import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edutrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('edutrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('edutrack_theme') || 'light';
  });

  const toast = useToast();

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('edutrack_theme', theme);
  }, [theme]);

  // Load and verify profile on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('edutrack_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('edutrack_user', JSON.stringify(res.user));
            if (res.user.theme) {
              setTheme(res.user.theme);
            }
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          localStorage.removeItem('edutrack_token');
          localStorage.removeItem('edutrack_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('edutrack_token', res.token);
        localStorage.setItem('edutrack_user', JSON.stringify(res.user));
        if (res.user.theme) setTheme(res.user.theme);
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      return { success: false, error: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('edutrack_token', res.token);
        localStorage.setItem('edutrack_user', JSON.stringify(res.user));
        toast.success('Registration successful! Welcome to EduTrack.');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
    setUser(null);
    setToken(null);
    toast.info('Logged out securely.');
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('edutrack_user', JSON.stringify(res.user));
        if (updates.theme) setTheme(updates.theme);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      return { success: false, error: err.message };
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      updateProfile({ theme: newTheme });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        theme,
        login,
        register,
        logout,
        updateProfile,
        toggleTheme,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
