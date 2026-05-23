export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: 'strength' | 'cardio' | 'flexibility';
  description?: string;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  isPR?: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  planId?: string;
  planName?: string;
  sets: WorkoutSet[];
  duration: number;
  startTime: string;
  endTime: string;
}

export interface UserSettings {
  weeklyGoal: number;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
}

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'fullbody';
