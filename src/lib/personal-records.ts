import { SupabaseClient } from '@supabase/supabase-js';

export interface PRCheck {
  isNewPR: boolean;
  recordType: string;
  previousValue: number | null;
  newValue: number;
}

export async function checkAndUpdatePR(
  supabase: SupabaseClient,
  exerciseId: string,
  sessionId: string,
  weight: number,
  reps: number
): Promise<PRCheck | null> {
  if (!weight || weight <= 0) return null;

  // Check max weight PR
  const { data: currentPR } = await supabase
    .from('personal_records')
    .select('id, value')
    .eq('exercise_id', exerciseId)
    .eq('record_type', 'max_weight')
    .single();

  if (!currentPR || weight > currentPR.value) {
    if (currentPR) {
      await supabase
        .from('personal_records')
        .update({
          value: weight,
          secondary_value: reps,
          achieved_at: new Date().toISOString(),
          session_id: sessionId,
        })
        .eq('id', currentPR.id);
    } else {
      await supabase.from('personal_records').insert({
        exercise_id: exerciseId,
        record_type: 'max_weight',
        value: weight,
        secondary_value: reps,
        session_id: sessionId,
      });
    }

    return {
      isNewPR: true,
      recordType: 'max_weight',
      previousValue: currentPR?.value ?? null,
      newValue: weight,
    };
  }

  return null;
}

export async function getExercisePRs(supabase: SupabaseClient, exerciseId: string) {
  const { data, error } = await supabase
    .from('personal_records')
    .select('record_type, value, secondary_value, achieved_at')
    .eq('exercise_id', exerciseId);

  if (error) return [];
  return data ?? [];
}
