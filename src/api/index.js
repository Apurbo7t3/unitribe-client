// src/api/index.js


import api from './axiosConfig';

// Export API instance
export default api;

// Auth service (if not already created)
export const authService = {
  login: (email, password) => api.post('/api/auth/login/', { email, password }),
  register: (userData) => api.post('/api/auth/register/', userData),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
  logout: () => api.post('/api/auth/logout/', { 
    refresh: localStorage.getItem('refresh_token') 
  }),
  verifyEmail: (token) => api.post('/api/auth/verify-email/', { token }),
};

// Post service
export const postService = {
  getAll: (params = {}) => api.get('/api/posts/', { params }),
  getFeed: () => api.get('/api/posts/feed/'),
  getById: (id) => api.get(`/api/posts/${id}/`),
  
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/api/posts/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/api/posts/', data);
  },
  
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`/api/posts/${id}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.patch(`/api/posts/${id}/`, data);
  },
  
  delete: (id) => api.delete(`/api/posts/${id}/`),
  like: (id) => api.post(`/api/posts/${id}/like/`),
  unlike: (id) => api.post(`/api/posts/${id}/unlike/`),
  addComment: (id, data) => api.post(`/api/posts/${id}/comments/`, data),
  deleteComment: (postId, commentId) => 
    api.delete(`/api/posts/${postId}/comments/${commentId}/`),
};

// Club service
export const clubService = {
  getAll: (params = {}) => api.get('/api/clubs/', { params }),
  getById: (id) => api.get(`/api/clubs/${id}/`),
  create: (data) => api.post('/api/clubs/', data),
  update: (id, data) => api.patch(`/api/clubs/${id}/`, data),
  delete: (id) => api.delete(`/api/clubs/${id}/`),
  join: (id) => api.post(`/api/clubs/${id}/join/`),
  leave: (id) => api.post(`/api/clubs/${id}/leave/`),
  getMembers: (id) => api.get(`/api/clubs/${id}/members/`),
  getMyClubs: () => api.get('/api/clubs/my-clubs/'),
};

// Event service
export const eventService = {
  getAll: (params = {}) => api.get('/api/events/', { params }),
  getById: (id) => api.get(`/api/events/${id}/`),
  create: (data) => api.post('/api/events/', data),
  update: (id, data) => api.patch(`/api/events/${id}/`, data),
  delete: (id) => api.delete(`/api/events/${id}/`),
  rsvp: (id) => api.post(`/api/events/${id}/rsvp/`),
  cancelRsvp: (id) => api.post(`/api/events/${id}/cancel-rsvp/`),
  getUpcoming: () => api.get('/api/events/upcoming/'),
  getMyEvents: () => api.get('/api/events/my-events/'),
};

// Notification service
export const notificationService = {
  getAll: () => api.get('/api/notifications/'),
  getUnreadCount: () => api.get('/api/notifications/unread-count/'),
  markAsRead: (id) => api.post(`/api/notifications/${id}/mark-as-read/`),
  markAllAsRead: () => api.post('/api/notifications/mark-all-as-read/'),
};


