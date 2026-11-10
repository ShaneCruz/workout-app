'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import RPESelector from './RPESelector';

interface WorkoutSummaryProps {
  sessionId: string;
  totalSets: number;
  startedAt: string;
  onFinish: () => void;
}

export default function WorkoutSummary({
  sessionId,
  totalSets,
  startedAt,
  onFinish,
}: WorkoutSummaryProps) {
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [comparison, setComparison] = useState<string | null>(null);

  const duration = Math.round((Date.now() - new Date(startedAt).getTime()) / 60000);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpe, notes: notes || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.total_volume) {
          setComparison(`Total volume: ${Math.round(data.total_volume).toLocaleString()} lbs`);
        }
      }

      onFinish();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-4">&#127942;</div>
      <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
      <p className="text-muted mb-6">
        {duration} min · {totalSets} sets logged
      </p>

      {comparison && (
        <div className="bg-card rounded-xl px-4 py-3 mb-6 text-center">
          <p className="text-sm text-accent">{comparison}</p>
        </div>
      )}

      <div className="w-full max-w-sm space-y-6">
        <RPESelector value={rpe} onChange={setRpe} label="How hard was this session?" />

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any notes? (optional)"
          className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-foreground
            placeholder:text-muted resize-none h-20"
        />

        <Button size="lg" onClick={handleFinish} disabled={saving}>
          {saving ? 'Saving...' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
