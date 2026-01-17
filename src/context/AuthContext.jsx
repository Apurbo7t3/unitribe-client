import React, { createContext, useState, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Logging in with:', email);
      
      const response = await authService.login({ email, password });
      console.log('Login response:', response.data);
      
      if (response.data.access && response.data.refresh && response.data.user) {
        // Store tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Invalid response' };
    } catch (err) {
      const errMsg = err.response?.data?.error || 
                    err.response?.data?.detail || 
                    err.message || 
                    'Login failed';
      console.error('Login error:', errMsg);
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (data) => {
    try {
      setError(null);
      console.log('Registering with:', data);
      
      const response = await authService.register(data);
      console.log('Register response:', response.data);
      
      return { 
        success: true, 
        data: response.data,
        message: response.data.message || 'Registration successful! Check your email to verify your account.'
      };
    } catch (err) {
      let errMsg = 'Registration failed';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Handle validation errors
          const errors = err.response.data;
          if (errors.email) errMsg = errors.email;
          else if (errors.password) errMsg = errors.password;
          else if (errors.student_id) errMsg = errors.student_id;
          else if (errors.role) errMsg = errors.role;
          else errMsg = Object.values(errors)[0]?.[0] || JSON.stringify(errors);
        } else {
          errMsg = err.response.data;
        }
      }
      
      console.error('Register error:', errMsg);
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // Check if user is logged in on page load
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value = {
    user,
    error,
    setError,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!localStorage.getItem('access_token')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};