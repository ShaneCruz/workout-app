'use client';

import { ExerciseRow } from '@/lib/db/plans';
import Button from '@/components/ui/Button';

interface OptionPickerProps {
  options: ExerciseRow[];
  onSelect: (exerciseId: string) => void;
}

export default function OptionPicker({ options, onSelect }: OptionPickerProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <p className="text-muted text-sm uppercase tracking-wider mb-2">Choose your exercise</p>
      <div className="w-full max-w-md space-y-3">
        {options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="w-full bg-card border border-card-border rounded-2xl p-5 text-left active:bg-card-border transition-colors"
          >
            <p className="text-xs text-accent mb-1">Option {String.fromCharCode(65 + i)}</p>
            <p className="text-xl font-semibold">{opt.name}</p>
            {opt.notes && <p className="text-sm text-muted mt-1">{opt.notes}</p>}
            {opt.duration_minutes && (
              <p className="text-sm text-muted mt-1">{opt.duration_minutes} min</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
