import { SupabaseClient } from '@supabase/supabase-js';

export interface ExerciseRow {
  id: string;
  name: string;
  exercise_type: string;
  rep_min: number | null;
  rep_max: number | null;
  sort_order: number;
  video_url: string | null;
  per_side: boolean;
  duration_seconds: number | null;
  duration_minutes: number | null;
  speed_min: number | null;
  speed_max: number | null;
  incline_min: number | null;
  incline_max: number | null;
  resistance_min: number | null;
  resistance_max: number | null;
  option_group: string | null;
  swap_group: string | null;
  notes: string | null;
}

export interface ExerciseGroupRow {
  id: string;
  name: string;
  group_type: string;
  sort_order: number;
  rest_seconds: number;
  rest_seconds_max: number | null;
  rounds: number;
  is_optional: boolean;
  work_seconds: number | null;
  rest_interval_seconds: number | null;
  notes: string | null;
  exercises: ExerciseRow[];
}

export interface WorkoutPlanRow {
  id: string;
  name: string;
  day_of_week: number;
  description: string | null;
  is_rest_day: boolean;
  exercise_groups: ExerciseGroupRow[];
}

export async function getPlanByDay(supabase: SupabaseClient, dayOfWeek: number): Promise<WorkoutPlanRow | null> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select(`
      id, name, day_of_week, description, is_rest_day,
      exercise_groups (
        id, name, group_type, sort_order, rest_seconds, rest_seconds_max,
        rounds, is_optional, work_seconds, rest_interval_seconds, notes,
        exercises (
          id, name, exercise_type, rep_min, rep_max, sort_order, video_url,
          per_side, duration_seconds, duration_minutes,
          speed_min, speed_max, incline_min, incline_max,
          resistance_min, resistance_max, option_group, swap_group, notes
        )
      )
    `)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (error || !data) return null;

  // Sort groups and exercises by sort_order
  const plan = data as WorkoutPlanRow;
  plan.exercise_groups.sort((a, b) => a.sort_order - b.sort_order);
  for (const group of plan.exercise_groups) {
    group.exercises.sort((a, b) => a.sort_order - b.sort_order);
  }

  return plan;
}
