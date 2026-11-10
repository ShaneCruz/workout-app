'use client';

interface RPESelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
}

const RPE_COLORS: Record<number, string> = {
  1: 'bg-green-600',
  2: 'bg-green-600',
  3: 'bg-green-500',
  4: 'bg-lime-500',
  5: 'bg-yellow-500',
  6: 'bg-yellow-500',
  7: 'bg-orange-500',
  8: 'bg-orange-600',
  9: 'bg-red-500',
  10: 'bg-red-600',
};

export default function RPESelector({ value, onChange, label = 'RPE' }: RPESelectorProps) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wider mb-2 text-center">{label}</p>
      <div className="flex gap-1.5 justify-center">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all
              ${value === n
                ? `${RPE_COLORS[n]} text-white scale-110`
                : 'bg-card border border-card-border text-muted'
              }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
