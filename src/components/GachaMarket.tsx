import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  Layers, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Lock, 
  Unlock,
  Sparkle,
  Home,
  CheckCircle,
  ChevronRight,
  Info,
  Gift
} from "lucide-react";
import { sound } from "../utils/audio";

export interface GachaItem {
  id: string;
  name: string;
  type: "I" | "L" | "T" | "X" | "GOLD";
  quality: "ウッド" | "メタル" | "ゴールド";
  rarity: "コモン" | "アンコモン" | "レア" | "レジェンダリー";
  baseValue: number; // base coin value
  colorClass: string; 
  bgClass: string;
  badgeClass: string;
  iconString: string;
}

// Full multi-tier rarity × quality matrix (15 custom components)
export const GACHA_POOL: GachaItem[] = [
  // --- WOOD QUALITY (Standard rustic value) ---
  {
    id: "g-I_wood",
    name: "I字パイプ (ウッド)",
    type: "I",
    quality: "ウッド",
    rarity: "コモン",
    baseValue: 45,
    colorClass: "border-amber-900/60 text-amber-200",
    bgClass: "bg-amber-950/5",
    badgeClass: "bg-amber-900/10 text-amber-400 border-amber-900/20",
    iconString: "🪵 ┃"
  },
  {
    id: "g-L_wood",
    name: "L字パイプ (ウッド)",
    type: "L",
    quality: "ウッド",
    rarity: "コモン",
    baseValue: 45,
    colorClass: "border-amber-900/60 text-amber-200",
    bgClass: "bg-amber-950/5",
    badgeClass: "bg-amber-900/10 text-amber-400 border-amber-900/20",
    iconString: "🪵 ┗"
  },
  {
    id: "g-T_wood",
    name: "T字パイプ (ウッド)",
    type: "T",
    quality: "ウッド",
    rarity: "アンコモン",
    baseValue: 95,
    colorClass: "border-amber-800 text-amber-300",
    bgClass: "bg-amber-950/10",
    badgeClass: "bg-amber-800/10 text-amber-400 border-amber-800/30",
    iconString: "🪵 ┳"
  },
  {
    id: "g-X_wood",
    name: "X字パイプ (ウッド)",
    type: "X",
    quality: "ウッド",
    rarity: "レア",
    baseValue: 240,
    colorClass: "border-purple-900 text-purple-300",
    bgClass: "bg-purple-950/10",
    badgeClass: "bg-purple-900/10 text-purple-400 border-purple-900/30",
    iconString: "🪵 ╋"
  },
  {
    id: "g-GOLD_wood",
    name: "黄金バルブ (ウッド)",
    type: "GOLD",
    quality: "ウッド",
    rarity: "レジェンダリー",
    baseValue: 720,
    colorClass: "border-yellow-700/70 text-yellow-300",
    bgClass: "bg-yellow-950/10",
    badgeClass: "bg-yellow-900/20 text-yellow-300 border-yellow-900/30",
    iconString: "🪵 ◈"
  },

  // --- METAL QUALITY (Premium durability, x2.0 price) ---
  {
    id: "g-I_metal",
    name: "I字パイプ (メタル)",
    type: "I",
    quality: "メタル",
    rarity: "コモン",
    baseValue: 90,
    colorClass: "border-slate-500/70 text-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.05)]",
    bgClass: "bg-slate-800/10",
    badgeClass: "bg-slate-700/25 text-slate-300 border-slate-700/35",
    iconString: "⚙️ ┃"
  },
  {
    id: "g-L_metal",
    name: "L字パイプ (メタル)",
    type: "L",
    quality: "メタル",
    rarity: "コモン",
    baseValue: 90,
    colorClass: "border-slate-500/70 text-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.05)]",
    bgClass: "bg-slate-800/10",
    badgeClass: "bg-slate-700/25 text-slate-300 border-slate-700/35",
    iconString: "⚙️ ┗"
  },
  {
    id: "g-T_metal",
    name: "T字パイプ (メタル)",
    type: "T",
    quality: "メタル",
    rarity: "アンコモン",
    baseValue: 200,
    colorClass: "border-cyan-500/50 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.1)]",
    bgClass: "bg-cyan-950/20",
    badgeClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
    iconString: "⚙️ ┳"
  },
  {
    id: "g-X_metal",
    name: "X字パイプ (メタル)",
    type: "X",
    quality: "メタル",
    rarity: "レア",
    baseValue: 500,
    colorClass: "border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
    bgClass: "bg-purple-950/20",
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/25",
    iconString: "⚙️ ╋"
  },
  {
    id: "g-GOLD_metal",
    name: "黄金バルブ (メタル)",
    type: "GOLD",
    quality: "メタル",
    rarity: "レジェンダリー",
    baseValue: 1500,
    colorClass: "border-amber-500/70 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    bgClass: "bg-amber-950/35",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/45 font-semibold",
    iconString: "⚙️ ◈"
  },

  // --- GOLD & CRYSTAL QUALITY (Pure Luxury status, x4.5 price) ---
  {
    id: "g-I_gold",
    name: "I字パイプ (クリスタル)",
    type: "I",
    quality: "ゴールド",
    rarity: "コモン",
    baseValue: 210,
    colorClass: "border-yellow-400 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]",
    bgClass: "bg-yellow-500/5",
    badgeClass: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25 font-bold",
    iconString: "💎 ┃"
  },
  {
    id: "g-L_gold",
    name: "L字パイプ (クリスタル)",
    type: "L",
    quality: "ゴールド",
    rarity: "コモン",
    baseValue: 210,
    colorClass: "border-yellow-400 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]",
    bgClass: "bg-yellow-500/5",
    badgeClass: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25 font-bold",
    iconString: "💎 ┗"
  },
  {
    id: "g-T_gold",
    name: "T字パイプ (クリスタル)",
    type: "T",
    quality: "ゴールド",
    rarity: "アンコモン",
    baseValue: 460,
    colorClass: "border-yellow-500/70 text-yellow-300 shadow-[0_0_16px_rgba(234,179,8,0.25)]",
    bgClass: "bg-yellow-500/10",
    badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/35 font-extrabold",
    iconString: "💎 ┳"
  },
  {
    id: "g-X_gold",
    name: "X字パイプ (クリスタル)",
    type: "X",
    quality: "ゴールド",
    rarity: "レア",
    baseValue: 1100,
    colorClass: "border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(192,132,252,0.3)] animate-pulse",
    bgClass: "bg-purple-950/30",
    badgeClass: "bg-purple-500/25 text-purple-200 border-purple-500/40 font-extrabold",
    iconString: "💎 ╋"
  },
  {
    id: "g-GOLD_gold",
    name: "黄金バルブ (クリスタル)",
    type: "GOLD",
    quality: "ゴールド",
    rarity: "レジェンダリー",
    baseValue: 3200,
    colorClass: "border-rose-400 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse",
    bgClass: "bg-rose-950/40",
    badgeClass: "bg-rose-500/30 text-rose-300 border-rose-500/40 font-extrabold",
    iconString: "🌟 ◈"
  }
];

// Four rich variations of box types (Standard, Pro Steel, Golden Crystal, Mythic Galaxy)
export interface GachaBox {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  unlockCost: number; // Coins spent to stock / import this box type
  description: string;
  rarities: { rarity: "コモン" | "アンコモン" | "レア" | "レジェンダリー"; rate: number }[];
  qualities: { quality: "ウッド" | "メタル" | "ゴールド"; rate: number }[];
  borderColor: string;
  bgGlow: string;
}

export const GACHA_BOXES: GachaBox[] = [
  {
    id: "wood_box",
    name: "木製スタンダード箱",
    emoji: "📦",
    cost: 80,
    unlockCost: 0, // initially free
    description: "手頃な価格でお財布に優しい初心者向け。主にウッド品質が排出されます。",
    rarities: [
      { rarity: "コモン", rate: 58 },
      { rarity: "アンコモン", rate: 26 },
      { rarity: "レア", rate: 12 },
      { rarity: "レジェンダリー", rate: 4 }
    ],
    qualities: [
      { quality: "ウッド", rate: 92 },
      { quality: "メタル", rate: 8 },
      { quality: "ゴールド", rate: 0 }
    ],
    borderColor: "border-amber-700/55 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(180,83,9,0.15)]",
    bgGlow: "from-amber-950/10 to-transparent"
  },
  {
    id: "metal_box",
    name: "プロ仕様スチール箱",
    emoji: "⚙️",
    cost: 240,
    unlockCost: 350,
    description: "本職の配管工向け。耐久性に優れたメタルパーツが8割以上の高確率で手に入ります。",
    rarities: [
      { rarity: "コモン", rate: 25 },
      { rarity: "アンコモン", rate: 45 },
      { rarity: "レア", rate: 22 },
      { rarity: "レジェンダリー", rate: 8 }
    ],
    qualities: [
      { quality: "ウッド", rate: 8 },
      { quality: "メタル", rate: 82 },
      { quality: "ゴールド", rate: 10 }
    ],
    borderColor: "border-cyan-600/55 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]",
    bgGlow: "from-cyan-950/10 to-transparent"
  },
  {
    id: "sound_box",
    name: "電子音響シンセ箱 🎼",
    emoji: "🎼",
    cost: 320,
    unlockCost: 500,
    description: "極上の音色。サウンドを奏でる音響専用ボックス。ゴールドパイプやレアメロディ部品が満載！",
    rarities: [
      { rarity: "コモン", rate: 5 },
      { rarity: "アンコモン", rate: 20 },
      { rarity: "レア", rate: 50 },
      { rarity: "レジェンダリー", rate: 25 }
    ],
    qualities: [
      { quality: "ウッド", rate: 5 },
      { quality: "メタル", rate: 35 },
      { quality: "ゴールド", rate: 60 }
    ],
    borderColor: "border-emerald-400/60 hover:border-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    bgGlow: "from-emerald-950/15 to-transparent"
  },
  {
    id: "gold_box",
    name: "真空ゴールドクリスタル箱",
    emoji: "💎",
    cost: 550,
    unlockCost: 1000,
    description: "最高品質保証。全てが最高級クリスタル＆ゴールド、上位レア確定の一攫千金ボックス！",
    rarities: [
      { rarity: "コモン", rate: 0 },
      { rarity: "アンコモン", rate: 15 },
      { rarity: "レア", rate: 45 },
      { rarity: "レジェンダリー", rate: 40 }
    ],
    qualities: [
      { quality: "ウッド", rate: 0 },
      { quality: "メタル", rate: 0 },
      { quality: "ゴールド", rate: 100 }
    ],
    borderColor: "border-yellow-400/60 hover:border-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]",
    bgGlow: "from-yellow-950/15 to-transparent"
  },
  {
    id: "mythic_box",
    name: "星間ギャラクシークリスタル箱",
    emoji: "🌌",
    cost: 950,
    unlockCost: 2000,
    description: "極上の星間パーツ。排出率はレア30%、レジェンダリー70%、100%最高級クリスタル・ゴールド品質！",
    rarities: [
      { rarity: "コモン", rate: 0 },
      { rarity: "アンコモン", rate: 0 },
      { rarity: "レア", rate: 30 },
      { rarity: "レジェンダリー", rate: 70 }
    ],
    qualities: [
      { quality: "ウッド", rate: 0 },
      { quality: "メタル", rate: 0 },
      { quality: "ゴールド", rate: 100 }
    ],
    borderColor: "border-purple-500/60 hover:border-purple-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    bgGlow: "from-purple-950/15 to-transparent"
  }
];

// Shop Upgrade Rankings configuration map
export const SHOP_RANKS = [
  { rank: 1, name: "見習い水道店 🛠️", multiplier: 1.0, cost: 0, desc: "地元の水回りをお手伝いする小さな配管屋さん。" },
  { rank: 2, name: "こだわりの水道工房 ⚙️", multiplier: 1.15, cost: 500, desc: "プロ用スチールが評判を呼び、リピーターが増えた中堅ショップ。全商品の買取価格が常に +15% UP！" },
  { rank: 3, name: "優雅な音響水流サロン 🎵✨", multiplier: 1.35, cost: 1200, desc: "水道の音色にこだわる芸術的なハイエンド店。愛好家が集い、全買取価格が常に +35% UP！" },
  { rank: 4, name: "伝説のハイドロエンペラー 🏛️🌌👑", multiplier: 1.60, cost: 2500, desc: "水流と音響を完全に支配した伝説の神殿。全買取価格が常に +60% UP（最高店）！" }
];

// Custom simulated online buyers matching dynamic type
export interface VirtualBuyer {
  id: string;
  name: string;
  avatar: string;
  phrase: string;
  wantedType: "I" | "L" | "T" | "X" | "GOLD";
  premiumMultiplier: number;
}

const BUYERS: VirtualBuyer[] = [
  { id: "b1", name: "配管マニア ケンジ", avatar: "👨‍🔧", phrase: "幻の始終端バルブ（GOLD型）をお前の店から言い値で買い上げよう！", wantedType: "GOLD", premiumMultiplier: 1.30 },
  { id: "b2", name: "美咲 (DIY女子)", avatar: "👩‍🎨", phrase: "棚を作るのにL型カーブパイプがまだ大量に足りないの！譲って！", wantedType: "L", premiumMultiplier: 1.15 },
  { id: "b3", name: "工業デザイナー Alex", avatar: "🧑‍💻", phrase: "X型の4方向ジョイントが欲しい。現代的幾何学アートの素材にね。", wantedType: "X", premiumMultiplier: 1.25 },
  { id: "b4", name: "リサイクル屋 タカさん", avatar: "🧔", phrase: "T型分岐ジョイント。工事現場からまとめて頼まれちまってな。売ってくれ！", wantedType: "T", premiumMultiplier: 1.10 },
  { id: "b5", name: "水道技術局員 サトウ", avatar: "👮", phrase: "汎用的なI型ストレート。予備をいつでも店舗から買い取らせていただく。", wantedType: "I", premiumMultiplier: 1.12 }
];

interface GachaMarketProps {
  coins: number;
  onModifyCoins: (amt: number) => void;
  inventory: Record<string, number>;
  onUpdateInventory: (itemId: string, diff: number) => void;
  shopRating: number;
  onIncreaseRating: (amt: number) => void;
  unlockedBoxes: string[];
  onUnlockBox: (boxId: string) => void;
  shopRank: number;
  onUpgradeShopRank: () => void;
}

export const GachaMarket: React.FC<GachaMarketProps> = ({
  coins,
  onModifyCoins,
  inventory,
  onUpdateInventory,
  shopRating,
  onIncreaseRating,
  unlockedBoxes,
  onUnlockBox,
  shopRank,
  onUpgradeShopRank
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string>("wood_box");
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [pulledItem, setPulledItem] = useState<GachaItem | null>(null);
  const [boxShake, setBoxShake] = useState<boolean>(false);
  const [activeMarketFilter, setActiveMarketFilter] = useState<"all" | "wood" | "metal" | "gold">("all");

  // Box Tapping Upgrade mechanics
  const [isTappingStage, setIsTappingStage] = useState<boolean>(false);
  const [tapUpgradeCount, setTapUpgradeCount] = useState<number>(0);

  // Water Pipe Live Auction House States
  const [auctionItem, setAuctionItem] = useState<GachaItem | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [highestBidder, setHighestBidder] = useState<string>("配管ロボAI");
  const [auctionTimeLeft, setAuctionTimeLeft] = useState<number>(18);
  const [bidHistory, setBidHistory] = useState<{ bidder: string; amount: number }[]>([]);
  const [auctionMessage, setAuctionMessage] = useState<string>("オークション開催中！🔨");

  const currentBoxConfig = GACHA_BOXES.find(b => b.id === selectedBoxId) || GACHA_BOXES[0];

  // Map rank specific settings
  const currentRankConfig = SHOP_RANKS.find(r => r.rank === shopRank) || SHOP_RANKS[0];
  const nextRankConfig = SHOP_RANKS.find(r => r.rank === shopRank + 1);

  // Shop Rating scalar
  const calculateShopRatingBonus = () => {
    const scalar = shopRating >= 4.0 ? 1 + (shopRating - 4.0) * 0.25 : 1 - (4.0 - shopRating) * 0.25;
    // Layer rank multiplier directly on top of base rating multiplier
    return Math.max(0.6, scalar * currentRankConfig.multiplier);
  };

  // Real-time Auction House interval
  useEffect(() => {
    if (!auctionItem) {
      const idx = Math.floor(Math.random() * GACHA_POOL.length);
      const item = GACHA_POOL[idx];
      setAuctionItem(item);
      setCurrentBid(Math.floor(item.baseValue * 0.5));
      setHighestBidder("マスター・シゲル");
      setAuctionTimeLeft(18);
      setBidHistory([
        { bidder: "マスター・シゲル", amount: Math.floor(item.baseValue * 0.5) }
      ]);
    }

    const timer = setInterval(() => {
      setAuctionTimeLeft((prev) => {
        if (prev <= 1) {
          // Finish!
          if (highestBidder === "あなた") {
            // Player won!
            onUpdateInventory(auctionItem!.id, 1);
            onModifyCoins(-currentBid);
            sound.playSuccessFanfare();
            setAuctionMessage(`🎉 オークション落札に大成功！「${auctionItem!.name}」を獲得しました！`);
          } else {
            sound.playPluck(200, 0.4);
            setAuctionMessage(`🔔 オークション終了！「${highestBidder}」が ${currentBid} Coins で落札しました。`);
          }

          // Queue next auction item
          setTimeout(() => {
            const nextIdx = Math.floor(Math.random() * GACHA_POOL.length);
            const nextItem = GACHA_POOL[nextIdx];
            setAuctionItem(nextItem);
            setCurrentBid(Math.floor(nextItem.baseValue * 0.5));
            setHighestBidder("快速のリカ");
            setAuctionTimeLeft(18);
            setBidHistory([
              { bidder: "快速のリカ", amount: Math.floor(nextItem.baseValue * 0.5) }
            ]);
            setAuctionMessage("新規の水道管が出品されました！ハンマーを叩き合おう！🔨");
          }, 4500);

          return 0;
        }

        // Rival places counter-bids with 38% probability
        if (Math.random() < 0.38 && prev > 2) {
          const rivals = ["マスター・シゲル", "快速のリカ", "配管ロボAI", "黄金の手柴", "伝説のウエダ", "配管ボーイ"];
          const ra = rivals[Math.floor(Math.random() * rivals.length)];
          const bidAdd = Math.floor(12 + Math.random() * 26);
          const nextBidVal = currentBid + bidAdd;
          setCurrentBid(nextBidVal);
          setHighestBidder(ra);
          setBidHistory(h => [{ bidder: ra, amount: nextBidVal }, ...h.slice(0, 3)]);
          sound.playPluck(293.66, 0.4); // pleasant click chime
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionItem, currentBid, highestBidder]);

  const handlePlaceBid = () => {
    const bidAddAmount = Math.floor(15 + Math.random() * 15);
    const myBid = currentBid + bidAddAmount;
    if (coins < myBid) {
      sound.playPluck(150, 0.6); // low error chord
      return;
    }
    sound.playPopSound(784, 0.4); // successful bid sound!
    setCurrentBid(myBid);
    setHighestBidder("あなた");
    setBidHistory(h => [{ bidder: "あなた", amount: myBid }, ...h.slice(0, 3)]);
    setAuctionMessage("あなたが最高入札者です！叩き落とせ！🔨");
  };

  // Locked box stock importer handler
  const handleImportBoxType = (box: GachaBox) => {
    if (coins < box.unlockCost) {
      sound.playPluck(220, 0.85);
      return;
    }
    sound.playMusicBox(783.99, 1.2);
    setTimeout(() => sound.playMusicBox(1046.5, 1.2), 120);
    onModifyCoins(-box.unlockCost);
    onUnlockBox(box.id);
    setSelectedBoxId(box.id);
  };

  // Upgrade entire Shop remodel
  const handleUpgradeStore = () => {
    if (!nextRankConfig) return;
    if (coins < nextRankConfig.cost) {
      sound.playPluck(220, 0.85);
      return;
    }
    onModifyCoins(-nextRankConfig.cost);
    onUpgradeShopRank();
    sound.playSuccessFanfare();
    
    // Automatically lift rating nicely representing customer trust!
    onIncreaseRating(0.25);
  };

  // Weighted blind box open trigger (Enter upgrade-tapping mode first)
  const handleBuyBlindBox = () => {
    const isUnlocked = unlockedBoxes.includes(currentBoxConfig.id);
    if (!isUnlocked) return;

    if (coins < currentBoxConfig.cost) {
      sound.playPluck(220, 0.82); // Sad sound
      return;
    }

    sound.playPluck(330, 0.6);
    onModifyCoins(-currentBoxConfig.cost);
    setPulledItem(null);
    setIsTappingStage(true);
    setTapUpgradeCount(0);
  };

  // Perform interactive upgrade tap (max 5)
  const handleBoxUpgradeTapAction = () => {
    if (tapUpgradeCount >= 5) return;
    sound.playPopSound(261.63 + tapUpgradeCount * 130.81, 0.35);
    sound.playPluck(523.25 + tapUpgradeCount * 80, 0.7);
    setTapUpgradeCount(prev => prev + 1);
  };

  // Finalize box opening after tapping upgrades
  const handleExecuteFinalBoxRoll = () => {
    setIsTappingStage(false);
    setIsOpening(true);
    setBoxShake(true);

    let ticks = 0;
    const interval = setInterval(() => {
      sound.playPopSound(220 + ticks * 110, 0.15);
      ticks++;
      if (ticks >= 6) clearInterval(interval);
    }, 120);

    setTimeout(() => {
      setBoxShake(false);

      // Tap-Upgrade Factor (Each tap increases higher quality and rarity weights!)
      const tapBonusPercent = tapUpgradeCount * 7.5; // Up to +37.5% shift

      // 1. Dynamic Rarity Rolling based on box weights + Tap modifier
      const rarityRoll = Math.max(0.1, Math.random() * 100 - tapBonusPercent);
      let cumRarity = 0;
      let selectedRarity: "コモン" | "アンコモン" | "レア" | "レジェンダリー" = "コモン";
      for (const item of currentBoxConfig.rarities) {
        // Shift base rate in favor of rare & legendary using tap bonus
        let actualRate = item.rate;
        if (item.rarity === "コモン") actualRate = Math.max(1, item.rate - tapBonusPercent * 1.5);
        if (item.rarity === "レジェンダリー") actualRate = item.rate + tapBonusPercent;
        if (item.rarity === "レア") actualRate = item.rate + tapBonusPercent * 0.5;

        cumRarity += actualRate;
        if (rarityRoll <= cumRarity) {
          selectedRarity = item.rarity;
          break;
        }
      }

      // 2. Dynamic Quality Rolling based on box weights + Tap modifier
      const qualityRoll = Math.max(0.1, Math.random() * 100 - tapBonusPercent);
      let cumQuality = 0;
      let selectedQuality: "ウッド" | "メタル" | "ゴールド" = "ウッド";
      for (const item of currentBoxConfig.qualities) {
        let actualRate = item.rate;
        if (item.quality === "ウッド") actualRate = Math.max(1, item.rate - tapBonusPercent * 1.5);
        if (item.quality === "ゴールド") actualRate = item.rate + tapBonusPercent;

        cumQuality += actualRate;
        if (qualityRoll <= cumQuality) {
          selectedQuality = item.quality;
          break;
        }
      }

      // 3. Selection from full pool matching BOTH rarity and quality
      let candidates = GACHA_POOL.filter(item => item.rarity === selectedRarity && item.quality === selectedQuality);
      if (candidates.length === 0) {
        candidates = GACHA_POOL.filter(item => item.quality === selectedQuality);
      }
      const finalSelected = candidates[Math.floor(Math.random() * candidates.length)] || GACHA_POOL[0];

      // Add to inventory
      onUpdateInventory(finalSelected.id, 1);
      setPulledItem(finalSelected);

      // Trigger glorious audio synthesizers! 
      // If of kind Sound Box, play beautiful pentatonic scale chords!
      if (selectedBoxId === "sound_box") {
        sound.playMusicBox(523.25, 0.9);
        setTimeout(() => sound.playMusicBox(587.33, 0.9), 100);
        setTimeout(() => sound.playMusicBox(659.25, 0.9), 200);
        setTimeout(() => sound.playMusicBox(783.99, 1.2), 300);
        setTimeout(() => sound.playMusicBox(1046.5, 1.4), 400);
      } else if (finalSelected.quality === "ゴールド") {
        sound.playSuccessFanfare();
      } else if (finalSelected.rarity === "レア" || finalSelected.rarity === "レジェンダリー") {
        sound.playPluck(880, 1.2);
        setTimeout(() => sound.playPluck(1046, 1.2), 100);
      } else {
        sound.playPluck(523.25, 0.95);
      }

      setIsOpening(false);
    }, 1300);
  };

  const handleSellDirect = (item: GachaItem) => {
    const qty = inventory[item.id] || 0;
    if (qty <= 0) return;

    const finalPrice = Math.floor(item.baseValue * calculateShopRatingBonus());

    sound.playPluck(587.33, 0.8); // coin sound
    onUpdateInventory(item.id, -1);
    onModifyCoins(finalPrice);
    
    // Tiny rating bump for selling items through the store
    const ratingPlus = item.quality === "ウッド" ? 0.005 : item.quality === "メタル" ? 0.01 : 0.02;
    onIncreaseRating(ratingPlus);
  };

  const handleSellToBuyer = (buyer: VirtualBuyer, matchedItem: GachaItem) => {
    const qty = inventory[matchedItem.id] || 0;
    if (qty <= 0) return;

    const finalPrice = Math.floor(matchedItem.baseValue * buyer.premiumMultiplier * calculateShopRatingBonus());

    sound.playMusicBox(659.25, 1.2); // sweet music box melody chime
    onUpdateInventory(matchedItem.id, -1);
    onModifyCoins(finalPrice);

    // Dynamic rating jump for selling to specific buyer requests
    const ratingJump = matchedItem.quality === "ウッド" ? 0.015 : matchedItem.quality === "メタル" ? 0.03 : 0.06;
    onIncreaseRating(ratingJump);
  };

  // Helper labels
  const getQualityTextcolor = (q: string) => {
    if (q === "ゴールド") return "text-yellow-400 font-extrabold";
    if (q === "メタル") return "text-neutral-300 font-bold";
    return "text-amber-600/90";
  };

  const filteredInventoryPool = GACHA_POOL.filter(item => {
    if (activeMarketFilter === "all") return true;
    if (activeMarketFilter === "wood") return item.quality === "ウッド";
    if (activeMarketFilter === "metal") return item.quality === "メタル";
    if (activeMarketFilter === "gold") return item.quality === "ゴールド";
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 my-4">
      
      {/* 🚀 STORE BRAND UPGRADE DASHBOARD (最高の店にしていく店舗アップグレード) */}
      <div className="p-6 rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-900/60 to-neutral-950/60 backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest font-mono bg-teal-500/10 px-2 py-0.5 border border-teal-500/20 rounded">
              店舗経営システム
            </span>
            <span className="text-xs font-mono text-yellow-300 font-bold">
              店舗ランク: {currentRankConfig.name}
            </span>
          </div>

          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Home className="w-5 h-5 text-teal-400 shrink-0" />
            自分の店を最高の「伝説のハイドロエンペラー」に育てよう！
          </h2>
          
          <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-2xl">
            {currentRankConfig.desc} 現在、店舗ランク補正として
            <span className="text-teal-400 font-bold font-mono"> 全買取価格 +{((currentRankConfig.multiplier - 1) * 100).toFixed(0)}% </span>
            の価格ボーナスが恒久適用されています。
          </p>
        </div>

        {/* Upgrade Action block */}
        <div className="md:col-span-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-850 flex flex-col justify-center text-center space-y-3">
          {nextRankConfig ? (
            <>
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                <span>次期リフォーム:</span>
                <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                  <Coins className="w-3 h-3" /> {nextRankConfig.cost} Coins
                </span>
              </div>
              <div className="text-[11px] font-bold text-neutral-200">
                ⇒ {nextRankConfig.name}
              </div>
              <button
                onClick={handleUpgradeStore}
                disabled={coins < nextRankConfig.cost}
                className={`py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all duration-300 ${
                  coins >= nextRankConfig.cost
                    ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-neutral-950 hover:shadow-lg hover:brightness-105 cursor-pointer"
                    : "bg-neutral-900 border border-neutral-850 text-neutral-500 cursor-not-allowed"
                }`}
              >
                店舗をリフォーム改装する 🔨
              </button>
            </>
          ) : (
            <div className="py-2.5 flex flex-col items-center justify-center space-y-1">
              <Sparkle className="w-5 h-5 text-yellow-400 animate-spin" />
              <div className="text-xs font-extrabold tracking-widest text-yellow-400">
                👑 最高店舗ランク到達！
              </div>
              <div className="text-[9px] text-neutral-450">
                あなたの店舗は世界一のハイドロエンペラーです。
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SECTION (7 columns): Box Selector and Physical Console */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Box Selector Panel */}
          <div className="p-5 rounded-3xl border border-neutral-850 bg-neutral-900/15 backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest font-mono">
                ブラインドボックス・入荷（仕入れ）ラインナップ
              </span>
              <span className="text-[9px] text-neutral-500 font-sans">
                ※ コインで入荷契約を結ぶと、いつでも開封可能になります。
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GACHA_BOXES.map((box) => {
                const isUnlocked = unlockedBoxes.includes(box.id);
                const scorePr = box.id === "mythic_box" ? "70% 極レア" : box.id === "gold_box" ? "100% 貴金属" : box.id === "metal_box" ? "82% スチール" : "92% 木製";
                return (
                  <button
                    key={box.id}
                    onClick={() => {
                      if (isOpening) return;
                      sound.playPluck(440, 0.6);
                      setSelectedBoxId(box.id);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden ${
                      selectedBoxId === box.id
                        ? "bg-neutral-900 border-[#2ffff3]/50 shadow-[0_4px_20px_rgba(47,255,243,0.1)]"
                        : "bg-neutral-950/20 border-neutral-850 hover:bg-neutral-900/40"
                    }`}
                    disabled={isOpening}
                  >
                    {/* Lock sign */}
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-bold px-1 py-0.2 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2 h-2" /> Locked
                      </div>
                    )}

                    <div className="flex items-start justify-between w-full">
                      <span className="text-xl">{box.emoji}</span>
                      <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 shrink-0">
                        {scorePr}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[10.5px] font-extrabold text-neutral-200 truncate">{box.name}</h4>
                      <p className="text-[8px] text-neutral-500 line-clamp-1 mt-0.5 leading-snug">{box.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-850/40 pt-1 mt-0.5 font-mono text-[9px]">
                      {isUnlocked ? (
                        <>
                          <span className="text-neutral-500">開封:</span>
                          <span className="font-extrabold text-yellow-400 flex items-center">
                            {box.cost}c
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-amber-500 font-bold shrink-0">入荷:</span>
                          <span className="font-extrabold text-amber-400 truncate">
                            {box.unlockCost}c
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawing physical display Card */}
          <div className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-md relative overflow-hidden text-center flex flex-col items-center justify-between min-h-[390px]">
            {/* Back glows according to selected box */}
            {selectedBoxId === "mythic_box" ? (
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
            ) : selectedBoxId === "gold_box" ? (
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />
            ) : selectedBoxId === "metal_box" ? (
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
            ) : (
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            )}

            {/* Wallet Header */}
            <div className="w-full flex items-center justify-between border-b border-neutral-850 pb-4">
              <h3 className="font-bold text-xs tracking-wider uppercase text-neutral-400 flex items-center gap-1.5 font-mono">
                <ShoppingBag className="w-4 h-4 text-pink-400 animate-pulse" />
                {currentBoxConfig.name} の開封コンソール
              </h3>
              <div className="flex items-center space-x-2 bg-neutral-950 px-3.5 py-1.5 rounded-full border border-neutral-850">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-mono font-semibold text-yellow-300 text-sm">{coins}</span>
                <span className="text-[10px] text-neutral-500 font-mono">Coins</span>
              </div>
            </div>

            {/* Center Box physical Drawing */}
            <div className="my-6 relative py-2 w-full">
              <AnimatePresence mode="wait">
                {!unlockedBoxes.includes(currentBoxConfig.id) ? (
                  /* LOCKED STATE IMPORTER DISPLAY */
                  <motion.div
                    key="locked-import-view"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md mx-auto p-5 rounded-2xl border border-amber-900/40 bg-amber-950/5 text-center flex flex-col items-center space-y-3.5"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-md">
                      🔒
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-200">
                        「{currentBoxConfig.name}」を入荷契約しましょう！
                      </h4>
                      <p className="text-[10px] text-neutral-400 leading-relaxed font-sans max-w-sm mx-auto mt-1">
                        現在このボックスはまだ入荷契約されていません。コインを投じて入荷することで、以降はいつでも1回 【{currentBoxConfig.cost} Coins】 で無限に仕入れ・開封できるようになります。
                      </p>
                    </div>

                    <div className="w-full">
                      <button
                        onClick={() => handleImportBoxType(currentBoxConfig)}
                        disabled={coins < currentBoxConfig.unlockCost}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          coins >= currentBoxConfig.unlockCost
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 hover:shadow-lg hover:brightness-105"
                            : "bg-neutral-900 border border-neutral-850 text-neutral-500 cursor-not-allowed"
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        ボックスを新規入荷契約：{currentBoxConfig.unlockCost} Coins
                      </button>
                    </div>
                  </motion.div>
                ) : isTappingStage ? (
                  /* INTERACTIVE TAPPING UPGRADE MODE */
                  <motion.div
                    key="tapping-upgrade-container"
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4 w-full"
                  >
                    <div className="text-[11px] font-mono text-teal-400 uppercase tracking-widest animate-pulse font-bold">
                      ⚡ BOXを連打タップしてグレードを昇格！ (最大5回) ⚡
                    </div>

                    <motion.div
                      whileTap={{ scale: 0.92, rotate: [-1, 1, -1] }}
                      onClick={handleBoxUpgradeTapAction}
                      className="w-32 h-32 rounded-3xl border-4 flex flex-col items-center justify-center text-5xl cursor-pointer shadow-2xl mx-auto relative overflow-hidden transition-all duration-300 bg-gradient-to-tr from-emerald-950/60 to-neutral-900 border-teal-400/80 hover:border-teal-300"
                    >
                      <span className="text-5xl select-none animate-pulse">{currentBoxConfig.emoji}</span>
                      
                      {tapUpgradeCount > 0 && (
                        <div className="absolute top-2 right-2 bg-neutral-950/80 px-1.5 py-0.5 rounded-md border border-[#2ffff3]/20 font-mono text-[9px] text-[#2ffff3]">
                          ★ LV{tapUpgradeCount}
                        </div>
                      )}
                    </motion.div>

                    {/* Progress representation */}
                    <div className="space-y-3 px-6">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          Taps: <span className="text-[#2ffff3] font-bold">{tapUpgradeCount}/5</span>
                        </span>
                        <span className="text-teal-400 font-extrabold text-[10.5px]">
                          レア度補正率: +{(tapUpgradeCount * 7.5).toFixed(1)}% UP!
                        </span>
                      </div>

                      {/* Cool grid dots for tap gauge */}
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div 
                            key={i}
                            style={{ transitionDelay: `${i * 30}ms` }}
                            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                              i <= tapUpgradeCount 
                                ? "bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.6)] animate-pulse" 
                                : "bg-neutral-850"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleExecuteFinalBoxRoll}
                        className="w-full py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-neutral-950 shadow-xl hover:brightness-105 active:scale-97 transition-all cursor-pointer"
                      >
                        {tapUpgradeCount === 5 ? "🔥 【伝説確定】極上の状態で開封！" : `現在のグレードで即開封する 🔨`}
                      </button>
                    </div>
                  </motion.div>
                ) : boxShake ? (
                  <motion.div
                    key="box-shaking"
                    animate={{ 
                      rotate: [-3, 3, -4, 4, -2, 2, 0],
                      y: [0, -7, 0, -5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 0.35 }}
                    className={`w-32 h-32 rounded-3xl border-3 flex items-center justify-center text-5xl cursor-wait shadow-2xl mx-auto ${
                      selectedBoxId === "mythic_box"
                        ? "bg-gradient-to-tr from-purple-800 to-[#1e1b4b] border-purple-400"
                        : selectedBoxId === "gold_box" 
                        ? "bg-gradient-to-tr from-yellow-700 to-amber-500 border-yellow-400" 
                        : selectedBoxId === "metal_box" 
                        ? "bg-gradient-to-tr from-cyan-800 to-neutral-700 border-cyan-400" 
                        : "bg-gradient-to-tr from-[#7c2d12] to-amber-800 border-amber-600"
                    }`}
                  >
                    {currentBoxConfig.emoji}
                  </motion.div>
                ) : pulledItem ? (
                  <motion.div
                    key="after-pulled"
                    initial={{ scale: 0.3, opacity: 0, rotate: -25 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="space-y-4"
                  >
                    <div className={`w-32 h-32 rounded-3xl border-2 ${pulledItem.colorClass} ${pulledItem.bgClass} flex items-center justify-center text-5xl mx-auto shadow-2xl relative`}>
                      <span className="select-none">{pulledItem.iconString.split(" ")[1] || pulledItem.iconString}</span>
                      <span className="absolute bottom-2 text-[8px] text-neutral-400 font-mono tracking-wider bg-neutral-950/85 px-1.5 py-0.2 rounded-full border border-neutral-850">
                        {pulledItem.quality} • {pulledItem.rarity}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-[#2ffff3] font-mono uppercase tracking-widest animate-pulse font-bold flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#2ffff3]" />
                        NEW PART ACQUIRED!
                      </div>
                      <h4 className="text-base font-bold text-neutral-100">{pulledItem.name}</h4>
                      <span className={`inline-block px-2 py-0.2 rounded-full border text-[9px] ${pulledItem.badgeClass}`}>
                        品質: {pulledItem.quality} • 基本価値: {pulledItem.baseValue}c
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="box-ready"
                    whileHover={{ scale: 1.05 }}
                    className={`w-32 h-32 rounded-3xl border-2 shadow-xl flex items-center justify-center text-5xl cursor-pointer mx-auto ${
                      selectedBoxId === "mythic_box"
                        ? "bg-gradient-to-tr from-purple-950 to-[#1e1b4b] border-purple-400"
                        : selectedBoxId === "gold_box" 
                        ? "bg-gradient-to-tr from-yellow-900 to-yellow-600 border-yellow-400" 
                        : selectedBoxId === "metal_box" 
                        ? "bg-gradient-to-tr from-slate-800 to-cyan-800 border-cyan-500" 
                        : selectedBoxId === "sound_box"
                        ? "bg-gradient-to-tr from-emerald-950 to-teal-900 border-emerald-400"
                        : "bg-gradient-to-tr from-[#7c2d12] to-amber-900 border-amber-800"
                    }`}
                    onClick={handleBuyBlindBox}
                  >
                    🎁
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Trigger */}
            <div className="w-full space-y-3">
              {unlockedBoxes.includes(currentBoxConfig.id) && !isTappingStage && (
                <button
                  onClick={handleBuyBlindBox}
                  disabled={coins < currentBoxConfig.cost || isOpening || boxShake}
                  className={`w-full py-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer ${
                    coins < currentBoxConfig.cost
                      ? "bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed"
                      : selectedBoxId === "mythic_box"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-neutral-100 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:brightness-105"
                      : selectedBoxId === "gold_box"
                      ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-neutral-950 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:brightness-105"
                      : selectedBoxId === "metal_box"
                      ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-neutral-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:brightness-105"
                      : selectedBoxId === "sound_box"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-neutral-950 hover:shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:brightness-105"
                      : "bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:brightness-105"
                  }`}
                >
                  {isOpening ? "ボックスから引き出し中..." : `${currentBoxConfig.emoji} ボックスを購入 & 昇格タップへ (${currentBoxConfig.cost} c)`}
                </button>
              )}

              <div className="flex items-center justify-center space-x-1 text-[10px] text-neutral-400 font-sans">
                <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>店補正適用後：実売価格は基本の</span>
                <span className="font-bold text-pink-400 font-mono">{(calculateShopRatingBonus() * 100).toFixed(0)}%</span>
                <span>で買い取られます。</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SECTION (5 columns): Marketplace Dashboard & Inventory Sales */}
        <div className="lg:col-span-5 space-y-6">

          {/* 🔨 REAL-TIME WATER PIPE AUCTION HOUSE (水道管オークション) */}
          <div className="p-5 rounded-3xl border border-yellow-500/30 bg-[#292215]/30 backdrop-blur-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500/10 border-b border-l border-yellow-500/20 text-yellow-500 font-mono text-[9px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              LIVE AUCTION
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-xs font-mono uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
                <span>🔨</span> 水道管リアルタイムオークション
              </h3>
              <p className="text-[9px] text-neutral-400 leading-snug">
                一定時間で最高額を提示し続けた者がその特注「水道管」を獲得！ライバルに競り勝て！
              </p>
            </div>

            {auctionItem ? (
              <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-850 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Item icon square */}
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl shrink-0 ${auctionItem.colorClass} ${auctionItem.bgClass}`}>
                    {auctionItem.iconString.split(" ")[1] || auctionItem.iconString}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-200 truncate">{auctionItem.name}</h4>
                    <div className="flex items-center gap-1 text-[8px]">
                      <span className="text-yellow-400 font-bold">{auctionItem.quality}品質</span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-neutral-400">{auctionItem.rarity}</span>
                    </div>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-2 text-center text-neutral-300 py-1 border-t border-b border-neutral-850/60 my-1 font-mono">
                  <div className="bg-neutral-900/40 p-1.5 rounded-lg border border-neutral-900">
                    <p className="text-[7.5px] text-neutral-500">最高入札額</p>
                    <p className="text-xs font-bold text-yellow-400">{currentBid} <span className="text-[8px] text-neutral-500">Coins</span></p>
                  </div>
                  <div className="bg-neutral-900/40 p-1.5 rounded-lg border border-neutral-900">
                    <p className="text-[7.5px] text-neutral-500">制限時間</p>
                    <p className={`text-xs font-bold ${auctionTimeLeft <= 5 ? "text-red-400 animate-pulse" : "text-neutral-200"}`}>{auctionTimeLeft}s</p>
                  </div>
                </div>

                {/* Highest bidder text */}
                <div className="flex justify-between items-center text-[10px] px-1 font-sans">
                  <span className="text-neutral-400">現在最高位:</span>
                  <span className={`font-bold px-2 py-0.2 rounded-full text-[9px] ${highestBidder === "あなた" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-550/30" : "bg-neutral-800 text-neutral-300"}`}>
                    👤 {highestBidder}
                  </span>
                </div>

                {/* Bidding logs */}
                <div className="space-y-1 bg-neutral-950 p-2 rounded-lg border border-neutral-900/60 font-mono text-[8.5px]">
                  <p className="text-neutral-500 border-b border-neutral-900 pb-0.5 text-[7px] tracking-wider">BIDS LOG</p>
                  {bidHistory.length > 0 ? (
                    bidHistory.map((b, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-400">
                        <span className="truncate max-w-[120px]">{b.bidder}</span>
                        <span className="text-yellow-400/80">{b.amount}c</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600 text-center py-1">入札履歴なし</p>
                  )}
                </div>

                {/* Bid raise button */}
                <button
                  onClick={handlePlaceBid}
                  disabled={auctionTimeLeft <= 1 || coins < (currentBid + 15)}
                  className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                    coins >= (currentBid + 15) && auctionTimeLeft > 1
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-neutral-950 hover:brightness-105 shadow-md active:scale-97 cursor-pointer"
                      : "bg-neutral-900 border border-neutral-850 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  🔨 {currentBid + 15} Coins 以上で更に入札する
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 text-xs">商品準備中...</div>
            )}

            {/* Auction alerts message display */}
            <div className="bg-neutral-950/30 p-2 rounded-xl text-center text-[9px] font-sans border border-neutral-850/50 text-yellow-200/90 italic">
              {auctionMessage}
            </div>
          </div>
          
          {/* Inventory list */}
          <div className="p-5 rounded-3xl border border-neutral-850 bg-neutral-900/15 backdrop-blur-md space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  所持パイプパーツ一覧
                </div>
                <span className="text-[10px] text-neutral-550 font-sans">
                  総数: {Object.values(inventory).reduce((acc: number, val: number) => acc + val, 0)}個
                </span>
              </h3>

              {/* Quality Filters */}
              <div className="flex items-center justify-between gap-1.5 bg-neutral-950/60 p-1 rounded-xl border border-neutral-850/50">
                <button 
                  onClick={() => setActiveMarketFilter("all")}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                    activeMarketFilter === "all" ? "bg-neutral-850 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  全て
                </button>
                <button 
                  onClick={() => setActiveMarketFilter("wood")}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                    activeMarketFilter === "wood" ? "bg-amber-900/20 text-amber-400 border border-amber-900/30" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  木
                </button>
                <button 
                  onClick={() => setActiveMarketFilter("metal")}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                    activeMarketFilter === "metal" ? "bg-neutral-800 text-neutral-200 border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  鉄
                </button>
                <button 
                  onClick={() => setActiveMarketFilter("gold")}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                    activeMarketFilter === "gold" ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  金
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[290px] overflow-y-auto pr-1">
              {filteredInventoryPool.map((item) => {
                const qty = inventory[item.id] || 0;
                const bonusPrice = Math.floor(item.baseValue * calculateShopRatingBonus());
                return (
                  <div 
                    key={item.id} 
                    className={`p-2 rounded-xl border transition-all ${
                      qty > 0 ? "border-neutral-800 bg-neutral-900/40" : "border-neutral-900/15 opacity-30 bg-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 w-7/12">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${item.colorClass}`}>
                          {item.iconString.split(" ")[1] || item.iconString}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-[11px] font-bold text-neutral-200 truncate">{item.name}</div>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.2 rounded text-[7px] border shrink-0 ${item.badgeClass}`}>
                              {item.rarity}
                            </span>
                            <span className={`text-[7.5px] uppercase font-mono ${getQualityTextcolor(item.quality)}`}>
                              {item.quality}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 font-mono text-[10px]">
                        <div className="text-right">
                          <div className="text-[9px] text-neutral-500 font-sans">店主買取</div>
                          <span className="font-extrabold text-neutral-250 font-sans">{bonusPrice}c</span>
                        </div>
                        <span className="font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                          x{qty}
                        </span>
                        
                        <button
                          onClick={() => handleSellDirect(item)}
                          disabled={qty <= 0}
                          className={`px-2 py-1 rounded text-[9px] tracking-wider font-bold border transition-colors cursor-pointer ${
                            qty > 0 
                              ? "bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20" 
                              : "border-neutral-800 text-neutral-600 bg-transparent cursor-not-allowed"
                          }`}
                          title={`${bonusPrice} Coins で今すぐ直接売却`}
                        >
                          売る
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredInventoryPool.filter(item => (inventory[item.id] || 0) > 0).length === 0 && (
                <div className="text-center py-8 text-neutral-600 text-[10px] font-sans">
                  指定の品質クラスのパーツを現在所持していません。
                </div>
              )}
            </div>
          </div>

          {/* Dynamic traders list */}
          <div className="p-5 rounded-3xl border border-neutral-850 bg-neutral-900/20 backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-pink-400" />
                リアルタイム買取オファー
              </h3>
              <span className="text-[9px] text-[#2ffff3] bg-[#2ffff3]/5 px-2 py-0.5 border border-[#2ffff3]/20 rounded-full font-mono">
                店ランク補正適用
              </span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {BUYERS.map((buyer) => {
                const possiblePoolItems = GACHA_POOL.filter(g => g.type === buyer.wantedType);
                
                const ownedMatchingItems = possiblePoolItems
                  .filter(item => (inventory[item.id] || 0) > 0)
                  .sort((a, b) => {
                    const weight = { "ゴールド": 3, "メタル": 2, "ウッド": 1 };
                    return weight[b.quality] - weight[a.quality];
                  });

                const selectedItem = ownedMatchingItems[0] || possiblePoolItems.find(g => g.quality === "ウッド") || possiblePoolItems[0];
                const ownedQty = inventory[selectedItem.id] || 0;
                const offerPrice = Math.floor(selectedItem.baseValue * buyer.premiumMultiplier * calculateShopRatingBonus());

                return (
                  <div key={buyer.id} className="p-3 border border-neutral-900 rounded-2xl bg-neutral-950/45 text-left space-y-2 relative border-l-2 border-l-pink-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl select-none">{buyer.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-neutral-200">{buyer.name}</div>
                          <div className="text-[9px] text-[#2ffff3]/90 font-mono tracking-wide">
                            売却で店舗の評判UP
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[10px]">
                        <div className="text-[8px] text-neutral-500 font-sans tracking-tight">商談提示オファー額</div>
                        <span className="text-yellow-400 font-extrabold text-sm">{offerPrice}</span>
                        <span className="text-neutral-500"> Coin</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-400 italic bg-neutral-900/50 p-2 rounded-xl border border-neutral-850/50 leading-relaxed font-sans mt-0.5">
                      「{buyer.phrase}」
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-850/50">
                      <div className="flex flex-col">
                        <span className="text-[9.5px] text-neutral-450 truncate max-w-[130px]">
                          希望: <span className="font-extrabold text-neutral-200 tracking-tight">{selectedItem.name}</span>
                        </span>
                        <span className="text-[8.5px] text-neutral-500 font-mono">
                          倉庫在庫: <span className="text-neutral-300 font-bold">{ownedQty}個</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleSellToBuyer(buyer, selectedItem)}
                        disabled={ownedQty <= 0}
                        className={`px-3 py-1.5 rounded-xl text-[10px] tracking-wider font-extrabold border transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                          ownedQty > 0
                            ? "bg-gradient-to-r from-pink-500 to-rose-400 text-neutral-950 border-transparent shadow-md hover:scale-102 hover:brightness-110 active:scale-98"
                            : "border-neutral-800 text-neutral-600 bg-transparent cursor-not-allowed"
                        }`}
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        直売却
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
