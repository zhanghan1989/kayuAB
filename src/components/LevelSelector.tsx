/**
 * KayuAB - LevelSelector Component
 * Let's user comfortably pick from designed levels, showing difficulty tags 
 * and clear description.
 */

import React from "react";
import { Level } from "../data/levels";
import { Star, ShieldAlert, CheckCircle2, ChevronRight, Waves } from "lucide-react";
import { sound } from "../utils/audio";

interface LevelSelectorProps {
  levels: Level[];
  activeLevelId: number;
  onSelectLevel: (id: number) => void;
  completedLevels: number[];
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  activeLevelId,
  onSelectLevel,
  completedLevels
}) => {
  
  const handleSelect = (id: number) => {
    sound.playPluck(523.25, 0.5);
    onSelectLevel(id);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Title */}
      <div className="flex items-center space-x-2 px-2 text-xs md:text-sm text-neutral-400 font-mono">
        <Waves className="w-4 h-4 text-cyan-400" />
        <span className="uppercase tracking-widest text-[#00e5ff] font-bold">配管ステージの選択</span>
      </div>

      {/* Grid of Stages */}
      <div className="grid grid-cols-1 gap-3">
        {levels.map((level) => {
          const isActive = level.id === activeLevelId;
          const isCompleted = completedLevels.includes(level.id);

          // Customize badge style based on parameters
          let diffColor = "bg-teal-500/10 text-teal-300 border-teal-500/20";
          if (level.difficulty === "中級") {
            diffColor = "bg-amber-500/10 text-amber-300 border-amber-500/20";
          } else if (level.difficulty === "上級") {
            diffColor = "bg-rose-500/10 text-rose-300 border-rose-500/20";
          }

          return (
            <button
              key={level.id}
              onClick={() => handleSelect(level.id)}
              className={`group w-full p-4 p-y-4.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 cursor-pointer ${
                isActive 
                  ? "bg-neutral-900 border-amber-500/90 shadow-[0_4px_20px_rgba(245,158,11,0.15)] scale-[1.01]" 
                  : "bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700 hover:scale-[1.005]"
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Level Index Indicator */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isActive 
                    ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950" 
                    : isCompleted
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                }`}>
                  {level.id}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold text-sm transition-colors ${
                      isActive ? "text-amber-400" : "text-neutral-100 group-hover:text-amber-300"
                    }`}>
                      {level.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold leading-normal ${diffColor}`}>
                      {level.difficulty}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                    {level.description}
                  </p>
                </div>
              </div>

              {/* Status Action Mark */}
              <div className="flex items-center space-x-2 pl-4">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-400 fill-teal-950/40 shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-neutral-350 transition-colors shrink-0" />
                )}
              </div>

            </button>
          );
        })}
      </div>
    </div>
  );
};
