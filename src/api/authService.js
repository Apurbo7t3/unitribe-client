// src/api/authService.js


import axios from './axiosConfig.js';

// Auth service functions
export const authService = {
  async login(username, password) {
    try {
      const response = await axios.post('/auth/login/', { username, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Login failed' 
      };
    }
  },

  async register(userData) {
    try {
      const response = await axios.post('/auth/register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  },

  async getProfile() {
    try {
      const response = await axios.get('/auth/profile/');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to get profile' 
      };
    }
  },

  async updateProfile(userData) {
    try {
      const response = await axios.put('/auth/profile/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to update profile' 
      };
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: 'Token refresh failed' 
      };
    }
  }
};

// Local storage helpers
export const storage = {
  setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getTokens() {
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token')
    };
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};


