'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { WorkoutPlanRow } from '@/lib/db/plans';
import { useWorkoutFlow } from '@/hooks/useWorkoutFlow';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import IntervalCard from './IntervalCard';
import OptionPicker from './OptionPicker';
import WorkoutSummary from './WorkoutSummary';
import PRCelebration from './PRCelebration';
import Button from '@/components/ui/Button';

interface WorkoutFlowProps {
  plan: WorkoutPlanRow;
  sessionId: string;
  startedAt: string;
}

export default function WorkoutFlow({ plan, sessionId, startedAt }: WorkoutFlowProps) {
  const {
    state,
    currentGroup,
    currentExercise,
    pendingOptionGroup,
    optionsForGroup,
    totalSets,
    completedSetCount,
    logSetAndAdvance,
    restComplete,
    selectOption,
    skipGroup,
    goBack,
    canGoBack,
  } = useWorkoutFlow(plan.exercise_groups);

  const [prState, setPrState] = useState<{ show: boolean; prev: number | null; value: number }>({
    show: false, prev: null, value: 0,
  });
  const [progressionMessages, setProgressionMessages] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startTime = useRef(new Date(startedAt).getTime());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);

  // Elapsed timer (accounts for paused time)
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current - totalPausedRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const togglePause = useCallback(() => {
    if (paused) {
      // Resuming — add paused duration to total
      if (pausedAtRef.current) {
        totalPausedRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
      setPaused(false);
    } else {
      // Pausing
      pausedAtRef.current = Date.now();
      setPaused(true);
    }
  }, [paused]);

  // Fetch progression suggestion when exercise changes
  useEffect(() => {
    if (!currentExercise || currentExercise.exercise_type !== 'strength') return;
    if (progressionMessages[currentExercise.id]) return;

    async function fetchProgression() {
      try {
        const repMax = currentExercise!.rep_max;
        if (!repMax) return;
        const res = await fetch(
          `/api/logs?exerciseId=${currentExercise!.id}&sessionId=${sessionId}&progression=true`
        );
        if (!res.ok) return;
        // Progression is computed client-side from last session data for simplicity
      } catch { /* ignore */ }
    }
    fetchProgression();
  }, [currentExercise, sessionId, progressionMessages]);

  const handleLogSet = useCallback(async (data: { weight: number; reps: number; notes?: string }) => {
    if (!currentExercise) return;

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          exercise_id: currentExercise.id,
          set_number: state.position.setNumber,
          weight: data.weight,
          reps: data.reps,
          side: state.position.side,
          notes: data.notes,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.pr?.isNewPR) {
          setPrState({
            show: true,
            prev: result.pr.previousValue,
            value: result.pr.newValue,
          });
        }
        // Vibrate on success
        if (navigator.vibrate) navigator.vibrate(50);
      }
    } catch { /* continue anyway */ }

    logSetAndAdvance();
  }, [currentExercise, sessionId, state.position, logSetAndAdvance]);

  const handleLogCardio = useCallback(async (data: {
    duration_seconds: number;
    speed?: number;
    incline?: number;
    resistance?: number;
    notes?: string;
  }) => {
    if (!currentExercise) return;

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          exercise_id: currentExercise.id,
          set_number: 1,
          ...data,
        }),
      });
    } catch { /* continue */ }

    logSetAndAdvance();
  }, [currentExercise, sessionId, logSetAndAdvance]);

  const handleLogTimed = useCallback(async (data: { duration_seconds: number; notes?: string }) => {
    if (!currentExercise) return;

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          exercise_id: currentExercise.id,
          set_number: state.position.setNumber,
          side: state.position.side,
          ...data,
        }),
      });
    } catch { /* continue */ }

    logSetAndAdvance();
  }, [currentExercise, sessionId, state.position, logSetAndAdvance]);

  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const targetMinutes = 60;
  const progressPercent = Math.min(100, (elapsed / (targetMinutes * 60)) * 100);

  // Workout complete
  if (state.isComplete) {
    return (
      <div className="h-dvh flex flex-col bg-background">
        <WorkoutSummary
          sessionId={sessionId}
          totalSets={completedSetCount}
          startedAt={startedAt}
          onFinish={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Duration progress bar */}
      <div className="relative h-1 bg-card-border">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
            progressPercent > 90 ? 'bg-danger' : progressPercent > 75 ? 'bg-warning' : 'bg-accent'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-card-border">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`px-2 py-1 text-sm ${canGoBack ? 'text-accent' : 'text-muted/30'}`}
        >
          ← Back
        </button>
        <div className="text-center">
          <p className="text-xs text-muted">{plan.name}</p>
          <p className="text-xs tabular-nums">
            {elapsedMin}:{elapsedSec.toString().padStart(2, '0')} · {completedSetCount}/{totalSets} sets
            {paused && <span className="text-warning ml-1">PAUSED</span>}
          </p>
        </div>
        <button
          onClick={togglePause}
          className={`px-2 py-1 text-sm ${paused ? 'text-success' : 'text-muted'}`}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Rest timer overlay */}
      {state.isResting && currentGroup && (
        <RestTimer
          seconds={currentGroup.rest_seconds}
          onComplete={restComplete}
        />
      )}

      {/* PR celebration */}
      <PRCelebration
        show={prState.show}
        previousWeight={prState.prev}
        newWeight={prState.value}
        onDismiss={() => setPrState(p => ({ ...p, show: false }))}
      />

      {/* Main content */}
      {pendingOptionGroup && currentGroup ? (
        <OptionPicker
          options={optionsForGroup}
          onSelect={(id) => selectOption(pendingOptionGroup, id)}
        />
      ) : currentGroup?.group_type === 'interval' && currentGroup.work_seconds ? (
        <IntervalCard
          totalRounds={currentGroup.rounds}
          workSeconds={currentGroup.work_seconds}
          restSeconds={currentGroup.rest_interval_seconds ?? 60}
          notes={currentGroup.notes}
          onComplete={logSetAndAdvance}
        />
      ) : currentGroup?.is_optional && state.position.roundIndex === 0 && state.position.exerciseIndex === 0 && completedSetCount > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-xl font-semibold">{currentGroup.name}</p>
          <p className="text-muted">This section is optional</p>
          <Button size="lg" onClick={() => {}} className="max-w-xs">
            Start
          </Button>
          <Button variant="ghost" size="lg" onClick={skipGroup} className="max-w-xs">
            Skip
          </Button>
        </div>
      ) : currentExercise && currentGroup ? (
        <ExerciseCard
          exercise={currentExercise}
          group={currentGroup}
          roundIndex={state.position.roundIndex}
          setNumber={state.position.setNumber}
          side={state.position.side}
          sessionId={sessionId}
          progressionMessage={progressionMessages[currentExercise.id] ?? null}
          onLogSet={handleLogSet}
          onLogCardio={handleLogCardio}
          onLogTimed={handleLogTimed}
          onComplete={logSetAndAdvance}
        />
      ) : null}
    </div>
  );
}
