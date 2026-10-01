export type Workout = {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  performed_at: string;
  created_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_name: string;
  order_index: number;
  created_at: string;
};

export type WorkoutSet = {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  reps: number | null;
  weight: number | null;
  weight_unit: string;
  created_at: string;
};

export type WorkoutWithExercises = Workout & {
  workout_exercises: (WorkoutExercise & { workout_sets: WorkoutSet[] })[];
};

export type FoodEntry = {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
  created_at: string;
};

// A set being filled out in the "log workout" form, before it's saved.
export type DraftSet = {
  reps: string;
  weight: string;
};

export type DraftExercise = {
  name: string;
  sets: DraftSet[];
};
