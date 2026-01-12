// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

// Custom hook to consume AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wrap in async function to avoid synchronous setState warning
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          // Verify token is still valid
          try {
            await authService.getProfile(); // optional, can remove if backend doesn't support
            setUser(JSON.parse(storedUser));
          } catch (err) {
            logout(); // invalid token
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      setError(null);
      const response = await authService.login({ email, password, role });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (data) => {
    try {
      setError(null);
      const response = await authService.register(data);

      if (response.status === 201) {
        // Auto-login after registration
        const { email, password, role } = data;
        return await login(email, password, role || 'student');
      }

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    setUser,
    error,
    setError, // ✅ included so Register.jsx works
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isFaculty: user?.role === 'faculty',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
