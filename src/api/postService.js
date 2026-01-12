// src/api/postService.js


import api from './axiosConfig';

export const postService = {
  // Get all posts with optional filters
  getAll: (params = {}) => api.get('/api/posts/', { params }),

  // Get user's personalized feed
  getFeed: () => api.get('/api/posts/feed/'),

  // Get single post by ID
  getById: (id) => api.get(`/api/posts/${id}/`),

  // Create new post
  create: (data) => {
    // Handle file upload with FormData
    if (data.file) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('post_type', data.post_type || 'general');
      if (data.club) formData.append('club', data.club);
      if (data.file) formData.append('file', data.file);
      
      return api.post('/api/posts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    // Regular JSON request for text-only posts
    return api.post('/api/posts/', data);
  },

  // Update post
  update: (id, data) => {
    if (data.file) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.content) formData.append('content', data.content);
      if (data.post_type) formData.append('post_type', data.post_type);
      if (data.club) formData.append('club', data.club);
      if (data.file) formData.append('file', data.file);
      
      return api.patch(`/api/posts/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    return api.patch(`/api/posts/${id}/`, data);
  },

  // Delete post
  delete: (id) => api.delete(`/api/posts/${id}/`),

  // Like a post
  like: (id) => api.post(`/api/posts/${id}/like/`),

  // Unlike a post
  unlike: (id) => api.post(`/api/posts/${id}/unlike/`),

  // Add comment
  addComment: (id, data) => api.post(`/api/posts/${id}/comments/`, data),

  // Delete comment
  deleteComment: (postId, commentId) => 
    api.delete(`/api/posts/${postId}/comments/${commentId}/`),
};