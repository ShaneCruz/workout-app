'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutPlanRow } from '@/lib/db/plans';
import Button from '@/components/ui/Button';

export default function WorkoutLauncher() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlanRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const day = new Date().getDay();
    fetch(`/api/plans?day=${day}`)
      .then(r => r.ok ? r.json() : null)
      .then(setPlan)
      .finally(() => setLoading(false));
  }, []);

  const startWorkout = async () => {
    if (!plan) return;
    setStarting(true);

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id }),
    });

    if (res.ok) {
      const session = await res.json();
      router.push(`/workout/${session.id}`);
    } else {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-background px-6">
        <p className="text-xl font-semibold mb-2">No workout planned today</p>
        <p className="text-muted mb-6">Enjoy your rest day!</p>
        <Button variant="secondary" onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (plan.is_rest_day) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-background px-6">
        <p className="text-4xl mb-4">&#128524;</p>
        <p className="text-xl font-semibold mb-2">Rest Day</p>
        <p className="text-muted mb-6">{plan.description}</p>
        <Button variant="secondary" size="lg" onClick={startWorkout} disabled={starting} className="max-w-xs">
          {starting ? 'Starting...' : 'Start Recovery Session'}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/')} className="mt-3">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-background px-6">
      <p className="text-xs text-accent uppercase tracking-wider mb-2">Today&apos;s Workout</p>
      <h1 className="text-3xl font-bold mb-2 text-center">{plan.name}</h1>
      <p className="text-muted mb-1">{plan.description}</p>
      <p className="text-sm text-muted mb-8">
        {plan.exercise_groups.length} sections ·{' '}
        {plan.exercise_groups.reduce((sum, g) => sum + g.exercises.length, 0)} exercises
      </p>

      {/* Quick preview of sections */}
      <div className="w-full max-w-sm space-y-2 mb-8">
        {plan.exercise_groups.map(group => (
          <div key={group.id} className="flex items-center justify-between bg-card rounded-xl px-4 py-2">
            <span className="text-sm">{group.name}</span>
            <span className="text-xs text-muted">
              {group.rounds > 1 ? `${group.rounds} rounds` : ''}
              {group.is_optional ? ' (optional)' : ''}
            </span>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={startWorkout} disabled={starting} className="max-w-xs">
        {starting ? 'Starting...' : 'Start Workout'}
      </Button>
    </div>
  );
}
