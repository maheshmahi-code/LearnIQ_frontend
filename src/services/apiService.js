/**
 * API Service - Axios instance for LearnIQ backend
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://learniq-backend-1.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Handling 401s manually or via components instead of hard reload to avoid infinite loops
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  google: (data) => api.post('/auth/google', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  generate: (data) => api.post('/courses/generate', data),
};

export const quizAPI = {
  getByCourse: (courseId) => api.get(`/quiz/course/${courseId}`),
  getOne: (id) => api.get(`/quiz/${id}`),
  generate: (data) => api.post('/quiz/generate', data),
  attempt: (id, data) => api.post(`/quiz/${id}/attempt`, data),
  getResults: (id) => api.get(`/quiz/${id}/results`),
};

export const aiAPI = {
  doubtSolver: (data) => api.post('/ai/doubt-solver', data, { responseType: 'stream' }),
  getConversations: () => api.get('/ai/conversations'),
  getConversation: (id) => api.get(`/ai/conversations/${id}`),
  createConversation: () => api.post('/ai/conversations'),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),
};

export const flashcardsAPI = {
  generate: (formData) => api.post('/flashcards/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  generateFromCourse: (courseId) => api.post('/flashcards/generate-from-course', { courseId }),
  getDecks: () => api.get('/flashcards/decks'),
  getDeck: (id) => api.get(`/flashcards/deck/${id}`),
  updateCard: (id, data) => api.put(`/flashcards/card/${id}`, data),
  getDueToday: () => api.get('/flashcards/due-today'),
};

export const gamificationAPI = {
  getProfile: () => api.get('/gamification/profile'),
  awardXP: (action) => api.post('/gamification/award-xp', { action }),
  getLeaderboard: (limit) => api.get('/gamification/leaderboard', { params: { limit } }),
};

export const weaknessAPI = {
  getReport: (studentId, courseId) =>
    api.get(`/weakness/${studentId || ''}`, { params: { courseId } }),
  getStudyPlan: (weakTopics) =>
    api.get('/weakness/study-plan', { params: { weakTopics: weakTopics?.join(',') } }),
  predictScore: (data) => api.post('/weakness/predict-score', data),
};

export const analyticsAPI = {
  getStudent: (id) => api.get(id ? `/analytics/student/${id}` : '/analytics/student'),
  getAdminOverview: () => api.get('/analytics/admin/overview'),
};

export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  generate: (data) => api.post('/assignments/generate', data),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
};

export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (data) => api.post('/community/posts', data),
  comment: (id, data) => api.post(`/community/posts/${id}/comment`, data),
  upvote: (id) => api.put(`/community/posts/${id}/upvote`),
};

export const notesAPI = {
  upload: (formData) => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/notes', { params }),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const chatAPI = {
  getMessages: (roomId = 'global') => api.get(`/chat/${roomId}`),
  sendMessage: (roomId = 'global', data) => api.post(`/chat/${roomId}`, data),
};

export default api;
