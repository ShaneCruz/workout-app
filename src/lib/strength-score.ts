import { SupabaseClient } from '@supabase/supabase-js';

export async function getWeeklyVolume(supabase: SupabaseClient, weekStart: Date, weekEnd: Date) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('total_volume, started_at')
    .gte('started_at', weekStart.toISOString())
    .lte('started_at', weekEnd.toISOString())
    .not('completed_at', 'is', null);

  if (error) return 0;
  return (data ?? []).reduce((sum, s) => sum + (s.total_volume ?? 0), 0);
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getStreak(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('started_at')
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(60);

  if (error || !data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDates = new Set(
    data.map(s => {
      const d = new Date(s.started_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  for (let i = 0; i <= 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

    // Skip today if no workout yet
    if (i === 0 && !workoutDates.has(key)) continue;

    if (workoutDates.has(key)) {
      streak++;
    } else {
      // Allow Sunday rest days in streak
      if (checkDate.getDay() === 0) continue;
      break;
    }
  }

  return streak;
}
