import { SupabaseClient } from '@supabase/supabase-js';
import { WORKOUT_PLANS } from '@/config/workout-plans';

export async function seedDatabase(supabase: SupabaseClient) {
  // Clear existing plan data (cascade deletes groups and exercises)
  await supabase.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('exercise_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('workout_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const plan of WORKOUT_PLANS) {
    const { data: planRow, error: planErr } = await supabase
      .from('workout_plans')
      .insert({
        name: plan.name,
        day_of_week: plan.dayOfWeek,
        description: plan.description,
        is_rest_day: plan.isRestDay ?? false,
      })
      .select('id')
      .single();

    if (planErr || !planRow) {
      console.error('Failed to insert plan:', plan.name, planErr);
      continue;
    }

    for (let gi = 0; gi < plan.groups.length; gi++) {
      const group = plan.groups[gi];
      const { data: groupRow, error: groupErr } = await supabase
        .from('exercise_groups')
        .insert({
          plan_id: planRow.id,
          name: group.name,
          group_type: group.groupType,
          sort_order: gi,
          rest_seconds: group.restSeconds,
          rest_seconds_max: group.restSecondsMax,
          rounds: group.rounds,
          is_optional: group.isOptional ?? false,
          work_seconds: group.workSeconds,
          rest_interval_seconds: group.restIntervalSeconds,
          notes: group.notes,
        })
        .select('id')
        .single();

      if (groupErr || !groupRow) {
        console.error('Failed to insert group:', group.name, groupErr);
        continue;
      }

      const exerciseRows = group.exercises.map((ex, ei) => ({
        group_id: groupRow.id,
        name: ex.name,
        exercise_type: ex.exerciseType,
        rep_min: ex.repMin,
        rep_max: ex.repMax,
        sort_order: ei,
        video_url: ex.videoUrl,
        per_side: ex.perSide ?? false,
        duration_seconds: ex.durationSeconds,
        duration_minutes: ex.durationMinutes,
        speed_min: ex.speedMin,
        speed_max: ex.speedMax,
        incline_min: ex.inclineMin,
        incline_max: ex.inclineMax,
        resistance_min: ex.resistanceMin,
        resistance_max: ex.resistanceMax,
        option_group: ex.optionGroup,
        swap_group: ex.swapGroup,
        notes: ex.notes,
      }));

      const { error: exErr } = await supabase.from('exercises').insert(exerciseRows);
      if (exErr) {
        console.error('Failed to insert exercises for group:', group.name, exErr);
      }
    }
  }

  return { success: true };
}
