import { create } from 'zustand';
import type { User, Item, ExchangeRequest, Category } from '../types';

interface AppState {
  user: User | null;
  items: Item[];
  exchangeRequests: ExchangeRequest[];
  unreadCount: number;
  currentCategory: Category | null;
  searchQuery: string;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setItems: (items: Item[]) => void;
  setExchangeRequests: (requests: ExchangeRequest[]) => void;
  setCurrentCategory: (category: Category | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  addExchangeRequest: (request: ExchangeRequest) => void;
  updateExchangeRequest: (request: ExchangeRequest) => void;
  markRequestAsRead: (id: string) => void;
  calculateUnreadCount: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  items: [],
  exchangeRequests: [],
  unreadCount: 0,
  currentCategory: null,
  searchQuery: '',
  isLoading: false,

  setUser: (user) => set({ user }),
  setItems: (items) => set({ items }),
  setExchangeRequests: (exchangeRequests) => {
    set({ exchangeRequests });
    get().calculateUnreadCount();
  },
  setCurrentCategory: (currentCategory) => set({ currentCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),

  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (item) => set((state) => ({
    items: state.items.map(i => i.id === item.id ? item : i)
  })),

  addExchangeRequest: (request) => set((state) => ({
    exchangeRequests: [request, ...state.exchangeRequests],
    unreadCount: state.unreadCount + 1,
  })),

  updateExchangeRequest: (request) => set((state) => ({
    exchangeRequests: state.exchangeRequests.map(r => r.id === request.id ? request : r)
  })),

  markRequestAsRead: (id) => set((state) => ({
    exchangeRequests: state.exchangeRequests.map(r =>
      r.id === id ? { ...r, isRead: true } : r
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  calculateUnreadCount: () => set((state) => ({
    unreadCount: state.exchangeRequests.filter(r => !r.isRead && r.toUserId === 'current-user').length
  })),
}));
