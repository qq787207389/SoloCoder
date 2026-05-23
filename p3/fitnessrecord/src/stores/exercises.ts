import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Exercise } from '@/types';
import { storage } from '@/utils/storage';

const STORAGE_KEY = 'fittrack_exercises';

const defaultExercises: Exercise[] = [
  { id: 'squat', name: '深蹲', muscleGroup: 'legs', type: 'strength', description: '锻炼腿部和臀部的黄金动作' },
  { id: 'bench-press', name: '卧推', muscleGroup: 'chest', type: 'strength', description: '锻炼胸部、肩部和肱三头肌' },
  { id: 'deadlift', name: '硬拉', muscleGroup: 'fullbody', type: 'strength', description: '全身复合动作，锻炼后链肌群' },
  { id: 'pull-up', name: '引体向上', muscleGroup: 'back', type: 'strength', description: '锻炼背部和肱二头肌' },
  { id: 'push-up', name: '俯卧撑', muscleGroup: 'chest', type: 'strength', description: '自重训练，锻炼胸部和手臂' },
  { id: 'overhead-press', name: '肩推', muscleGroup: 'shoulders', type: 'strength', description: '锻炼肩部三角肌' },
  { id: 'barbell-row', name: '杠铃划船', muscleGroup: 'back', type: 'strength', description: '锻炼背部厚度' },
  { id: 'bicep-curl', name: '二头弯举', muscleGroup: 'arms', type: 'strength', description: '锻炼肱二头肌' },
  { id: 'tricep-dip', name: '臂屈伸', muscleGroup: 'arms', type: 'strength', description: '锻炼肱三头肌' },
  { id: 'leg-press', name: '腿举', muscleGroup: 'legs', type: 'strength', description: '腿部力量训练' },
  { id: 'lunges', name: '箭步蹲', muscleGroup: 'legs', type: 'strength', description: '单腿力量训练' },
  { id: 'plank', name: '平板支撑', muscleGroup: 'core', type: 'strength', description: '核心稳定训练' },
  { id: 'crunch', name: '卷腹', muscleGroup: 'core', type: 'strength', description: '腹部肌肉训练' },
  { id: 'running', name: '跑步', muscleGroup: 'cardio', type: 'cardio', description: '有氧训练，提升心肺功能' },
  { id: 'cycling', name: '骑行', muscleGroup: 'cardio', type: 'cardio', description: '低冲击有氧训练' },
  { id: 'jump-rope', name: '跳绳', muscleGroup: 'cardio', type: 'cardio', description: '高效燃脂有氧训练' },
  { id: 'stretching', name: '拉伸', muscleGroup: 'fullbody', type: 'flexibility', description: '提升身体柔韧性' },
  { id: 'yoga', name: '瑜伽', muscleGroup: 'fullbody', type: 'flexibility', description: '身心平衡训练' }
];

export const useExercisesStore = defineStore('exercises', () => {
  const exercises = ref<Exercise[]>(storage.get(STORAGE_KEY, defaultExercises));

  const allExercises = computed(() => exercises.value);

  const strengthExercises = computed(() => 
    exercises.value.filter(e => e.type === 'strength')
  );

  const cardioExercises = computed(() => 
    exercises.value.filter(e => e.type === 'cardio')
  );

  const getExerciseById = (id: string) => {
    return exercises.value.find(e => e.id === id);
  };

  const getExercisesByMuscleGroup = (muscleGroup: string) => {
    return exercises.value.filter(e => e.muscleGroup === muscleGroup);
  };

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(36)
    };
    exercises.value.push(newExercise);
    saveToStorage();
  };

  const saveToStorage = () => {
    storage.set(STORAGE_KEY, exercises.value);
  };

  return {
    exercises,
    allExercises,
    strengthExercises,
    cardioExercises,
    getExerciseById,
    getExercisesByMuscleGroup,
    addExercise
  };
});
