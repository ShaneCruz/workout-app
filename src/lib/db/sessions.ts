import { SupabaseClient } from '@supabase/supabase-js';

export async function createSession(supabase: SupabaseClient, planId: string) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ plan_id: planId })
    .select('id, started_at')
    .single();

  if (error) throw error;
  return data;
}

export async function completeSession(
  supabase: SupabaseClient,
  sessionId: string,
  rpe?: number,
  notes?: string
) {
  // Calculate total volume
  const { data: logs } = await supabase
    .from('exercise_logs')
    .select('reps, weight')
    .eq('session_id', sessionId)
    .not('weight', 'is', null)
    .not('reps', 'is', null);

  const totalVolume = (logs ?? []).reduce(
    (sum, log) => sum + (log.reps ?? 0) * (log.weight ?? 0),
    0
  );

  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: new Date().toISOString(),
      total_volume: totalVolume,
      rpe,
      notes,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentSessions(supabase: SupabaseClient, limit = 10) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id, started_at, completed_at, total_volume, rpe, notes,
      workout_plans ( name )
    `)
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getSessionWithLogs(supabase: SupabaseClient, sessionId: string) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id, started_at, completed_at, total_volume, rpe, notes,
      workout_plans ( id, name ),
      exercise_logs (
        id, exercise_id, set_number, reps, weight,
        duration_seconds, speed, incline, resistance, distance,
        side, rpe, notes, logged_at,
        exercises ( name, exercise_type, rep_min, rep_max )
      )
    `)
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}
