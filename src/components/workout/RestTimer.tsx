'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/components/ui/Button';

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
}

export default function RestTimer({ seconds, onComplete }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const endTimeRef = useRef(Date.now() + seconds * 1000);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const doneRef = useRef(false);

  useEffect(() => {
    endTimeRef.current = Date.now() + seconds * 1000;
    setSecondsLeft(seconds);
    doneRef.current = false;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.value = 0.3;
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch { /* audio not available */ }
        onCompleteRef.current();
      }
    }, 250);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // Only restart if seconds prop changes (new rest period)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const skip = useCallback(() => {
    if (!doneRef.current) {
      doneRef.current = true;
      onCompleteRef.current();
    }
  }, []);

  const progress = 1 - secondsLeft / seconds;
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center">
      <p className="text-muted text-lg mb-4 uppercase tracking-wider">Rest</p>

      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="var(--card-border)"
            strokeWidth="4"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 283} 283`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold tabular-nums">
            {minutes > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : secs}
          </span>
        </div>
      </div>

      <Button variant="ghost" size="lg" onClick={skip} className="max-w-xs">
        Skip Rest
      </Button>
    </div>
  );
}
