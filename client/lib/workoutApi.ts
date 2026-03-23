import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest_s: number;
    instructions: string[];
}

export interface WorkoutPlan {
    _id?: string;
    userId: string;
    title: string;
    exercises: Exercise[];
    days?: any[]; // For manual workouts
    weeks?: number;
    notes?: string;
    is_active?: boolean;
    createdAt?: string;
}

export const workoutApi = {
    // Exercises
    fetchExercises: async () => {
        const res = await axios.get(`${API_BASE_URL}/exercises`);
        return res.data;
    },
    fetchBodyParts: async () => {
        const res = await axios.get(`${API_BASE_URL}/exercises/bodyparts`);
        return res.data;
    },
    fetchMuscles: async () => {
        const res = await axios.get(`${API_BASE_URL}/exercises/muscles`);
        return res.data;
    },
    fetchEquipment: async () => {
        const res = await axios.get(`${API_BASE_URL}/exercises/equipment`);
        return res.data;
    },
    fetchExerciseById: async (id: string) => {
        const res = await axios.get(`${API_BASE_URL}/exercises/${id}`);
        return res.data;
    },

    // Generator
    generateWorkout: async (profile: { age?: number; gender: string; weight: number; goal: string }, filters: any) => {
        const res = await axios.post(`${API_BASE_URL}/workouts/generate`, { ...profile, ...filters });
        return res.data;
    },

    // Workout Plans
    savePlan: async (plan: Partial<WorkoutPlan>) => {
        const res = await axios.post(`${API_BASE_URL}/workouts`, plan);
        return res.data;
    },
    fetchPlans: async (userId: string) => {
        const res = await axios.get(`${API_BASE_URL}/workouts`, { params: { userId } });
        return res.data;
    },
    fetchActivePlan: async (userId: string) => {
        const res = await axios.get(`${API_BASE_URL}/workouts/active`, { params: { userId } });
        return res.data;
    },
    activatePlan: async (planId: string) => {
        const res = await axios.put(`${API_BASE_URL}/workouts/${planId}/activate`);
        return res.data;
    },
    updatePlan: async (planId: string, updates: Partial<WorkoutPlan>) => {
        const res = await axios.put(`${API_BASE_URL}/workouts/${planId}`, updates);
        return res.data;
    },
    deletePlan: async (planId: string) => {
        const res = await axios.delete(`${API_BASE_URL}/workouts/${planId}`);
        return res.data;
    }
};
