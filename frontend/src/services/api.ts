import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Basic error handling
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (data: any) => api.post('/auth/logout', data),
  refresh: (data: any) => api.post('/auth/refresh', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: any) => api.put('/auth/change-password', data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getPotentialMatches: (params?: any) => api.get('/users/matches', { params }),
  getMyMatches: () => api.get('/users/matches/my'),
  deleteAccount: () => api.delete('/users/account'),
};

// Matches API
export const matchesAPI = {
  createMatch: (data: any) => api.post('/matches', data),
  updateMatchStatus: (id: string, data: any) => api.put(`/matches/${id}/status`, data),
  getMatch: (id: string) => api.get(`/matches/${id}`),
  deleteMatch: (id: string) => api.delete(`/matches/${id}`),
  getPendingMatches: () => api.get('/matches/pending'),
  getAcceptedMatches: () => api.get('/matches/accepted'),
};

// Messages API
export const messagesAPI = {
  sendMessage: (data: any) => api.post('/messages', data),
  getConversation: (userId: string, params?: any) => 
    api.get(`/messages/conversation/${userId}`, { params }),
  getConversations: () => api.get('/messages/conversations'),
  markAsRead: (senderId: string) => api.put(`/messages/read/${senderId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  deleteMessage: (id: string) => api.delete(`/messages/${id}`),
};

// Questions API
export const questionsAPI = {
  getAll: (params?: any) => api.get('/questions', { params }),
  getById: (id: string) => api.get(`/questions/${id}`),
  getRandom: (count: number, params?: any) => 
    api.get(`/questions/random/${count}`, { params }),
  submitAnswer: (id: string, data: any) => api.post(`/questions/${id}/answer`, data),
  getMyAnswers: () => api.get('/questions/answers/me'),
  getByCategory: (category: string) => api.get(`/questions/category/${category}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getMySubscription: () => api.get('/subscriptions/me'),
  createSubscription: (data: any) => api.post('/subscriptions', data),
  cancelSubscription: () => api.put('/subscriptions/cancel'),
  getHistory: () => api.get('/subscriptions/history'),
  checkPremium: () => api.get('/subscriptions/premium/check'),
};

// Payments API
export const paymentsAPI = {
  createPayment: (data: any) => api.post('/payments/create', data),
  createNOWPayments: (data: any) => api.post('/payments/nowpayments', data),
  getPaymentStatus: (id: string) => api.get(`/payments/${id}/status`),
  getPaymentHistory: () => api.get('/payments/history'),
  // Webhook is handled by backend
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 