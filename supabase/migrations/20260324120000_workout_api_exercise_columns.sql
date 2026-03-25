-- Add Workout API linkage columns to existing databases (idempotent).
alter table public.workout_exercises
  add column if not exists workout_api_exercise_id text;

alter table public.workout_exercises
  add column if not exists exercise_image_url text;

comment on column public.workout_exercises.workout_api_exercise_id is 'Stable id from Workout API (api.workoutapi.com) when matched';
comment on column public.workout_exercises.exercise_image_url is 'HTTPS URL for exercise illustration from Workout API';
