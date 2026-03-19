export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  unit_system: "imperial" | "metric";
  timezone: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  fitness_goal: "lose_fat" | "build_muscle" | "maintain" | "recomp" | "improve_health";
  experience_level: "beginner" | "intermediate" | "advanced";
  age: number | null;
  sex: "male" | "female" | "other" | null;
  height_cm: number | null;
  weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  workout_days_per_week: number;
  workout_duration_minutes: number;
  available_equipment: string[];
  dietary_restrictions: string[];
  diet_type: "flexible" | "keto" | "paleo" | "vegan" | "vegetarian" | "mediterranean";
  meals_per_day: number;
  calorie_target: number | null;
  protein_target_g: number | null;
  carb_target_g: number | null;
  fat_target_g: number | null;
  created_at: string;
  updated_at: string;
};

export type Injury = {
  id: string;
  user_id: string;
  body_part: string;
  description: string | null;
  severity: "mild" | "moderate" | "severe";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  weeks: number;
  days_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutDay = {
  id: string;
  user_id: string;
  workout_plan_id: string;
  day_number: number;
  name: string;
  focus: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkoutExercise = {
  id: string;
  user_id: string;
  workout_day_id: string;
  order_index: number;
  name: string;
  muscle_group: string | null;
  sets: number;
  reps: string;
  rest_seconds: number | null;
  weight_suggestion: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  workout_day_id: string;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutSetLog = {
  id: string;
  user_id: string;
  workout_log_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
  created_at: string;
};

export type MealPlan = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  daily_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MealDay = {
  id: string;
  user_id: string;
  meal_plan_id: string;
  day_number: number;
  total_calories: number | null;
  total_protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
  created_at: string;
  updated_at: string;
};

export type Meal = {
  id: string;
  user_id: string;
  meal_day_id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  prep_time_minutes: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type MealIngredient = {
  id: string;
  user_id: string;
  meal_id: string;
  name: string;
  amount: string | null;
  unit: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  order_index: number;
  created_at: string;
};

export type MealLog = {
  id: string;
  user_id: string;
  meal_id: string;
  date: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
};

export type GroceryList = {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type GroceryItem = {
  id: string;
  user_id: string;
  grocery_list_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  checked: boolean;
  created_at: string;
};

export type DailyChecklist = {
  id: string;
  user_id: string;
  date: string;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  user_id: string;
  checklist_id: string;
  title: string;
  description: string | null;
  item_type: "workout" | "meal" | "water" | "sleep" | "supplement" | "custom";
  reference_id: string | null;
  completed: boolean;
  order_index: number;
  created_at: string;
};

export type WeightLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string;
  notes: string | null;
  created_at: string;
};

export type ProgressPhoto = {
  id: string;
  user_id: string;
  storage_path: string;
  date: string;
  category: "front" | "side" | "back" | "other";
  notes: string | null;
  created_at: string;
};

export type AiThread = {
  id: string;
  user_id: string;
  context_type: "workout" | "meal" | "general" | "substitution" | "menu";
  context_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AiMessage = {
  id: string;
  user_id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type MenuScan = {
  id: string;
  user_id: string;
  image_storage_path: string;
  analysis: MenuAnalysis | null;
  restaurant_name: string | null;
  created_at: string;
};

export type MenuAnalysis = {
  recommendations: MenuRecommendation[];
  summary: string;
};

export type MenuRecommendation = {
  item_name: string;
  health_score: number;
  estimated_calories: number;
  estimated_protein_g: number;
  estimated_carbs_g: number;
  estimated_fat_g: number;
  reasoning: string;
  modifications: string[];
};

export type WorkoutDayWithExercises = WorkoutDay & {
  workout_exercises: WorkoutExercise[];
};

export type MealDayWithMeals = MealDay & {
  meals: (Meal & { meal_ingredients: MealIngredient[] })[];
};
