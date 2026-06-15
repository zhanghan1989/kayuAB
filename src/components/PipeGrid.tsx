/**
 * KayuAB - PipeGrid Component
 * Renders the beautiful interactive SVG pipe network. 
 * Handles tap rotations, water flow simulation (BFS), flow sound triggers, and success state updates.
 * Now features ultimate intelligent design puzzle hints: high visibility check colors,
 * error guides, and a tactile "Plumber's Help Auto-Fix" button powered by Aqua Coins!
 */

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PipeCell, Level, CONNECTIONS } from "../data/levels";
import { sound } from "../utils/audio";
import { 
  RotateCw, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  CheckCircle2, 
  HelpCircle, 
  Wrench, 
  Coins, 
  FlameKindling,
  AlertTriangle,
  Lightbulb,
  Music,
  Move,
  Play,
  Palette
} from "lucide-react";

interface PipeGridProps {
  level: Level;
  onLevelComplete: (
    mode: "use" | "sell",
    earnedCoins: number,
    ratingDelta: number,
    buyerReview?: { buyer: string; avatar: string; rating: number; text: string }
  ) => void;
  selectedInstrument: "bubble" | "musicbox" | "marimba" | "keyboard" | "flow";
  onMuteToggle: () => void;
  isMuted: boolean;
  shopRating: number;
  coins: number;
  onModifyCoins: (amt: number) => void;
}

export const PipeGrid: React.FC<PipeGridProps> = ({
  level,
  onLevelComplete,
  selectedInstrument,
  onMuteToggle,
  isMuted,
  shopRating,
  coins,
  onModifyCoins
}) => {
  // Deep clone grid to manage state locally
  const [grid, setGrid] = useState<PipeCell[][]>([]);
  // Traces path in BFS order to play incremental sounds
  const [flowedPath, setFlowedPath] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);
  const [showSolutionHint, setShowSolutionHint] = useState<boolean>(false);
  const [isPlayingUseMelody, setIsPlayingUseMelody] = useState<boolean>(false);

  // --- SPECIAL GAME MECHANICS ---
  // A: Position Swap Mode
  const [swapMode, setSwapMode] = useState<boolean>(false);
  const [selectedSwapCell, setSelectedSwapCell] = useState<{ r: number; c: number } | null>(null);

  // B: Sound-Driven Playbacks & Pipe Skins Lock/Unlock System
  const [playbackCount, setPlaybackCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("kayuab_playback_count");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [activeSkin, setActiveSkin] = useState<"retro" | "neon" | "bamboo" | "gold">(() => {
    try {
      const saved = localStorage.getItem("kayuab_active_skin");
      return (saved as any) || "retro";
    } catch {
      return "retro";
    }
  });

  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("kayuab_unlocked_skins");
      return saved ? JSON.parse(saved) : ["retro"];
    } catch {
      return ["retro"];
    }
  });

  const [isMelodySweepActive, setIsMelodySweepActive] = useState<boolean>(false);
  const [sweepIndex, setSweepIndex] = useState<number>(-1);

  // Automatically sync unlocked skins array to playback milestones
  useEffect(() => {
    localStorage.setItem("kayuab_playback_count", playbackCount.toString());
    const list = ["retro"];
    if (playbackCount >= 3) list.push("neon");
    if (playbackCount >= 5) list.push("bamboo");
    
    // Preserve gold if unlocked before
    try {
      const saved = localStorage.getItem("kayuab_unlocked_skins");
      const savedList = saved ? JSON.parse(saved) : [];
      if (savedList.includes("gold") && !list.includes("gold")) {
        list.push("gold");
      }
    } catch {}

    setUnlockedSkins(list);
    localStorage.setItem("kayuab_unlocked_skins", JSON.stringify(list));
  }, [playbackCount]);

  useEffect(() => {
    localStorage.setItem("kayuab_active_skin", activeSkin);
  }, [activeSkin]);

  // Initialize level
  useEffect(() => {
    const cloned = level.grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        // Start mixed or random rotations, keeping S & E fixed if requested
        currentRotation: cell.fixed ? cell.currentRotation : (cell.currentRotation + Math.floor(Math.random() * 3) + 1) % 4
      }))
    );
    setGrid(cloned);
    setIsCompleted(false);
    setMoves(0);
    setShowSolutionHint(false);
  }, [level]);

  // Compute active connection graph & path finding
  const checkedFlow = useMemo(() => {
    if (grid.length === 0) return { flowed: new Set<string>(), isSolved: false, order: [] as string[] };

    const height = grid.length;
    const width = grid[0].length;
    const flowed = new Set<string>();
    const order: string[] = [];

    // Find the Source cell (typically type "S")
    let sourceX = -1, sourceY = -1;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (grid[r][c].type === "S") {
          sourceX = r;
          sourceY = c;
          break;
        }
      }
      if (sourceX !== -1) break;
    }

    if (sourceX === -1) return { flowed, isSolved: false, order };

    // Standard BFS path trace
    const queue: [number, number][] = [[sourceX, sourceY]];
    const startKey = `${sourceX}-${sourceY}`;
    flowed.add(startKey);
    order.push(startKey);

    // Delta mapping for compass [Up, Right, Down, Left]
    const delta = [
      [-1, 0], // 0: Up
      [0, 1],  // 1: Right
      [1, 0],  // 2: Down
      [0, -1]  // 3: Left
    ];

    let solved = false;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const cellA = grid[r][c];

      // Get allowed exit directions for cell A
      const allowedDirs = CONNECTIONS[cellA.type]?.[cellA.currentRotation] || [];

      for (const dir of allowedDirs) {
        const [dr, dc] = delta[dir];
        const nr = r + dr;
        const nc = c + dc;

        // Boundary check
        if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
          const nextKey = `${nr}-${nc}`;
          if (!flowed.has(nextKey)) {
            const cellB = grid[nr][nc];
            // Opposite direction (e.g. Up is opposite to Down)
            const oppDir = (dir + 2) % 4;
            const bAllowedDirs = CONNECTIONS[cellB.type]?.[cellB.currentRotation] || [];

            // Dual connection check
            if (bAllowedDirs.includes(oppDir)) {
              flowed.add(nextKey);
              order.push(nextKey);
              queue.push([nr, nc]);

              if (cellB.type === "E") {
                solved = true;
              }
            }
          }
        }
      }
    }

    return { flowed, isSolved: solved, order };
  }, [grid]);

  // Audio syncer: Plays dynamic incremental scales whenever path increases
  useEffect(() => {
    if (grid.length === 0) return;
    const { order, isSolved } = checkedFlow;
    
    // Evaluate if flow has grown or changed
    const currentPathKeys = order.join(",");
    const prevPathKeys = flowedPath.join(",");
    
    if (currentPathKeys !== prevPathKeys) {
      // Find what elements were newly connected
      const newItems = order.filter(key => !flowedPath.includes(key));
      if (newItems.length > 0 && !isCompleted) {
        // Play water droplet tones based on step index for beautiful feedback
        newItems.forEach((_, idx) => {
          setTimeout(() => {
            sound.playWaterFlowStep(order.indexOf(_) + 1, 12);
          }, idx * 60);
        });
      }
      setFlowedPath(order);
    }

    // Trigger Success
    if (isSolved && !isCompleted) {
      setIsCompleted(true);
      sound.playSuccessFanfare();
    }
  }, [checkedFlow, grid, flowedPath, isCompleted]);

  // Handle pipe clicking
  const rotatePipe = (r: number, c: number) => {
    if (isCompleted) return;
    const cell = grid[r][c];
    if (cell.fixed && cell.type !== "S" && cell.type !== "E") return;

    if (swapMode) {
      if (selectedSwapCell === null) {
        // Select cell for swap
        sound.playPluck(440, 0.7);
        setSelectedSwapCell({ r, c });
      } else {
        const first = selectedSwapCell;
        // If same cell clicked again, deselect
        if (first.r === r && first.c === c) {
          setSelectedSwapCell(null);
          sound.playPluck(330, 0.4);
          return;
        }

        const secondCell = grid[r][c];
        if (secondCell.fixed && secondCell.type !== "S" && secondCell.type !== "E") {
          sound.playPluck(225, 0.85); // cannot swap with fixed endpoints
          return;
        }

        // SWAP pipe cell features!
        sound.playKeyboardClick(523.25, 1.0);
        setGrid(prev => {
          return prev.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              if (rIdx === first.r && cIdx === first.c) {
                // Gets properties of second
                return {
                  ...cell,
                  type: prev[r][c].type,
                  targetRotation: prev[r][c].targetRotation,
                  currentRotation: prev[r][c].currentRotation,
                  fixed: prev[r][c].fixed
                };
              }
              if (rIdx === r && cIdx === c) {
                // Gets properties of first
                return {
                  ...cell,
                  type: prev[first.r][first.c].type,
                  targetRotation: prev[first.r][first.c].targetRotation,
                  currentRotation: prev[first.r][first.c].currentRotation,
                  fixed: prev[first.r][first.c].fixed
                };
              }
              return cell;
            })
          );
        });

        setMoves(prev => prev + 1);
        setSelectedSwapCell(null);
      }
    } else {
      // Normal rotation
      sound.playRotate();
      setGrid(prev => {
        const copy = prev.map(row => row.map(cell => ({ ...cell })));
        copy[r][c].currentRotation = (copy[r][c].currentRotation + 1) % 4;
        return copy;
      });
      setMoves(prev => prev + 1);
    }
  };

  // Perform dynamic custom water-pipe melody sweep (spending coins or free if complete)
  const startPerformancePlayback = async () => {
    if (isMelodySweepActive) return;

    // Coins spent rules: 10 Coins in development, 0 if solved
    const cost = isCompleted ? 0 : 10;
    if (cost > 0 && coins < cost) {
      sound.playPluck(220, 0.85);
      return;
    }

    if (cost > 0) {
      onModifyCoins(-cost);
    }

    setIsMelodySweepActive(true);
    setSweepIndex(0);

    // Get order of current flow or all cells sorted
    const sweepKeys = flowedPath.length > 0 
      ? flowedPath 
      : grid.flat().map(c => c.id);

    // Play chord fanfare build-up
    sound.playMusicBox(523.25, 0.4);

    for (let idx = 0; idx < sweepKeys.length; idx++) {
      setSweepIndex(idx);
      sound.playWaterFlowStep(idx + 1, Math.max(8, sweepKeys.length));
      await new Promise(resolve => setTimeout(resolve, 140));
    }

    setSweepIndex(-1);
    setIsMelodySweepActive(false);
    setPlaybackCount(prev => prev + 1);
  };

  const handleBuyGoldSkin = () => {
    if (coins < 150) {
      sound.playPluck(220, 0.85);
      return;
    }
    onModifyCoins(-150);
    sound.playSuccessFanfare();
    const list = [...unlockedSkins, "gold"];
    setUnlockedSkins(list);
    localStorage.setItem("kayuab_unlocked_skins", JSON.stringify(list));
    setActiveSkin("gold");
  };

  // 🛠️ Plumber Help Auto-Fix 1 Pipe (15 Coins)
  // Intelligent fix that selects one incorrectly rotated pipe and fixes it directly
  const handlePlumberAutoFix = () => {
    if (isCompleted) return;
    if (coins < 15) {
      sound.playPluck(220, 0.82); // sad coin sound
      return;
    }

    // Find all cells that are not fixed, and currently rotated incorrectly
    const incorrectCells: { r: number; c: number; cell: PipeCell }[] = [];
    grid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (!cell.fixed || cell.type === "S" || cell.type === "E") {
          // Check if current rotation is different from target rotation
          // Some symmetric shapes (like straight line 'I' and cross 'X') have multiple valid rotations.
          // Let's do a strict check for simplicity, or standard modulo rotation equivalent
          const isCorrect = (cell.currentRotation % 2 === cell.targetRotation % 2) && cell.type === "I" 
            ? true 
            : cell.type === "X" 
            ? true 
            : cell.currentRotation === cell.targetRotation;

          if (!isCorrect) {
            incorrectCells.push({ r: rIdx, c: cIdx, cell });
          }
        }
      });
    });

    if (incorrectCells.length === 0) {
      // All correct already! Sparkly sound
      sound.playMusicBox(783.99, 1.2);
      return;
    }

    // Spend coins
    onModifyCoins(-15);
    
    // Pick one random incorrect cell
    const luckyPick = incorrectCells[Math.floor(Math.random() * incorrectCells.length)];
    
    // Play elegant mechanical tool and droplet chime
    sound.playMarimba(392, 0.3);
    setTimeout(() => sound.playMusicBox(523.25, 0.5), 100);
    setTimeout(() => sound.playWaterFlowStep(5, 0.5), 200);

    setGrid(prev => {
      return prev.map((row, rIdx) => 
        row.map((cell, cIdx) => {
          if (rIdx === luckyPick.r && cIdx === luckyPick.c) {
            return {
              ...cell,
              currentRotation: cell.targetRotation
            };
          }
          return cell;
        })
      );
    });

    setMoves(prev => prev + 1);
  };

  // ⚡ 一発全自動解決 (Auto Solve) - ユーザーの強い要望により、詰まったときいつでも無料で一瞬で完璧に自動接続する
  const handleAutoSolve = () => {
    if (isCompleted) return;
    sound.playSuccessFanfare();
    
    setGrid(prev => {
      return prev.map(row => 
        row.map(cell => {
          if (cell.fixed && cell.type !== "S" && cell.type !== "E") return cell;
          return {
            ...cell,
            currentRotation: cell.targetRotation
          };
        })
      );
    });
    setMoves(prev => prev + 1);
  };

  // Reset stage
  const handleReset = () => {
    sound.playPopSound(180, 0.2);
    setGrid(prev => {
      return prev.map(row => row.map(cell => ({
        ...cell,
        currentRotation: cell.fixed ? cell.currentRotation : (cell.currentRotation + Math.floor(Math.random() * 3) + 1) % 4
      })));
    });
    setMoves(0);
    setIsCompleted(false);
  };

  // Toggle Solution Hints
  const toggleSolutionHint = () => {
    sound.playPluck(880, 0.6);
    setShowSolutionHint(!showSolutionHint);
  };

  // Renders the specific customized vector graphic for each Pipe type
  const renderPipeSVG = (cell: PipeCell) => {
    const isFlowing = flowedPath.includes(cell.id) || (isMelodySweepActive && grid.flat().findIndex(c => c.id === cell.id) <= sweepIndex && flowedPath.includes(cell.id));
    
    // Customize colors dynamically based on active skin
    let strokeColor = isFlowing ? "#2dd4bf" : "#4b5563"; // default teal vs slate
    let fluidColor = "#06b6d4";
    let backTubeColor = "#1f2937";
    let outerJointColor = "#374151";
    let indicatorGlow = "#2dd4bf";

    if (activeSkin === "neon") {
      strokeColor = isFlowing ? "#ff0d80" : "#2e2157"; // high pink neon vs dark violet
      fluidColor = "#ff2a95";
      backTubeColor = "#130f26";
      outerJointColor = "#4338ca";
      indicatorGlow = "#ff0d80";
    } else if (activeSkin === "bamboo") {
      strokeColor = isFlowing ? "#10b981" : "#5c3d11"; // organic emerald vs dark bamboo stem
      fluidColor = "#34d399";
      backTubeColor = "#164010";
      outerJointColor = "#15803d";
      indicatorGlow = "#10b981";
    } else if (activeSkin === "gold") {
      strokeColor = isFlowing ? "#fbbf24" : "#572109"; // glittering amber gold vs deep royal bronze
      fluidColor = "#ea580c";
      backTubeColor = "#2d1601";
      outerJointColor = "#ea580c";
      indicatorGlow = "#facc15";
    }

    const glowColor = isFlowing ? indicatorGlow : "transparent";

    return (
      <svg id={`svg-${cell.id}`} viewBox="0 0 100 100" className="w-full h-full p-1 select-none">
        <defs>
          <radialGradient id={`glow-${cell.id}`} r="50%">
            <stop offset="0%" stopColor={indicatorGlow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={indicatorGlow} stopOpacity="0" />
          </radialGradient>
          <filter id={`neon-${cell.id}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient glow backing for active flowing water cells */}
        {isFlowing && (
          <circle cx="50" cy="50" r="40" fill={`url(#glow-${cell.id})`} className="animate-pulse" />
        )}

        {/* Pipe Outer Boundary */}
        <circle cx="50" cy="50" r="6" fill={backTubeColor} stroke={outerJointColor} strokeWidth="2" />

        {/* Start / Source Node */}
        {cell.type === "S" && (
          <>
            <rect x="36" y="36" width="28" height="28" rx="8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="10" fill="#111827" />
            {/* Water flowing exit pipe to connection direction (typically right) */}
            <path d="M 50 50 L 50 5" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
            {isFlowing && (
              <path d="M 50 50 L 50 5" stroke={fluidColor} strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
            )}
            <circle cx="50" cy="50" r="5" fill="#f59e0b" className="animate-ping" style={{ animationDuration: "1.8s" }} />
          </>
        )}

        {/* End / Drain Sink Node */}
        {cell.type === "E" && (
          <>
            <motion.rect 
              animate={{ scale: isFlowing ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              x="34" y="34" width="32" height="32" rx="16" fill="#0d9488" stroke="#14b8a6" strokeWidth="3" 
            />
            <circle cx="50" cy="50" r="12" fill="#0f172a" />
            {/* Receiver connector from target */}
            <path d="M 50 50 L 50 95" stroke="#0d9488" strokeWidth="12" strokeLinecap="round" />
            {isFlowing && (
              <path d="M 50 50 L 50 95" stroke={fluidColor} strokeWidth="6" strokeLinecap="round" />
            )}
            <Sparkles className={`w-4 h-4 text-emerald-300 absolute left-8 top-8 ${isFlowing ? "animate-spin" : "opacity-30"}`} style={{ animationDuration: "5s" }} />
          </>
        )}

        {/* Straight Line Pipe "I" */}
        {cell.type === "I" && (
          <>
            {/* Background casing */}
            <path d="M 50 0 L 50 100" stroke={backTubeColor} strokeWidth="18" strokeLinecap="square" />
            <path d="M 50 0 L 50 100" stroke={strokeColor} strokeWidth="10" strokeLinecap="square" />
            {/* Active flowing ambient fluid */}
            {isFlowing && (
              <motion.path 
                initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                d="M 50 0 L 50 100" 
                stroke={fluidColor} 
                strokeWidth="4" 
                style={{ filter: `url(#neon-${cell.id})` }}
              />
            )}
          </>
        )}

        {/* L-bend Elbow Pipe "L" */}
        {cell.type === "L" && (
          <>
            <path d="M 50 0 Q 50 50 100 50" fill="none" stroke={backTubeColor} strokeWidth="18" strokeLinecap="square" />
            <path d="M 50 0 Q 50 50 100 50" fill="none" stroke={strokeColor} strokeWidth="10" strokeLinecap="square" />
            {isFlowing && (
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                d="M 50 0 Q 50 50 100 50" 
                fill="none" 
                stroke={fluidColor} 
                strokeWidth="4"
                style={{ filter: `url(#neon-${cell.id})` }}
              />
            )}
            {/* Elbow structural cap joint */}
            <circle cx="50" cy="50" r="7" fill={outerJointColor} />
          </>
        )}

        {/* T-junction Pipe "T" */}
        {cell.type === "T" && (
          <>
            {/* Top branch cross bar */}
            <path d="M 0 50 L 100 50" stroke={backTubeColor} strokeWidth="18" />
            <path d="M 50 50 L 50 100" stroke={backTubeColor} strokeWidth="18" />

            <path d="M 0 50 L 100 50" stroke={strokeColor} strokeWidth="10" />
            <path d="M 50 50 L 50 100" stroke={strokeColor} strokeWidth="10" />
            {isFlowing && (
              <>
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  d="M 0 50 L 100 50" 
                  stroke={fluidColor} 
                  strokeWidth="4" 
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  d="M 50 50 L 50 100" 
                  stroke={fluidColor} 
                  strokeWidth="4" 
                />
              </>
            )}
            <circle cx="50" cy="50" r="8" fill="#374151" />
          </>
        )}

        {/* Cross Pipe "X" */}
        {cell.type === "X" && (
          <>
            <path d="M 50 0 L 50 100" stroke="#1f2937" strokeWidth="18" />
            <path d="M 0 50 L 100 50" stroke="#1f2937" strokeWidth="18" />

            <path d="M 50 0 L 50 100" stroke={strokeColor} strokeWidth="10" />
            <path d="M 0 50 L 100 50" stroke={strokeColor} strokeWidth="10" />
            {isFlowing && (
              <>
                <path d="M 50 0 L 50 100" stroke={fluidColor} strokeWidth="4" />
                <path d="M 0 50 L 100 50" stroke={fluidColor} strokeWidth="4" />
              </>
            )}
            <circle cx="50" cy="50" r="9" fill="#4b5563" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto space-y-5">

      {/* Dynamic Performance Playback & Swap Mode Controllers Container */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-neutral-900/45 p-4 rounded-2xl border border-neutral-800 shadow-md">
        {/* Playback Performance */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-450 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              音響・自動メロディ再生 🎶
            </span>
            <span className="text-[9px] text-[#00ffcc] font-mono font-bold bg-[#00ffcc]/10 px-1.5 py-0.2 rounded border border-[#00ffcc]/20">
              再生回数: {playbackCount}回
            </span>
          </div>
          <button
            onClick={startPerformancePlayback}
            disabled={isMelodySweepActive}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isMelodySweepActive
                ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300 animate-pulse"
                : isCompleted
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300 hover:brightness-110"
                : coins >= 10
                ? "bg-neutral-950 border-neutral-800 hover:border-cyan-500/40 text-neutral-205"
                : "border-neutral-850 text-neutral-600 bg-neutral-950/20 cursor-not-allowed"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isMelodySweepActive ? "animate-spin" : ""}`} />
            {isMelodySweepActive ? (
              <span>メロディ演奏中...</span>
            ) : isCompleted ? (
              <span>完成音響を再生 (無料) 🎵</span>
            ) : (
              <span>和音を自動再生 (10 Coins) 🪙</span>
            )}
          </button>
        </div>

        {/* Position Swap Switcher */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-450 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-pink-400" />
              位置移動・交換システム ⚙️
            </span>
            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
              swapMode ? "bg-pink-500/15 text-pink-300 border border-pink-500/30 animate-pulse" : "bg-neutral-950 text-neutral-500 border border-neutral-850"
            }`}>
              {swapMode ? "位置交換稼働中" : "通常回転"}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playPluck(523.25, 0.4);
              setSwapMode(!swapMode);
              setSelectedSwapCell(null);
            }}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              swapMode
                ? "bg-pink-950/30 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                : "bg-neutral-950 border-neutral-800 hover:border-pink-500/40 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Move className="w-3.5 h-3.5 shrink-0" />
            <span>{swapMode ? "位置交換をOFFにする" : "位置移動/スワップON"}</span>
          </button>
        </div>

        {/* C: Unlockable visual skins row */}
        <div className="sm:col-span-2 space-y-2 border-t border-neutral-800/60 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
              水道管のデザインスキン（再生・演奏で解放！）🎨
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {/* 1. Retro Brass */}
            <button
              onClick={() => {
                sound.playPluck(440, 0.5);
                setActiveSkin("retro");
              }}
              className={`p-1.5 rounded-lg border text-left text-[9px] cursor-pointer transition-all ${
                activeSkin === "retro" ? "bg-neutral-800 border-neutral-700 font-bold text-neutral-100" : "bg-neutral-950 border-transparent text-neutral-450 hover:bg-neutral-900"
              }`}
            >
              🪵 機械式真鍮 (標準)
            </button>

            {/* 2. Crystal Neon */}
            {unlockedSkins.includes("neon") ? (
              <button
                onClick={() => {
                  sound.playPluck(523, 0.5);
                  setActiveSkin("neon");
                }}
                className={`p-1.5 rounded-lg border text-left text-[9px] cursor-pointer transition-all ${
                  activeSkin === "neon" ? "bg-pink-500/10 border-pink-500 text-pink-300 font-bold" : "bg-neutral-950 border-transparent text-neutral-450 hover:bg-neutral-900"
                }`}
              >
                🔮 クリスタルネオン
              </button>
            ) : (
              <div className="p-1.5 rounded-lg bg-neutral-950/40 border border-neutral-900 text-neutral-600 text-[8.5px] flex flex-col justify-center leading-normal select-none">
                <span className="truncate">🔒 結晶ネオン</span>
                <span className="text-[7.5px] text-neutral-500 shrink-0">3回演奏で(現在:{playbackCount}/3)</span>
              </div>
            )}

            {/* 3. Bamboo */}
            {unlockedSkins.includes("bamboo") ? (
              <button
                onClick={() => {
                  sound.playPluck(587, 0.5);
                  setActiveSkin("bamboo");
                }}
                className={`p-1.5 rounded-lg border text-left text-[9px] cursor-pointer transition-all ${
                  activeSkin === "bamboo" ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold" : "bg-neutral-950 border-transparent text-neutral-450 hover:bg-neutral-900"
                }`}
              >
                🎋 和風自然美：青竹
              </button>
            ) : (
              <div className="p-1.5 rounded-lg bg-neutral-950/40 border border-neutral-900 text-neutral-600 text-[8.5px] flex flex-col justify-center leading-normal select-none">
                <span className="truncate">🔒 和風青竹</span>
                <span className="text-[7.5px] text-neutral-500 shrink-0">5回演奏で(現在:{playbackCount}/5)</span>
              </div>
            )}

            {/* 4. Luxury Gold */}
            {unlockedSkins.includes("gold") ? (
              <button
                onClick={() => {
                  sound.playPluck(659, 0.5);
                  setActiveSkin("gold");
                }}
                className={`p-1.5 rounded-lg border text-left text-[9px] cursor-pointer transition-all ${
                  activeSkin === "gold" ? "bg-yellow-500/10 border-yellow-500 text-yellow-300 font-bold" : "bg-neutral-950 border-transparent text-neutral-450 hover:bg-neutral-900"
                }`}
              >
                👑 皇帝ロイヤルゴールド
              </button>
            ) : (
              <button
                onClick={handleBuyGoldSkin}
                disabled={coins < 150}
                className={`p-1.5 rounded-lg border text-left text-[8.5px] cursor-pointer transition-all flex flex-col justify-center leading-tight ${
                  coins >= 150 
                    ? "bg-amber-950/10 border-amber-900/30 text-amber-400 hover:bg-amber-900/20 animate-pulse" 
                    : "bg-neutral-950/40 border-neutral-900 text-neutral-650 cursor-not-allowed"
                }`}
                title="150 Coins を支払い、超豪華ゴールドスキンをアンロック！"
              >
                <span>🛒 皇帝ゴールド開放</span>
                <span className="text-[7.5px] text-yellow-550 font-mono">Cost: 150c</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 📖 遊び方・簡単パズル解説ガイド */}
      <div className="w-full bg-neutral-900/35 p-4 rounded-2.5xl border border-neutral-800/80 text-[11px] leading-relaxed text-neutral-350 space-y-2">
        <h4 className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-1.5 border-b border-neutral-800/50 pb-1">
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>💧 水道配管パズル 遊び方 ＆ 超強力クリア支援機能 ⏎</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 text-neutral-400">
          <p>🔄 <strong className="text-neutral-200">向きを変える (回転)</strong>：パイプをタップするだけで、右に90度回転します。</p>
          <p>⇄ <strong className="text-neutral-200">場所を変える (移動)</strong>：上の「位置移動/スワップON」ボタンをピンクにして有効化したあと、2つの別のパイプを連続タップすると「場所を交換（スワップ）」できます。</p>
          <p>💡 <strong className="text-neutral-200">ガイド電球</strong>：今間違っているパイプの右上を 🔴マーク でお知らせします。</p>
          <p>✨ <strong className="text-neutral-200">一発全自動クリア (無料)</strong>：どうしても繋がらず水が流れない時は、下のボタンを押せば瞬時に配管を揃えてクリア可能です！</p>
        </div>
      </div>

      {/* HUD Info bar */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 px-2 text-xs text-neutral-400 font-mono">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div>
            回転数: <span className="text-neutral-100 font-bold text-sm">{moves}</span> 回
          </div>
          <div>
            到達度: <span className="text-teal-400 font-bold font-sans">
              {grid.length > 0 ? Math.floor((flowedPath.length / (grid.length * grid[0].length)) * 100) : 0}%
            </span>
          </div>
        </div>
 
        {/* 🛠️ PLUMBER CONTROLLER SYSTEM */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-end">
          
          {/* ① FREE VISUAL LIGHT HINTS (無料配置ヒント) */}
          <button
            onClick={toggleSolutionHint}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1 shrink-0 ${
              showSolutionHint 
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse"
                : "border-neutral-800 text-neutral-450 hover:bg-neutral-900"
            }`}
            title="各パイプが正解の回転方向を向いているかを示すガイドライトをONにする"
          >
            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
            {showSolutionHint ? "ガイド消す" : "ガイド電球"}
          </button>
 
          {/* ② PLUMBER HELP AUTO-FIX BUTTON (水道屋のお助け自動回転、1回15c) */}
          <button
            onClick={handlePlumberAutoFix}
            disabled={isCompleted}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
              isCompleted
                ? "border-neutral-850 text-neutral-600 bg-transparent cursor-not-allowed"
                : coins >= 15
                ? "bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20 shadow-md"
                : "border-neutral-850 text-neutral-550 hover:border-rose-500/20 hover:text-rose-400 bg-neutral-950/20"
            }`}
            title="15 Coins を支払い、間違っているパーツを1個正しい角度にカチッと自動回転してあげる"
          >
            <Wrench className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
            <span>お助け修理 (15c)</span>
          </button>

          {/* ③ AUTO SOLVE CLEAR BUTTON (一発全自動完成、無料) */}
          <button
            onClick={handleAutoSolve}
            disabled={isCompleted}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 flex items-center gap-1 shrink-0 ${
              isCompleted
                ? "border-neutral-850 text-neutral-600 bg-transparent cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border-emerald-500/50 text-emerald-300 hover:brightness-110 shadow-lg animate-pulse"
            }`}
            title="すべてのパイプを正しい角度に自動配置し、一瞬で水が通る状態を完成させます！（無料・お助け）"
          >
            <Sparkles className="w-3 h-3 text-emerald-300 shrink-0" />
            <span>一発全自動クリア (無料) ✨</span>
          </button>
 
          <button
            onClick={handleReset}
            disabled={isCompleted}
            className="p-1.5 rounded-lg border border-neutral-800 text-neutral-450 hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
            title="現在のステージの回転状況を元に戻す"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        id="puzzle-board"
        className="w-full relative p-4 md:p-6 rounded-3xl border border-neutral-800 bg-neutral-900/35 backdrop-blur-xl shadow-2xl transition-all duration-500"
        style={{
          boxShadow: isCompleted 
            ? "0 0 50px rgba(45, 212, 191, 0.15), inset 0 0 30px rgba(45, 212, 191, 0.05)"
            : "none"
        }}
      >
        <div 
          className="grid gap-2 sm:gap-3 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${level.size.width}, minmax(0, 1fr))`,
            maxWidth: `${level.size.width * 80}px`
          }}
        >
          {grid.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isFlowing = flowedPath.includes(cell.id);
              const isClickable = !isCompleted && (!cell.fixed || cell.type === "S" || cell.type === "E");
              const isSelectedForSwap = selectedSwapCell?.r === rIdx && selectedSwapCell?.c === cIdx;
              
              // Evaluate symmetry correctly
              // I-pipe has symmetry (rotations 0 == 2, 1 == 3)
              // X-pipe has symmetry (rotations 0 == 1 == 2 == 3, always correct)
              const isCorrectRotation = cell.type === "X" 
                ? true 
                : cell.type === "I" 
                ? (cell.currentRotation % 2 === cell.targetRotation % 2)
                : cell.currentRotation === cell.targetRotation;
              
              return (
                <motion.div
                  key={cell.id}
                  layoutId={`cell-${cell.id}`}
                  onClick={() => isClickable && rotatePipe(rIdx, cIdx)}
                  style={{ cursor: isClickable ? "pointer" : "default" }}
                  className={`aspect-square rounded-2xl relative flex items-center justify-center overflow-hidden border transition-all duration-300 ${
                    isSelectedForSwap
                      ? "border-pink-500 bg-pink-950/25 ring-2 ring-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse"
                      : isFlowing 
                      ? "border-teal-500/40 bg-teal-950/20 shadow-[0_0_15px_rgba(45,212,191,0.08)]" 
                      : showSolutionHint && (!cell.fixed || cell.type === "S" || cell.type === "E") && !isCorrectRotation
                      ? "border-rose-500/30 bg-rose-950/5 shadow-[0_0_10px_rgba(239,68,68,0.05)] animate-pulse"
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/60"
                  }`}
                  whileHover={isClickable ? { scale: 1.04 } : {}}
                  whileTap={isClickable ? { scale: 0.94 } : {}}
                >
                  {/* Subtle indication of solver target to support inclusive/peaceful play */}
                  {showSolutionHint && (!cell.fixed || cell.type === "S" || cell.type === "E") && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-neutral-950 shadow-md ${
                        isCorrectRotation 
                          ? "bg-teal-400 shadow-teal-500/30" 
                          : "bg-rose-500 animate-ping"
                      }`} />
                      
                      {/* Hint visual overlays - Question mark on incorrect pipe */}
                      {!isCorrectRotation && (
                        <div className="text-[10px] text-rose-400 font-bold bg-rose-950/40 leading-none w-3.5 h-3.5 rounded-full border border-rose-500/20 flex items-center justify-center absolute bottom-1 right-1">
                          ❓
                        </div>
                      )}
                    </div>
                  )}

                  {/* SVG rendering with motion layout angle transitions */}
                  <motion.div
                    animate={{ rotate: cell.currentRotation * 90 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="w-full h-full flex items-center justify-center text-center"
                  >
                    {renderPipeSVG(cell)}
                  </motion.div>

                  {/* Flow splash bubble particle effect overlay */}
                  {isFlowing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
                      className="absolute bottom-1 right-2 pointer-events-none"
                    >
                      <span className="text-[10px] text-teal-400 select-none">。</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Beautiful Animated Success Overlay with Mode Choices */}
        <AnimatePresence>
          {isCompleted && (() => {
            const flowedCount = flowedPath.length;
            const useReward = flowedCount * 16 + (level.difficulty === "上級" ? 180 : level.difficulty === "中級" ? 100 : 50);
            
            // Rating premium
            const ratingMultiplier = shopRating / 4.0;
            const sellRewardBase = flowedCount * 25 + (level.difficulty === "上級" ? 220 : level.difficulty === "中級" ? 120 : 60);
            const sellReward = Math.floor(sellRewardBase * ratingMultiplier);

            const handleUseLocally = () => {
              if (isPlayingUseMelody) return;
              setIsPlayingUseMelody(true);
              let count = 0;
              const interval = setInterval(() => {
                const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
                const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
                
                if (selectedInstrument === "flow") {
                  sound.playFlowWater(freq * 1.3, 0.28);
                } else if (selectedInstrument === "bubble") {
                  sound.playPopSound(freq * 1.5, 0.25);
                } else if (selectedInstrument === "musicbox") {
                  sound.playMusicBox(freq, 0.25);
                } else if (selectedInstrument === "marimba") {
                  sound.playMarimba(freq, 0.28);
                } else {
                  sound.playKeyboardClick(freq, 0.24);
                }
                
                count++;
                if (count >= 12) {
                  clearInterval(interval);
                  setIsPlayingUseMelody(false);
                  onLevelComplete("use", useReward, 0.02);
                }
              }, 140);
            };

            const handleSellToBuyer = () => {
              const REVIEWS = [
                { buyer: "配管マニア ケンジ", avatar: "👨‍🔧", text: "完璧な配管設計ですね！流水がハープのような極上の響きを奏でています。非常に満足。 ★5.0", rating: 5.0 },
                { buyer: "美咲 (DIY女子)", avatar: "👩‍🎨", text: "庭の水はけとサウンドシステム用として。美しく流れて大満足です！ありががとうございました！ ★4.9", rating: 4.9 },
                { buyer: "工業デザイナー Alex", avatar: "🧑‍💻", text: "無駄のない配管、水圧、迫力。パーツごとの音響が非常に近代的なクオリティです。 ★5.0", rating: 5.0 },
                { buyer: "リサイクルショップ店長", avatar: "🧔", text: "分岐点の処理に職人の温かみを感じる。店先に置いて客寄せの噴水にします。 ★4.8", rating: 4.8 },
                { buyer: "水道局のタナカ", avatar: "👮", text: "水の循環効率と和音の設計が完璧。一般流通基準を悠々クリアする素晴らしい出来栄え！ ★5.0", rating: 5.0 }
              ];
              const review = REVIEWS[Math.floor(Math.random() * REVIEWS.length)];
              sound.playMusicBox(783.99, 1.2);
              setTimeout(() => sound.playMusicBox(1046.5, 1.2), 120);
              onLevelComplete("sell", sellReward, 0.1, review);
            };

            return (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/93 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center select-none z-30 font-sans"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8 }}
                  className="space-y-4 w-full max-w-sm"
                >
                  <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center mx-auto text-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-emerald-200 to-teal-400 bg-clip-text text-transparent">
                      立派な水道管が完成！
                    </h3>
                    <p className="text-neutral-400 text-[11px] leading-relaxed max-w-xs mx-auto">
                      水流が隅々まで行き渡り、美しい調和のメロディが誕生しました。<br />
                      この完成品をどのように運用しますか？
                    </p>
                  </div>

                  {/* Puzzle stats */}
                  <div className="bg-neutral-900/60 border border-neutral-850 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-[10px] font-mono text-left">
                    <div>
                      • 接続パーツ数: <span className="text-teal-400 font-bold">{flowedCount} 個</span>
                    </div>
                    <div>
                      • 総手数: <span className="text-neutral-200 font-bold">{moves} 回</span>
                    </div>
                    <div className="col-span-2 text-[9px] text-neutral-500 border-t border-neutral-800 pt-1">
                      ※ 水道管が立派（＝水が通るパーツが多い）なほど、運用価値が爆発的に向上します！
                    </div>
                  </div>

                  {/* Choices Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* CHOICE 1: USE LOCALLY */}
                    <button
                      onClick={handleUseLocally}
                      disabled={isPlayingUseMelody}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                        isPlayingUseMelody 
                          ? "bg-teal-500/25 border-teal-400 text-teal-200 animate-pulse"
                          : "border-teal-900/40 bg-teal-950/10 hover:bg-teal-950/20 hover:border-teal-500/40 text-neutral-200"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold flex items-center gap-1 text-teal-300">
                          🎵 自分で使う
                        </div>
                        <p className="text-[9px] text-neutral-400 leading-snug">
                          自分で水道管に水を流し、心地よい演奏をたっぷり再生！
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between w-full border-t border-teal-950/50 pt-1.5">
                        <span className="text-[9px] text-neutral-400">体験報酬:</span>
                        <span className="text-xs font-bold text-yellow-400 font-mono animate-pulse">+{useReward} Coins</span>
                      </div>
                      {isPlayingUseMelody && (
                        <div className="absolute inset-0 bg-teal-950/80 flex items-center justify-center text-xs font-bold text-teal-300 font-mono">
                          奏でています... 🎶
                        </div>
                      )}
                    </button>

                    {/* CHOICE 2: SELL TO BUYER */}
                    <button
                      onClick={handleSellToBuyer}
                      disabled={isPlayingUseMelody}
                      className="p-3.5 rounded-2xl border border-pink-900/40 bg-pink-950/10 hover:bg-pink-950/20 hover:border-pink-500/40 text-left flex flex-col justify-between transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold flex items-center gap-1 text-pink-300 font-sans">
                          💼 相手に売る
                        </div>
                        <p className="text-[9px] text-neutral-400 leading-snug">
                          オンライン市場に売却。店舗の評価をUPします。
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between w-full border-t border-pink-950/50 pt-1.5">
                        <span className="text-[9px] text-neutral-400">
                          売却売上
                          {shopRating >= 4.0 && (
                            <span className="text-[8px] text-pink-400 font-bold ml-1">
                              (★{(shopRating / 4 * 100 - 100).toFixed(0)}%UP)
                            </span>
                          )}
                          :
                        </span>
                        <span className="text-xs font-bold text-yellow-400 font-mono">+{sellReward} Coins</span>
                      </div>
                    </button>
                  </div>

                  <div className="text-[9px] text-neutral-500 font-sans">
                    ※ 「相手に売る」を選択すると、店の評判が <span className="text-pink-400 font-bold font-mono">+0.1★</span> 向上し、次回のパズル価格がさらにプラス！
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Play Controls & Instructions */}
      <div className="w-full text-center text-[10px] text-neutral-500 border border-neutral-900 p-3 rounded-2xl bg-neutral-950/20 leading-relaxed space-y-1.5 font-sans">
        <div>
          📌 <span className="text-neutral-300">遊び方:</span> グレーのパイプをタップして回転させ、オレンジの【始点】からエメラルドの【終点】まで一本に繋ぎましょう！
        </div>
        <div className="text-emerald-400 flex items-center justify-center gap-1.5">
          <Wrench className="w-3.5 h-3.5" />
          <span>パズルが解けない時は “お助け修理” を押すと、15cで間違っているパーツを1個自動で解決してくれます。</span>
        </div>
      </div>

    </div>
  );
};
