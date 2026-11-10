@AGENTS.md

# Workout Tracker: guide for Claude

A personal, single-user workout tracker (Next.js 16 App Router + Supabase). It's used mostly on an iPad at the gym, so design for touch first: big tap targets and a portrait layout. See `README.md` for features and setup.

## How it fits together

- **All database access goes through API routes** in `src/app/api/*`, using the service-role client from `src/lib/supabase/server.ts`. Pages and components are client components that `fetch()` those routes. The anon/browser client in `src/lib/supabase/client.ts` is currently unused. Don't call Supabase from client code.
- **Auth:** `src/proxy.ts` (Next 16's replacement for `middleware.ts`) sends every request without the `workout_pin=authenticated` cookie to `/login`. `/api/auth` checks the PIN against `APP_PIN_HASH` (bcrypt) and sets the cookie for 30 days. Supabase has no row-level security; the PIN is the only gate.
- **Plans live in code, then get seeded:** `src/config/workout-plans.ts` (types in `src/config/types.ts`) defines one plan per weekday (`dayOfWeek` 0 = Sunday). `POST /api/seed` → `src/lib/db/seed.ts` copies it into `workout_plans` → `exercise_groups` → `exercises`.
- **Exercise swaps:** `src/config/exercise-swaps.ts` maps a `swapGroup` key to the exercises that can replace each other. `optionGroup` on exercises within a group means "pick one of these" (`OptionPicker`).

## Database (`supabase/migrations/001_initial_schema.sql`)

The plan side is `workout_plans` (unique per `day_of_week`) → `exercise_groups` (`group_type`: warmup / superset / triset / standalone / finisher / circuit / interval / cardio; `rounds`, rest times, interval work/rest) → `exercises` (rep range, `per_side`, duration, cardio speed/incline/resistance ranges, `swap_group`, `option_group`).

The logging side is `workout_sessions` (`completed_at`, `total_volume`, `rpe`) → `exercise_logs` (one row per set; and per side for per-side exercises). Also `personal_records` (currently only `max_weight` is written) and `user_preferences` (key/value, not used yet).

New schema changes go in a new numbered file under `supabase/migrations/`. Never edit `001`. Migrations are run by hand in the Supabase SQL editor; there's no migration tooling.

**Reseeding warning:** `seedDatabase` deletes every plan, group and exercise and inserts them again with new UUIDs. `exercise_logs.exercise_id` references `exercises` with no `ON DELETE`, so reseeding fails once any sets are logged. If you're changing plans after real data exists, write an update-in-place path that matches on plan, group and exercise name, or write a migration. Don't just re-run the seed.

## Main files

| Area | Files |
|---|---|
| Workout runner | `src/app/workout/[sessionId]/page.tsx` → `components/workout/WorkoutFlow.tsx`, state machine in `hooks/useWorkoutFlow.ts` (position = group / round / exercise / side / set) |
| Per-exercise UI | `ExerciseCard`, `IntervalCard`, `RestTimer` + `hooks/useRestTimer.ts`, `RPESelector`, `NumberStepper`, `ExerciseSwapSheet`, `VoiceNoteButton` (Web Speech API), `PRCelebration`, `WorkoutSummary` |
| Training logic | `lib/progression.ts` (add-weight / deload hints), `lib/personal-records.ts`, `lib/warmup-calculator.ts`, `lib/strength-score.ts` (weekly volume, streak) |
| Data helpers | `lib/db/{plans,sessions,logs,seed}.ts` |
| Pages | `/` dashboard, `/workout` (today's plan → start a session), `/history`, `/history/[sessionId]`, `/progress`, `/login` |
| API | `auth`, `plans?day=`, `sessions` (create; get by `id` or `limit`), `sessions/[id]/complete`, `logs` (POST set; GET by `exerciseId` + `sessionId`), `prs?exerciseId=`, `export` (CSV), `seed` |

## Conventions

- Weights are in **pounds**. Plate math assumes a 45 lb bar and rounds to the nearest 5 lb.
- The `@/` import alias points to `src/`.
- Styling is Tailwind 4 (theme tokens in `src/app/globals.css`) with a dark UI; animation uses Framer Motion; charts use Recharts.
- There are no tests. Check changes with `npm run lint` and `npm run build`, and by running the app (`npm run dev`).

## Environment

The repo is at `~/personal/workout/app` (WSL). The remote is `personal-github:ShaneCruz/workout-app.git`, which uses the personal SSH key; commits use `shane.cruz@gmail.com`. Secrets are in `.env.local` (ignored by git); `.env.local.example` lists the variables.
