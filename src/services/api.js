// src/services/api.js
import axios from 'axios';

// 🔹 FIX for VITE: use import.meta.env.VITE_API_URL instead of process.env.REACT_APP_API_URL
const API_URL ='http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =================== AUTH SERVICES ===================
export const authService = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }),
  
  // ✅ Verify email
  verifyEmail: (token) => api.post('/auth/verify-email/', { token }),

  // ✅ Resend verification email
  resendVerification: (email) => api.post('/auth/resend-verification/', { email }),

  passwordReset: (email) => api.post('/auth/password-reset/', { email }),
  passwordResetConfirm: (data) => api.post('/auth/password-reset-confirm/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  
  // Add token refresh endpoint
  tokenRefresh: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// =================== NOTIFICATION SERVICES ===================
export const notificationService = {
  getAll: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-as-read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-as-read/'),
};

// =================== OTHER SERVICES ===================
export const userService = {
  search: (params) => api.get('/auth/search/', { params }),
  getConnections: () => api.get('/auth/connections/'),
  
  // Add user by ID endpoint
  getById: (id) => api.get(`/auth/users/${id}/`),
};

// =================== CLUB SERVICES ===================
export const clubService = {
  // Clubs
  getAll: (params) => api.get('/clubs/', { params }),
  getMyClubs: () => api.get('/clubs/my-clubs/'),
  getById: (id) => api.get(`/clubs/${id}/`),
  create: (data) => {
    // Handle FormData for club logo/banner uploads
    if (data instanceof FormData) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return api.post('/clubs/', data, config);
    }
    return api.post('/clubs/', data);
  },
  update: (id, data) => {
    // Handle FormData for updates
    if (data instanceof FormData) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return api.patch(`/clubs/${id}/`, data, config);
    }
    return api.patch(`/clubs/${id}/`, data);
  },
  delete: (id) => api.delete(`/clubs/${id}/`),
  
  // Membership
  join: (id, data = {}) => api.post(`/clubs/${id}/join/`, data), // Add message parameter support
  leave: (id) => api.post(`/clubs/${id}/leave/`),
  getMembers: (id) => api.get(`/clubs/${id}/members/`),
  
  // Membership Requests
  getMembershipRequests: (id) => api.get(`/clubs/${id}/membership-requests/`),
  processMembershipRequest: (clubId, requestId, action) =>
    api.post(`/clubs/${clubId}/membership-requests/${requestId}/process/`, { action }),
  
  // Club Roles
  getRoles: (clubId) => api.get(`/clubs/${clubId}/roles/`),
  assignRole: (clubId, data) => api.post(`/clubs/${clubId}/roles/`, data),
  updateRole: (clubId, roleId, data) => api.patch(`/clubs/${clubId}/roles/${roleId}/`, data),
  deleteRole: (clubId, roleId) => api.delete(`/clubs/${clubId}/roles/${roleId}/`),
  
  // Admin endpoints
  getPendingClubs: () => api.get('/clubs/admin/pending/'),
  approveClub: (clubId, reason = '') => 
    api.post(`/clubs/admin/${clubId}/approve/`, { action: 'approve', reason }),
  rejectClub: (clubId, reason = '') => 
    api.post(`/clubs/admin/${clubId}/approve/`, { action: 'reject', reason }),
};

// =================== EVENT SERVICES ===================
export const eventService = {
  // Events
  getAll: (params) => api.get('/events/', { params }),
  getUpcoming: () => api.get('/events/upcoming/'),
  getMyEvents: () => api.get('/events/my-events/'),
  getById: (id) => api.get(`/events/${id}/`),
  create: (data) => api.post('/events/', data),
  update: (id, data) => api.patch(`/events/${id}/`, data),
  delete: (id) => api.delete(`/events/${id}/`),
  
  // RSVP
  rsvp: (id) => api.post(`/events/${id}/rsvp/`),
  cancelRsvp: (id) => api.post(`/events/${id}/cancel-rsvp/`),
  
  // Reminders (add these new endpoints)
  getReminders: (eventId) => api.get(`/events/${eventId}/reminders/`),
  setReminder: (eventId, reminder_time) => 
    api.post(`/events/${eventId}/reminders/`, { reminder_time }),
  
  // Analytics (add this new endpoint)
  getAnalytics: (eventId) => api.get(`/events/${eventId}/analytics/`),
};

// =================== POST SERVICES ===================
export const postService = {
  getAll: (params) => api.get('/posts/', { params }),
  getFeed: () => api.get('/posts/feed/'),
  getById: (id) => api.get(`/posts/${id}/`),
  
  create: (data) => {
    // Handle FormData for file uploads
    if (data instanceof FormData) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return api.post('/posts/', data, config);
    }
    return api.post('/posts/', data);
  },
  
  update: (id, data) => {
    // Handle FormData for updates
    if (data instanceof FormData) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return api.patch(`/posts/${id}/`, data, config);
    }
    return api.patch(`/posts/${id}/`, data);
  },
  
  delete: (id) => api.delete(`/posts/${id}/`),
  like: (id) => api.post(`/posts/${id}/like/`),
  unlike: (id) => api.post(`/posts/${id}/unlike/`),
  
  addComment: (id, data) => {
    console.log(`Making comment request to: /posts/${id}/comments/`);
    console.log('Comment data:', data);
    
    // Make sure we're sending JSON
    return api.post(`/posts/${id}/comments/`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
  
  deleteComment: (postId, commentId) => 
    api.delete(`/posts/${postId}/comments/${commentId}/`),
};

// =================== MESSAGING SERVICES ===================
export const messagingService = {
  getConversations: () => api.get('/messaging/conversations/'),
  getConversation: (id) => api.get(`/messaging/conversations/${id}/`),
  createConversation: (data) => api.post('/messaging/conversations/', data),
  getMessages: (conversationId) => api.get(`/messaging/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, data) =>
    api.post(`/messaging/conversations/${conversationId}/messages/`, data),
  markAllAsRead: (conversationId) =>
    api.post(`/messaging/conversations/${conversationId}/mark-all-read/`),
  
  // Add participant management endpoints
  addParticipant: (conversationId, participantId) =>
    api.post(`/messaging/conversations/${conversationId}/add-participant/`, { participant_id: participantId }),
  removeParticipant: (conversationId, participantId) =>
    api.post(`/messaging/conversations/${conversationId}/remove-participant/`, { participant_id: participantId }),
  
  // Add search endpoint
  searchConversations: (search) => 
    api.get('/messaging/conversations/search/', { params: { search } }),
  
  // Add settings endpoint
  getSettings: () => api.get('/messaging/settings/'),
  updateSettings: (data) => api.patch('/messaging/settings/', data),
};

export default api;