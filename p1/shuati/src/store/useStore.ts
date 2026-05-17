import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, User, Submission, Note } from '@/types'

interface AppState {
  theme: Theme
  user: User | null
  submissions: Submission[]
  wrongQuestions: string[]
  notes: Note[]
  dailyCompleted: number
  lastCompletedDate: string | null
  
  toggleTheme: () => void
  setUser: (user: User) => void
  addSubmission: (submission: Submission) => void
  addWrongQuestion: (questionId: string) => void
  removeWrongQuestion: (questionId: string) => void
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  deleteNote: (noteId: string) => void
  incrementDailyCompleted: () => void
  checkDailyReset: () => void
}

const defaultUser: User = {
  id: '1',
  username: 'coder',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coder',
  level: 5,
  streak: 7,
  dailyGoal: 3,
  joinedAt: '2024-01-01',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      user: defaultUser,
      submissions: [],
      wrongQuestions: [],
      notes: [],
      dailyCompleted: 0,
      lastCompletedDate: null,

      toggleTheme: () => set(state => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),

      setUser: (user) => set({ user }),

      addSubmission: (submission) => set(state => ({
        submissions: [submission, ...state.submissions]
      })),

      addWrongQuestion: (questionId) => set(state => ({
        wrongQuestions: state.wrongQuestions.includes(questionId)
          ? state.wrongQuestions
          : [...state.wrongQuestions, questionId]
      })),

      removeWrongQuestion: (questionId) => set(state => ({
        wrongQuestions: state.wrongQuestions.filter(id => id !== questionId)
      })),

      addNote: (note) => set(state => ({
        notes: [note, ...state.notes]
      })),

      updateNote: (note) => set(state => ({
        notes: state.notes.map(n => n.id === note.id ? note : n)
      })),

      deleteNote: (noteId) => set(state => ({
        notes: state.notes.filter(n => n.id !== noteId)
      })),

      incrementDailyCompleted: () => {
        const today = new Date().toDateString()
        const { lastCompletedDate } = get()
        
        if (lastCompletedDate !== today) {
          set({ dailyCompleted: 1, lastCompletedDate: today })
        } else {
          set(state => ({ dailyCompleted: state.dailyCompleted + 1 }))
        }
      },

      checkDailyReset: () => {
        const today = new Date().toDateString()
        const { lastCompletedDate } = get()
        
        if (lastCompletedDate && lastCompletedDate !== today) {
          set({ dailyCompleted: 0 })
        }
      },
    }),
    {
      name: 'dev-oj-storage',
    }
  )
)
