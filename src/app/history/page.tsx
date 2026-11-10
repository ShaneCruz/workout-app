'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface SessionSummary {
  id: string;
  started_at: string;
  completed_at: string | null;
  total_volume: number | null;
  rpe: number | null;
  workout_plans: { name: string } | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions?limit=50')
      .then(r => r.ok ? r.json() : [])
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  // Group sessions by month
  const grouped = sessions.reduce((acc, session) => {
    const d = new Date(session.started_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = { label, sessions: [] };
    acc[key].sessions.push(session);
    return acc;
  }, {} as Record<string, { label: string; sessions: SessionSummary[] }>);

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-y-auto">
      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="text-accent text-sm">← Dashboard</button>
          <h1 className="text-xl font-bold">History</h1>
          <div className="w-16" />
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No completed workouts yet.</p>
            <Button variant="secondary" onClick={() => router.push('/workout')} className="mt-4">
              Start a Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(grouped).map(group => (
              <div key={group.label}>
                <p className="text-xs text-muted uppercase tracking-wider mb-2">{group.label}</p>
                <div className="space-y-2">
                  {group.sessions.map(session => {
                    const d = new Date(session.started_at);
                    const duration = session.completed_at
                      ? Math.round((new Date(session.completed_at).getTime() - d.getTime()) / 60000)
                      : null;
                    return (
                      <button
                        key={session.id}
                        onClick={() => router.push(`/history/${session.id}`)}
                        className="w-full bg-card rounded-xl px-4 py-3 flex items-center justify-between text-left active:bg-card-border transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{session.workout_plans?.name ?? 'Workout'}</p>
                          <p className="text-xs text-muted">
                            {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {duration ? ` · ${duration} min` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          {session.total_volume ? (
                            <p className="text-sm font-medium">{Math.round(session.total_volume).toLocaleString()} lbs</p>
                          ) : null}
                          {session.rpe && <p className="text-xs text-muted">RPE {session.rpe}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
