import { SupabaseClient } from '@supabase/supabase-js';

export interface LogSetInput {
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps?: number;
  weight?: number;
  duration_seconds?: number;
  speed?: number;
  incline?: number;
  resistance?: number;
  distance?: number;
  side?: 'left' | 'right';
  rpe?: number;
  notes?: string;
}

export async function logSet(supabase: SupabaseClient, input: LogSetInput) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLastSessionLogs(
  supabase: SupabaseClient,
  exerciseId: string,
  currentSessionId: string
) {
  // Find the most recent session that logged this exercise (excluding current)
  const { data: lastLog } = await supabase
    .from('exercise_logs')
    .select('session_id, logged_at')
    .eq('exercise_id', exerciseId)
    .neq('session_id', currentSessionId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastLog) return [];

  const { data: logs, error } = await supabase
    .from('exercise_logs')
    .select('set_number, reps, weight, duration_seconds, speed, incline, resistance, distance, side')
    .eq('session_id', lastLog.session_id)
    .eq('exercise_id', exerciseId)
    .order('set_number', { ascending: true });

  if (error) return [];
  return logs ?? [];
}

export async function getExerciseHistory(
  supabase: SupabaseClient,
  exerciseId: string,
  limit = 50
) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select(`
      set_number, reps, weight, logged_at,
      workout_sessions ( started_at )
    `)
    .eq('exercise_id', exerciseId)
    .not('weight', 'is', null)
    .order('logged_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
