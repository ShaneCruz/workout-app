import { SupabaseClient } from '@supabase/supabase-js';

interface ProgressionSuggestion {
  shouldIncrease: boolean;
  suggestedWeight: number | null;
  message: string | null;
  isStalled: boolean;
  stallWeeks: number;
}

export async function getProgressionSuggestion(
  supabase: SupabaseClient,
  exerciseId: string,
  repMax: number,
  currentSessionId: string
): Promise<ProgressionSuggestion> {
  // Get last 3 sessions' logs for this exercise
  const { data: logs } = await supabase
    .from('exercise_logs')
    .select(`
      set_number, reps, weight, session_id,
      workout_sessions!inner ( started_at, completed_at )
    `)
    .eq('exercise_id', exerciseId)
    .neq('session_id', currentSessionId)
    .not('weight', 'is', null)
    .not('workout_sessions.completed_at', 'is', null)
    .order('logged_at', { ascending: false })
    .limit(30);

  if (!logs || logs.length === 0) {
    return { shouldIncrease: false, suggestedWeight: null, message: null, isStalled: false, stallWeeks: 0 };
  }

  // Group by session
  const sessions = new Map<string, { reps: number; weight: number }[]>();
  for (const log of logs) {
    const existing = sessions.get(log.session_id) ?? [];
    existing.push({ reps: log.reps!, weight: log.weight! });
    sessions.set(log.session_id, existing);
  }

  const sessionEntries = [...sessions.entries()];
  if (sessionEntries.length === 0) {
    return { shouldIncrease: false, suggestedWeight: null, message: null, isStalled: false, stallWeeks: 0 };
  }

  // Check most recent session: did all sets hit repMax?
  const [, lastSets] = sessionEntries[0];
  const lastWeight = lastSets[0]?.weight ?? 0;
  const allHitMax = lastSets.every(s => s.reps >= repMax);

  // Check for stalling (same weight for 3+ sessions, not hitting repMax)
  let stallWeeks = 0;
  for (const [, sets] of sessionEntries) {
    const sameWeight = sets.every(s => Math.abs(s.weight - lastWeight) < 0.1);
    const hitMax = sets.every(s => s.reps >= repMax);
    if (sameWeight && !hitMax) {
      stallWeeks++;
    } else {
      break;
    }
  }

  if (allHitMax) {
    const increase = lastWeight >= 50 ? 5 : 2.5;
    const suggestedWeight = lastWeight + increase;
    return {
      shouldIncrease: true,
      suggestedWeight,
      message: `You hit ${repMax} reps on all sets at ${lastWeight} lbs. Try ${suggestedWeight} lbs today!`,
      isStalled: false,
      stallWeeks: 0,
    };
  }

  if (stallWeeks >= 3) {
    const deloadWeight = Math.round(lastWeight * 0.8 / 2.5) * 2.5;
    return {
      shouldIncrease: false,
      suggestedWeight: deloadWeight,
      message: `You've been at ${lastWeight} lbs for ${stallWeeks} sessions without hitting your rep target. Consider a deload to ${deloadWeight} lbs this week.`,
      isStalled: true,
      stallWeeks,
    };
  }

  return { shouldIncrease: false, suggestedWeight: null, message: null, isStalled: false, stallWeeks };
}
