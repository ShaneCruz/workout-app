'use client';

import { EXERCISE_SWAPS } from '@/config/exercise-swaps';

interface ExerciseSwapSheetProps {
  swapGroup: string;
  currentName: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export default function ExerciseSwapSheet({ swapGroup, currentName, onSelect, onClose }: ExerciseSwapSheetProps) {
  const alternatives = EXERCISE_SWAPS[swapGroup]?.filter(name => name !== currentName) ?? [];

  if (alternatives.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-card-border rounded-full mx-auto mb-4" />
        <p className="text-lg font-semibold mb-4">Swap Exercise</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alternatives.map(name => (
            <button
              key={name}
              onClick={() => {
                onSelect(name);
                onClose();
              }}
              className="w-full text-left px-4 py-3 rounded-xl bg-background active:bg-card-border transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
