/**
 * KayuAB - Main App Entry
 * A tactile, high-fidelity relaxation plumbing puzzle game with 
 * real-time Web Audio API sound synths.
 * Upgraded with premium boxed stocking mechanics, persistent shop refurbishment,
 * visual hints and Plumber's Help auto-rotations using Aqua Coins.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LEVELS } from "./data/levels";
import { PipeGrid } from "./components/PipeGrid";
import { SoundSettings } from "./components/SoundSettings";
import { LevelSelector } from "./components/LevelSelector";
import { GachaMarket, SHOP_RANKS } from "./components/GachaMarket";
import { sound } from "./utils/audio";
import { 
  Sparkles, 
  Gamepad2, 
  Music, 
  Volume2, 
  VolumeX, 
  Award, 
  Droplet,
  Coins,
  PackageCheck,
  Home,
  HelpCircle,
  Wrench,
  CheckCircle2,
  Calendar,
  Send,
  User,
  Star,
  Play,
  RotateCw
} from "lucide-react";

export default function App() {
  // Game states
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentInstrument, setCurrentInstrument] = useState<"bubble" | "musicbox" | "marimba" | "keyboard" | "flow">("bubble");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingSeaBg, setIsPlayingSeaBg] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"puzzle" | "gacha" | "ambient" | "pvp" | "missions" | "guestbook">("puzzle");
  
  // Aqua Coin persistent economy
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("kayuab_coins");
      return saved ? parseInt(saved, 10) : 600;
    } catch {
      return 600;
    }
  });

  // Shop Online Rating: 4.0 stars (min 1.0, max 5.0)
  const [shopRating, setShopRating] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("kayuab_shop_rating");
      return saved ? parseFloat(saved) : 4.0;
    } catch {
      return 4.0;
    }
  });

  // Gacha Inventory
  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("kayuab_inventory");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // --- PVP Battle States ---
  const [pvpIsActive, setPvpIsActive] = useState<boolean>(false);
  const [pvpRivalId, setPvpRivalId] = useState<string>("saki");
  const [rivalProgress, setRivalProgress] = useState<number>(0);
  const [pvpWinner, setPvpWinner] = useState<"player" | "rival" | null>(null);

  // Passive Pipe Rental states
  const [rentedItems, setRentedItems] = useState<{ id: string; name: string; payRate: number; renter: string; quality: string }[]>(() => {
    try {
      const saved = localStorage.getItem("kayuab_rented_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [rentalAccumulatedCoins, setRentalAccumulatedCoins] = useState<number>(0);

  // PVP Active Action Throwing Arena States
  const [pvpSubMode, setPvpSubMode] = useState<"puzzle" | "action">("puzzle");
  const [activeSkinId, setActiveSkinId] = useState<string>("default");

  const [playerGridPos, setPlayerGridPos] = useState<{x: number; y: number}>({x: 1, y: 3});
  const [allyGridPos, setAllyGridPos] = useState<{x: number; y: number}>({x: 1, y: 1});
  const [enemyGridPos, setEnemyGridPos] = useState<{x: number; y: number}>({x: 8, y: 3});
  const [playerHP, setPlayerHP] = useState<number>(120);
  const [playerMaxHP, setPlayerMaxHP] = useState<number>(120);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [allyHP, setAllyHP] = useState<number>(100);
  const [enemyHP, setEnemyHP] = useState<number>(200);
  const [enemyMaxHP, setEnemyMaxHP] = useState<number>(200);
  const [healCooldown, setHealCooldown] = useState<number>(0);
  const [chests, setChests] = useState<{id: string; x: number; y: number; hp: number}[]>([
    {id: "c1", x: 4, y: 1, hp: 50}, 
    {id: "c2", x: 5, y: 4, hp: 50},
    {id: "c3", x: 3, y: 2, hp: 50}
  ]);
  const [actionLog, setActionLog] = useState<string[]>(["水道管バトルアリーナへようこそ！草むらに隠れてやり過ごし、宝箱を破壊して特製コインを集め、敵を倒そう。"]);
  const [actionBattleWinner, setActionBattleWinner] = useState<"player" | "enemy" | null>(null);

  // Brawl Stars elements
  const [playerAmmo, setPlayerAmmo] = useState<number>(3);
  const [superGauge, setSuperGauge] = useState<number>(0);
  const [playerPowerCount, setPlayerPowerCount] = useState<number>(0);
  const [powerCubes, setPowerCubes] = useState<{id: string; x: number; y: number; hp: number}[]>([]);

  // Persistent save rented items
  useEffect(() => {
    localStorage.setItem("kayuab_rented_items", JSON.stringify(rentedItems));
  }, [rentedItems]);

  // Handle passive renting coins generation timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (rentedItems.length > 0) {
        // Calculate total payout rate
        const rates = rentedItems.reduce((acc, val) => acc + val.payRate, 0);
        setRentalAccumulatedCoins(prev => prev + rates);
      }
    }, 6000); // Tick every 6 seconds!
    return () => clearInterval(timer);
  }, [rentedItems]);

  // --- Continuous Day Streak States ---
  const [stampStreak, setStampStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("kayuab_stamp_streak");
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [claimedDays, setClaimedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("kayuab_claimed_days");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- Dynamic Forum Reviews Forum ---
  const [forumReviews, setForumReviews] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kayuab_forum_reviews");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "r1", name: "流浪の配管工 テツ", rating: 5.0, text: "この店のアンティーク真鍮の音の響きは他店とは違う。店主の調律に対する並々ならぬこだわりが伝わる出来栄えだね。", date: "昨日" },
      { id: "r2", name: "美咲", rating: 4.8, text: "木製ボックスをたくさん入荷してお店の評価を上げてみたら、買取価格が全部いつもより多く貰えてホクホクです！🎵", date: "3日前" },
      { id: "r3", name: "デザイナー Alex", rating: 5.0, text: "音響水流サロンのコンセプトに深く一目を置いている。インテリアとしてのミニマルな幾何学銅製パイプを購入した。最高。", date: "5日前" }
    ];
  });

  // Save custom review list to localStorage
  useEffect(() => {
    localStorage.setItem("kayuab_forum_reviews", JSON.stringify(forumReviews));
  }, [forumReviews]);

  useEffect(() => {
    localStorage.setItem("kayuab_stamp_streak", stampStreak.toString());
  }, [stampStreak]);

  useEffect(() => {
    localStorage.setItem("kayuab_claimed_days", JSON.stringify(claimedDays));
  }, [claimedDays]);

  // --- NEW PERSISTENT MECHANICS FOR THE ULTIMATE EXPERIENCE ---

  // Web Audio Instruments unlocked with coins
  const [unlockedInstruments, setUnlockedInstruments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("kayuab_unlocked_instrs");
      return saved ? JSON.parse(saved) : ["bubble", "flow"]; // bubble and flow are free initially
    } catch {
      return ["bubble", "flow"];
    }
  });

  // Gacha boxes currently stocked in our boutique (bought/unlocked with coins)
  const [unlockedBoxes, setUnlockedBoxes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("kayuab_unlocked_boxes");
      return saved ? JSON.parse(saved) : ["wood_box"]; // only wood box is free initially
    } catch {
      return ["wood_box"];
    }
  });

  // Shop upgrade tier rank rank index (1 to 4)
  const [shopRank, setShopRank] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("kayuab_shop_rank");
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("kayuab_coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("kayuab_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("kayuab_shop_rating", shopRating.toString());
  }, [shopRating]);

  useEffect(() => {
    localStorage.setItem("kayuab_unlocked_instrs", JSON.stringify(unlockedInstruments));
  }, [unlockedInstruments]);

  useEffect(() => {
    localStorage.setItem("kayuab_unlocked_boxes", JSON.stringify(unlockedBoxes));
  }, [unlockedBoxes]);

  useEffect(() => {
    localStorage.setItem("kayuab_shop_rank", shopRank.toString());
  }, [shopRank]);

  const handleModifyCoins = (diff: number) => {
    setCoins((prev) => Math.max(0, prev + diff));
  };

  const handleUpdateInventory = (itemId: string, diff: number) => {
    setInventory((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + diff);
      return { ...prev, [itemId]: next };
    });
  };

  const handleUnlockInstrument = (inst: string) => {
    setUnlockedInstruments(prev => {
      if (prev.includes(inst)) return prev;
      return [...prev, inst];
    });
  };

  const handleUnlockBox = (boxId: string) => {
    setUnlockedBoxes(prev => {
      if (prev.includes(boxId)) return prev;
      return [...prev, boxId];
    });
  };

  const handleUpgradeShopRank = () => {
    setShopRank(prev => Math.min(4, prev + 1));
  };
  
  // Confetti particles for success celebration
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);

  // Find active level configuration
  const currentLevel = LEVELS.find((l) => l.id === activeLevelId) || LEVELS[0];

  useEffect(() => {
    // Lazy audio setup on interaction
    const handleGesture = () => {
      sound.init();
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchend", handleGesture);
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("touchend", handleGesture);
    
    // Default instrument loading
    sound.setInstrument("bubble");
    sound.setVolume(0.5);
    sound.setAmbientVolume(isPlayingSeaBg ? 0.15 : 0.0);

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchend", handleGesture);
    };
  }, []);

  // When sound on/off state switches
  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleToggleSeaBg = () => {
    sound.init();
    const nextIsPlaying = !isPlayingSeaBg;
    setIsPlayingSeaBg(nextIsPlaying);
    sound.setAmbientVolume(nextIsPlaying ? 0.15 : 0.0);
  };

  // Passive Rental System Logic
  const handleRentPipe = (itemId: string, payRate: number, name: string, quality: string) => {
    if ((inventory[itemId] || 0) <= 0) {
      sound.playPluck(150, 0.5);
      return;
    }
    // Decrement inventory
    handleUpdateInventory(itemId, -1);
    
    // Add to rentedItems list
    const newRentalId = `${itemId}_${Date.now()}`;
    const buyerNames = [
      "オルゴール演奏会", 
      "ネオン管サイバーギャラリー", 
      "レトロ喫茶「ハイドロ」", 
      "マリンバのサキ", 
      "地下水道研究都市", 
      "国立音響ホールの音源師"
    ];
    const chosenBuyer = buyerNames[Math.floor(Math.random() * buyerNames.length)];

    setRentedItems(prev => [
      ...prev,
      {
        id: newRentalId,
        name,
        payRate,
        renter: chosenBuyer,
        quality
      }
    ]);
    sound.playPopSound(523, 0.6); // positive pluck sound
  };

  const handleReturnRentedPipe = (rentalId: string, itemId: string) => {
    // Remove from rentedItems
    setRentedItems(prev => prev.filter(item => item.id !== rentalId));
    // Restore inventory
    handleUpdateInventory(itemId, 1);
    sound.playPopSound(392, 0.4);
  };

  const handleCollectRentAccumulated = () => {
    if (rentalAccumulatedCoins <= 0) return;
    setCoins(prev => prev + rentalAccumulatedCoins);
    setLastEarnedCoins(rentalAccumulatedCoins);
    setRentalAccumulatedCoins(0);
    setShowCoinToast(true);
    setTimeout(() => setShowCoinToast(false), 2400);
    sound.playSuccessFanfare();
  };

  // Co-Op Throwing Action Block Methods
  const getSkinStats = (skinId: string) => {
    switch (skinId) {
      case "golden":
        return { hp: 180, atk: 35, def: 15, skillName: "黄金の輝き洗礼 (全回復)", maxHp: 180 };
      case "bamboo":
        return { hp: 150, atk: 20, def: 10, skillName: "大自然の恵水流 (+60HP)", maxHp: 150 };
      case "cyberNeon":
        return { hp: 100, atk: 50, def: 3, skillName: "過負荷レーザー砲 (+25ATK)", maxHp: 100 };
      case "default":
      default:
        return { hp: 120, atk: 25, def: 5, skillName: "簡易自己修復 (+30HP)", maxHp: 120 };
    }
  };

  const handleSelectSkin = (skinId: string) => {
    const stats = getSkinStats(skinId);
    setActiveSkinId(skinId);
    setPlayerHP(stats.hp);
    setPlayerMaxHP(stats.maxHp);
    sound.playPopSound(523, 0.6);
  };

  const handleResetActionBattle = () => {
    const stats = getSkinStats(activeSkinId);
    setPlayerGridPos({ x: 1, y: 3 });
    setAllyGridPos({ x: 1, y: 1 });
    setEnemyGridPos({ x: 8, y: 3 });
    setPlayerHP(stats.hp);
    setPlayerMaxHP(stats.maxHp);
    setAllyHP(100);
    setEnemyHP(200);
    setHealCooldown(0);
    setIsShieldActive(false);
    setPlayerAmmo(3);
    setSuperGauge(0);
    setPlayerPowerCount(0);
    setPowerCubes([]);
    setChests([
      { id: "c1", x: 4, y: 1, hp: 50 },
      { id: "c2", x: 5, y: 4, hp: 50 },
      { id: "c3", x: 3, y: 2, hp: 50 }
    ]);
    setActionBattleWinner(null);
    setActionLog(["闘いの鐘が鳴り響いた！移動して宝箱を壊し、敵を倒そう。"]);
    sound.playPopSound(440, 0.5);
  };

  const handlePlayerMove = (dx: number, dy: number) => {
    if (playerHP <= 0 || actionBattleWinner) return;

    let targetCoords: { x: number; y: number } | null = null;

    setPlayerGridPos(prev => {
      const nx = Math.max(0, Math.min(9, prev.x + dx));
      const ny = Math.max(0, Math.min(6, prev.y + dy));

      // Check if trying to walk into a solid chest
      const collidesChest = chests.some(c => c.x === nx && c.y === ny && c.hp > 0);
      if (collidesChest) {
        setActionLog(logs => ["❌ そこには宝箱があります！攻撃して破壊しましょう。", ...logs.slice(0, 7)]);
        sound.playPluck(150, 0.5);
        return prev;
      }
      targetCoords = { x: nx, y: ny };
      return { x: nx, y: ny };
    });

    // Pick up Power Cube on land immediately
    setTimeout(() => {
      if (targetCoords) {
        const { x, y } = targetCoords;
        setPowerCubes(prev => {
          const matchCube = prev.find(cube => cube.x === x && cube.y === y && cube.hp > 0);
          if (matchCube) {
            setPlayerPowerCount(count => count + 1);
            setPlayerHP(hp => Math.min(playerMaxHP + 20, hp + 30));
            setPlayerMaxHP(max => max + 20);
            setActionLog(logs => [
              `⭐ パワーキューブ「緑の超エネルギー」を獲得！最大HP+20 / 攻撃力+15% 常時UP! 🌟`,
              ...logs.slice(0, 7)
            ]);
            sound.playPopSound(784, 0.65);
            return prev.filter(cube => !(cube.x === x && cube.y === y));
          }
          return prev;
        });

        // Bush entry logic
        const isBush = [{x: 3, y: 1}, {x: 3, y: 4}, {x: 5, y: 3}, {x: 7, y: 2}, {x: 7, y: 5}].some(b => b.x === x && b.y === y);
        if (isBush) {
          setActionLog(logs => ["🌲 草むら（ブッシュ）に隠れた！スモッグの視界から消え隠密状態中！", ...logs.slice(0, 7)]);
          sound.playPopSound(440, 0.2);
        }
      }
    }, 20);
  };

  const spawnPowerCube = (cx: number, cy: number) => {
    setPowerCubes(prev => [
      ...prev,
      { id: `cube-${Date.now()}-${Math.random()}`, x: cx, y: cy, hp: 1 }
    ]);
  };

  const handleThrowPipeAction = () => {
    if (playerHP <= 0 || actionBattleWinner) return;

    if (playerAmmo <= 0) {
      setActionLog(logs => ["⚠️ 弾薬（Ammo）が足りない！自動リチャージを待って！ 🔴", ...logs.slice(0, 7)]);
      sound.playPluck(100, 0.4);
      return;
    }

    // Spend 1 Ammo
    setPlayerAmmo(prev => Math.max(0, prev - 1));

    const stats = getSkinStats(activeSkinId);
    const multiplier = 1 + playerPowerCount * 0.15;
    const damage = Math.floor(stats.atk * multiplier);

    let targetHit = false;
    const distToEnemy = Math.abs(playerGridPos.x - enemyGridPos.x) + Math.abs(playerGridPos.y - enemyGridPos.y);

    if (distToEnemy <= 4 && enemyHP > 0) {
      targetHit = true;
      setSuperGauge(prev => {
        const next = Math.min(100, prev + 25);
        if (next >= 100 && prev < 100) {
          sound.playSuccessFanfare();
        }
        return next;
      });

      setEnemyHP(prev => {
        const next = Math.max(0, prev - damage);
        if (next <= 0) {
          setActionBattleWinner("player");
          setCoins(c => c + 350);
          sound.playSuccessFanfare();
        }
        return next;
      });

      sound.playPluck(784, 0.6);
      setActionLog(logs => [
        `🎯 水道管アタック！スモッグに ${damage} ダメージ！ (ウルト+25%) ⚡`,
        ...logs.slice(0, 7)
      ]);
    } else {
      let hitChestId = "";
      chests.forEach(c => {
        if (c.hp > 0) {
          const distToChest = Math.abs(playerGridPos.x - c.x) + Math.abs(playerGridPos.y - c.y);
          if (distToChest <= 1.5) {
            hitChestId = c.id;
          }
        }
      });

      if (hitChestId) {
        targetHit = true;
        setSuperGauge(prev => Math.min(100, prev + 20));

        setChests(prev => prev.map(c => {
          if (c.id === hitChestId) {
            const nextHp = Math.max(0, c.hp - damage);
            if (nextHp === 0) {
              spawnPowerCube(c.x, c.y);
              setCoins(prevCoins => prevCoins + 75);
              sound.playSuccessFanfare();
              setActionLog(logs => [
                `🎁 宝箱を破壊した！輝くパワーキューブ⭐が出現！+75c 獲得！`,
                ...logs.slice(0, 7)
              ]);
            } else {
              setActionLog(logs => [
                `💥 宝箱を叩いた！ 残りHP: ${nextHp} (ウルト+20%)`,
                ...logs.slice(0, 7)
              ]);
            }
            return { ...c, hp: nextHp };
          }
          return c;
        }));
        sound.playPluck(330, 0.6);
      }
    }

    if (!targetHit) {
      setActionLog(logs => ["💨 空ぶった！射程4以上の外に投げてしまった。", ...logs.slice(0, 7)]);
      sound.playPluck(220, 0.3);
    }
  };

  const handleSuperAttackAction = () => {
    if (playerHP <= 0 || actionBattleWinner || superGauge < 100) return;

    setSuperGauge(0);
    const stats = getSkinStats(activeSkinId);
    const multiplier = 1 + playerPowerCount * 0.15;
    const superDamage = Math.floor(stats.atk * 3 * multiplier);

    sound.playSuccessFanfare();

    // Pierce/Smash enemy Smogg
    if (enemyHP > 0) {
      setEnemyHP(prev => {
        const next = Math.max(0, prev - superDamage);
        if (next <= 0) {
          setActionBattleWinner("player");
          setCoins(c => c + 350);
        }
        return next;
      });
    }

    // Blast and pierce ALL chests
    setChests(prev => prev.map(c => {
      if (c.hp > 0) {
        const nextHp = Math.max(0, c.hp - superDamage);
        if (nextHp === 0) {
          spawnPowerCube(c.x, c.y);
          setCoins(cv => cv + 75);
        }
        return { ...c, hp: nextHp };
      }
      return c;
    }));

    // Super self-heal
    setPlayerHP(prev => Math.min(playerMaxHP, prev + 50));

    setActionLog(logs => [
      `🌟🌟🌟 必殺ウルトラ：メガ水道管バースト！！！ 🌟🌟🌟 全てを貫通してスモッグに ${superDamage} ダメージ ＆ 体力+50回復！`,
      ...logs.slice(0, 7)
    ]);
  };

  const handleActionHealSkill = () => {
    if (playerHP <= 0 || healCooldown > 0 || actionBattleWinner) return;

    const stats = getSkinStats(activeSkinId);
    let healAmount = 30;
    if (activeSkinId === "bamboo") healAmount = 60;
    if (activeSkinId === "golden") healAmount = 180;

    setPlayerHP(prev => Math.min(playerMaxHP, prev + healAmount));
    setHealCooldown(4);
    sound.playPopSound(659, 0.7);
    setActionLog(logs => [
      `💚 特典技「${stats.skillName}」発動！体力 ${healAmount} 回復。`,
      ...logs.slice(0, 7)
    ]);
  };

  const handleEnemyTurnTick = () => {
    if (enemyHP <= 0 || playerHP <= 0 || actionBattleWinner) return;

    const grassCells = [{x: 3, y: 1}, {x: 3, y: 4}, {x: 5, y: 3}, {x: 7, y: 2}, {x: 7, y: 5}];
    const isPlayerHidden = grassCells.some(cell => cell.x === playerGridPos.x && cell.y === playerGridPos.y);

    setHealCooldown(prev => Math.max(0, prev - 1));

    // Enemy movement behavior: track player in real time
    setEnemyGridPos(prev => {
      let dx = 0;
      let dy = 0;
      if (!isPlayerHidden && Math.random() > 0.3) {
        dx = playerGridPos.x > prev.x ? 1 : playerGridPos.x < prev.x ? -1 : 0;
        dy = playerGridPos.y > prev.y ? 1 : playerGridPos.y < prev.y ? -1 : 0;
      } else {
        dx = Math.floor(Math.random() * 3) - 1;
        dy = Math.floor(Math.random() * 3) - 1;
      }
      return {
        x: Math.max(0, Math.min(9, prev.x + dx)),
        y: Math.max(0, Math.min(6, prev.y + dy))
      };
    });

    // Enemy attack
    const rand = Math.random();
    if (rand > 0.35) {
      if (isPlayerHidden) {
        setActionLog(logs => [
          "🌲 スモッグはキョロキョロしている... 草むらに隠れているあなたを見失った！",
          ...logs.slice(0, 7)
        ]);
      } else {
        const baseDamage = Math.max(2, 22 - (activeSkinId === "golden" ? 15 : activeSkinId === "bamboo" ? 10 : 5));
        const damage = isShieldActive ? Math.max(0, Math.floor(baseDamage * 0.1)) : baseDamage;

        setPlayerHP(prev => {
          const next = Math.max(0, prev - damage);
          if (next <= 0) {
            setActionBattleWinner("enemy");
            sound.playPluck(150, 0.8);
          }
          return next;
        });

        // Charging Super Gauge when taking damage (Brawl Stars style!)
        setSuperGauge(prev => Math.min(100, prev + 8));

        if (isShieldActive) {
          setActionLog(logs => [
            `🛡️ ガギィィン！水道管シールドで防御！ダメージを ${damage} に激減！ (ウルト+8%)`,
            ...logs.slice(0, 7)
          ]);
          sound.playPopSound(880, 0.5);
        } else {
          setActionLog(logs => [
            `⚠️ スモッグがサビ水道管をぶん投げた！ 被害: ${damage} ダメージ！ (ウルト+8%)`,
            ...logs.slice(0, 7)
          ]);
          sound.playPluck(180, 0.5);
        }
      }
    } else {
      if (allyHP > 0) {
        const allyAtk = 18;
        setEnemyHP(prev => {
          const next = Math.max(0, prev - allyAtk);
          if (next <= 0) {
            setActionBattleWinner("player");
            setCoins(c => c + 350);
            sound.playSuccessFanfare();
          }
          return next;
        });
        setActionLog(logs => [
          `🤝 味方配管ウサギ「ラビィ」がサビ管で援護射撃！スモッグに ${allyAtk} ダメージ！`,
          ...logs.slice(0, 7)
        ]);
        sound.playPopSound(523, 0.5);
      }
    }
  };

  // Real-time Game Loop for Brawl Stars (Brosta) action feel!
  useEffect(() => {
    if (activeTab !== "pvp" || pvpSubMode !== "action" || playerHP <= 0 || actionBattleWinner) return;

    const interval = setInterval(() => {
      // 1. Recharge Ammo
      setPlayerAmmo(prev => Math.min(3, prev + 1));

      // 2. Slow passive healing in grass
      const isPlayerInBush = [{x: 3, y: 1}, {x: 3, y: 4}, {x: 5, y: 3}, {x: 7, y: 2}, {x: 7, y: 5}]
        .some(cell => cell.x === playerGridPos.x && cell.y === playerGridPos.y);
      if (isPlayerInBush) {
        setPlayerHP(prev => Math.min(playerMaxHP, prev + 10));
      }

      // 3. Enemy AI action tick
      handleEnemyTurnTick();
    }, 1100);

    return () => clearInterval(interval);
  }, [activeTab, pvpSubMode, playerHP, actionBattleWinner, playerGridPos, playerMaxHP, enemyHP, enemyGridPos, isShieldActive, activeSkinId]);

  // Action Battle Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "pvp" || pvpSubMode !== "action" || playerHP <= 0 || actionBattleWinner) return;
      const key = e.key.toLowerCase();

      // Avoid page scroll for direction triggers
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (key === "w" || key === "arrowup") {
        handlePlayerMove(0, -1);
      } else if (key === "s" || key === "arrowdown") {
        handlePlayerMove(0, 1);
      } else if (key === "a" || key === "arrowleft") {
        handlePlayerMove(-1, 0);
      } else if (key === "d" || key === "arrowright") {
        handlePlayerMove(1, 0);
      } else if (e.key === " " || key === "q") {
        handleThrowPipeAction();
      } else if (key === "e" || key === "r" || key === "f") {
        if (superGauge >= 100) {
          handleSuperAttackAction();
        } else {
          setActionLog(logs => [`⚡ ウルトラ技が未充填です！ (${superGauge}% / 100%)。敵を攻撃して溜めましょう。`, ...logs.slice(0, 7)]);
          sound.playPluck(100, 0.3);
        }
      } else if (key === "shift" || key === "x" || key === "c") {
        setIsShieldActive(prev => {
          const next = !prev;
          if (next) {
            sound.playPopSound(200, 0.4);
            setActionLog(logs => ["🛡️ 水道管を盾にした！防御状態中（被ダメージ90%カット、サビ管防御！）", ...logs.slice(0, 7)]);
          } else {
            sound.playPopSound(150, 0.4);
            setActionLog(logs => ["🔓 盾の構えを解除した。", ...logs.slice(0, 7)]);
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab, pvpSubMode, playerHP, actionBattleWinner, playerGridPos, chests, enemyGridPos, enemyHP, activeSkinId, isShieldActive, superGauge, playerPowerCount, powerCubes]);

  // State for reward coin toasts
  const [showCoinToast, setShowCoinToast] = useState<boolean>(false);
  const [latestReview, setLatestReview] = useState<{ buyer: string; avatar: string; rating: number; text: string } | null>(null);
  const [clearedMode, setClearedMode] = useState<"use" | "sell" | null>(null);
  const [lastEarnedCoins, setLastEarnedCoins] = useState<number>(0);

  // PVP Battle ticker effect
  useEffect(() => {
    let interval: any = null;
    if (pvpIsActive && !pvpWinner) {
      // Calculate active inventory pipe advantage (水道管連鎖アドバンテージ)
      // Having more pipes makes battle easier by slowing down the rival
      let ownedPipesCount = 0;
      Object.keys(inventory).forEach(k => {
        const amt = inventory[k];
        if (typeof amt === "number") {
          ownedPipesCount += amt;
        }
      });
      const slowdownFactor = Math.max(0.2, 1 - (ownedPipesCount * 0.04));

      let tickRate = 1.0; 
      if (pvpRivalId === "saki") {
        tickRate = 2.4; 
      } else if (pvpRivalId === "yoshi") {
        tickRate = 5.2; 
      }

      // Apply slowdown advantage
      const adjustedTickRate = tickRate * slowdownFactor;

      interval = setInterval(() => {
        setRivalProgress((prev) => {
          const next = Math.min(100, Math.round((prev + adjustedTickRate) * 10) / 10);
          if (next >= 100) {
            setPvpWinner("rival");
            sound.playPluck(180, 0.8); // defeat pitch
            clearInterval(interval);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pvpIsActive, pvpWinner, pvpRivalId, inventory]);

  // Stage clear handler with specific mode choice (locally used or sold to a buyer)
  const handleLevelClear = (
    mode: "use" | "sell",
    earnedCoins: number,
    ratingDelta: number,
    buyerReview?: { buyer: string; avatar: string; rating: number; text: string }
  ) => {
    if (pvpIsActive) {
      if (!pvpWinner) {
        setPvpWinner("player");
        let cashPrize = 60;
        if (pvpRivalId === "saki") cashPrize = 150;
        if (pvpRivalId === "yoshi") cashPrize = 390;
        
        handleModifyCoins(cashPrize);
        sound.playMusicBox(783.99, 1.2);
        setLastEarnedCoins(cashPrize);
        setClearedMode("sell");
        setShowCoinToast(true);
        setTimeout(() => setShowCoinToast(false), 4500);

        // particles
        const arr = Array.from({ length: 45 }).map((_, idx) => ({
          id: Date.now() + idx,
          x: 10 + Math.random() * 80, 
          y: 100, 
          size: 4 + Math.random() * 12,
          color: ["#ec4899", "#a855f7", "#3b82f6", "#f43f5e", "#10b981"][Math.floor(Math.random() * 5)]
        }));
        setParticles(arr);
        setTimeout(() => setParticles([]), 3500);
      }
      return; 
    }

    if (!completedLevels.includes(activeLevelId)) {
      setCompletedLevels((prev) => [...prev, activeLevelId]);
    }
    
    // Reward Coins
    handleModifyCoins(earnedCoins);
    setLastEarnedCoins(earnedCoins);
    setClearedMode(mode);

    // Apply Rating increment (if any)
    if (ratingDelta > 0) {
      setShopRating((prev) => Math.min(5.0, Math.round((prev + ratingDelta) * 100) / 100));
    }

    if (buyerReview) {
      setLatestReview(buyerReview);
    } else {
      setLatestReview(null);
    }

    setShowCoinToast(true);
    setTimeout(() => {
      setShowCoinToast(false);
      setLatestReview(null);
      setClearedMode(null);
    }, 6500);

    // Generate beautiful celebrate water bubbles / particles
    const arr = Array.from({ length: 45 }).map((_, idx) => ({
      id: Date.now() + idx,
      x: 10 + Math.random() * 80, // % from left
      y: 100, // starts at bottom
      size: 4 + Math.random() * 12,
      color: ["#2dd4bf", "#06b6d4", "#f59e0b", "#38bdf8", "#34d399"][Math.floor(Math.random() * 5)]
    }));
    setParticles(arr);

    // Auto-progress to next level after brief delay
    setTimeout(() => {
      const nextId = activeLevelId + 1;
      if (LEVELS.some((l) => l.id === nextId)) {
        setActiveLevelId(nextId);
      }
      setParticles([]);
    }, 4500);
  };

  // Ambient Drone generator (creates arbitrary pleasant melodic loops)
  const [ambientNotesTriggered, setAmbientNotesTriggered] = useState<number>(0);
  const triggerAmbientPluck = () => {
    // Pentatonic scale
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    const randomIndex = Math.floor(Math.random() * pentatonic.length);
    const frequency = pentatonic[randomIndex];
    
    sound.playPluck(frequency, 1.4);
    setAmbientNotesTriggered(prev => prev + 1);
  };

  // Total clear evaluation
  const isGameAllCompleted = completedLevels.length === LEVELS.length;

  const activeRankConfig = SHOP_RANKS.find(r => r.rank === shopRank) || SHOP_RANKS[0];

  return (
    <div 
      id="kayuab-app" 
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-teal-500 selection:text-neutral-950 font-sans overflow-x-hidden"
    >
      {/* Absolute Ambient Background Lights */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Celebration Particle Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.5, x: `${p.x}vw`, y: "110vh" }}
            animate={{ 
              opacity: [0, 1, 0.8, 0], 
              scale: [0.5, 1.2, 0.8],
              y: "-10vh",
              x: `${p.x + (Math.random() * 10 - 5)}vw`
            }}
            transition={{ duration: 3.5 + Math.random() * 1.5, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`
            }}
          />
        ))}
      </div>

      {/* Minimalistic Header */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-6 md:pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-[#2ffff3] flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.25)] animate-pulse">
            <Droplet className="w-5 h-5 text-neutral-950 fill-neutral-950/20" />
          </div>
          <div className="space-y-0.5">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-350 bg-clip-text text-transparent">
              KayuAB
            </span>
            <span className="block text-[10px] text-teal-400 font-bold font-mono tracking-wider uppercase">
              ~ AQUATIC MELODIC PUZZLE ~
            </span>
          </div>
        </div>

        {/* Persistent top metrics bar */}
        <div className="flex items-center flex-wrap justify-center gap-3">
          {/* Rank Badge */}
          <div className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-neutral-400">店格:</span>
            <span className="text-yellow-400 font-extrabold">{activeRankConfig.name.split(" ")[0]}</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono flex items-center gap-1.5">
            <b className="text-pink-400">ショップ評価:</b>
            <span className="text-neutral-100 font-bold">★{shopRating.toFixed(2)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10.5px] font-mono text-neutral-40 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-300 font-extrabold">{coins}c</span>
          </div>

          <button
            onClick={handleToggleSeaBg}
            className={`p-1.5 px-3 rounded-xl border text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              isPlayingSeaBg 
                ? "bg-teal-950/40 border-teal-500/40 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.15)]"
                : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-350"
            }`}
            title="海洋アンビエント（海洋自然音ループ）をON/OFFします"
          >
            🌊 {isPlayingSeaBg ? "アンビエント：ON" : "アンビエント：OFF"}
          </button>

          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 transition-colors border border-neutral-800/80 cursor-pointer"
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-5 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="p-1 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex flex-wrap gap-1">
          <button
            onClick={() => { sound.playPluck(330, 0.6); setActiveTab("puzzle"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              activeTab === "puzzle"
                ? "bg-gradient-to-r from-teal-500 to-[#2ffff3] text-neutral-950 shadow-[0_4px_12px_rgba(45,212,191,0.25)] font-extrabold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            水道管パズル
          </button>
          
          <button
            onClick={() => { sound.playPluck(392, 0.65); setActiveTab("gacha"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              activeTab === "gacha"
                ? "bg-gradient-to-r from-teal-500 to-[#2ffff3] text-neutral-950 shadow-[0_4px_12px_rgba(45,212,191,0.25)] font-extrabold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <PackageCheck className="w-4 h-4 text-emerald-300" />
            BB入荷＆売買市場
          </button>

          <button
            onClick={() => { sound.playPluck(440, 0.6); setActiveTab("ambient"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              activeTab === "ambient"
                ? "bg-gradient-to-r from-teal-500 to-[#2ffff3] text-neutral-950 shadow-[0_4px_12px_rgba(45,212,191,0.25)] font-extrabold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Music className="w-4 h-4" />
            癒やしの滴
          </button>

          <button
            onClick={() => { sound.playPluck(523, 0.6); setActiveTab("pvp"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              activeTab === "pvp"
                ? "bg-gradient-to-r from-teal-500 to-[#2ffff3] text-neutral-950 shadow-[0_4px_12px_rgba(45,212,191,0.25)] font-extrabold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            水道管対戦 (PVP)
          </button>

          <button
            onClick={() => { sound.playPluck(587, 0.65); setActiveTab("missions"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              activeTab === "missions"
                ? "bg-gradient-to-r from-teal-500 to-[#2ffff3] text-neutral-950 shadow-[0_4px_12px_rgba(45,212,191,0.25)] font-extrabold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Award className="w-4 h-4 text-amber-300 animate-bounce" style={{ animationDuration: "3s" }} />
            ミッション・連日記録
          </button>

          <button
            onClick={() => { sound.playPluck(659, 0.6); setActiveTab("guestbook"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              activeTab === "guestbook"
                ? "bg-gradient-to-r from-teal-500 to-[#2ffff3] text-neutral-950 shadow-[0_4px_12px_rgba(45,212,191,0.25)] font-extrabold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Home className="w-4 h-4 text-sky-400" />
            店舗評価クチコミ板
          </button>
        </div>

        {/* Simple short description */}
        <div className="text-[11px] text-neutral-550 hidden md:block select-none max-w-sm text-right leading-snug">
          パズルを接続して稼いだ資金で
          <span className="text-teal-400 font-bold"> 店舗改装 </span>
          や 
          <span className="text-amber-400 font-bold"> ボックス入荷 </span>
          を行い、日本一のハイエンド水道ショップを創り上げましょう！
        </div>
      </div>

      {/* Main Tab Render Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 z-10 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PIPE PUZZLE ACTION */}
          {activeTab === "puzzle" && (
            <motion.div
              key="puzzle-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Level selector (4 columns) */}
                <div className="lg:col-span-4 bg-neutral-900/30 p-5 rounded-3xl border border-neutral-850 backdrop-blur-md space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs tracking-wider uppercase text-neutral-450 font-mono">
                      配管工事依頼リスト
                    </h3>
                    <p className="text-[10px] text-neutral-500 leading-snug">
                      ステージを巡り、水流ネットワークを構築。売却利益で店舗の規模と取扱ボックスを増やせます。
                    </p>
                  </div>
                  <LevelSelector 
                    levels={LEVELS} 
                    activeLevelId={activeLevelId} 
                    completedLevels={completedLevels}
                    onSelectLevel={(id) => {
                      sound.playPopSound(440, 0.1);
                      setActiveLevelId(id);
                    }}
                  />
                </div>

                {/* Main Interactive Grid (8 columns) */}
                <div className="lg:col-span-8">
                  <div className="text-center mb-4 space-y-1 select-none">
                    <span className="text-[10px] text-teal-400 tracking-widest font-extrabold uppercase bg-teal-500/10 px-2 py-0.5 border border-teal-500/20 rounded">
                      依頼 {currentLevel.id}: {currentLevel.name}
                    </span>
                    <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-neutral-100 flex items-center justify-center gap-1 ml-1.5">
                      {currentLevel.difficulty === "初級" ? "🟢" : currentLevel.difficulty === "中級" ? "🟡" : "🔴"}{" "}
                      難易度: {currentLevel.difficulty} ({currentLevel.size.width}x{currentLevel.size.height})
                    </h2>
                  </div>

                  <PipeCellGridWrap
                    level={currentLevel}
                    onLevelComplete={handleLevelClear}
                    selectedInstrument={currentInstrument}
                    onMuteToggle={handleMuteToggle}
                    isMuted={isMuted}
                    shopRating={shopRating}
                    coins={coins}
                    onModifyCoins={handleModifyCoins}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BOX OPEN & TRADING MARKET */}
          {activeTab === "gacha" && (
            <motion.div
              key="gacha-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <GachaMarket 
                coins={coins}
                onModifyCoins={handleModifyCoins}
                inventory={inventory}
                onUpdateInventory={handleUpdateInventory}
                shopRating={shopRating}
                onIncreaseRating={(amt) => setShopRating(prev => Math.min(5.0, Math.round((prev + amt) * 100) / 100))}
                unlockedBoxes={unlockedBoxes}
                onUnlockBox={handleUnlockBox}
                shopRank={shopRank}
                onUpgradeShopRank={handleUpgradeShopRank}
              />
            </motion.div>
          )}

          {/* TAB 3: RELAXING AMBIENT INSTRUMENTS */}
          {activeTab === "ambient" && (
            <motion.div
              key="ambient-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="text-center max-w-xl mx-auto space-y-1.5 select-none my-2">
                <span className="text-[10px] text-teal-400 tracking-widest font-bold uppercase bg-teal-500/10 px-2 py-0.5 border border-teal-500/20 rounded">
                  癒やしのサウンドパビリオン
                </span>
                <h2 className="text-xl font-bold tracking-tight text-neutral-100">
                  海洋アンビエント ＆ 自動奏でデバイス
                </h2>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  波の音を流しながら、下のボタンを自由にタップして、リアルタイムのペンタトニックスケールの和音を奏でましょう。心やすらぐ一時を演出します。
                </p>
              </div>

              {/* Sound controller */}
              <SoundSettings 
                currentInstrument={currentInstrument}
                onInstrumentChange={(i) => setCurrentInstrument(i)}
                isMuted={isMuted}
                onMuteToggle={handleMuteToggle}
                coins={coins}
                onModifyCoins={handleModifyCoins}
                unlockedInstruments={unlockedInstruments}
                onUnlockInstrument={handleUnlockInstrument}
              />

              {/* Tactile Ambient tapping board */}
              <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border border-neutral-800 bg-neutral-900/10 backdrop-blur-md text-center space-y-6">
                <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
                  <span>AMBIENT DRONE SYSTEM</span>
                  <span className="text-teal-400 animate-pulse">● READY</span>
                </div>

                <div 
                  onClick={triggerAmbientPluck}
                  className="w-48 h-48 rounded-full bg-gradient-to-tr from-teal-500/10 to-indigo-500/5 hover:from-teal-500/20 hover:to-indigo-500/15 border border-teal-500/35 flex flex-col items-center justify-center cursor-pointer mx-auto transition-all duration-500 hover:scale-105 active:scale-95 group shadow-2xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="flex flex-col items-center"
                  >
                    <Droplet className="w-12 h-12 text-teal-400 fill-teal-400/20 group-hover:scale-110 transition-transform" />
                  </motion.div>
                  <span className="text-xs text-neutral-200 mt-3 font-semibold font-sans tracking-wide">
                    タップして雫を奏でる 🎶
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono mt-1">
                    累積再生: {ambientNotesTriggered} 音
                  </span>
                </div>

                <div className="text-[10px] text-neutral-550 leading-relaxed font-sans">
                  ヒント: イヤホンでご視聴いただくと、より豊かな音響空間をお楽しみいただけます。<br />
                  お金（Coins）をためて「Sound Customizer」からオルゴールやマリンバ、キーボード打鍵のプレミアム音色もアンロックしましょう！
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: WATER PIPE PVP BATTLE */}
          {activeTab === "pvp" && (
            <motion.div
              key="pvp-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Top Banner */}
              <div className="text-center max-w-xl mx-auto space-y-1.5 select-none my-2">
                <span className="text-[10px] text-pink-400 tracking-widest font-bold uppercase bg-pink-500/10 px-2 py-0.5 border border-pink-500/20 rounded-full">
                  配管スピード ＆ 格闘アリーナ
                </span>
                <h2 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center justify-center gap-1.5">
                  ⚔️ 水道管マルチバトルセンター
                </h2>
                <p className="text-sm text-neutral-400 font-sans leading-relaxed">
                  スピード建築バトル、アクションを競う投げ合いバトル、さらに水道管を不労賃貸するレンタルシステムを完備！
                </p>
              </div>

              {/* Mode Selectors Slider tabs */}
              <div className="flex bg-neutral-900/60 p-1.5 rounded-2xl border border-neutral-800 max-w-xl mx-auto gap-2 text-xs font-bold font-mono">
                <button
                  onClick={() => { setPvpSubMode("puzzle"); sound.playPluck(330, 0.4); }}
                  className={`flex-1 py-2.5 rounded-xl transition text-center cursor-pointer ${
                    pvpSubMode === "puzzle" 
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-neutral-100 shadow-[0_4px_12px_rgba(239,68,68,0.2)] font-extrabold" 
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  お題スピード戦 🧩
                </button>
                <button
                  onClick={() => { setPvpSubMode("action"); handleResetActionBattle(); }}
                  className={`flex-1 py-2.5 rounded-xl transition text-center cursor-pointer ${
                    pvpSubMode === "action" 
                      ? "bg-gradient-to-r from-teal-500 to-indigo-500 text-neutral-100 shadow-[0_4px_12px_rgba(20,184,166,0.2)] font-extrabold" 
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  投げ合い協力戦 ⚔️
                </button>
                <button
                  onClick={() => { setPvpSubMode("rent"); sound.playPluck(554, 0.4); }}
                  className={`flex-1 py-2.5 rounded-xl transition text-center cursor-pointer ${
                    pvpSubMode === "rent" 
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-950 shadow-[0_4px_12px_rgba(245,158,11,0.2)] font-extrabold" 
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  水道管レンタル 🏢
                </button>
              </div>

              {/* ----------------- MODE 1: PUZZLE SPEED SHOWDOWN ----------------- */}
              {pvpSubMode === "puzzle" && (
                <div className="space-y-6">
                  {!pvpIsActive ? (
                    /* Select Opponent Screen */
                    <div className="max-w-xl mx-auto bg-neutral-900/35 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-3 gap-2">
                        <h3 className="text-sm font-bold text-neutral-350 tracking-wider uppercase font-mono">
                          対戦相手（ライバル配管工）一覧
                        </h3>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg text-emerald-400 font-mono text-[9.5px]">
                          🧪 配管数アドバンテージ： {Object.values(inventory).reduce((acc: number, val: number) => acc + val, 0)} 個所致中
                        </div>
                      </div>

                      {/* Advantage detail tip */}
                      <p className="text-[10px] text-teal-400 leading-snug font-sans bg-teal-950/20 p-3 rounded-xl border border-teal-500/10 mb-2">
                        💡 <strong>水道管所持ボーナス発動中！</strong> パイプ部品を多く所持しているほど、ライバルの建築スピードが最大で <b>80%</b> スローダウン(減速補正)され、バトルクリアが圧倒的に有利になります！
                      </p>

                      <div className="space-y-3.5">
                        {/* Rival 1: Tatsu */}
                        <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-neutral-900/40">
                          <div className="flex items-start space-x-3">
                            <span className="text-2.5xl p-2 bg-neutral-900 rounded-xl">👦</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-extrabold text-neutral-200">見習い配管工 タツ</h4>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-green-500/15 text-green-400 font-bold">初級</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                                「まだ始めて1週間だけど、一生懸命がんばるよ！お手柔らかにね。」
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-end justify-between font-mono text-[10px] sm:text-right border-t sm:border-t-0 border-neutral-900 pt-2 sm:pt-0">
                            <div>
                              <span className="text-neutral-500">参加費:</span>{" "}
                              <span className="text-yellow-400 font-bold">25c</span>
                            </div>
                            <div>
                              <span className="text-neutral-500">勝利報酬:</span>{" "}
                              <span className="text-emerald-400 font-bold">+60c</span>
                            </div>
                            <button
                              onClick={() => {
                                if (coins < 25) {
                                  sound.playPluck(150, 0.5);
                                  return;
                                }
                                sound.playPopSound(392, 0.4);
                                sound.playPluck(523, 0.6);
                                handleModifyCoins(-25);
                                setPvpRivalId("tatsu");
                                setRivalProgress(0);
                                setPvpWinner(null);
                                setPvpIsActive(true);
                              }}
                              disabled={coins < 25}
                              className={`mt-2 py-1 px-3.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                                coins >= 25 
                                  ? "bg-teal-500 text-neutral-955 hover:scale-105 active:scale-95 font-extrabold" 
                                  : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
                              }`}
                            >
                              {coins >= 25 ? "対戦スタート" : "資金不足"}
                            </button>
                          </div>
                        </div>

                        {/* Rival 2: Saki */}
                        <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-neutral-900/40">
                          <div className="flex items-start space-x-3">
                            <span className="text-2.5xl p-2 bg-neutral-900 rounded-xl">⚡</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-extrabold text-neutral-200">急速ハイドロのサキ</h4>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-yellow-500/15 text-yellow-450 font-bold">中級</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                                「スピードこそ命。私の電光石火のねじ込み締め付けについてこれるかしら？」
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-end justify-between font-mono text-[10px] sm:text-right border-t sm:border-t-0 border-neutral-900 pt-2 sm:pt-0">
                            <div>
                              <span className="text-neutral-500">参加費:</span>{" "}
                              <span className="text-yellow-400 font-bold">50c</span>
                            </div>
                            <div>
                              <span className="text-neutral-500">勝利報酬:</span>{" "}
                              <span className="text-emerald-400 font-bold">+150c</span>
                            </div>
                            <button
                              onClick={() => {
                                if (coins < 50) {
                                  sound.playPluck(150, 0.5);
                                  return;
                                }
                                sound.playPopSound(392, 0.4);
                                sound.playPluck(587, 0.6);
                                handleModifyCoins(-50);
                                setPvpRivalId("saki");
                                setRivalProgress(0);
                                setPvpWinner(null);
                                setPvpIsActive(true);
                              }}
                              disabled={coins < 50}
                              className={`mt-2 py-1 px-3.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                                coins >= 50 
                                  ? "bg-teal-500 text-neutral-955 hover:scale-105 active:scale-95 font-extrabold" 
                                  : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
                              }`}
                            >
                              {coins >= 50 ? "対戦スタート" : "資金不足"}
                            </button>
                          </div>
                        </div>

                        {/* Rival 3: Yoshi */}
                        <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-neutral-900/40">
                          <div className="flex items-start space-x-3">
                            <span className="text-2.5xl p-2 bg-neutral-900 rounded-xl">👑</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-extrabold text-neutral-200">配管王マスター・ヨシ</h4>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/15 text-rose-400 font-bold">上級者</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                                「100万本の管を調律してきた。水流の歌声を聴き、瞬く間に正解を導こう。」
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-end justify-between font-mono text-[10px] sm:text-right border-t sm:border-t-0 border-neutral-900 pt-2 sm:pt-0">
                            <div>
                              <span className="text-neutral-500">参加費:</span>{" "}
                              <span className="text-yellow-400 font-bold">120c</span>
                            </div>
                            <div>
                              <span className="text-neutral-500">勝利報酬:</span>{" "}
                              <span className="text-emerald-400 font-bold">+390c</span>
                            </div>
                            <button
                              onClick={() => {
                                if (coins < 120) {
                                  sound.playPluck(150, 0.5);
                                  return;
                                }
                                sound.playPopSound(392, 0.4);
                                sound.playPluck(659, 0.6);
                                handleModifyCoins(-120);
                                setPvpRivalId("yoshi");
                                setRivalProgress(0);
                                setPvpWinner(null);
                                setPvpIsActive(true);
                              }}
                              disabled={coins < 120}
                              className={`mt-2 py-1 px-3.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                                coins >= 120 
                                  ? "bg-teal-500 text-neutral-955 hover:scale-105 active:scale-95 font-extrabold" 
                                  : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
                              }`}
                            >
                              {coins >= 120 ? "対戦スタート" : "資金不足"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Ongoing Battle Screen */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Rival Speed Panel */}
                      <div className="md:col-span-4 bg-neutral-900/35 border border-neutral-800 p-5 rounded-3xl space-y-4">
                        <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
                          <span className="text-2xl">
                            {pvpRivalId === "tatsu" ? "👦" : pvpRivalId === "saki" ? "⚡" : "👑"}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-200">
                              {pvpRivalId === "tatsu" ? "見習い配管工 タツ" : pvpRivalId === "saki" ? "急速ハイドロのサキ" : "配管王マスター・ヨシ"}
                            </h4>
                            <span className="text-[8px] text-neutral-500 font-mono tracking-wider">OPPONENT AI RADAR</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-teal-950/20 p-2 border border-teal-500/20 text-[9px] text-teal-400 font-mono rounded-lg">
                            🔧 部品数ボーナスにより、ライバルの建築速度が遅くなっています！
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-neutral-400">ライバルの進捗状況:</span>
                              <span className={`${rivalProgress >= 80 ? "text-rose-400 font-extrabold animate-pulse" : "text-yellow-400 font-bold"}`}>
                                {rivalProgress}%
                              </span>
                            </div>

                            <div className="w-full bg-neutral-950 h-3.5 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${
                                  rivalProgress >= 80 ? "from-rose-500 to-amber-500" : "from-teal-500 to-emerald-500"
                                }`}
                                animate={{ width: `${rivalProgress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>

                        {pvpWinner && (
                          <div className={`p-4 rounded-xl border text-center space-y-2.5 ${
                            pvpWinner === "player"
                              ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                              : "bg-rose-950/20 border-rose-500/40 text-rose-300 animate-pulse"
                          }`}>
                            <h4 className="text-sm font-extrabold tracking-wider uppercase">
                              {pvpWinner === "player" ? "👑 VICTORY 👑" : "☠️ BATTLE LOST ☠️"}
                            </h4>
                            <p className="text-[10px] leading-relaxed">
                              {pvpWinner === "player" 
                                ? "見事にライバルより早く全ての水流管を接合し、正解のメロディを奏でました！" 
                                : "ライバルが先に水流をフルパワー接続しました。"}
                            </p>
                            <button
                              onClick={() => {
                                sound.playPopSound(300, 0.2);
                                setPvpIsActive(false);
                                setPvpWinner(null);
                              }}
                              className="mt-2 text-[10px] font-bold bg-neutral-900 border border-neutral-800 text-neutral-200 py-1.5 px-3 rounded-lg hover:bg-neutral-800 cursor-pointer"
                            >
                              ロビーへ戻る
                            </button>
                          </div>
                        )}

                        <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-900 text-[10px] text-neutral-450 leading-relaxed font-sans space-y-1">
                          <div className="font-bold text-neutral-300 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-teal-400" /> PVP競合規約:
                          </div>
                          <p>
                            対決中のパズルで「お助け修理 (15c)」や「デザインスキン変更」はすべて通常稼働します。
                          </p>
                        </div>
                      </div>

                      {/* Right: Actual Puzzle Stage inside Match */}
                      <div className="md:col-span-8 space-y-4">
                        <div className="bg-neutral-900/30 p-4 border border-neutral-850 rounded-2xl flex items-center justify-between text-xs select-none">
                          <span className="text-neutral-400 font-mono">BATTLE STAGE PUZZLE</span>
                          <span className="text-pink-400 font-bold tracking-widest animate-pulse">LIVE PVP PIPE TUNING</span>
                        </div>

                        <PipeCellGridWrap
                          level={currentLevel}
                          onLevelComplete={handleLevelClear}
                          selectedInstrument={currentInstrument}
                          onMuteToggle={handleMuteToggle}
                          isMuted={isMuted}
                          shopRating={shopRating}
                          coins={coins}
                          onModifyCoins={handleModifyCoins}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- MODE 2: CO-OP THROWING ACTION arena ----------------- */}
              {pvpSubMode === "action" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Skin selection & Stats deck */}
                  <div className="bg-neutral-900/35 border border-neutral-800 p-5 rounded-3xl space-y-3.5">
                    <h3 className="text-xs font-bold text-neutral-300 tracking-wider uppercase font-mono border-b border-neutral-850 pb-2 flex items-center justify-between">
                      <span>👤 バトルスキンの選択 (攻撃・防御・体力)</span>
                      <span className="text-[10px] text-emerald-400 font-sans normal-case">スキンによってアビリティが変化！</span>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: "default", name: "通常スチールスーツ 🔧", emoji: "🤠", desc: "標準の服。簡単な自己修復が得意。" },
                        { id: "golden", name: "黄金ハイドロメイル 👑", emoji: "🌟", desc: "重厚なゴールド鎧。防御が完璧で全快回復。" },
                        { id: "bamboo", name: "竹林オーガニック 🎋", emoji: "🐼", desc: "竹の服。バランスが良く大自然ヒーリング。" },
                        { id: "cyberNeon", name: "ネオンサイバー ⚡", emoji: "👽", desc: "紙の装甲。攻撃力50の化け物粒子レーザー。" }
                      ].map(skin => (
                        <button
                          key={skin.id}
                          onClick={() => handleSelectSkin(skin.id)}
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                            activeSkinId === skin.id
                              ? "bg-teal-950/35 border-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
                              : "bg-neutral-950/30 border-neutral-850 hover:bg-neutral-900/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{skin.emoji}</span>
                            <span className="text-[8px] font-mono text-neutral-500">
                              {skin.id === "default" ? "Standard" : "Special"}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-extrabold text-neutral-200">{skin.name}</h4>
                            <p className="text-[8px] text-neutral-500 line-clamp-2 mt-0.5 leading-snug">{skin.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Show selected stats details */}
                    <div className="flex flex-wrap items-center gap-4 bg-neutral-950 p-3 rounded-xl border border-neutral-850 text-[10px] font-mono">
                      <div>
                        HP: <span className="font-bold text-emerald-400">{getSkinStats(activeSkinId).hp}</span>
                      </div>
                      <div>
                        ATK(攻撃力): <span className="font-bold text-red-400">{getSkinStats(activeSkinId).atk}</span>
                      </div>
                      <div>
                        DEF(防御力): <span className="font-bold text-teal-400">{getSkinStats(activeSkinId).def}</span>
                      </div>
                      <div className="text-yellow-400">
                        特典技: <span className="font-bold bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">{getSkinStats(activeSkinId).skillName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Fighting Board */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* SVG Interactive Arena Map */}
                    <div className="lg:col-span-8 bg-neutral-950 p-4 border border-neutral-800 rounded-3xl space-y-4">
                      
                      {/* Health stats banner of fight */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                        {/* Player */}
                        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-850 flex items-center justify-between">
                          <div>
                            <p className="text-neutral-400 flex items-center gap-1">
                              🤠 あなた (You) {[{x: 3, y: 1}, {x: 3, y: 4}, {x: 5, y: 3}, {x: 7, y: 2}, {x: 7, y: 5}].some(b => b.x === playerGridPos.x && b.y === playerGridPos.y) && "🌲 (隠密)"}
                            </p>
                            <p className="font-bold text-emerald-400 text-xs mt-0.5">{playerHP} / {playerMaxHP} HP</p>
                          </div>
                          {playerPowerCount > 0 && (
                            <div className="bg-emerald-950/80 border border-emerald-500/50 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 text-emerald-300 animate-pulse scale-90">
                              <span className="text-xs">⭐</span>
                              <span className="font-black">x{playerPowerCount}</span>
                            </div>
                          )}
                        </div>
                        {/* Ally Bunny */}
                        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-850">
                          <p className="text-neutral-400">🐰 兔ラビィ (Ally)</p>
                          <p className="font-bold text-cyan-400 text-xs mt-0.5">{allyHP} HP</p>
                        </div>
                        {/* Smog enemy */}
                        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-850 text-right">
                          <p className="text-neutral-400">👺 敵：スモッグ</p>
                          <p className="font-bold text-rose-500 text-xs mt-0.5">{enemyHP} / {enemyMaxHP} HP</p>
                        </div>
                      </div>

                      {/* Map Board visualization */}
                      <div className="relative border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/60 p-2 select-none">
                        <div className="grid grid-cols-10 gap-1.5 aspect-[10/7]">
                          {Array.from({ length: 7 }).map((_, y) => (
                            Array.from({ length: 10 }).map((_, x) => {
                              // Identify occupants
                              const isPlayer = playerGridPos.x === x && playerGridPos.y === y;
                              const isAlly = allyGridPos.x === x && allyGridPos.y === y;
                              const isEnemy = enemyGridPos.x === x && enemyGridPos.y === y;
                              
                              // Check bushes/grass
                              const isBush = [{x: 3, y: 1}, {x: 3, y: 4}, {x: 5, y: 3}, {x: 7, y: 2}, {x: 7, y: 5}].some(b => b.x === x && b.y === y);
                              
                              // Check solid chests
                              const activeChest = chests.find(c => c.x === x && c.y === y && c.hp > 0);

                              // Check dropped power cubes
                              const activeCube = powerCubes.find(cube => cube.x === x && cube.y === y);

                              return (
                                <div
                                  key={`${x}-${y}`}
                                  className={`relative rounded-lg flex items-center justify-center text-xl transition-all duration-300 overflow-hidden ${
                                    isPlayer && isShieldActive
                                      ? "bg-teal-950/60 border border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.4)] z-20"
                                      : isBush 
                                        ? "bg-emerald-950/65 border border-emerald-600/40" 
                                        : "bg-neutral-950/50 border border-neutral-900/30"
                                  }`}
                                >
                                  {/* Grid coordinate overlay very faint */}
                                  <span className="absolute bottom-0.5 right-1 text-[7px] text-neutral-800 font-mono pointer-events-none">
                                    {x},{y}
                                  </span>

                                  {/* Render sprites hierarchy */}
                                  {isPlayer ? (
                                    <div className="flex flex-col items-center justify-center relative w-full h-full z-20">
                                      {/* Floating HP & Ammo above avatar head */}
                                      <div className="absolute top-0.5 left-0.5 right-0.5 flex flex-col items-center gap-0.5 pointer-events-none scale-90 z-30">
                                        {/* HP green-cyan progress bar */}
                                        <div className="w-full bg-neutral-950/80 rounded-full h-1 overflow-hidden border border-neutral-900/40 flex">
                                          <div 
                                            className="bg-emerald-400 h-full transition-all duration-200" 
                                            style={{ width: `${Math.min(100, (playerHP / playerMaxHP) * 100)}%` }} 
                                          />
                                        </div>
                                        {/* Ammo containers */}
                                        <div className="flex gap-0.5">
                                          {Array.from({ length: 3 }).map((_, aIdx) => (
                                            <div 
                                              key={aIdx} 
                                              className={`w-1.5 h-0.5 rounded-sm ${aIdx < playerAmmo ? 'bg-amber-400' : 'bg-neutral-800'}`} 
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {/* Skin-specific Emoji */}
                                      <span className={`text-2xl drop-shadow-[0_0_12px_rgba(20,184,166,0.6)] flex items-center justify-center relative transition-transform ${superGauge >= 100 ? "scale-110 animate-bounce" : "animate-pulse"}`}>
                                        {activeSkinId === "cyberNeon" ? "👽" : activeSkinId === "golden" ? "🌟" : activeSkinId === "bamboo" ? "🐼" : "🤠"}
                                        {isShieldActive && <span className="absolute -top-1 -right-1 text-xs bg-teal-500/90 rounded-full p-0.5 shadow-md">🛡️</span>}
                                      </span>

                                      {/* Yellow Super Aura indicator */}
                                      {superGauge >= 100 && (
                                        <span className="absolute -bottom-1 bg-yellow-400 text-neutral-950 text-[6.5px] font-extrabold px-1 rounded animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.85)] tracking-tighter uppercase scale-90 z-20">ULT READY</span>
                                      )}
                                    </div>
                                  ) : isAlly ? (
                                    <span className="text-xl drop-shadow-md z-15">
                                      🐰
                                    </span>
                                  ) : isEnemy ? (
                                    <div className="flex flex-col items-center justify-center relative w-full h-full z-15">
                                      {/* Boss floating HP level */}
                                      <div className="absolute top-0.5 left-0.5 right-0.5 flex flex-col items-center pointer-events-none scale-90 z-25">
                                        <div className="w-full bg-neutral-950/80 rounded-full h-1 overflow-hidden border border-neutral-900/40">
                                          <div 
                                            className="bg-red-500 h-full transition-all duration-200" 
                                            style={{ width: `${Math.min(100, (enemyHP / enemyMaxHP) * 100)}%` }} 
                                          />
                                        </div>
                                        <span className="text-[5.5px] text-red-400 font-mono scale-75 tracking-tighter uppercase mt-0.5">BOSS: SMOGG</span>
                                      </div>
                                      <span className="text-2xl drop-shadow-[0_0_15px_rgba(239,68,68,0.71)] animate-bounce">
                                        👹
                                      </span>
                                    </div>
                                  ) : activeChest ? (
                                    <div className="flex flex-col items-center relative w-full h-full">
                                      <div className="absolute top-0.5 w-[85%] bg-neutral-950/80 rounded-full h-0.5 overflow-hidden">
                                        <div 
                                          className="bg-red-400 h-full" 
                                          style={{ width: `${Math.min(100, (activeChest.hp / 50) * 100)}%` }} 
                                        />
                                      </div>
                                      <span className="text-base mt-2">📦</span>
                                    </div>
                                  ) : activeCube ? (
                                    <div className="flex flex-col items-center justify-center relative w-full h-full animate-pulse z-10">
                                      <span className="text-lg filter drop-shadow-[0_0_10px_rgba(34,197,94,0.95)] animate-bounce">⭐</span>
                                      <span className="absolute bottom-0 text-[6.5px] bg-emerald-900/90 text-emerald-300 font-mono scale-75 rounded px-0.5">UP!</span>
                                    </div>
                                  ) : isBush ? (
                                    <span className="text-lg opacity-85 animate-pulse">🌳</span>
                                  ) : null}
                                </div>
                              );
                            })
                          ))
                        }
                        </div>
                      </div>

                      {/* Direction and action controllers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        {/* Moving arrow pad */}
                        <div className="flex flex-col items-center gap-1.5 bg-neutral-900 p-3 rounded-2xl border border-neutral-850 w-full">
                          <span className="text-[9px] font-mono text-neutral-400 tracking-wider flex items-center gap-1">⌨️ 自由キーボード操作 & タップ移動 ⏎</span>
                          <div className="grid grid-cols-3 gap-2 w-36 py-1">
                            <div />
                            <button
                              onClick={() => handlePlayerMove(0, -1)}
                              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 py-1.5 rounded-lg font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer flex justify-center items-center text-xs"
                            >
                              ▲ (W)
                            </button>
                            <div />

                            <button
                              onClick={() => handlePlayerMove(-1, 0)}
                              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 py-1.5 rounded-lg font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer flex justify-center items-center text-xs"
                            >
                              ◀ (A)
                            </button>
                            <div className="text-[8px] flex items-center justify-center font-bold text-neutral-600 font-mono">MOVE</div>
                            <button
                              onClick={() => handlePlayerMove(1, 0)}
                              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 py-1.5 rounded-lg font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer flex justify-center items-center text-xs"
                            >
                              (D) ▶
                            </button>

                            <div />
                            <button
                              onClick={() => handlePlayerMove(0, 1)}
                              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 py-1.5 rounded-lg font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer flex justify-center items-center text-xs"
                            >
                              ▼ (S)
                            </button>
                            <div />
                          </div>
                          
                          <div className="w-full text-center text-[7.5px] border-t border-neutral-850 pt-1.5 text-neutral-450 font-sans leading-relaxed">
                            <p><strong>[↑↓←→ / WASD]</strong>：アリーナをリアルタイム縦横無尽に移動</p>
                            <p><strong>[Space / Q]</strong>：水道管弾丸の発射（全3スロット・高速自動リロード）</p>
                            <p><strong>[E / R / F]</strong>：必殺ウルト技「メガ水道管バースト」（100%で発動可）</p>
                            <p><strong>[Shift / X / C]</strong>：水道管シールドを構える（被ダメ90%OFF）</p>
                          </div>
                        </div>

                        {/* Trigger skills and throws */}
                        <div className="space-y-3 w-full">
                          {/* Brawl Stars Typical Attack Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Normal Shoot Button with rechargeable Ammo bars */}
                            <button
                              onClick={handleThrowPipeAction}
                              className="relative overflow-hidden py-3 px-4 rounded-2xl font-black font-mono tracking-wider bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-neutral-950 shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 text-xs">
                                <span>🎯 通常射撃 (Space / Q)</span>
                              </div>
                              {/* Ammo indicators inside button */}
                              <div className="flex gap-1.5 items-center mt-1">
                                <span className="text-[7.5px] font-sans font-bold text-amber-950/80 mr-0.5">AMMO:</span>
                                {Array.from({ length: 3 }).map((_, aIdx) => (
                                  <div 
                                    key={aIdx} 
                                    className={`w-4 h-1.5 rounded-sm border border-amber-900/40 ${aIdx < playerAmmo ? 'bg-amber-950 shadow-inner' : 'bg-neutral-900/60'}`} 
                                  />
                                ))}
                              </div>
                            </button>

                            {/* Super Ultimate Button (Brawl Stars Super Attack) */}
                            <button
                              onClick={handleSuperAttackAction}
                              disabled={superGauge < 100}
                              className={`relative overflow-hidden py-3 px-4 rounded-2xl font-black font-mono tracking-widest transition-all cursor-pointer flex flex-col items-center justify-center select-none ${
                                superGauge >= 100
                                  ? "bg-gradient-to-r from-yellow-400 via-purple-600 to-pink-500 text-neutral-950 py-3 font-extrabold shadow-[0_0_20px_rgba(234,179,8,0.7)] animate-pulse scale-102 border-2 border-yellow-300"
                                  : "bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed"
                              }`}
                            >
                              <div className="text-[11px] font-extrabold flex items-center gap-1.5">
                                <span>⚡ {superGauge >= 100 ? "メガ水道管バースト!! (E)" : "ウルトチャージ中"}</span>
                              </div>
                              {/* Reload progress bar */}
                              <div className="w-full bg-neutral-950/80 rounded-full h-2 mt-1.5 overflow-hidden p-0.5 border border-neutral-850">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${superGauge >= 100 ? 'bg-yellow-400 animate-pulse' : 'bg-purple-500'}`}
                                  style={{ width: `${superGauge}%` }}
                                />
                              </div>
                              <span className="text-[7px] text-neutral-400 mt-1">
                                {superGauge >= 100 ? "READY ⚡ PRESS E / CLICK ME" : `CHARGED: ${superGauge}%`}
                              </span>
                            </button>
                          </div>

                          {/* Secondary commands */}
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={handleActionHealSkill}
                              disabled={healCooldown > 0}
                              className={`py-2 px-1 rounded-xl text-[9px] font-bold font-mono transition-all uppercase flex items-center justify-center gap-0.5 border cursor-pointer ${
                                healCooldown > 0
                                  ? "bg-neutral-900 border-neutral-850 text-neutral-500 cursor-not-allowed"
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95"
                              }`}
                            >
                              💚 回復 {healCooldown > 0 ? `(${healCooldown}T)` : ""}
                            </button>

                            <button
                              onClick={() => {
                                sound.playPopSound(200, 0.4);
                                setIsShieldActive(prev => {
                                  const next = !prev;
                                  if (next) {
                                    setActionLog(logs => ["🛡️ 水道管を盾にした！防御状態中（被ダメージ90%カット、サビ管防御！）", ...logs.slice(0, 7)]);
                                  } else {
                                    setActionLog(logs => ["🔓 盾の構えを解除した。", ...logs.slice(0, 7)]);
                                  }
                                  return next;
                                });
                              }}
                              className={`py-2 px-1 rounded-xl text-[9px] font-bold font-mono transition-all uppercase flex items-center justify-center gap-0.5 border cursor-pointer ${
                                isShieldActive
                                  ? "bg-teal-500 text-neutral-950 border-teal-350 font-extrabold shadow-[0_0_12px_rgba(20,184,166,0.35)] animate-pulse"
                                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850"
                              }`}
                            >
                              🛡️ {isShieldActive ? "盾 解除" : "盾構え (Shift)"}
                            </button>

                            <button
                              onClick={handleResetActionBattle}
                              className="py-2 px-1 rounded-xl text-[9px] font-bold font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-850 active:scale-95 transition-all text-center cursor-pointer"
                            >
                              🔄 リセット
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Arena Battle Log Screen / Victory Card */}
                    <div className="lg:col-span-4 bg-neutral-900/35 border border-neutral-800 p-5 rounded-3xl space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 border-b border-neutral-800 pb-2 flex items-center justify-between">
                        <span>📝 バトル歴史ログ (Battle feed)</span>
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                      </h4>

                      {/* Display live logs */}
                      <div className="space-y-1.5 bg-neutral-950 p-3 rounded-2xl border border-neutral-900 shadow-inner h-[210px] overflow-y-auto font-mono text-[9px] leading-relaxed text-neutral-300 flex flex-col justify-end">
                        {actionLog.map((log, idx) => (
                          <div key={idx} className="border-b border-neutral-900/60 pb-1 last:border-b-0">
                            {log}
                          </div>
                        ))}
                      </div>

                      {/* Victory popup placeholder inside sidebar */}
                      {actionBattleWinner && (
                        <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                          actionBattleWinner === "player"
                            ? "bg-gradient-to-b from-[#115e59] to-[#134e4a] border-emerald-500/40 text-emerald-200 shadow-xl animate-pulse"
                            : "bg-gradient-to-b from-red-950 to-neutral-950 border-red-500/30 text-red-300"
                        }`}>
                          <p className="text-xl">
                            {actionBattleWinner === "player" ? "🏆 WINNER!" : "💀 GAME OVER"}
                          </p>
                          <p className="text-[10px] leading-relaxed font-sans">
                            {actionBattleWinner === "player"
                              ? "見事、秘密のダーク配管工を撃破して水道管世界の平穏を取り戻した！報酬の +300 Coins を獲得しました！"
                              : "敵スモッグのサビ水道管ストライクに屈してしまった... 特殊スーツのHPが尽きた。"}
                          </p>
                          <button
                            onClick={handleResetActionBattle}
                            className="bg-neutral-950/80 hover:bg-neutral-900 font-mono text-[9px] font-bold py-1 px-3 border border-neutral-800 rounded-lg text-neutral-200 hover:scale-105 active:scale-95 transition-all w-full cursor-pointer"
                          >
                            アリーナに再参戦する
                          </button>
                        </div>
                      )}

                      {/* Legend tips card */}
                      <div className="p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl space-y-1.5 text-[8.5px] text-neutral-400 leading-snug">
                        <p className="font-bold font-mono text-[#2ffff3] text-[9.5px]">🎮 アリーナ戦闘指南:</p>
                        <p>1. <strong>木（Grass/緑）のマス</strong>：隠密状態となり敵に狙われず、ダメージを受けません。</p>
                        <p>2. <strong>宝箱（Chest/段ボール）</strong>：隣接した状態で水道管を投げつけると攻撃でき、HPを削りきると <b>+75 Coins</b> を即座に獲得できます！</p>
                        <p>3. <strong>味方兔ラビィ</strong>：敵スモッグが水道管攻撃してくるたび、確率で自動援護射撃をおこない敵に18ダメージ与えます！</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- MODE 3: PASSIVE RENTAL SYSTEM ----------------- */}
              {pvpSubMode === "rent" && (
                <div className="max-w-2xl mx-auto bg-neutral-900/35 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md space-y-6">
                  
                  {/* Payout collector module */}
                  <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-yellow-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-[8.5px] font-mono text-yellow-500 tracking-widest font-extrabold uppercase">COIN ACCUMULATOR JAR</span>
                      <h4 className="text-sm font-extrabold text-neutral-200">💰 貯まった水道管の賃貸収入</h4>
                      <p className="text-[10px] text-neutral-400 font-sans mt-0.5 max-w-sm leading-snug">
                        貸し出しパイプによる賃貸料が自動で貯まります。いつでも回収ボタンを押して引き出し可能です！
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800 text-center select-none">
                        <span className="text-[9px] text-neutral-500 block font-mono">現在の蓄積額</span>
                        <span className="font-mono font-extrabold text-[#2ffff3] text-lg">{rentalAccumulatedCoins} c</span>
                      </div>
                      
                      <button
                        onClick={handleCollectRentAccumulated}
                        disabled={rentalAccumulatedCoins <= 0}
                        className={`py-3 px-4 rounded-xl font-bold font-mono text-[10px] tracking-wider transition-all uppercase flex items-center justify-center gap-1 cursor-pointer ${
                          rentalAccumulatedCoins > 0
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-neutral-950 hover:scale-105 active:scale-95 shadow-md font-extrabold"
                            : "bg-neutral-900 text-neutral-600 border border-neutral-850 cursor-not-allowed"
                        }`}
                      >
                        賃貸料を回収する
                      </button>
                    </div>
                  </div>

                  {/* Active rented clients inventory list */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400 border-b border-neutral-850 pb-2 flex items-center justify-between">
                      <span>🏢 現在貸し出し中パイプ一覧 ({rentedItems.length}件)</span>
                      <span className="text-[9.5px] text-neutral-500 font-sans tracking-wide">6秒ごとに自動で賃料加算</span>
                    </h3>

                    {rentedItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rentedItems.map(item => (
                          <div key={item.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl select-none">✨</span>
                              <div>
                                <p className="text-[10.5px] font-extrabold text-neutral-200">{item.name}</p>
                                <p className="text-[9px] text-neutral-555 italic leading-snug">貸出先: {item.renter}</p>
                              </div>
                            </div>
                            <div className="text-right font-mono text-[10px] flex flex-col justify-end shrink-0">
                              <span className="text-[#2ffff3] font-bold">+{item.payRate}c/周期</span>
                              <button 
                                onClick={() => handleReturnRentedPipe(item.id, item.id.split("_")[0])}
                                className="block text-red-400 font-sans text-[8.5px] font-bold hover:underline cursor-pointer mt-1"
                              >
                                レンタルを終了・返却 ⏎
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-550 text-center py-5">現在貸し出し中の水道管はありません。</p>
                    )}
                  </div>

                  {/* Manual trigger section to list and rent existing gacha parts */}
                  <div className="space-y-3 bg-neutral-950/40 p-4 rounded-2xl border border-neutral-850">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                      <span>🔨 レンタル可能な水道管（所持パーツから供給）</span>
                      <span className="text-[8.5px] text-pink-400 font-sans">※貸し出している間は一時的に在庫から除外されます。</span>
                    </h3>

                    {/* Pre-fill default starter items or check active inventory items */}
                    <div className="space-y-2.5">
                      {[
                        { id: "pipe_l_wood", name: "木製 L型パイプ (Wood L)", payRate: 4, quality: "標準" },
                        { id: "pipe_t_metal", name: "金属 T型パイプ (Steel T)", payRate: 9, quality: "特級" },
                        { id: "pipe_cross_gold", name: "黄金 十字パイプ (Gold Cross)", payRate: 25, quality: "伝説" }
                      ].map(item => {
                        const inInventory = inventory[item.id] || 0;
                        return (
                          <div key={item.id} className="p-3 bg-neutral-950/80 border border-neutral-900 rounded-xl flex items-center justify-between text-[11px] font-sans">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-neutral-200">{item.name}</span>
                                <span className="text-[8px] bg-neutral-900 px-1.5 py-0.1 border border-neutral-800 rounded font-mono text-neutral-400">{item.quality}</span>
                              </div>
                              <p className="text-[9px] text-neutral-555 leading-snug">
                                必要在庫：あなたの所持パックにあります 
                                (<span className="text-yellow-400 font-bold font-mono">現在庫: {inInventory} 個</span>)
                              </p>
                            </div>

                            <button
                              disabled={inInventory <= 0}
                              onClick={() => handleRentPipe(item.id, item.payRate, item.name, item.quality)}
                              className={`py-1.5 px-3 rounded-lg text-[9px] font-bold font-mono transition-all ${
                                inInventory > 0
                                  ? "bg-yellow-500 text-neutral-950 hover:scale-105 active:scale-95 cursor-pointer font-extrabold"
                                  : "bg-neutral-950 border border-neutral-800 text-neutral-600 cursor-not-allowed"
                              }`}
                            >
                              {inInventory > 0 ? "賃貸に回す (+Coins/週)" : "在庫なし"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[9px] text-neutral-500 leading-normal font-sans pt-1">
                      💡 <strong>アドバイス：</strong> 仕入・市場（Gacha Box）で木・鉄・金のブラインドボックス(Sound Boxを含む)を開封してアイテムパーツをたくさん集めることで、より数多くの特級/伝説水道管を同時にレンタルできるようになり、コイン蓄積スピードが爆発的に上昇します！
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: MISSIONS & CONTINUOUS IN-LOG STREAK */}
          {activeTab === "missions" && (
            <motion.div
              key="missions-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="text-center space-y-1.5 select-none my-2">
                <span className="text-[10px] text-amber-400 tracking-widest font-bold uppercase bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                  デイリーアチーブメント ＆ 連続日付特典
                </span>
                <h2 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center justify-center gap-1.5">
                  🗓️ 連続日付ログイン ＆ 経営ミッション
                </h2>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  連続で来店スタンプを貯めて大量コインを獲得。店舗実績をクリアして真の調律職人としての名声を高めましょう。
                </p>
              </div>

              {/* 1. STAMP CALENDAR CARD */}
              <div className="bg-neutral-900/35 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4.5 h-4.5 text-teal-400" />
                    <h3 className="text-xs font-bold font-mono text-neutral-200 uppercase tracking-widest">
                      連日来店調律スタンプカード ({stampStreak}日連続)
                    </h3>
                  </div>
                  <span className="text-[9px] bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.2 rounded border border-teal-500/20 font-mono">
                    STREAK PERSISTENT
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 py-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const isClaimed = claimedDays.includes(day);
                    const isCurrentDay = stampStreak === day;
                    return (
                      <div
                        key={day}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-between border relative transition-all ${
                          isClaimed
                            ? "bg-teal-950/20 border-teal-500/30 text-teal-300"
                            : isCurrentDay
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse"
                            : "bg-neutral-950/60 border-neutral-850 text-neutral-550"
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold">DAY {day}</span>
                        <div className="my-2 text-xl">
                          {isClaimed ? "✅" : day === 3 ? "💎" : day === 7 ? "👑" : "💧"}
                        </div>
                        <span className="text-[8px] font-mono">
                          {day === 3 ? "+200c" : day === 7 ? "+500c" : "+50c"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 pt-3 border-t border-neutral-800/60">
                  <div className="text-[10px] text-neutral-450 leading-relaxed max-w-sm">
                    💡 3日目と7日目にはさらに超豪華な「金の雫・王冠」スタンプでスペシャルのコインが進呈されます！
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Debug Fast Forward button */}
                    <button
                      onClick={() => {
                        sound.playPluck(880, 0.4);
                        setStampStreak(prev => (prev % 7) + 1);
                        // Make sure we simulate a next day, so we clear the claims if it resets to Day 1
                        setClaimedDays(prev => {
                          const nextDay = (stampStreak % 7) + 1;
                          if (nextDay === 1) return [];
                          return prev;
                        });
                      }}
                      className="px-2.5 py-2 rounded-xl text-[9px] font-bold bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-305 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="日付日付経過をシミュレーションして、翌日のログイン報酬をテスト！"
                    >
                      <RotateCw className="w-3 h-3 text-neutral-500" />
                      模擬1日時間進める
                    </button>

                    <button
                      onClick={() => {
                        if (claimedDays.includes(stampStreak)) return;
                        sound.playMusicBox(523.25, 0.8);
                        sound.playPopSound(500, 0.4);
                        
                        let prize = 50;
                        if (stampStreak === 3) prize = 200;
                        if (stampStreak === 7) prize = 500;
                        
                        handleModifyCoins(prize);
                        setClaimedDays(prev => [...prev, stampStreak]);
                        
                        // Show tiny feedback
                        setLastEarnedCoins(prize);
                        setClearedMode("use");
                        setShowCoinToast(true);
                        setTimeout(() => setShowCoinToast(false), 3000);
                      }}
                      disabled={claimedDays.includes(stampStreak)}
                      className={`py-2 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        claimedDays.includes(stampStreak)
                          ? "bg-neutral-950 border border-neutral-850 text-neutral-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-500 to-cyan-500 text-neutral-950 font-extrabold shadow-[0_4px_15px_rgba(45,212,191,0.25)] hover:brightness-110 active:scale-95"
                      }`}
                    >
                      スタンプを押す (今日)
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. PERSISTENT PROGRESSIVE MISSIONS LIST */}
              <div className="bg-neutral-900/35 border border-neutral-800 p-6 rounded-3xl backdrop-blur-md space-y-4">
                <h3 className="text-xs font-bold text-neutral-300 tracking-wider uppercase font-mono border-b border-neutral-850 pb-2.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> 店舗経営アチーブメント
                </h3>

                <div className="space-y-3">
                  {/* Mission 1 */}
                  <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-250">🎵 ミッション①: 音響の深淵</span>
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">累計演奏</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-snug">
                        自動メロディ再生（和音演奏）を合計 3回 以上実行する。
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-yellow-400 font-bold block mb-1.5">+120 Coins</span>
                      <button
                        onClick={() => {
                          sound.playMusicBox(783.99, 1.2);
                          handleModifyCoins(120);
                          // store tiny flag using localStorage to avoid duplication
                          localStorage.setItem("m1_claimed", "true");
                        }}
                        disabled={localStorage.getItem("m1_claimed") === "true"}
                        className={`py-1 px-3 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          localStorage.getItem("m1_claimed") === "true"
                            ? "bg-neutral-900 text-neutral-650 cursor-not-allowed"
                            : "bg-teal-500/10 hover:bg-teal-500/20 border border-teal-550 text-teal-350"
                        }`}
                      >
                        {localStorage.getItem("m1_claimed") === "true" ? "獲得済" : "報酬を貰う"}
                      </button>
                    </div>
                  </div>

                  {/* Mission 2 */}
                  <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-250">⭐ ミッション②: 大評判サロン</span>
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">ショップ点数</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-snug">
                        口コミ店舗評価を平均「★4.40」以上に引き上げる。
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-yellow-400 font-bold block mb-1.5">+200 Coins</span>
                      <button
                        onClick={() => {
                          if (shopRating < 4.40) return;
                          sound.playMusicBox(783.99, 1.2);
                          handleModifyCoins(200);
                          localStorage.setItem("m2_claimed", "true");
                        }}
                        disabled={shopRating < 4.40 || localStorage.getItem("m2_claimed") === "true"}
                        className={`py-1 px-3 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          localStorage.getItem("m2_claimed") === "true"
                            ? "bg-neutral-900 text-neutral-650 cursor-not-allowed"
                            : shopRating >= 4.40
                            ? "bg-teal-500 text-neutral-950 font-extrabold"
                            : "bg-neutral-950 border border-neutral-900 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {localStorage.getItem("m2_claimed") === "true" ? "獲得済" : "報酬を貰う"}
                      </button>
                    </div>
                  </div>

                  {/* Mission 3 */}
                  <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-250">📦 ミッション③: バイヤー信頼感</span>
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">在庫経営</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-snug">
                        ブライドボックス（商品ロット）を一度に2種類以上解放・調達する。
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-yellow-400 font-bold block mb-1.5">+180 Coins</span>
                      <button
                        onClick={() => {
                          sound.playMusicBox(783.99, 1.2);
                          handleModifyCoins(180);
                          localStorage.setItem("m3_claimed", "true");
                        }}
                        disabled={unlockedBoxes.length < 2 || localStorage.getItem("m3_claimed") === "true"}
                        className={`py-1 px-3 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          localStorage.getItem("m3_claimed") === "true"
                            ? "bg-neutral-900 text-neutral-650 cursor-not-allowed"
                            : unlockedBoxes.length >= 2
                            ? "bg-teal-500 text-neutral-950 font-extrabold"
                            : "bg-neutral-950 border border-neutral-900 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {localStorage.getItem("m3_claimed") === "true" ? "獲得済" : "報酬を貰う"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: ONLINE GUESTBOOK FORUM REVIEWS */}
          {activeTab === "guestbook" && (
            <motion.div
              key="guestbook-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              {/* Core rating stats header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Total Avg Card */}
                <div className="p-5 rounded-3xl bg-neutral-900/40 border border-neutral-800 flex flex-col items-center justify-center text-center">
                  <Star className="w-10 h-10 text-yellow-500 fill-yellow-500/10 animate-pulse" />
                  <span className="text-3xl font-extrabold text-neutral-100 font-mono mt-2">
                    ★{shopRating.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 uppercase tracking-widest">
                    OVERALL SHOP RATING
                  </span>
                </div>

                {/* Rating Distribution */}
                <div className="sm:col-span-2 p-5 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-2 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-400">極上の極み (★5)</span>
                    <span className="text-neutral-300">75%</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: "75%" }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-400">大いに満足 (★4)</span>
                    <span className="text-neutral-300">20%</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500/80 h-full rounded-full" style={{ width: "20%" }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-400">普通・改善あり (★1-3)</span>
                    <span className="text-neutral-500">5%</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-neutral-800 h-full rounded-full" style={{ width: "5%" }} />
                  </div>
                </div>
              </div>

              {/* Add Custom User Review Form */}
              <div className="p-6 rounded-3xl bg-neutral-900/35 border border-neutral-800 space-y-4">
                <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-300 uppercase border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-teal-400" /> 顧客レビューを投稿して店舗評価に反映する！
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("reviewerName")?.toString() || "匿名調律工";
                    const ratingVal = parseFloat(formData.get("reviewerRating")?.toString() || "5.0");
                    const reviewText = formData.get("reviewerText")?.toString() || "心地よい水流の音がいつもお気に入りです。";
                    
                    if (!reviewText.trim()) return;

                    const newReview = {
                      id: `r-${Date.now()}`,
                      name,
                      rating: ratingVal,
                      text: reviewText,
                      date: "ただいま投稿",
                      reply: "（自動管理者答）レビューありがとうございます！当店のペンタトニックスケールをお気に召していただき嬉しいです。これからも最高の水道管調律サロンとして精進を重ねて参ります！"
                    };

                    setForumReviews(prev => [newReview, ...prev]);

                    // Recalculate average rating with a subtle nudge up!
                    setShopRating(prev => {
                      const next = Math.min(5.0, Math.round((prev + (ratingVal - prev) * 0.15) * 100) / 100);
                      return next;
                    });

                    // Play pleasant water droplets chimes
                    sound.playMarimba(523, 0.4);
                    setTimeout(() => sound.playMusicBox(783.99, 0.7), 150);

                    e.currentTarget.reset();
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-450 mb-1">お名前 (投稿名)</label>
                      <input
                        required
                        name="reviewerName"
                        type="text"
                        placeholder="例：配管のメロディ"
                        className="w-full bg-neutral-950 outline-none border border-neutral-850 focus:border-teal-500/40 rounded-xl px-4 py-2 text-xs text-neutral-250 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-450 mb-1">評価星数 (Rating)</label>
                      <select
                        name="reviewerRating"
                        className="w-full bg-neutral-950 outline-none border border-neutral-850 focus:border-teal-500/40 rounded-xl px-3 py-2 text-xs text-neutral-200 transition-colors"
                      >
                        <option value="5.0">★★★★★ 5.0 (極上の癒し)</option>
                        <option value="4.0">★★★★☆ 4.0 (満足の調律)</option>
                        <option value="3.0">★★★☆☆ 3.0 (普通・もう少し)</option>
                        <option value="2.0">★★☆☆☆ 2.0 (音がズレている)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-450 mb-1">レビューメッセージ</label>
                    <textarea
                      required
                      name="reviewerText"
                      rows={2}
                      placeholder="例：アンティーク真鍮のキーボードを叩く音色、とっても癒やされました！"
                      className="w-full bg-neutral-950 outline-none border border-neutral-850 focus:border-teal-500/40 rounded-xl px-4 py-2 text-xs text-neutral-250 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-550 text-neutral-950 font-bold font-sans text-xs rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950/20" />
                    <span>レビューを送信（ショップ掲示板へ即時追加！）</span>
                  </button>
                </form>
              </div>

              {/* Feed Card timeline list */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-neutral-450 tracking-wider uppercase pl-1.5 flex items-center gap-1">
                  口コミ総合タイムライン 💬
                </h3>

                <div className="space-y-3">
                  {forumReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2.5xl border border-neutral-800 bg-neutral-900/10 backdrop-blur-md space-y-2 relative overflow-hidden transition-all hover:bg-neutral-900/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800 text-[11px]">
                            👤
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-200 block">{rev.name}</span>
                            <span className="text-[10px] text-yellow-500 font-mono">
                              {"★".repeat(Math.floor(rev.rating))}
                              {rev.rating % 1 !== 0 ? "☆" : ""} {rev.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-neutral-550 font-mono bg-neutral-950/40 px-2 py-0.5 rounded-lg border border-neutral-900">
                          {rev.date}
                        </span>
                      </div>

                      <p className="text-xs font-sans text-neutral-400 pl-9 leading-relaxed">
                        "{rev.text}"
                      </p>

                      {/* simulated owner reply or manager comment */}
                      {(rev.reply || rev.id === "r1") && (
                        <div className="mt-3 ml-9 p-3 rounded-xl bg-teal-950/5 border-l-2 border-teal-500/40 text-[10.5px] text-teal-400/90 leading-relaxed font-sans">
                          {rev.reply || "（調律管理責任者より）大変光栄なコメントに感激しております。真鍮素材の厚みと管径は高周波共鳴を最適化すべくミリ単位で調整してあります。今後ともよろしくお願い申し上げます！"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Global Coin toast notification banner */}
      <AnimatePresence>
        {showCoinToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-5 rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-lg shadow-2xl max-w-xs space-y-3"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center text-yellow-400 animate-bounce">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-yellow-300">資金を獲得しました！</div>
                <div className="text-[10px] font-mono text-neutral-400">+{lastEarnedCoins} Aqua Coins obtained</div>
              </div>
            </div>

            {latestReview && (
              <div className="border-t border-neutral-900 pt-2 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base select-none">{latestReview.avatar}</span>
                  <span className="text-[10px] font-bold text-neutral-300">{latestReview.buyer}</span>
                </div>
                <p className="text-[9.5px] italic text-neutral-400 leading-normal font-sans">
                  "{latestReview.text}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aesthetic Footer */}
      <footer className="w-full text-center py-6 text-[10px] text-neutral-600 border-t border-neutral-900/60 font-mono z-10 shrink-0">
        <div>© 2026 KAYUAB AQUATIC SYNTH LABS. ALL REFRESHING CHORDS SPECIFIED.</div>
      </footer>
    </div>
  );
}

// Simple dynamic element wrapper avoiding re-render flickering
const PipeCellGridWrap = (props: any) => {
  return <PipeGrid {...props} />;
};
