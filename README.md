# Workout Tracker

A personal workout tracker built for the gym floor, used mainly on an iPad (it can also be installed to the home screen). It walks you through the day's planned workout one set at a time: it logs reps, weight, cardio settings and RPE, runs the rest timer, suggests when to add weight, and records personal records.

This is a single-user app protected by a PIN. It has no accounts.

## Features

- **Weekly program.** Each day of the week has its own plan (Mon upper, Tue lower + cardio, Wed cardio + core, Thu upper volume, Fri lower + intervals, Sat cardio + circuit, Sun rest/recovery). Plans are defined in code and seeded into the database.
- **Guided workout flow.** It steps through warm-ups, supersets, tri-sets, circuits, intervals, finishers and cardio blocks, round by round, and handles per-side (left/right) exercises.
- **Logging.** Records reps and weight for strength work; time, speed, incline, resistance and distance for cardio; plus RPE per set and per session. Voice notes use the browser's speech recognition.
- **Rest timer** with an audio beep and vibration.
- **Exercise swaps.** Any exercise can be swapped for an equivalent, such as DB Bench → Machine Chest Press. Some plans also offer "pick one" option groups.
- **Progressive overload hints.** If every set hit the top of the rep range last session, it suggests adding weight (+5 lb at 50 lb or more, +2.5 lb below that). If the weight stays the same for 3 or more sessions without hitting the rep target, it suggests a deload to about 80%.
- **Warm-up set calculator** for barbell lifts: the empty bar, then about 50%, 70% and 85% of the working weight.
- **Personal records.** Detects a new max-weight PR when you log a set and celebrates it.
- **History and progress.** A list of past sessions with details, per-exercise charts (Recharts), weekly volume and workout streak.
- **CSV export** of every logged set at `/api/export`.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- Tailwind CSS 4 and Framer Motion
- [Supabase](https://supabase.com) (Postgres), accessed only from the server's API routes
- bcryptjs for the PIN login

## Setup

### 1. Install

```bash
npm install
```

### 2. Create the database

1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/migrations/001_initial_schema.sql`.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep this secret; the server uses it for all queries) |
| `APP_PIN_HASH` | A bcrypt hash of your PIN; see below |

To generate the PIN hash (replace `1234` with your PIN):

```bash
node -e "require('bcryptjs').hash('1234', 10).then(console.log)"
```

The hash contains `$` characters. If a value doesn't load as expected, wrap it in single quotes in `.env.local`.

### 4. Run it and seed the workout plans

```bash
npm run dev
```

Open http://localhost:3000 and log in with your PIN. Then load the plans from `src/config/workout-plans.ts` into the database. While logged in, run this in the browser's dev tools console:

```js
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

> **Warning:** seeding deletes all plans, groups and exercises and creates them again with new IDs. Once you've logged workouts, it fails, because logged sets still reference the old exercise rows. Change plans after that point by editing rows in Supabase, or by adding an update path to the seeding code. See `CLAUDE.md`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server on port 3000 |
| `npm run build` | Builds for production |
| `npm start` | Runs the production build |
| `npm run lint` | Runs ESLint |

To try it on an iPad over your local network, run `npm run dev -- -H 0.0.0.0` and open `http://<your-PC's-IP>:3000`. On WSL you may need to forward the port from Windows.

## Deploying

The app is a standard Next.js app, so it deploys to Vercel or anywhere else that runs Node. Set the four environment variables on the host. The login cookie is marked `secure` in production, so the app needs to be served over HTTPS.

## Known gaps

- `public/manifest.json` points to `icon-192.png` and `icon-512.png`, which don't exist yet.
- The login cookie's value is just `authenticated`, so anyone who knows that can fake a login. It's fine for a private, single-user app, but use a signed or random session token before exposing it more widely.
- `/api/seed` can be called by anyone who is logged in, and it wipes the plan tables.
- There are no automated tests.

## Project docs

- `CLAUDE.md` / `AGENTS.md`: the code layout and conventions, written for AI coding assistants (and useful for humans too).
- `supabase/migrations/`: the database schema.
