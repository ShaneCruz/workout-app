import { WorkoutPlanConfig } from './types';

export const WORKOUT_PLANS: WorkoutPlanConfig[] = [
  // ─── MONDAY: Upper Body (60 min) ───
  {
    name: 'Monday – Upper Body',
    dayOfWeek: 1,
    description: 'Push/pull supersets + tri-set + cardio finisher (60 min)',
    groups: [
      {
        name: 'Warm-Up',
        groupType: 'warmup',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          { name: 'Elliptical', exerciseType: 'cardio', durationMinutes: 2, resistanceMin: 3, resistanceMax: 5, notes: 'Easy pace' },
          { name: 'Push-ups', exerciseType: 'warmup', repMin: 10, repMax: 10 },
          { name: 'Light Cable Row', exerciseType: 'warmup', repMin: 12, repMax: 12 },
          { name: 'Arm Circles', exerciseType: 'warmup', repMin: 10, repMax: 10 },
        ],
      },
      {
        name: 'Primary Superset',
        groupType: 'superset',
        restSeconds: 60,
        restSecondsMax: 75,
        rounds: 4,
        exercises: [
          { name: 'DB Bench Press', exerciseType: 'strength', repMin: 6, repMax: 8, swapGroup: 'chest_press' },
          { name: 'Chest-Supported DB Row', exerciseType: 'strength', repMin: 8, repMax: 10, swapGroup: 'horizontal_row' },
        ],
      },
      {
        name: 'Secondary Superset',
        groupType: 'superset',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'DB Incline Press', exerciseType: 'strength', repMin: 8, repMax: 10, swapGroup: 'incline_press' },
          { name: 'Lat Pulldown', exerciseType: 'strength', repMin: 10, repMax: 12, swapGroup: 'vertical_pull' },
        ],
      },
      {
        name: 'Tri-Set',
        groupType: 'triset',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Cable Face Pull', exerciseType: 'strength', repMin: 12, repMax: 15, swapGroup: 'rear_delt' },
          { name: 'Triceps Pressdown', exerciseType: 'strength', repMin: 12, repMax: 15, swapGroup: 'triceps' },
          { name: 'DB Hammer Curl', exerciseType: 'strength', repMin: 10, repMax: 12, swapGroup: 'biceps' },
        ],
      },
      {
        name: 'Finisher',
        groupType: 'finisher',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          {
            name: 'Treadmill Incline Walk',
            exerciseType: 'cardio',
            durationMinutes: 9,
            speedMin: 3.2,
            speedMax: 3.5,
            inclineMin: 8,
            inclineMax: 12,
            notes: 'Brisk but able to talk in short sentences',
          },
        ],
      },
    ],
  },

  // ─── TUESDAY: Lower Body + Cardio ───
  {
    name: 'Tuesday – Lower Body + Cardio',
    dayOfWeek: 2,
    description: 'Lower body strength + Zone 2 cardio',
    groups: [
      {
        name: 'Warm-Up',
        groupType: 'warmup',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          { name: 'Treadmill Walk', exerciseType: 'cardio', durationMinutes: 2, speedMin: 2.5, speedMax: 3.0, inclineMin: 0, inclineMax: 3 },
          { name: 'Bodyweight Squats', exerciseType: 'warmup', repMin: 10, repMax: 10 },
          { name: 'Glute Bridges', exerciseType: 'warmup', repMin: 10, repMax: 10 },
        ],
      },
      {
        name: 'Goblet Squat',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 4,
        exercises: [
          { name: 'Goblet Squat', exerciseType: 'strength', repMin: 8, repMax: 8, swapGroup: 'squat' },
        ],
      },
      {
        name: 'DB RDL',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 4,
        exercises: [
          { name: 'DB RDL', exerciseType: 'strength', repMin: 8, repMax: 10, swapGroup: 'hip_hinge' },
        ],
      },
      {
        name: 'Bulgarian Split Squat',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Bulgarian Split Squat', exerciseType: 'strength', repMin: 8, repMax: 8, perSide: true, swapGroup: 'single_leg' },
        ],
      },
      {
        name: 'Calf Raises',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Calf Raises', exerciseType: 'strength', repMin: 15, repMax: 15, swapGroup: 'calves' },
        ],
      },
      {
        name: 'Cardio (Zone 2)',
        groupType: 'cardio',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          {
            name: 'Elliptical',
            exerciseType: 'cardio',
            durationMinutes: 27,
            resistanceMin: 5,
            resistanceMax: 8,
            notes: 'Zone 2: steady, slightly challenging. Can talk but not comfortably hold long conversation.',
          },
        ],
      },
    ],
  },

  // ─── WEDNESDAY: Cardio + Core ───
  {
    name: 'Wednesday – Cardio + Core',
    dayOfWeek: 3,
    description: 'Cardio (run or walk) + core work',
    groups: [
      {
        name: 'Cardio',
        groupType: 'cardio',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          {
            name: 'Run 2–3 miles',
            exerciseType: 'cardio',
            durationMinutes: 25,
            optionGroup: 'wed_cardio',
            notes: 'Easy pace — you can talk',
          },
          {
            name: 'Incline Walk',
            exerciseType: 'cardio',
            durationMinutes: 35,
            speedMin: 3.2,
            speedMax: 3.6,
            inclineMin: 5,
            inclineMax: 10,
            optionGroup: 'wed_cardio',
          },
        ],
      },
      {
        name: 'Core',
        groupType: 'circuit',
        restSeconds: 45,
        rounds: 1,
        notes: 'Perform each exercise for the prescribed sets before moving on',
        exercises: [
          { name: 'Pallof Press', exerciseType: 'core', repMin: 12, repMax: 12, perSide: true },
          { name: 'Dead Bug', exerciseType: 'core', repMin: 8, repMax: 8, perSide: true },
          { name: 'Side Plank', exerciseType: 'core', durationSeconds: 30, perSide: true },
        ],
      },
    ],
  },

  // ─── THURSDAY: Upper Volume ───
  {
    name: 'Thursday – Upper Volume',
    dayOfWeek: 4,
    description: 'High-volume upper body + optional cardio',
    groups: [
      {
        name: 'Warm-Up',
        groupType: 'warmup',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          { name: 'Elliptical', exerciseType: 'cardio', durationMinutes: 3, resistanceMin: 3, resistanceMax: 5 },
          { name: 'Light Face Pulls', exerciseType: 'warmup', repMin: 15, repMax: 15 },
        ],
      },
      {
        name: 'DB Shoulder Press',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 4,
        exercises: [
          { name: 'DB Shoulder Press', exerciseType: 'strength', repMin: 8, repMax: 8, swapGroup: 'shoulder_press' },
        ],
      },
      {
        name: '1-Arm Cable Row',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 4,
        exercises: [
          { name: '1-Arm Cable Row', exerciseType: 'strength', repMin: 10, repMax: 10, perSide: true, swapGroup: 'horizontal_row' },
        ],
      },
      {
        name: 'Cable Fly',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Cable Fly', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'chest_fly' },
        ],
      },
      {
        name: 'Landmine Press',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Landmine Press', exerciseType: 'strength', repMin: 10, repMax: 10, swapGroup: 'shoulder_press' },
        ],
      },
      {
        name: 'Lateral Raises',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Lateral Raises', exerciseType: 'strength', repMin: 15, repMax: 15, swapGroup: 'lateral_delt' },
        ],
      },
      {
        name: 'Curls + Triceps',
        groupType: 'superset',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Curls', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'biceps' },
          { name: 'Triceps', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'triceps' },
        ],
      },
      {
        name: 'Optional Cardio',
        groupType: 'cardio',
        restSeconds: 0,
        rounds: 1,
        isOptional: true,
        exercises: [
          {
            name: 'Elliptical Easy Recovery',
            exerciseType: 'cardio',
            durationMinutes: 9,
            resistanceMin: 3,
            resistanceMax: 5,
            notes: 'Low intensity recovery',
          },
        ],
      },
    ],
  },

  // ─── FRIDAY: Lower + Intervals ───
  {
    name: 'Friday – Lower + Intervals',
    dayOfWeek: 5,
    description: 'Lower body strength + elliptical intervals',
    groups: [
      {
        name: 'Warm-Up',
        groupType: 'warmup',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          { name: 'Treadmill Walk', exerciseType: 'cardio', durationMinutes: 3, speedMin: 2.5, speedMax: 3.0 },
        ],
      },
      {
        name: 'Landmine Squat',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 4,
        exercises: [
          { name: 'Landmine Squat', exerciseType: 'strength', repMin: 10, repMax: 10, swapGroup: 'squat' },
        ],
      },
      {
        name: 'Step-Ups',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Step-Ups', exerciseType: 'strength', repMin: 10, repMax: 10, perSide: true, swapGroup: 'single_leg' },
        ],
      },
      {
        name: 'Hip Thrust',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Hip Thrust', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'glutes' },
        ],
      },
      {
        name: 'Hamstring Curl',
        groupType: 'standalone',
        restSeconds: 60,
        rounds: 3,
        exercises: [
          { name: 'Hamstring Curl', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'hamstrings' },
        ],
      },
      {
        name: 'Intervals (Elliptical)',
        groupType: 'interval',
        restSeconds: 0,
        rounds: 10,
        workSeconds: 30,
        restIntervalSeconds: 60,
        notes: 'Hard = breathing heavy, cannot talk. Easy = recovery pace.',
        exercises: [
          {
            name: 'Elliptical Intervals',
            exerciseType: 'cardio',
            resistanceMin: 3,
            resistanceMax: 5,
            notes: 'Hard: resistance 8–12 | Easy: resistance 3–5',
          },
        ],
      },
    ],
  },

  // ─── SATURDAY: Cardio + Circuit ───
  {
    name: 'Saturday – Cardio + Circuit',
    dayOfWeek: 6,
    description: 'Cardio (run or walk) + full-body circuit',
    groups: [
      {
        name: 'Cardio',
        groupType: 'cardio',
        restSeconds: 0,
        rounds: 1,
        exercises: [
          {
            name: 'Run 3 miles',
            exerciseType: 'cardio',
            durationMinutes: 30,
            optionGroup: 'sat_cardio',
            notes: 'Easy pace',
          },
          {
            name: 'Brisk Walk',
            exerciseType: 'cardio',
            durationMinutes: 50,
            speedMin: 3.2,
            speedMax: 3.8,
            optionGroup: 'sat_cardio',
            notes: '45–60 min brisk walk',
          },
        ],
      },
      {
        name: 'Circuit',
        groupType: 'circuit',
        restSeconds: 15,
        rounds: 3,
        notes: 'Minimal rest between exercises',
        exercises: [
          { name: 'Push-ups', exerciseType: 'strength', repMin: 15, repMax: 20 },
          { name: 'Cable Row', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'horizontal_row' },
          { name: 'Lateral Raise', exerciseType: 'strength', repMin: 15, repMax: 15, swapGroup: 'lateral_delt' },
          { name: 'DB Curl', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'biceps' },
          { name: 'Triceps', exerciseType: 'strength', repMin: 12, repMax: 12, swapGroup: 'triceps' },
        ],
      },
    ],
  },

  // ─── SUNDAY: Rest / Recovery ───
  {
    name: 'Sunday – Rest / Recovery',
    dayOfWeek: 0,
    description: 'Rest day with optional light activity',
    isRestDay: true,
    groups: [
      {
        name: 'Recovery (Optional)',
        groupType: 'cardio',
        restSeconds: 0,
        rounds: 1,
        isOptional: true,
        exercises: [
          { name: 'Light Walk', exerciseType: 'cardio', durationMinutes: 25, notes: '20–30 min easy walk' },
        ],
      },
      {
        name: 'Stretching / Mobility',
        groupType: 'standalone',
        restSeconds: 0,
        rounds: 1,
        isOptional: true,
        exercises: [
          { name: 'Stretching & Mobility', exerciseType: 'stretch', durationMinutes: 10, notes: 'Full body stretching and mobility work' },
        ],
      },
    ],
  },
];
