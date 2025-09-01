// frontend/src/services/api.ts
import axios from 'axios';
import toast from 'react-hot-toast';

// Determine API URL based on environment
const getApiUrl = () => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }
  
  // In production, use the same domain (Vercel will handle routing)
  return '/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || 'An error occurred';
    const errorType = error.response?.data?.error?.type;
    const suggestion = error.response?.data?.error?.suggestion || '';

    console.error('API Error:', { status, message, errorType, url: original?.url });

    // Handle specific errors
    switch (status) {
      case 401:
        // Don't redirect during signup/login flow or for optional auth endpoints
        const isAuthFlow = window.location.pathname.includes('/signup') || 
                          window.location.pathname.includes('/login') || 
                          window.location.pathname.includes('/register');
        const isOptionalAuth = original?.url?.includes('/images/upload') || 
                              original?.url?.includes('/users/potential-matches');
        
        if (isAuthFlow || isOptionalAuth) {
          // For signup flow and optional auth endpoints, just show error without redirect
          console.warn('Auth error during signup flow or optional auth endpoint:', { url: original?.url, message });
          // Don't show toast error for image upload during signup - let component handle it
          if (!original?.url?.includes('/images/upload')) {
            toast.error(message, { duration: 4000 });
          }
        } else {
          // Normal 401 handling for authenticated routes
          toast.error('Please log in to continue. ' + suggestion, { duration: 6000 });
          if (!original._retry && errorType !== 'AUTH_TOKEN_INVALID') {
            original._retry = true;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        break;
      case 413:
        toast.error(`${message} ${suggestion}`, { duration: 6000 });
        break;
      case 404:
        toast.error('API endpoint not found. Please try again later.', { duration: 6000 });
        break;
      case 500:
        toast.error('Server error. Please try again or contact support.', { duration: 6000 });
        break;
      default:
        toast.error(message, { duration: 6000 });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: (data: { refreshToken: string; logoutAll?: boolean }) => api.post('/auth/logout', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; userId: string; newPassword: string }) => 
    api.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/auth/change-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  refreshToken: (data: { refreshToken: string }) => api.post('/auth/refresh', data),
  getMe: () => api.get('/auth/me'),
  deleteAccount: (data: { password: string; confirmation: string }) => 
    api.delete('/auth/delete-account', { data }),
  updateProfile: (data: any) => api.put('/users/profile', data), // Added this method
};

// Images API
export const imagesAPI = {
  uploadSingle: (formData: FormData, onProgress?: (progress: number) => void) => {
    return api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      timeout: 60000, // 60 second timeout for large files
    });
  },
  uploadMultiple: (formData: FormData, onProgress?: (progress: number) => void) => {
    return api.post('/images/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      timeout: 120000, // 2 minute timeout for multiple files
    });
  },
  deletePhoto: (data: { imageId: string }) => api.delete('/images/delete', { data }),
  reorderPhotos: (data: { photoUrls: string[] }) => api.put('/images/reorder', data),
  testConnection: () => api.get('/images/test'),
};

// Matches API
export const matchesAPI = {
  getMatches: () => api.get('/matches'),
  createMatch: (data: { matchedUserId: string; compatibilityScore: number }) => 
    api.post('/matches', data),
  updateMatchStatus: (matchId: string, data: { status: string }) => 
    api.put(`/matches/${matchId}/status`, data),
  getMatchDetails: (matchId: string) => api.get(`/matches/${matchId}`),
  getPotentialMatches: (params?: { limit?: number; offset?: number }) => 
    api.get('/users/matches', { params }),
  getPendingMatches: () => api.get('/matches/pending'),
  getAcceptedMatches: () => api.get('/matches/accepted'),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId: string, params?: { limit?: number; offset?: number }) => 
    api.get(`/messages/conversation/${userId}`, { params }),
  sendMessage: (data: { receiverId: string; content: string }) => 
    api.post('/messages', data),
  markAsRead: (senderId: string) => api.put(`/messages/read/${senderId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getPotentialMatches: (params?: { limit?: number; offset?: number }) => 
    api.get('/users/matches', { params }),
  getMyMatches: () => api.get('/users/matches/my'),
  deleteAccount: () => api.delete('/users/account'),
};

// Payments API
export const paymentsAPI = {
  // Get available currencies
  getCurrencies: () => api.get('/payments/currencies'),
  
  // Estimate payment
  estimatePayment: (data: {
    amount: number;
    from_currency: string;
    to_currency: string;
  }) => api.post('/payments/estimate', data),
  
  // Create payment
  createPayment: (data: {
    price_amount: number;
    price_currency: string;
    pay_currency: string;
    order_description: string;
  }) => api.post('/payments/create', data),
  
  // Get payment status
  getPaymentStatus: (paymentId: string) => api.get(`/payments/status/${paymentId}`),
  
  // Create subscription payment
  createSubscription: (data: {
    plan: 'premium' | 'gold';
    duration: 'monthly' | 'yearly';
    payment_method: 'crypto' | 'card';
  }) => api.post('/payments/subscription', data),
  
  // Get payment history
  getPaymentHistory: (params?: { page?: number; limit?: number }) => 
    api.get('/payments/history', { params }),
  
  // NOWPayments specific methods
  createNOWPayments: (data: {
    amount: number;
    currency: string;
    description: string;
  }) => api.post('/payments/nowpayments/create', data),
};

// Subscriptions API
export const subscriptionsAPI = {
  getMySubscription: () => api.get('/subscriptions/me'),
  createSubscription: (data: {
    plan: 'premium' | 'vip';
    paypalSubscriptionId?: string;
  }) => api.post('/subscriptions', data),
  cancelSubscription: () => api.put('/subscriptions/cancel'),
  getSubscriptionHistory: () => api.get('/subscriptions/history'),
  checkPremiumStatus: () => api.get('/subscriptions/premium/check'),
};

// Questions API
export const questionsAPI = {
  getQuestions: (params?: {
    category?: string;
    limit?: number;
    offset?: number;
    weight?: number;
  }) => api.get('/questions', { params }),
  
  getQuestionById: (id: string) => api.get(`/questions/${id}`),
  
  getRandomQuestions: (count: number, params?: {
    category?: string;
    exclude?: string[];
  }) => api.get(`/questions/random/${count}`, { params }),
  
  submitAnswer: (questionId: string, data: { answer: any }) => 
    api.post(`/questions/${questionId}/answer`, data),
  
  getMyAnswers: () => api.get('/questions/answers/me'),
  
  getQuestionsByCategory: (category: string) => 
    api.get(`/questions/category/${category}`),
};

// Analytics API (for admin/user insights)
export const analyticsAPI = {
  getUserStats: () => api.get('/analytics/user-stats'),
  getMatchingStats: () => api.get('/analytics/matching-stats'),
  getEngagementStats: () => api.get('/analytics/engagement'),
};

// Admin API (for admin panel)
export const adminAPI = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/admin/users', { params }),
  getUserDetails: (userId: string) => api.get(`/admin/users/${userId}`),
  updateUser: (userId: string, data: any) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getSystemStats: () => api.get('/admin/stats'),
  getPayments: (params?: { page?: number; limit?: number }) => 
    api.get('/admin/payments', { params }),
  getReports: () => api.get('/admin/reports'),
};

export default api;