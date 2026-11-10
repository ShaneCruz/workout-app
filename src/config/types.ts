export type ExerciseType = 'strength' | 'cardio' | 'warmup' | 'stretch' | 'core';
export type GroupType = 'warmup' | 'superset' | 'triset' | 'standalone' | 'finisher' | 'circuit' | 'interval' | 'cardio';

export interface ExerciseConfig {
  name: string;
  exerciseType: ExerciseType;
  repMin?: number;
  repMax?: number;
  videoUrl?: string;
  perSide?: boolean;
  durationSeconds?: number;
  durationMinutes?: number;
  speedMin?: number;
  speedMax?: number;
  inclineMin?: number;
  inclineMax?: number;
  resistanceMin?: number;
  resistanceMax?: number;
  optionGroup?: string;
  swapGroup?: string;
  notes?: string;
}

export interface ExerciseGroupConfig {
  name: string;
  groupType: GroupType;
  restSeconds: number;
  restSecondsMax?: number;
  rounds: number;
  isOptional?: boolean;
  workSeconds?: number;
  restIntervalSeconds?: number;
  exercises: ExerciseConfig[];
  notes?: string;
}

export interface WorkoutPlanConfig {
  name: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday ... 6=Saturday
  description?: string;
  isRestDay?: boolean;
  groups: ExerciseGroupConfig[];
}
