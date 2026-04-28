# IronMind — AI Fitness Coach

A full-stack fitness tracking app with AI-powered coaching, persistent cloud storage, and multi-user auth.

Live: https://ironmindai.netlify.app

---

## Features

### Workout Tracking

- Log exercises with weight, sets, reps, and date
- Supports bodyweight exercises (pull-ups, dips, etc.)
- Edit and delete entries inline
- Duplicate prevention per session

### Body Weight Tracking

- Log daily weigh-ins with inline edit/delete
- Trends visible in progress charts and AI context

### Progress Visualization

- Interactive charts showing weight and volume trends per exercise
- Stats bar: total volume, max weight, active training days

### Personal Records

- Tracks all-time PR per exercise
- Estimated 1RM using the Epley formula
- Highlights PRs set in the last 7 days

### AI Coaching (Gemini 2.5 Flash)

- Generates 3–5 personalized insights from workout and body weight history
- Conversational chat with full context awareness
- Fallback to rule-based insights if AI is unavailable

### Auth & Data

- Email/password sign-up via Supabase Auth
- Postgres database with Row Level Security (users only access their own data)
- Guest/demo mode — loads on first visit with pre-seeded realistic data, no sign-up required

---

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Recharts, Radix UI, Supabase JS client

**Backend** — Node.js, Express, Google Gemini API, rate limiting, shared-secret API auth

**Database** — Supabase (Postgres + Auth + RLS)

---

## Local Development

### Prerequisites

- Node.js 20+
- Supabase project with `workout_entries` and `body_weights` tables
- Google Gemini API key

### Frontend

```bash
npm install
# create .env.local with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL, VITE_API_SECRET
npm run dev
```

### Backend

```bash
cd server
npm install
# create .env with GEMINI_API_KEY, API_SECRET, ALLOWED_ORIGIN, PORT
npm run dev
```

### Database schema

```sql
create table workout_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date text not null,
  exercise text not null,
  weight numeric not null default 0,
  reps integer not null,
  sets integer not null
);

create table body_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date text not null,
  weight numeric not null,
  unique (user_id, date)
);

alter table workout_entries enable row level security;
alter table body_weights enable row level security;

create policy "users own their workouts" on workout_entries
  for all using (auth.uid() = user_id);

create policy "users own their body weights" on body_weights
  for all using (auth.uid() = user_id);
```
