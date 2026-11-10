'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ExerciseLog {
  id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  duration_seconds: number | null;
  speed: number | null;
  incline: number | null;
  resistance: number | null;
  side: string | null;
  rpe: number | null;
  notes: string | null;
  exercises: { name: string; exercise_type: string } | null;
}

interface SessionDetail {
  id: string;
  started_at: string;
  completed_at: string | null;
  total_volume: number | null;
  rpe: number | null;
  notes: string | null;
  workout_plans: { id: string; name: string } | null;
  exercise_logs: ExerciseLog[];
}

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions?id=${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading || !session) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const d = new Date(session.started_at);
  const duration = session.completed_at
    ? Math.round((new Date(session.completed_at).getTime() - d.getTime()) / 60000)
    : null;

  // Group logs by exercise
  const byExercise = session.exercise_logs.reduce((acc, log) => {
    const name = log.exercises?.name ?? 'Unknown';
    if (!acc[name]) acc[name] = { type: log.exercises?.exercise_type ?? 'strength', logs: [] };
    acc[name].logs.push(log);
    return acc;
  }, {} as Record<string, { type: string; logs: ExerciseLog[] }>);

  return (
    <div className="h-dvh flex flex-col bg-background overflow-y-auto">
      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">
        <button onClick={() => router.push('/history')} className="text-accent text-sm mb-4">
          ← History
        </button>

        <h1 className="text-xl font-bold mb-1">{session.workout_plans?.name ?? 'Workout'}</h1>
        <p className="text-sm text-muted mb-1">
          {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="flex gap-4 text-sm text-muted mb-6">
          {duration && <span>{duration} min</span>}
          {session.total_volume && <span>{Math.round(session.total_volume).toLocaleString()} lbs</span>}
          {session.rpe && <span>RPE {session.rpe}</span>}
        </div>

        {session.notes && (
          <div className="bg-card rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-muted">{session.notes}</p>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(byExercise).map(([name, { type, logs }]) => (
            <div key={name} className="bg-card rounded-xl px-4 py-3">
              <p className="font-semibold text-sm mb-2">{name}</p>
              {type === 'strength' || type === 'core' ? (
                <div className="space-y-1">
                  {logs.map(log => (
                    <div key={log.id} className="flex justify-between text-sm">
                      <span className="text-muted">
                        Set {log.set_number}
                        {log.side ? ` (${log.side})` : ''}
                      </span>
                      <span>
                        {log.weight && log.reps
                          ? `${log.weight} lbs × ${log.reps}`
                          : log.duration_seconds
                            ? `${log.duration_seconds}s`
                            : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted">
                  {logs[0]?.duration_seconds && (
                    <span>{Math.round(logs[0].duration_seconds / 60)} min</span>
                  )}
                  {logs[0]?.speed && <span> · {logs[0].speed} mph</span>}
                  {logs[0]?.incline && <span> · {logs[0].incline}% incline</span>}
                  {logs[0]?.resistance && <span> · Resistance {logs[0].resistance}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
