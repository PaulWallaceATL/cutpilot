-- CutPilot Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- ============================================================
-- PROFILES — extends auth.users with app-specific data
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  unit_system text not null default 'imperial' check (unit_system in ('imperial', 'metric')),
  timezone text default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile data linked to auth.users';

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- USER_PREFERENCES — fitness/diet preferences from onboarding
-- ============================================================
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fitness_goal text not null default 'lose_fat' check (fitness_goal in ('lose_fat', 'build_muscle', 'maintain', 'recomp', 'improve_health')),
  experience_level text not null default 'beginner' check (experience_level in ('beginner', 'intermediate', 'advanced')),
  age integer,
  sex text check (sex in ('male', 'female', 'other')),
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  activity_level text default 'moderate' check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  workout_days_per_week integer default 4 check (workout_days_per_week between 1 and 7),
  workout_duration_minutes integer default 60,
  available_equipment text[] default '{}',
  dietary_restrictions text[] default '{}',
  diet_type text default 'flexible' check (diet_type in ('flexible', 'keto', 'paleo', 'vegan', 'vegetarian', 'mediterranean')),
  meals_per_day integer default 3 check (meals_per_day between 2 and 6),
  calorie_target integer,
  protein_target_g integer,
  carb_target_g integer,
  fat_target_g integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

comment on table public.user_preferences is 'Fitness goals, diet preferences, body stats from onboarding';

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences"
  on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences"
  on public.user_preferences for update using (auth.uid() = user_id);

create index idx_user_preferences_user_id on public.user_preferences(user_id);

-- ============================================================
-- INJURIES — user injuries/limitations for AI to consider
-- ============================================================
create table public.injuries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body_part text not null,
  description text,
  severity text default 'moderate' check (severity in ('mild', 'moderate', 'severe')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.injuries is 'User injuries/limitations considered during plan generation';

alter table public.injuries enable row level security;

create policy "Users can manage own injuries"
  on public.injuries for all using (auth.uid() = user_id);

create index idx_injuries_user_id on public.injuries(user_id);

-- ============================================================
-- WORKOUT_PLANS — AI-generated workout programs
-- ============================================================
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  weeks integer not null default 4,
  days_per_week integer not null default 4,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workout_plans is 'AI-generated workout programs with metadata';

alter table public.workout_plans enable row level security;

create policy "Users can manage own workout plans"
  on public.workout_plans for all using (auth.uid() = user_id);

create index idx_workout_plans_user_id on public.workout_plans(user_id);

-- ============================================================
-- WORKOUT_DAYS — individual days within a workout plan
-- ============================================================
create table public.workout_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  day_number integer not null,
  name text not null,
  focus text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workout_days is 'Individual training days within a workout plan';

alter table public.workout_days enable row level security;

create policy "Users can manage own workout days"
  on public.workout_days for all using (auth.uid() = user_id);

create index idx_workout_days_plan_id on public.workout_days(workout_plan_id);
create index idx_workout_days_user_id on public.workout_days(user_id);

-- ============================================================
-- WORKOUT_EXERCISES — exercises within a workout day
-- ============================================================
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  order_index integer not null default 0,
  name text not null,
  muscle_group text,
  sets integer not null default 3,
  reps text not null default '10',
  rest_seconds integer default 90,
  weight_suggestion text,
  notes text,
  workout_api_exercise_id text,
  exercise_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workout_exercises is 'Individual exercises with sets/reps within a workout day';
comment on column public.workout_exercises.workout_api_exercise_id is 'Stable id from Workout API (api.workoutapi.com) when matched';
comment on column public.workout_exercises.exercise_image_url is 'HTTPS URL for exercise illustration from Workout API';

alter table public.workout_exercises enable row level security;

create policy "Users can manage own exercises"
  on public.workout_exercises for all using (auth.uid() = user_id);

create index idx_workout_exercises_day_id on public.workout_exercises(workout_day_id);

-- ============================================================
-- WORKOUT_LOGS — tracks when a user completes a workout
-- ============================================================
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  date date not null default current_date,
  duration_minutes integer,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workout_logs is 'Tracks completed workout sessions';

alter table public.workout_logs enable row level security;

create policy "Users can manage own workout logs"
  on public.workout_logs for all using (auth.uid() = user_id);

create index idx_workout_logs_user_id on public.workout_logs(user_id);
create index idx_workout_logs_date on public.workout_logs(date);

-- ============================================================
-- WORKOUT_SET_LOGS — individual set performance tracking
-- ============================================================
create table public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number integer not null,
  reps integer,
  weight numeric,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.workout_set_logs is 'Individual set performance data (weight, reps)';

alter table public.workout_set_logs enable row level security;

create policy "Users can manage own set logs"
  on public.workout_set_logs for all using (auth.uid() = user_id);

create index idx_workout_set_logs_log_id on public.workout_set_logs(workout_log_id);

-- ============================================================
-- MEAL_PLANS — AI-generated meal programs
-- ============================================================
create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  daily_calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.meal_plans is 'AI-generated meal plans with macro targets';

alter table public.meal_plans enable row level security;

create policy "Users can manage own meal plans"
  on public.meal_plans for all using (auth.uid() = user_id);

create index idx_meal_plans_user_id on public.meal_plans(user_id);

-- ============================================================
-- MEAL_DAYS — daily meal templates within a plan
-- ============================================================
create table public.meal_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  day_number integer not null,
  total_calories integer,
  total_protein_g integer,
  total_carbs_g integer,
  total_fat_g integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.meal_days is 'Daily meal templates within a meal plan';

alter table public.meal_days enable row level security;

create policy "Users can manage own meal days"
  on public.meal_days for all using (auth.uid() = user_id);

create index idx_meal_days_plan_id on public.meal_days(meal_plan_id);

-- ============================================================
-- MEALS — individual meals (breakfast, lunch, dinner, snack)
-- ============================================================
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_day_id uuid not null references public.meal_days(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  description text,
  calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  prep_time_minutes integer,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.meals is 'Individual meals (breakfast/lunch/dinner/snack) with macros';

alter table public.meals enable row level security;

create policy "Users can manage own meals"
  on public.meals for all using (auth.uid() = user_id);

create index idx_meals_day_id on public.meals(meal_day_id);

-- ============================================================
-- MEAL_INGREDIENTS — ingredients for each meal
-- ============================================================
create table public.meal_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id uuid not null references public.meals(id) on delete cascade,
  name text not null,
  amount text,
  unit text,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.meal_ingredients is 'Ingredient details for each meal';

alter table public.meal_ingredients enable row level security;

create policy "Users can manage own meal ingredients"
  on public.meal_ingredients for all using (auth.uid() = user_id);

create index idx_meal_ingredients_meal_id on public.meal_ingredients(meal_id);

-- ============================================================
-- MEAL_LOGS — tracks when a user completes a meal
-- ============================================================
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id uuid not null references public.meals(id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.meal_logs is 'Tracks completed meal consumption';

alter table public.meal_logs enable row level security;

create policy "Users can manage own meal logs"
  on public.meal_logs for all using (auth.uid() = user_id);

create index idx_meal_logs_user_id on public.meal_logs(user_id);
create index idx_meal_logs_date on public.meal_logs(date);

-- ============================================================
-- GROCERY_LISTS — generated shopping lists
-- ============================================================
create table public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  name text not null default 'Weekly Groceries',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.grocery_lists is 'Generated grocery/shopping lists linked to meal plans';

alter table public.grocery_lists enable row level security;

create policy "Users can manage own grocery lists"
  on public.grocery_lists for all using (auth.uid() = user_id);

create index idx_grocery_lists_user_id on public.grocery_lists(user_id);

-- ============================================================
-- GROCERY_ITEMS — individual items on a grocery list
-- ============================================================
create table public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grocery_list_id uuid not null references public.grocery_lists(id) on delete cascade,
  name text not null,
  quantity text,
  unit text,
  category text,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.grocery_items is 'Individual grocery items with check-off tracking';

alter table public.grocery_items enable row level security;

create policy "Users can manage own grocery items"
  on public.grocery_items for all using (auth.uid() = user_id);

create index idx_grocery_items_list_id on public.grocery_items(grocery_list_id);

-- ============================================================
-- DAILY_CHECKLISTS — daily task checklists
-- ============================================================
create table public.daily_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

comment on table public.daily_checklists is 'Daily checklist instances per user per day';

alter table public.daily_checklists enable row level security;

create policy "Users can manage own checklists"
  on public.daily_checklists for all using (auth.uid() = user_id);

create index idx_daily_checklists_user_date on public.daily_checklists(user_id, date);

-- ============================================================
-- CHECKLIST_ITEMS — items within a daily checklist
-- ============================================================
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id uuid not null references public.daily_checklists(id) on delete cascade,
  title text not null,
  description text,
  item_type text not null default 'custom' check (item_type in ('workout', 'meal', 'water', 'sleep', 'supplement', 'custom')),
  reference_id uuid,
  completed boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.checklist_items is 'Individual items within a daily checklist';

alter table public.checklist_items enable row level security;

create policy "Users can manage own checklist items"
  on public.checklist_items for all using (auth.uid() = user_id);

create index idx_checklist_items_checklist_id on public.checklist_items(checklist_id);

-- ============================================================
-- WEIGHT_LOGS — body weight tracking
-- ============================================================
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric not null,
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.weight_logs is 'Body weight log entries for progress tracking';

alter table public.weight_logs enable row level security;

create policy "Users can manage own weight logs"
  on public.weight_logs for all using (auth.uid() = user_id);

create index idx_weight_logs_user_date on public.weight_logs(user_id, date);

-- ============================================================
-- PROGRESS_PHOTOS — progress photo references (stored in Supabase Storage)
-- ============================================================
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  date date not null default current_date,
  category text default 'front' check (category in ('front', 'side', 'back', 'other')),
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.progress_photos is 'Progress photo metadata (files in Supabase Storage)';

alter table public.progress_photos enable row level security;

create policy "Users can manage own progress photos"
  on public.progress_photos for all using (auth.uid() = user_id);

create index idx_progress_photos_user_id on public.progress_photos(user_id);

-- ============================================================
-- AI_THREADS — conversation threads with AI assistant
-- ============================================================
create table public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context_type text not null check (context_type in ('workout', 'meal', 'general', 'substitution', 'menu')),
  context_id uuid,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_threads is 'Conversation threads for contextual AI chat';

alter table public.ai_threads enable row level security;

create policy "Users can manage own ai threads"
  on public.ai_threads for all using (auth.uid() = user_id);

create index idx_ai_threads_user_id on public.ai_threads(user_id);

-- ============================================================
-- AI_MESSAGES — individual messages within an AI thread
-- ============================================================
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid not null references public.ai_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

comment on table public.ai_messages is 'Chat messages within an AI conversation thread';

alter table public.ai_messages enable row level security;

create policy "Users can manage own ai messages"
  on public.ai_messages for all using (auth.uid() = user_id);

create index idx_ai_messages_thread_id on public.ai_messages(thread_id);

-- ============================================================
-- MENU_SCANS — uploaded menu images with AI analysis
-- ============================================================
create table public.menu_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_storage_path text not null,
  analysis jsonb,
  restaurant_name text,
  created_at timestamptz not null default now()
);

comment on table public.menu_scans is 'Uploaded menu images with AI-generated health analysis';

alter table public.menu_scans enable row level security;

create policy "Users can manage own menu scans"
  on public.menu_scans for all using (auth.uid() = user_id);

create index idx_menu_scans_user_id on public.menu_scans(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger update_user_preferences_updated_at before update on public.user_preferences for each row execute function public.update_updated_at();
create trigger update_injuries_updated_at before update on public.injuries for each row execute function public.update_updated_at();
create trigger update_workout_plans_updated_at before update on public.workout_plans for each row execute function public.update_updated_at();
create trigger update_workout_days_updated_at before update on public.workout_days for each row execute function public.update_updated_at();
create trigger update_workout_exercises_updated_at before update on public.workout_exercises for each row execute function public.update_updated_at();
create trigger update_workout_logs_updated_at before update on public.workout_logs for each row execute function public.update_updated_at();
create trigger update_meal_plans_updated_at before update on public.meal_plans for each row execute function public.update_updated_at();
create trigger update_meal_days_updated_at before update on public.meal_days for each row execute function public.update_updated_at();
create trigger update_meals_updated_at before update on public.meals for each row execute function public.update_updated_at();
create trigger update_grocery_lists_updated_at before update on public.grocery_lists for each row execute function public.update_updated_at();
create trigger update_daily_checklists_updated_at before update on public.daily_checklists for each row execute function public.update_updated_at();
create trigger update_ai_threads_updated_at before update on public.ai_threads for each row execute function public.update_updated_at();

-- ============================================================
-- STORAGE BUCKET for progress photos and menu scans
-- ============================================================
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', false)
on conflict (id) do nothing;

create policy "Users can upload own files"
  on storage.objects for insert
  with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own files"
  on storage.objects for select
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own files"
  on storage.objects for delete
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
