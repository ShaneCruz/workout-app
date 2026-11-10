import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerClient();

  const { data: logs } = await supabase
    .from('exercise_logs')
    .select(`
      set_number, reps, weight, duration_seconds, speed, incline, resistance,
      distance, side, rpe, notes, logged_at,
      exercises ( name, exercise_type ),
      workout_sessions ( started_at, workout_plans ( name ) )
    `)
    .order('logged_at', { ascending: true });

  if (!logs || logs.length === 0) {
    return new NextResponse('No data', { status: 404 });
  }

  const headers = [
    'Date', 'Workout', 'Exercise', 'Type', 'Set', 'Reps', 'Weight (lbs)',
    'Duration (s)', 'Speed', 'Incline', 'Resistance', 'Distance', 'Side', 'RPE', 'Notes',
  ];

  const rows = logs.map((log: Record<string, unknown>) => {
    const exercise = log.exercises as Record<string, unknown> | null;
    const session = log.workout_sessions as Record<string, unknown> | null;
    const plan = session?.workout_plans as Record<string, unknown> | null;
    return [
      log.logged_at,
      plan?.name ?? '',
      exercise?.name ?? '',
      exercise?.exercise_type ?? '',
      log.set_number,
      log.reps ?? '',
      log.weight ?? '',
      log.duration_seconds ?? '',
      log.speed ?? '',
      log.incline ?? '',
      log.resistance ?? '',
      log.distance ?? '',
      log.side ?? '',
      log.rpe ?? '',
      log.notes ?? '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="workout-history-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
