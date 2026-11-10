'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ExerciseOption {
  id: string;
  name: string;
}

interface ChartPoint {
  date: string;
  weight: number;
}

interface PRRecord {
  record_type: string;
  value: number;
  secondary_value: number | null;
  achieved_at: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [prs, setPrs] = useState<PRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load exercises from a recent session
  useEffect(() => {
    async function loadExercises() {
      const res = await fetch('/api/sessions?limit=5');
      if (!res.ok) { setLoading(false); return; }
      const sessions = await res.json();

      const exerciseMap = new Map<string, string>();
      for (const session of sessions) {
        if (session.exercise_logs) {
          for (const log of session.exercise_logs) {
            if (log.exercises && log.weight) {
              exerciseMap.set(log.exercise_id, log.exercises.name);
            }
          }
        }
      }

      const exList = [...exerciseMap.entries()].map(([id, name]) => ({ id, name }));
      setExercises(exList);
      if (exList.length > 0) setSelectedId(exList[0].id);
      setLoading(false);
    }
    loadExercises();
  }, []);

  // Load chart data when exercise changes
  useEffect(() => {
    if (!selectedId) return;

    async function loadData() {
      const [prsRes] = await Promise.all([
        fetch(`/api/prs?exerciseId=${selectedId}`),
      ]);

      if (prsRes.ok) {
        const prData = await prsRes.json();
        setPrs(prData);
      }

      // Get historical data from sessions
      const sessionsRes = await fetch('/api/sessions?limit=50');
      if (!sessionsRes.ok) return;
      const sessions = await sessionsRes.json();

      const points: ChartPoint[] = [];
      for (const session of sessions) {
        if (!session.exercise_logs) continue;
        const relevantLogs = session.exercise_logs.filter(
          (l: { exercise_id: string; weight: number | null }) => l.exercise_id === selectedId && l.weight
        );
        if (relevantLogs.length === 0) continue;

        const maxWeight = Math.max(...relevantLogs.map((l: { weight: number }) => l.weight));
        const date = new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        points.push({ date, weight: maxWeight });
      }

      setChartData(points.reverse());
    }

    loadData();
  }, [selectedId]);

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const maxWeightPR = prs.find(p => p.record_type === 'max_weight');

  return (
    <div className="h-dvh flex flex-col bg-background overflow-y-auto">
      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-accent text-sm">← Dashboard</button>
          <h1 className="text-xl font-bold">Progress</h1>
          <div className="w-16" />
        </div>

        {exercises.length === 0 ? (
          <p className="text-center text-muted py-12">Complete some workouts to see progress charts.</p>
        ) : (
          <>
            {/* Exercise selector */}
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-foreground"
            >
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>

            {/* PR display */}
            {maxWeightPR && (
              <div className="bg-card rounded-2xl p-4 text-center">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Personal Record</p>
                <p className="text-3xl font-bold">{maxWeightPR.value} lbs</p>
                {maxWeightPR.secondary_value && (
                  <p className="text-sm text-muted">× {maxWeightPR.secondary_value} reps</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {new Date(maxWeightPR.achieved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}

            {/* Chart */}
            {chartData.length > 1 ? (
              <div className="bg-card rounded-2xl p-4">
                <p className="text-xs text-muted uppercase tracking-wider mb-3">Weight Over Time</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted text-sm">Need more sessions to show a chart.</p>
            )}

            {/* All PRs */}
            {prs.length > 0 && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-3">All Records</p>
                <div className="space-y-2">
                  {prs.map((pr, i) => (
                    <div key={i} className="bg-card rounded-xl px-4 py-3 flex justify-between">
                      <span className="text-sm capitalize">{pr.record_type.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium">
                        {pr.value} {pr.record_type === 'max_weight' ? 'lbs' : ''}
                        {pr.secondary_value ? ` × ${pr.secondary_value}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
