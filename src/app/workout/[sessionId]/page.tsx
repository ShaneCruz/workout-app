'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WorkoutPlanRow } from '@/lib/db/plans';
import WorkoutFlow from '@/components/workout/WorkoutFlow';

export default function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [plan, setPlan] = useState<WorkoutPlanRow | null>(null);
  const [startedAt, setStartedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Get session details
      const sessionRes = await fetch(`/api/sessions?id=${sessionId}`);
      if (!sessionRes.ok) return;
      const session = await sessionRes.json();

      setStartedAt(session.started_at);

      // Get plan details
      const planId = session.workout_plans?.id;
      if (!planId) return;

      const day = new Date().getDay();
      const planRes = await fetch(`/api/plans?day=${day}`);
      if (!planRes.ok) return;
      const planData = await planRes.json();

      setPlan(planData);
      setLoading(false);
    }

    load();
  }, [sessionId]);

  if (loading || !plan) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">Loading workout...</p>
      </div>
    );
  }

  return <WorkoutFlow plan={plan} sessionId={sessionId} startedAt={startedAt} />;
}
