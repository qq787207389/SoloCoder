export type Category = 'books' | 'home' | 'digital' | 'clothing' | 'toys' | 'sports' | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  books: '书籍',
  home: '家居',
  digital: '数码',
  clothing: '衣物',
  toys: '玩具',
  sports: '运动',
  other: '其他',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  books: '📚',
  home: '🏠',
  digital: '📱',
  clothing: '👕',
  toys: '🧸',
  sports: '⚽',
  other: '📦',
};

export interface User {
  id: string;
  name: string;
  avatar: string;
  community: string;
  rating: number;
  exchangeCount: number;
  phone: string;
}

export interface Item {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Category;
  images: string[];
  desiredCategory: string;
  community: string;
  createdAt: string;
  status: 'active' | 'exchanged' | 'offline';
  distance?: string;
}

export type ExchangeRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface ExchangeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  offeredItemId: string;
  requestedItemId: string;
  message: string;
  status: ExchangeRequestStatus;
  createdAt: string;
  isRead: boolean;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  exchangeId: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
