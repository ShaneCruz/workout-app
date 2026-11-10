'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/ui/Button';

interface IntervalCardProps {
  totalRounds: number;
  workSeconds: number;
  restSeconds: number;
  notes?: string | null;
  onComplete: () => void;
}

type Phase = 'idle' | 'work' | 'rest' | 'done';

export default function IntervalCard({
  totalRounds,
  workSeconds,
  restSeconds,
  notes,
  onComplete,
}: IntervalCardProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workSeconds);
  const endTimeRef = useRef<number>(0);

  const startPhase = useCallback((newPhase: 'work' | 'rest', duration: number) => {
    endTimeRef.current = Date.now() + duration * 1000;
    setSecondsLeft(duration);
    setPhase(newPhase);
  }, []);

  const startWorkout = () => {
    setCurrentRound(1);
    startPhase('work', workSeconds);
  };

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        if (phase === 'work') {
          if (currentRound >= totalRounds) {
            setPhase('done');
            clearInterval(interval);
          } else {
            startPhase('rest', restSeconds);
          }
        } else if (phase === 'rest') {
          setCurrentRound(r => r + 1);
          startPhase('work', workSeconds);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [phase, currentRound, totalRounds, workSeconds, restSeconds, startPhase]);

  // Visibility change handler
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && endTimeRef.current > 0) {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const isWork = phase === 'work';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <p className="text-sm text-muted uppercase tracking-wider mb-1">Intervals</p>
      <p className="text-lg text-muted mb-6">
        Round {currentRound} / {totalRounds}
      </p>

      {phase === 'idle' && (
        <>
          <p className="text-center text-muted mb-4">
            {totalRounds} rounds: {workSeconds}s hard / {restSeconds}s easy
          </p>
          {notes && <p className="text-sm text-muted text-center mb-6">{notes}</p>}
          <Button size="lg" onClick={startWorkout} className="max-w-xs">
            Start Intervals
          </Button>
        </>
      )}

      {(phase === 'work' || phase === 'rest') && (
        <>
          <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-4 ${
            isWork ? 'bg-danger/20 border-4 border-danger' : 'bg-success/20 border-4 border-success'
          }`}>
            <span className="text-6xl font-bold tabular-nums">{secondsLeft}</span>
          </div>
          <p className={`text-2xl font-bold ${isWork ? 'text-danger' : 'text-success'}`}>
            {isWork ? 'GO HARD!' : 'Easy Recovery'}
          </p>
        </>
      )}

      {phase === 'done' && (
        <>
          <p className="text-3xl font-bold text-success mb-6">Done!</p>
          <Button size="lg" onClick={onComplete} className="max-w-xs">
            Continue
          </Button>
        </>
      )}
    </div>
  );
}
