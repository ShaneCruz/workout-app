-- Workout Tracker Schema

-- Workout plan templates (one per day of week)
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  description TEXT,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_plans_day ON workout_plans(day_of_week);

-- Groups within a plan
CREATE TABLE exercise_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN (
    'warmup', 'superset', 'triset', 'standalone', 'finisher',
    'circuit', 'interval', 'cardio'
  )),
  sort_order INTEGER NOT NULL,
  rest_seconds INTEGER DEFAULT 60,
  rest_seconds_max INTEGER,
  rounds INTEGER DEFAULT 1,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  -- Interval-specific
  work_seconds INTEGER,
  rest_interval_seconds INTEGER,
  notes TEXT
);

CREATE INDEX idx_groups_plan ON exercise_groups(plan_id, sort_order);

-- Individual exercises within a group
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES exercise_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercise_type TEXT NOT NULL DEFAULT 'strength' CHECK (
    exercise_type IN ('strength', 'cardio', 'warmup', 'stretch', 'core')
  ),
  rep_min INTEGER,
  rep_max INTEGER,
  sort_order INTEGER NOT NULL,
  video_url TEXT,
  per_side BOOLEAN NOT NULL DEFAULT false,
  -- Timed exercise target
  duration_seconds INTEGER,
  duration_minutes INTEGER,
  -- Cardio targets
  speed_min NUMERIC(4,1),
  speed_max NUMERIC(4,1),
  incline_min NUMERIC(4,1),
  incline_max NUMERIC(4,1),
  resistance_min NUMERIC(4,1),
  resistance_max NUMERIC(4,1),
  -- Grouping
  option_group TEXT,
  swap_group TEXT,
  notes TEXT
);

CREATE INDEX idx_exercises_group ON exercises(group_id, sort_order);

-- Actual workout sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES workout_plans(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_volume NUMERIC(10,1),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT
);

CREATE INDEX idx_sessions_date ON workout_sessions(started_at DESC);

-- Individual set/exercise logs within a session
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC(6,1),
  duration_seconds INTEGER,
  speed NUMERIC(4,1),
  incline NUMERIC(4,1),
  resistance NUMERIC(4,1),
  distance NUMERIC(6,2),
  side TEXT CHECK (side IN ('left', 'right')),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_logs_session ON exercise_logs(session_id);
CREATE INDEX idx_logs_exercise ON exercise_logs(exercise_id, logged_at DESC);
CREATE INDEX idx_logs_exercise_recent ON exercise_logs(exercise_id, logged_at DESC)
  WHERE weight IS NOT NULL;

-- Personal records
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('max_weight', 'max_reps_at_weight', 'max_session_volume')),
  value NUMERIC(10,1) NOT NULL,
  secondary_value NUMERIC(10,1),
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_prs_exercise ON personal_records(exercise_id, record_type);

-- User preferences (key-value store)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
