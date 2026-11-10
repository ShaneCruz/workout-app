'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRestTimerReturn {
  secondsLeft: number;
  isRunning: boolean;
  start: (seconds: number) => void;
  skip: () => void;
  skippedEarly: boolean;
  skippedWithRemaining: number;
}

export function useRestTimer(onComplete: () => void): UseRestTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [skippedEarly, setSkippedEarly] = useState(false);
  const [skippedWithRemaining, setSkippedWithRemaining] = useState(0);
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    cleanup();
    setSkippedEarly(false);
    setSkippedWithRemaining(0);
    endTimeRef.current = Date.now() + seconds * 1000;
    setSecondsLeft(seconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        cleanup();
        setIsRunning(false);
        // Audio beep
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
  }, [cleanup]);

  const skip = useCallback(() => {
    const remaining = secondsLeft;
    cleanup();
    setIsRunning(false);
    setSecondsLeft(0);
    setSkippedEarly(true);
    setSkippedWithRemaining(remaining);
    onCompleteRef.current();
  }, [cleanup, secondsLeft]);

  useEffect(() => {
    // Handle visibility change — recalculate on resume
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && endTimeRef.current > 0) {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0 && isRunning) {
          cleanup();
          setIsRunning(false);
          onCompleteRef.current();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      cleanup();
    };
  }, [cleanup, isRunning]);

  return { secondsLeft, isRunning, start, skip, skippedEarly, skippedWithRemaining };
}
