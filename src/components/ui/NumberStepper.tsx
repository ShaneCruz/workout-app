'use client';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: 'normal' | 'large';
}

export default function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  label,
  unit,
  size = 'normal',
}: NumberStepperProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  const isLarge = size === 'large';

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={decrement}
          className={`rounded-xl bg-card border border-card-border text-foreground font-bold
            active:bg-card-border transition-colors
            ${isLarge ? 'w-16 h-16 text-2xl' : 'w-14 h-14 text-xl'}`}
        >
          −
        </button>
        <div className={`text-center min-w-[80px] ${isLarge ? 'text-4xl' : 'text-3xl'} font-bold tabular-nums`}>
          {value}
          {unit && <span className="text-base text-muted ml-1">{unit}</span>}
        </div>
        <button
          onClick={increment}
          className={`rounded-xl bg-card border border-card-border text-foreground font-bold
            active:bg-card-border transition-colors
            ${isLarge ? 'w-16 h-16 text-2xl' : 'w-14 h-14 text-xl'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
