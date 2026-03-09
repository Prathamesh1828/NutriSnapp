// lib/wgerApi.ts
// All requests are routed through /api/wger (Next.js server proxy).
// This keeps WGER_API_KEY server-side only — never exposed to the browser.
// Set WGER_API_KEY in .env.local (NOT NEXT_PUBLIC_WGER_API_KEY)

export interface WgerResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Workout {
  id: number;
  creation_date: string;
  description: string;
  equipment: number[];
}

export interface WorkoutDay {
  id: number;
  training: number;
  description: string;
  day: number[];
}

export interface Setting {
  id: number;
  set: number;
  exercise: number;
  reps: number;
  weight: number;
  rir: number;
  weight_unit: string;
  repetition_unit: number;
}

export interface ExerciseSet {
  id: number;
  day: number;
  exercise: number[];
  sets: number;
  order: number;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  language: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Muscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
}

// -------------------------------------------------------------------
// Internal fetch helper — calls our own /api/wger proxy, never wger directly
// -------------------------------------------------------------------
async function proxyFetch<T>(
  wgerPath: string,
  options: RequestInit = {}
): Promise<T> {
  const proxyUrl = `/api/wger?path=${encodeURIComponent(wgerPath)}`;

  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[wgerApi] ${response.status} for ${wgerPath}`, errorBody);
    throw new Error(`wger API error: ${response.status}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

// -------------------------------------------------------------------
// Public API surface
// -------------------------------------------------------------------
export const wgerApi = {

  // ── Workouts ──────────────────────────────────────────────────────
  fetchWorkouts: () =>
    proxyFetch<WgerResponse<Workout>>('/workout/?format=json'),

  createWorkout: (data: Partial<Workout>) =>
    proxyFetch<Workout>('/workout/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteWorkout: (id: number) =>
    proxyFetch<void>(`/workout/${id}/`, { method: 'DELETE' }),

  // ── Days ──────────────────────────────────────────────────────────
  fetchWorkoutDays: (workoutId: number) =>
    proxyFetch<WgerResponse<WorkoutDay>>(
      `/day/?training=${workoutId}&format=json`
    ),

  createWorkoutDay: (data: Partial<WorkoutDay>) =>
    proxyFetch<WorkoutDay>('/day/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteWorkoutDay: (id: number) =>
    proxyFetch<void>(`/day/${id}/`, { method: 'DELETE' }),

  // ── Sets (exercise groups attached to a day) ──────────────────────
  fetchSetsForDay: (dayId: number) =>
    proxyFetch<WgerResponse<ExerciseSet>>(`/set/?day=${dayId}&format=json`),

  createSet: (data: Partial<ExerciseSet>) =>
    proxyFetch<ExerciseSet>('/set/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSet: (setId: number) =>
    proxyFetch<void>(`/set/${setId}/`, { method: 'DELETE' }),

  // ── Settings (reps/weight per set) ───────────────────────────────
  fetchSettingsForSet: (setId: number) =>
    proxyFetch<WgerResponse<Setting>>(`/setting/?set=${setId}&format=json`),

  createSetting: (data: Partial<Setting>) =>
    proxyFetch<Setting>('/setting/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSetting: (settingId: number) =>
    proxyFetch<void>(`/setting/${settingId}/`, { method: 'DELETE' }),

  // ── Exercises ─────────────────────────────────────────────────────
  fetchExercises: (
    limit = 20,
    offset = 0,
    category?: number,
    muscle?: number
  ) => {
    let path = `/exercise/?format=json&language=2&limit=${limit}&offset=${offset}`;
    if (category) path += `&category=${category}`;
    if (muscle) path += `&muscles=${muscle}`;
    return proxyFetch<WgerResponse<Exercise>>(path);
  },

  fetchExerciseById: (id: number) =>
    proxyFetch<Exercise>(`/exercise/${id}/?format=json`),

  // ── Metadata ──────────────────────────────────────────────────────
  fetchCategories: () =>
    proxyFetch<WgerResponse<Category>>('/exercisecategory/?format=json'),

  fetchMuscles: () =>
    proxyFetch<WgerResponse<Muscle>>('/muscle/?format=json'),
};