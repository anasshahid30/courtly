'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Sparkles, ChevronRight, Play } from 'lucide-react';
import type { AdvocacyLevel } from '@/types';
import type { BackendLevelProgressItem } from '@/services';

interface LevelSelectorProps {
  selectedLevel: number;
  onSelectLevel: (levelNum: number) => void;
  compact?: boolean;
  progressLevels?: BackendLevelProgressItem[];
}

export function LevelSelector({
  selectedLevel,
  onSelectLevel,
  compact = false,
  progressLevels,
}: LevelSelectorProps) {
  const { levels, currentLevel, isAuthenticated, isGuestMode } = useAppStore();

  return (
    <div className="w-full space-y-3">
      {/* Desktop Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.levelNumber;
          const isOfficialCurrent = !isGuestMode && isAuthenticated && currentLevel === lvl.levelNumber;
          const isCompleted = !isGuestMode && isAuthenticated && lvl.levelNumber < currentLevel;
          const isLocked = !isGuestMode && isAuthenticated && lvl.levelNumber > currentLevel + 1;
          const progress = progressLevels?.find(
            (p) => p.level_number === lvl.levelNumber || p.level === lvl.levelNumber
          );

          return (
            <button
              key={lvl.levelNumber}
              type="button"
              onClick={() => onSelectLevel(lvl.levelNumber)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                  : 'border-border/60 bg-card hover:border-border hover:bg-muted/30'
              }`}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-serif text-sm font-bold ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    Level {lvl.levelNumber}
                  </span>

                  {progress ? (
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                        progress.status === 'PASSED'
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : progress.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-muted/80 text-muted-foreground border-border/60'
                      }`}
                    >
                      {progress.status}
                    </span>
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : isOfficialCurrent ? (
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                      Current
                    </span>
                  ) : isGuestMode ? (
                    <span className="text-[9px] font-medium text-muted-foreground">
                      Practice
                    </span>
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  ) : (
                    <span className="text-[9px] font-medium text-muted-foreground">
                      Available
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-foreground line-clamp-1">{lvl.title}</p>
                {!compact && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                    {lvl.subtitle}
                  </p>
                )}
              </div>

              {/* Progress or status bottom */}
              {!compact && !isGuestMode && isAuthenticated && (
                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    Best score:{' '}
                    <span className="font-semibold text-foreground">
                      {progress
                        ? (progress.best_score != null ? `${progress.best_score}%` : 'Not available yet')
                        : (lvl.minPassingScore ? `Min: ${lvl.minPassingScore}%` : 'Not available yet')}
                    </span>
                  </span>
                  {progress ? (
                    <span
                      className={`font-semibold uppercase text-[9px] ${
                        progress.status === 'PASSED'
                          ? 'text-primary'
                          : progress.status === 'IN_PROGRESS'
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {progress.status}
                    </span>
                  ) : isCompleted ? (
                    <span className="text-primary font-medium">Completed</span>
                  ) : isOfficialCurrent ? (
                    <span className="text-primary font-medium">{lvl.progressPercentage}%</span>
                  ) : (
                    <span>Practice</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
