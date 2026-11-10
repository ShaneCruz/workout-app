'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExerciseRow, ExerciseGroupRow } from '@/lib/db/plans';
import NumberStepper from '@/components/ui/NumberStepper';
import Button from '@/components/ui/Button';
import VoiceNoteButton from './VoiceNoteButton';
import ExerciseSwapSheet from './ExerciseSwapSheet';

interface LastSetData {
  reps: number;
  weight: number;
}

interface ExerciseCardProps {
  exercise: ExerciseRow;
  group: ExerciseGroupRow;
  roundIndex: number;
  setNumber: number;
  side: 'left' | 'right' | null;
  sessionId: string;
  progressionMessage: string | null;
  onLogSet: (data: { weight: number; reps: number; notes?: string; rpe?: number }) => void;
  onLogCardio: (data: { duration_seconds: number; speed?: number; incline?: number; resistance?: number; notes?: string }) => void;
  onLogTimed: (data: { duration_seconds: number; notes?: string }) => void;
  onComplete: () => void; // For warmup items
}

export default function ExerciseCard({
  exercise,
  group,
  roundIndex,
  setNumber,
  side,
  sessionId,
  progressionMessage,
  onLogSet,
  onLogCardio,
  onLogTimed,
  onComplete,
}: ExerciseCardProps) {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(exercise.rep_max ?? exercise.rep_min ?? 0);
  const [notes, setNotes] = useState('');
  const [showSwap, setShowSwap] = useState(false);
  const [lastSets, setLastSets] = useState<LastSetData[]>([]);

  // Cardio state
  const [duration, setDuration] = useState((exercise.duration_minutes ?? 0) * 60);
  const [speed, setSpeed] = useState(exercise.speed_min ?? 0);
  const [incline, setIncline] = useState(exercise.incline_min ?? 0);
  const [resistance, setResistance] = useState(exercise.resistance_min ?? 0);

  // Timed exercise state
  const [timerSeconds, setTimerSeconds] = useState(exercise.duration_seconds ?? 30);

  // Reset all state when exercise or set changes
  useEffect(() => {
    setWeight(0);
    setReps(exercise.rep_max ?? exercise.rep_min ?? 0);
    setNotes('');
    setShowSwap(false);
    setLastSets([]);
    setDuration((exercise.duration_minutes ?? 0) * 60);
    setSpeed(exercise.speed_min ?? 0);
    setIncline(exercise.incline_min ?? 0);
    setResistance(exercise.resistance_min ?? 0);
    setTimerSeconds(exercise.duration_seconds ?? 30);
  }, [exercise.id, setNumber, side, exercise.rep_max, exercise.rep_min, exercise.duration_minutes, exercise.speed_min, exercise.incline_min, exercise.resistance_min, exercise.duration_seconds]);

  // Fetch last session data and pre-populate weight/reps
  useEffect(() => {
    let cancelled = false;
    async function fetchLast() {
      try {
        const res = await fetch(`/api/logs?exerciseId=${exercise.id}&sessionId=${sessionId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.length > 0) {
            setLastSets(data);
            // Pre-populate from last session's matching set
            const lastForSet = data[setNumber - 1] ?? data[0];
            if (lastForSet?.weight) setWeight(lastForSet.weight);
            if (lastForSet?.reps) setReps(lastForSet.reps);
          }
        }
      } catch { /* ignore */ }
    }
    if (exercise.exercise_type === 'strength' || exercise.exercise_type === 'core') {
      fetchLast();
    }
    return () => { cancelled = true; };
  }, [exercise.id, sessionId, setNumber, side, exercise.exercise_type]);

  const handleVoiceNote = useCallback((text: string) => {
    setNotes(prev => prev ? `${prev}. ${text}` : text);
  }, []);

  const isWarmup = group.group_type === 'warmup';
  const isCardio = exercise.exercise_type === 'cardio';
  const isTimed = exercise.duration_seconds != null && exercise.exercise_type !== 'cardio';
  const isStrength = exercise.exercise_type === 'strength' || exercise.exercise_type === 'core';

  const repRange = exercise.rep_min && exercise.rep_max
    ? exercise.rep_min === exercise.rep_max
      ? `${exercise.rep_min}`
      : `${exercise.rep_min}–${exercise.rep_max}`
    : null;

  return (
    <div className="flex-1 flex flex-col px-6 py-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-xs text-accent uppercase tracking-wider mb-1">
          {group.name} · Round {roundIndex + 1}/{group.rounds}
          {side && ` · ${side.charAt(0).toUpperCase() + side.slice(1)} side`}
        </p>
        <h2 className="text-2xl font-bold">{exercise.name}</h2>
        {repRange && <p className="text-muted mt-1">Target: {repRange} reps</p>}
        {exercise.video_url && (
          <a href={exercise.video_url} target="_blank" rel="noopener noreferrer"
            className="text-accent text-sm underline mt-1 inline-block">
            Watch demo
          </a>
        )}
        {exercise.notes && (
          <p className="text-sm text-muted mt-1">{exercise.notes}</p>
        )}
      </div>

      {/* Progression hint */}
      {progressionMessage && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mb-4 text-center">
          <p className="text-sm text-accent">{progressionMessage}</p>
        </div>
      )}

      {/* Last session data */}
      {lastSets.length > 0 && isStrength && (
        <div className="bg-card rounded-xl px-4 py-2 mb-4 text-center">
          <p className="text-xs text-muted mb-1">Last session</p>
          <p className="text-sm text-muted">
            {lastSets.map((s, i) => `${s.weight}×${s.reps}`).join(', ')}
          </p>
        </div>
      )}

      {/* Warmup */}
      {isWarmup && !isCardio && !isTimed && (
        <div className="flex-1 flex flex-col items-center justify-center">
          {repRange && <p className="text-4xl font-bold mb-6">×{repRange}</p>}
          <Button size="lg" onClick={onComplete} className="max-w-xs">
            Done
          </Button>
        </div>
      )}

      {/* Strength exercise */}
      {isStrength && !isWarmup && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-sm text-muted">Set {setNumber}</p>

          <NumberStepper
            value={weight}
            onChange={setWeight}
            step={5}
            min={0}
            max={500}
            label="Weight"
            unit="lbs"
            size="large"
          />

          <NumberStepper
            value={reps}
            onChange={setReps}
            step={1}
            min={0}
            max={50}
            label="Reps"
          />

          <div className="flex items-center gap-3 w-full max-w-xs">
            <Button
              size="lg"
              onClick={() => onLogSet({ weight, reps, notes: notes || undefined })}
              className="flex-1"
            >
              Log Set
            </Button>
            <VoiceNoteButton onNote={handleVoiceNote} />
          </div>

          {notes && (
            <p className="text-xs text-muted text-center max-w-xs">{notes}</p>
          )}

          {exercise.swap_group && (
            <button
              onClick={() => setShowSwap(true)}
              className="text-xs text-muted underline"
            >
              Swap exercise
            </button>
          )}
        </div>
      )}

      {/* Cardio */}
      {isCardio && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <NumberStepper
            value={Math.floor(duration / 60)}
            onChange={v => setDuration(v * 60)}
            step={1}
            min={1}
            max={120}
            label="Minutes"
            unit="min"
            size="large"
          />

          {(exercise.speed_min != null || exercise.speed_max != null) && (
            <NumberStepper value={speed} onChange={setSpeed} step={0.1} min={0} max={15} label="Speed" unit="mph" />
          )}
          {(exercise.incline_min != null || exercise.incline_max != null) && (
            <NumberStepper value={incline} onChange={setIncline} step={0.5} min={0} max={15} label="Incline" unit="%" />
          )}
          {(exercise.resistance_min != null || exercise.resistance_max != null) && (
            <NumberStepper value={resistance} onChange={setResistance} step={1} min={0} max={25} label="Resistance" />
          )}

          <div className="flex items-center gap-3 w-full max-w-xs">
            <Button
              size="lg"
              onClick={() => onLogCardio({
                duration_seconds: duration,
                speed: speed || undefined,
                incline: incline || undefined,
                resistance: resistance || undefined,
                notes: notes || undefined,
              })}
              className="flex-1"
            >
              Log Cardio
            </Button>
            <VoiceNoteButton onNote={handleVoiceNote} />
          </div>
        </div>
      )}

      {/* Timed exercise (planks, etc.) */}
      {isTimed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-sm text-muted">Set {setNumber}</p>
          <NumberStepper
            value={timerSeconds}
            onChange={setTimerSeconds}
            step={5}
            min={5}
            max={300}
            label="Seconds"
            unit="s"
            size="large"
          />
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Button
              size="lg"
              onClick={() => onLogTimed({ duration_seconds: timerSeconds, notes: notes || undefined })}
              className="flex-1"
            >
              Log Set
            </Button>
            <VoiceNoteButton onNote={handleVoiceNote} />
          </div>
        </div>
      )}

      {showSwap && exercise.swap_group && (
        <ExerciseSwapSheet
          swapGroup={exercise.swap_group}
          currentName={exercise.name}
          onSelect={() => { /* For now just close — full swap requires DB update */ }}
          onClose={() => setShowSwap(false)}
        />
      )}
    </div>
  );
}
