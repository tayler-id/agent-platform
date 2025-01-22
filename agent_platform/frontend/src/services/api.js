import axios from 'axios';

// Create configured axios instance with proper ESM support
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getSession: () => api.get('/auth/session'),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  generate2FASecret: () => api.get('/auth/2fa/secret'),
  enable2FA: (data) => api.post('/auth/2fa/enable', data),
};

const agents = {
  createAgent: (agentData) => api.post('/agents', agentData),
  getAgent: (agentId) => api.get(`/agents/${agentId}`),
  listAgents: () => api.get('/agents'),
  runAgent: (agentId, message) => api.post(`/agents/${agentId}/run`, { message }),
};

const marketplace = {
  listListings: () => api.get('/marketplace'),
  createListing: (listingData) => api.post('/marketplace', listingData),
  rentAgent: (listingId) => api.post(`/marketplace/${listingId}/rent`),
  purchaseAgent: (listingId) => api.post(`/marketplace/${listingId}/purchase`),
};

const gamification = {
  getUserStats: () => api.get('/users/me/stats'),
  getLeaderboard: (category) => api.get(`/leaderboard/${category}`),
  getAchievements: () => api.get('/achievements'),
  updateProfile: (updates) => api.patch('/users/me', updates),
  getProfile: () => api.get('/users/me'),
  updateAvatar: (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    return api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getMyAgents: () => api.get('/users/me/agents'),
  getAgentHistory: (agentId) => api.get(`/users/me/agents/${agentId}/history`)
};

const system = {
  healthCheck: () => api.get('/health'),
};

const api_service = {
  auth,
  agents,
  marketplace,
  gamification,
  system,
};

export default api_service;
