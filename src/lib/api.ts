import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Favorites
export const favoritesApi = {
  getAll: () => api.get('/favorites'),
  add: (data: { animeId: number; animeTitle: string; animeCover?: string; animeFormat?: string; animeScore?: number | null }) =>
    api.post('/favorites', data),
  remove: (animeId: number) => api.delete(`/favorites/${animeId}`),
  check: (animeId: number) => api.get(`/favorites/check/${animeId}`),
};

// Comments
export const commentsApi = {
  getByAnime: (animeId: number, page = 1) =>
    api.get(`/comments/${animeId}?page=${page}`),
  create: (animeId: number, content: string) =>
    api.post(`/comments/${animeId}`, { content }),
  update: (id: string, content: string) =>
    api.put(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}`),
  toggleLike: (id: string) => api.post(`/comments/${id}/like`),
};

// Users
export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
    api.put('/users/me', data),
  follow: (id: string) => api.post(`/users/${id}/follow`),
};

// Admin
export const adminApi = {
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  createUser: (data: object) => api.post('/admin/users', data),
  editUser: (id: string, data: object) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  toggleBlock: (id: string) => api.patch(`/admin/users/${id}/block`),
  getComments: (page = 1) => api.get(`/admin/comments?page=${page}`),
  deleteComment: (id: string) => api.delete(`/admin/comments/${id}`),
};
