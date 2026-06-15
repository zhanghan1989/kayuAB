/**
 * KayuAB - SoundSettings Component
 * Lets users adjust music instruments, overall sound volume, 
 * ambient sea drone levels, and mute settings easily.
 */

import React, { useState } from "react";
import { sound } from "../utils/audio";
import { Volume2, VolumeX, Sparkles, Navigation, Waves, Settings, Lock, Coins } from "lucide-react";

interface SoundSettingsProps {
  currentInstrument: "bubble" | "musicbox" | "marimba" | "keyboard" | "flow";
  onInstrumentChange: (inst: "bubble" | "musicbox" | "marimba" | "keyboard" | "flow") => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  coins: number;
  onModifyCoins: (diff: number) => void;
  unlockedInstruments: string[];
  onUnlockInstrument: (inst: string) => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({
  currentInstrument,
  onInstrumentChange,
  isMuted,
  onMuteToggle,
  coins,
  onModifyCoins,
  unlockedInstruments,
  onUnlockInstrument
}) => {
  const [vol, setVol] = useState<number>(50);
  const [ambientVol, setAmbientVol] = useState<number>(15);

  const INSTRUMENT_COSTS: Record<string, number> = {
    bubble: 0,
    flow: 0,
    musicbox: 300,
    marimba: 500,
    keyboard: 750
  };

  const handleInstrumentSelect = (inst: "bubble" | "musicbox" | "marimba" | "keyboard" | "flow") => {
    const isUnlocked = unlockedInstruments.includes(inst);

    if (!isUnlocked) {
      const cost = INSTRUMENT_COSTS[inst] || 0;
      if (coins >= cost) {
        // Unlock
        onModifyCoins(-cost);
        onUnlockInstrument(inst);
        sound.setInstrument(inst);
        onInstrumentChange(inst);
        // Play sparkly unlock sound chime
        sound.playMusicBox(659.25, 1.2);
        setTimeout(() => sound.playMusicBox(880, 1.2), 100);
        setTimeout(() => sound.playMusicBox(1046.5, 1.2), 200);
      } else {
        // Negative sound feedback
        sound.playPluck(220, 0.8);
      }
      return;
    }

    sound.setInstrument(inst);
    onInstrumentChange(inst);
    
    // Play test note to demo the instrument
    if (inst === "bubble") {
      sound.playPopSound(523.25, 0.2);
    } else if (inst === "musicbox") {
      sound.playMusicBox(523.25, 0.26);
    } else if (inst === "marimba") {
      sound.playMarimba(523.25, 0.28);
    } else if (inst === "keyboard") {
      sound.playKeyboardClick(523.25, 0.26);
    } else {
      sound.playFlowWater(523.25, 0.26);
    }
  };

  const handleVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setVol(value);
    sound.setVolume(value / 100);
  };

  const handleAmbientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAmbientVol(value);
    sound.setAmbientVolume(value / 100);
  };

  const testTrigger = () => {
    sound.playPluck(392, 1.2);
    setTimeout(() => sound.playPluck(440, 1.2), 120);
    setTimeout(() => sound.playPluck(523.25, 1.5), 240);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-3xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-md space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
          <h3 className="font-medium text-sm text-neutral-100 uppercase tracking-wider font-mono">
            Sound Customizer
          </h3>
        </div>
        <button
          onClick={onMuteToggle}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold select-none cursor-pointer border transition-all duration-300 ${
            isMuted 
              ? "bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20" 
              : "bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20"
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>消音中</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span>音声：ON</span>
            </>
          )}
        </button>
      </div>

      {/* Select Instrument type */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-neutral-400 block font-mono">
            音色 (コインでお好みのプレミアムサウンドを解放)
          </label>
          <div className="flex items-center text-[10px] text-amber-300 font-mono gap-1">
            <Coins className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span>所持: {coins}c</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "bubble" as const, name: "水泡", desc: "ポコポコした泡" },
            { id: "flow" as const, name: "流水", desc: "瑞々しい流れ水" },
            { id: "musicbox" as const, name: "オルゴール", desc: "澄んだ金属音" },
            { id: "marimba" as const, name: "マリンバ", desc: "温かな木琴音" },
            { id: "keyboard" as const, name: "打鍵 click", desc: "心地よい音色" },
          ].map((item) => {
            const isSelected = currentInstrument === item.id;
            const isUnlocked = unlockedInstruments.includes(item.id);
            const cost = INSTRUMENT_COSTS[item.id] || 0;

            return (
              <button
                key={item.id}
                onClick={() => handleInstrumentSelect(item.id)}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center border cursor-pointer transition-all duration-300 h-20 ${
                  isSelected 
                    ? "bg-teal-500/10 border-teal-500/80 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.1)]" 
                    : !isUnlocked
                    ? "border-neutral-850 bg-neutral-950/20 text-neutral-500 hover:border-amber-500/30 hover:text-amber-400"
                    : "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                }`}
              >
                {!isUnlocked ? (
                  <div className="space-y-1 flex flex-col items-center justify-center">
                    <Lock className="w-3 h-3 text-amber-500/80" />
                    <div className="font-extrabold text-[10px] text-neutral-300">{item.name}</div>
                    <div className="text-[9px] font-mono text-amber-400 bg-amber-500/5 px-1 rounded border border-amber-500/20 font-bold">
                      {cost}c
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-bold text-xs">{item.name}</div>
                    <div className="text-[9px] text-neutral-500 mt-1 leading-tight">{item.desc}</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Volume Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {/* Effective Tap Sounds */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-500" />
              タップ・接続音
            </span>
            <span className="font-bold text-neutral-200">{vol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={vol}
            onChange={handleVolChange}
            className="w-full accent-amber-500 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Ocean waves / Ambient hum */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-mono">
              <Waves className="w-3" />
              海洋アンビエント
            </span>
            <span className="font-bold text-neutral-200">{ambientVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ambientVol}
            onChange={handleAmbientChange}
            className="w-full accent-teal-500 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Test Play Trigger Button */}
      <div className="w-full pt-1.5 flex justify-end">
        <button
          onClick={testTrigger}
          className="text-[11px] font-mono border border-neutral-800 rounded-lg px-2.5 py-1 text-neutral-550 hover:bg-neutral-900/60 hover:text-neutral-400 cursor-pointer transition-colors"
        >
          音のテスト再生 ♫
        </button>
      </div>

    </div>
  );
};
