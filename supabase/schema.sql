-- FitTrack v1 schema
-- Run this in your Supabase project's SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to run once on a fresh project.

-- ─────────────────────────────────────────────
-- Workouts
-- ─────────────────────────────────────────────
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Workout',
  notes text,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_name text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_index int not null default 0,
  reps int,
  weight numeric,
  weight_unit text not null default 'lb',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Nutrition
-- ─────────────────────────────────────────────
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_performed_at_idx on public.workouts(performed_at desc);
create index if not exists workout_exercises_workout_id_idx on public.workout_exercises(workout_id);
create index if not exists workout_sets_workout_exercise_id_idx on public.workout_sets(workout_exercise_id);
create index if not exists food_entries_user_id_idx on public.food_entries(user_id);
create index if not exists food_entries_logged_at_idx on public.food_entries(logged_at desc);

-- ─────────────────────────────────────────────
-- Row Level Security — every user can only ever see/write their own data
-- ─────────────────────────────────────────────
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.food_entries enable row level security;

create policy "Users manage their own workouts"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage exercises on their own workouts"
  on public.workout_exercises for all
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = auth.uid()
  ));

create policy "Users manage sets on their own exercises"
  on public.workout_sets for all
  using (exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_sets.workout_exercise_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id
    where we.id = workout_sets.workout_exercise_id and w.user_id = auth.uid()
  ));

create policy "Users manage their own food entries"
  on public.food_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
