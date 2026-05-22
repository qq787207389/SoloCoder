import type { Item, User, ExchangeRequest, Rating, PaginatedResponse, Category } from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getItems: (params?: {
    page?: number;
    pageSize?: number;
    category?: Category;
    search?: string;
    community?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.community) searchParams.set('community', params.community);

    return request<PaginatedResponse<Item>>(`/api/items?${searchParams.toString()}`);
  },

  getItem: (id: string) =>
    request<{ success: boolean; data: Item }>(`/api/items/${id}`),

  createItem: (item: Partial<Item>) =>
    request<{ success: boolean; data: Item }>('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateItem: (id: string, item: Partial<Item>) =>
    request<{ success: boolean; data: Item }>(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),

  deleteItem: (id: string) =>
    request<{ success: boolean }>(`/api/items/${id}`, {
      method: 'DELETE',
    }),

  getCurrentUser: () =>
    request<{ success: boolean; data: User }>('/api/user'),

  getUser: (id: string) =>
    request<{ success: boolean; data: User }>(`/api/users/${id}`),

  getUserItems: (userId: string) =>
    request<{ success: boolean; data: Item[] }>(`/api/users/${userId}/items`),

  getExchangeRequests: (type?: 'sent' | 'received' | 'all') => {
    const searchParams = new URLSearchParams();
    if (type) searchParams.set('type', type);
    return request<{ success: boolean; data: ExchangeRequest[] }>(
      `/api/exchange-requests?${searchParams.toString()}`
    );
  },

  createExchangeRequest: (data: Partial<ExchangeRequest>) =>
    request<{ success: boolean; data: ExchangeRequest }>('/api/exchange-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExchangeRequest: (id: string, data: Partial<ExchangeRequest>) =>
    request<{ success: boolean; data: ExchangeRequest }>(`/api/exchange-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  markRequestAsRead: (id: string) =>
    request<{ success: boolean }>(`/api/exchange-requests/${id}/read`, {
      method: 'PUT',
    }),

  getRatings: (userId: string) =>
    request<{ success: boolean; data: Rating[] }>(`/api/ratings/${userId}`),

  createRating: (rating: Partial<Rating>) =>
    request<{ success: boolean; data: Rating }>('/api/ratings', {
      method: 'POST',
      body: JSON.stringify(rating),
    }),
};
