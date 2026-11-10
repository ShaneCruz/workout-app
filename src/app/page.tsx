'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface SessionSummary {
  id: string;
  started_at: string;
  completed_at: string;
  total_volume: number | null;
  rpe: number | null;
  workout_plans: { name: string } | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions?limit=30')
      .then(r => r.ok ? r.json() : [])
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateSet = new Set(
    sessions.map(s => new Date(s.started_at).toDateString())
  );
  for (let i = 0; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (i === 0 && !dateSet.has(d.toDateString())) continue;
    if (dateSet.has(d.toDateString())) {
      streak++;
    } else if (d.getDay() === 0) {
      continue; // Sunday rest
    } else {
      break;
    }
  }

  // Weekly volume
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const weeklyVolume = sessions
    .filter(s => new Date(s.started_at) >= startOfWeek)
    .reduce((sum, s) => sum + (s.total_volume ?? 0), 0);

  const lastWeekVolume = sessions
    .filter(s => {
      const d = new Date(s.started_at);
      return d >= lastWeekStart && d < startOfWeek;
    })
    .reduce((sum, s) => sum + (s.total_volume ?? 0), 0);

  const volumeTrend = lastWeekVolume > 0
    ? ((weeklyVolume - lastWeekVolume) / lastWeekVolume * 100).toFixed(0)
    : null;

  // Calendar grid (last 7 weeks)
  const workoutDateStrs = new Set(
    sessions.map(s => new Date(s.started_at).toISOString().split('T')[0])
  );
  const calendarWeeks: { date: Date; hasWorkout: boolean }[][] = [];
  for (let week = 6; week >= 0; week--) {
    const days: { date: Date; hasWorkout: boolean }[] = [];
    for (let day = 0; day < 7; day++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (week * 7 + (6 - day)));
      days.push({
        date: d,
        hasWorkout: workoutDateStrs.has(d.toISOString().split('T')[0]),
      });
    }
    calendarWeeks.push(days);
  }

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-y-auto">
      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workout Tracker</h1>
        </div>

        <Button size="lg" onClick={() => router.push('/workout')}>
          Start Today&apos;s Workout
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-xs text-muted">Day Streak</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold">
              {weeklyVolume ? `${(weeklyVolume / 1000).toFixed(1)}k` : '0'}
            </p>
            <p className="text-xs text-muted">
              Weekly Volume
              {volumeTrend && Number(volumeTrend) !== 0 && (
                <span className={Number(volumeTrend) > 0 ? ' text-success' : ' text-danger'}>
                  {' '}{Number(volumeTrend) > 0 ? '↑' : '↓'}{Math.abs(Number(volumeTrend))}%
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-2xl p-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Last 7 Weeks</p>
          <div className="flex gap-1 justify-center">
            {calendarWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-5 h-5 rounded-sm ${
                      day.hasWorkout
                        ? 'bg-success'
                        : day.date > today
                          ? 'bg-transparent'
                          : 'bg-card-border/50'
                    }`}
                    title={day.date.toLocaleDateString()}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Recent Sessions</p>
          <div className="space-y-2">
            {sessions.slice(0, 5).map(session => {
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
            {sessions.length === 0 && (
              <p className="text-center text-muted text-sm py-4">No workouts yet. Start your first one!</p>
            )}
          </div>
        </div>

        {/* Nav */}
        <div className="grid grid-cols-3 gap-2 pb-6">
          <Button variant="secondary" onClick={() => router.push('/history')}>History</Button>
          <Button variant="secondary" onClick={() => router.push('/progress')}>Progress</Button>
          <Button variant="secondary" onClick={() => { window.location.href = '/api/export'; }}>Export</Button>
        </div>
      </div>
    </div>
  );
}
