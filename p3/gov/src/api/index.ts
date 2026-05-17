import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const serviceApi = {
  getGuides: (params?: { department?: string; theme?: string; keyword?: string }) =>
    api.get<any[]>('/guides', { params }),
  getGuideById: (id: string) => api.get<any>(`/guides/${id}`),
};

export const policyApi = {
  getPolicies: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
    api.get<{ list: any[]; total: number }>('/policies', { params }),
  getPolicyById: (id: string) => api.get<any>(`/policies/${id}`),
  getNotices: () => api.get<any[]>('/notices'),
};

export const applicationApi = {
  createApplication: (data: any) => api.post<any>('/applications', data),
  getApplicationById: (id: string) => api.get<any>(`/applications/${id}`),
  getUserApplications: () => api.get<any[]>('/applications/user'),
};

export const consultationApi = {
  createConsultation: (data: any) => api.post<any>('/consultations', data),
  getUserConsultations: () => api.get<any[]>('/consultations/user'),
};

export const commonApi = {
  getBanners: () => api.get<any[]>('/banners'),
  getQuickServices: () => api.get<any[]>('/quick-services'),
};

export default api;
