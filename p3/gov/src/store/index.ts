import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  isLoggedIn: boolean;
  login: (user: any) => void;
  logout: () => void;
  updateUser: (user: Partial<any>) => void;
}

interface ApplicationState {
  applications: any[];
  addApplication: (app: any) => void;
  updateApplication: (id: string, updates: Partial<any>) => void;
}

interface ConsultationState {
  consultations: any[];
  addConsultation: (consult: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      applications: [],
      addApplication: (app) =>
        set((state) => ({ applications: [...state.applications, app] })),
      updateApplication: (id, updates) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          ),
        })),
    }),
    {
      name: 'application-storage',
    }
  )
);

export const useConsultationStore = create<ConsultationState>()(
  persist(
    (set) => ({
      consultations: [],
      addConsultation: (consult) =>
        set((state) => ({ consultations: [...state.consultations, consult] })),
    }),
    {
      name: 'consultation-storage',
    }
  )
);
