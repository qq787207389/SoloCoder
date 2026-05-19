import { create } from 'zustand';
import type { Questionnaire, Question, QuestionOption } from '../types';
import dayjs from 'dayjs';

interface QuestionnaireState {
  currentQuestionnaire: Questionnaire | null;
  questionnaires: Questionnaire[];
  isLoading: boolean;
  setCurrentQuestionnaire: (questionnaire: Questionnaire | null) => void;
  setQuestionnaires: (questionnaires: Questionnaire[]) => void;
  addQuestion: (type: Question['type']) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionId: string, text: string) => void;
  deleteOption: (questionId: string, optionId: string) => void;
  updateQuestionnaireInfo: (updates: Partial<Questionnaire>) => void;
  createNewQuestionnaire: () => void;
  loadDraft: () => void;
  saveDraft: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyQuestion = (type: Question['type'], order: number): Question => {
  const question: Question = {
    id: generateId(),
    type,
    title: '',
    required: false,
    order,
  };
  if (type === 'single' || type === 'multiple') {
    question.options = [
      { id: generateId(), text: '选项1' },
      { id: generateId(), text: '选项2' },
    ];
  }
  return question;
};

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  currentQuestionnaire: null,
  questionnaires: [],
  isLoading: false,

  setCurrentQuestionnaire: (questionnaire) => set({ currentQuestionnaire: questionnaire }),
  setQuestionnaires: (questionnaires) => set({ questionnaires }),

  createNewQuestionnaire: () => {
    const newQuestionnaire: Questionnaire = {
      id: generateId(),
      title: '未命名问卷',
      description: '',
      status: 'draft',
      questions: [],
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };
    set({ currentQuestionnaire: newQuestionnaire });
  },

  addQuestion: (type) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      const newQuestion = createEmptyQuestion(type, state.currentQuestionnaire.questions.length);
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: [...state.currentQuestionnaire.questions, newQuestion],
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  updateQuestion: (questionId, updates) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: state.currentQuestionnaire.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  deleteQuestion: (questionId) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      const newQuestions = state.currentQuestionnaire.questions
        .filter((q) => q.id !== questionId)
        .map((q, idx) => ({ ...q, order: idx }));
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: newQuestions,
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  reorderQuestions: (startIndex, endIndex) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      const questions = [...state.currentQuestionnaire.questions];
      const [removed] = questions.splice(startIndex, 1);
      questions.splice(endIndex, 0, removed);
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: questions.map((q, idx) => ({ ...q, order: idx })),
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  addOption: (questionId) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: state.currentQuestionnaire.questions.map((q) => {
            if (q.id === questionId && q.options) {
              const newOption: QuestionOption = {
                id: generateId(),
                text: `选项${q.options.length + 1}`,
              };
              return { ...q, options: [...q.options, newOption] };
            }
            return q;
          }),
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  updateOption: (questionId, optionId, text) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: state.currentQuestionnaire.questions.map((q) => {
            if (q.id === questionId && q.options) {
              return {
                ...q,
                options: q.options.map((o) =>
                  o.id === optionId ? { ...o, text } : o
                ),
              };
            }
            return q;
          }),
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  deleteOption: (questionId, optionId) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          questions: state.currentQuestionnaire.questions.map((q) => {
            if (q.id === questionId && q.options) {
              return {
                ...q,
                options: q.options.filter((o) => o.id !== optionId),
              };
            }
            return q;
          }),
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  updateQuestionnaireInfo: (updates) => {
    set((state) => {
      if (!state.currentQuestionnaire) return state;
      return {
        currentQuestionnaire: {
          ...state.currentQuestionnaire,
          ...updates,
          updatedAt: dayjs().toISOString(),
        },
      };
    });
  },

  saveDraft: () => {
    const { currentQuestionnaire } = get();
    if (currentQuestionnaire) {
      localStorage.setItem('questionnaire_draft', JSON.stringify(currentQuestionnaire));
    }
  },

  loadDraft: () => {
    const draftStr = localStorage.getItem('questionnaire_draft');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      set({ currentQuestionnaire: draft });
    }
  },
}));
