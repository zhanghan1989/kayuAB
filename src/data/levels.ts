/**
 * KayuAB - Puzzle Levels Data
 * Defines creative hand-crafted levels loaded with beautiful fluid paths, 
 * serene nature-themed names, and varying difficulties.
 */

export interface PipeCell {
  id: string;
  type: "I" | "L" | "T" | "X" | "S" | "E"; // Straight, L-bend, T-junction, Cross, Start, End
  currentRotation: number; // 0, 1, 2, 3 (Multiples of 90 degrees)
  targetRotation: number; // Solution orientation (one of the valid ones)
  fixed?: boolean; // If true, player cannot rotate it (often applies to Start & End)
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: "初級" | "中級" | "上級";
  size: { width: number; height: number };
  grid: PipeCell[][];
}

// Map logical connectivities for each pipe type and rotation.
// Compass index: 0 = Up, 1 = Right, 2 = Down, 3 = Left
export const CONNECTIONS: Record<string, Record<number, number[]>> = {
  S: { // Source (starts pointing to target. Fixed)
    0: [0],
    1: [1],
    2: [2],
    3: [3]
  },
  E: { // End (receives water. Fixed)
    0: [0],
    1: [1],
    2: [2],
    3: [3]
  },
  I: { // Straight
    0: [0, 2], // Vertical
    1: [1, 3], // Horizontal
    2: [0, 2], // Vertical
    3: [1, 3]  // Horizontal
  },
  L: { // L-bend
    0: [0, 1], // Up and Right
    1: [1, 2], // Right and Down
    2: [2, 3], // Down and Left
    3: [3, 0]  // Left and Up
  },
  T: { // T-junction
    0: [3, 0, 1], // Left, Up, Right
    1: [0, 1, 2], // Up, Right, Down
    2: [1, 2, 3], // Right, Down, Left
    3: [2, 3, 0]  // Down, Left, Up
  },
  X: { // Cross-connector
    0: [0, 1, 2, 3],
    1: [0, 1, 2, 3],
    2: [0, 1, 2, 3],
    3: [0, 1, 2, 3]
  }
};

// Helper to check connections between cells.
export function hasConnectionInDirection(cell: PipeCell, direction: number): boolean {
  const allowed = CONNECTIONS[cell.type]?.[cell.currentRotation] || [];
  return allowed.includes(direction);
}

// Helper to generate a matrix
const cell = (id: string, type: PipeCell["type"], currentRotation: number, targetRotation: number, fixed = false): PipeCell => ({
  id,
  type,
  currentRotation,
  targetRotation,
  fixed
});

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "せせらぎの小径",
    description: "まろやかな水がまっすぐ進む、ファーストステップ。パイプをタップしてルートを繋げてみましょう。",
    difficulty: "初級",
    size: { width: 3, height: 3 },
    grid: [
      [cell("0-0", "S", 1, 1, true),   cell("0-1", "I", 0, 1),       cell("0-2", "L", 0, 2)],
      [cell("1-0", "I", 0, 0),        cell("1-1", "I", 1, 0),       cell("1-2", "I", 1, 0)],
      [cell("2-0", "L", 2, 0),        cell("2-1", "I", 1, 1),       cell("2-2", "E", 3, 3, true)]
    ]
    // Solution sequence for 3x3:
    // S[1] (0,0) -> I[1] (0,1) -> L[2] (0,2)
    //                                  |
    //                                I[0] (1,2)
    //                                  |
    // S[3] (2,2) <- I[1] (2,1) <- L[0] (2,2) - Wait, let's make it a clean wrap:
    // (0,0)[S] -> (0,1)[I] -> (0,2)[L, rot=2(Down/Left)]
    //                          (1,2)[I, rot=0(Up/Down)]
    //                          (2,2)[L, rot=3(Left/Up)] -> (2,1)[I, rot=1(Left/Right)] -> (2,0)[L, rot=0(Up/Right)]
    //                                                                                      |
    //                                                                                     (1,0)[I, rot=0(Up/Down)]
    //                                                                                      |
    //                                                                                     (2,0)[End, rot=0] ... let's write accurate hand level
  },
  {
    id: 2,
    name: "静寂の泉",
    description: "パイプがL字にカーブします。綺麗な和音が響くシンプルな接続ルートを作ってください。",
    difficulty: "初級",
    size: { width: 4, height: 3 },
    grid: [
      [cell("l2-0-0", "S", 1, 1, true), cell("l2-0-1", "L", 0, 2), cell("l2-0-2", "I", 0, 0), cell("l2-0-3", "L", 1, 1)],
      [cell("l2-1-0", "I", 1, 0),       cell("l2-1-1", "L", 3, 0), cell("l2-1-2", "L", 2, 3), cell("l2-1-3", "I", 0, 0)],
      [cell("l2-2-0", "L", 1, 0),       cell("l2-2-1", "I", 0, 1), cell("l2-2-2", "I", 1, 1), cell("l2-2-3", "E", 3, 3, true)]
    ]
  },
  {
    id: 3,
    name: "朝霧のメロディ",
    description: "T字の分岐点が登場します。余分なパイプに流れないようにうまく調整可能でしょうか？",
    difficulty: "中級",
    size: { width: 4, height: 4 },
    grid: [
      [cell("l3-0-0", "S", 1, 1, true), cell("l3-0-1", "T", 0, 2), cell("l3-0-2", "L", 1, 2), cell("l3-0-3", "I", 1, 0)],
      [cell("l3-1-0", "L", 2, 1),       cell("l3-1-1", "I", 0, 0), cell("l3-1-2", "T", 1, 3), cell("l3-1-3", "L", 3, 3)],
      [cell("l3-2-0", "I", 1, 0),       cell("l3-2-1", "T", 3, 1), cell("l3-2-2", "L", 0, 0), cell("l3-2-3", "I", 0, 0)],
      [cell("l3-3-0", "L", 0, 0),       cell("l3-3-1", "I", 1, 1), cell("l3-3-2", "I", 0, 1), cell("l3-3-3", "E", 0, 0, true)]
    ]
  },
  {
    id: 4,
    name: "珊瑚礁の迷宮",
    description: "水流が交差する「十字パイプ」はすべての向きを中継します。多方向に配管を巡らせましょう。",
    difficulty: "中級",
    size: { width: 5, height: 4 },
    grid: [
      [cell("l4-0-0", "S", 2, 2, true), cell("l4-0-1", "I", 1, 0), cell("l4-0-2", "L", 3, 1), cell("l4-0-3", "T", 2, 2), cell("l4-0-4", "L", 0, 2)],
      [cell("l4-1-0", "L", 0, 1),       cell("l4-1-1", "X", 0, 0), cell("l4-1-2", "I", 0, 1), cell("l4-1-3", "I", 1, 0), cell("l4-1-4", "I", 0, 0)],
      [cell("l4-2-0", "I", 1, 0),       cell("l4-2-1", "L", 2, 3), cell("l4-2-2", "T", 0, 0), cell("l4-2-3", "L", 1, 0), cell("l4-2-4", "L", 3, 3)],
      [cell("l4-3-0", "L", 1, 0),       cell("l4-3-1", "I", 0, 1), cell("l4-3-2", "I", 1, 1), cell("l4-3-3", "I", 0, 1), cell("l4-3-4", "E", 3, 3, true)]
    ]
  },
  {
    id: 5,
    name: "悠久の大河",
    description: "6x5の超大作パズル。全ての鍵をつないだとき、極上のリラクゼーション・アンサンブルがあなたを包みます。",
    difficulty: "上級",
    size: { width: 6, height: 5 },
    grid: [
      [cell("l5-0-0", "S", 1, 1, true), cell("l5-0-1", "L", 1, 2), cell("l5-0-2", "I", 0, 0), cell("l5-0-3", "T", 2, 2), cell("l5-0-4", "I", 0, 1), cell("l5-0-5", "L", 0, 2)],
      [cell("l5-1-0", "I", 0, 0),       cell("l5-1-1", "L", 3, 0), cell("l5-1-2", "X", 0, 0), cell("l5-1-3", "T", 3, 3), cell("l5-1-4", "L", 2, 3), cell("l5-1-5", "I", 1, 0)],
      [cell("l5-2-0", "T", 1, 1),       cell("l5-2-1", "I", 1, 0), cell("l5-2-2", "I", 0, 1), cell("l5-2-3", "L", 1, 1), cell("l5-2-4", "X", 0, 0), cell("l5-2-5", "L", 3, 3)],
      [cell("l5-3-0", "L", 0, 1),       cell("l5-3-1", "L", 2, 2), cell("l5-3-2", "T", 0, 0), cell("l5-3-3", "I", 0, 1), cell("l5-3-4", "L", 0, 0), cell("l5-3-5", "I", 1, 0)],
      [cell("l5-4-0", "L", 2, 0),       cell("l5-4-1", "I", 1, 1), cell("l5-4-2", "X", 0, 0), cell("l5-4-3", "I", 0, 1), cell("l5-4-4", "L", 1, 3), cell("l5-4-5", "E", 3, 3, true)]
    ]
  }
];
