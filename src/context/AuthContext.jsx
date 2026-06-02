import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('namazly_user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (err) {
        console.error('Failed to parse cached user:', err);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('namazly_token');
    const cachedUser = localStorage.getItem('namazly_user');
    if (!token) return false;
    if (cachedUser) return false;
    return true;
  });

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('namazly_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        localStorage.removeItem('namazly_user');
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('namazly_user', JSON.stringify(data.user));
      } catch (err) {
        console.error('Session restoration failed:', err);
        // Only log out if it is an authorization error (401 or 403).
        // For network/server errors (like Render server timeout/cold-start), we do NOT log out the user.
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('namazly_token');
          localStorage.removeItem('namazly_user');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credential, accessToken) => {
    const payload = credential ? { credential } : { accessToken };
    const { data } = await api.post('/auth/google', payload);
    if (data.token) {
      localStorage.setItem('namazly_token', data.token);
    }
    setUser(data.user);
    localStorage.setItem('namazly_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API call failed:', err);
    }
    localStorage.removeItem('namazly_token');
    localStorage.removeItem('namazly_user');
    setUser(null);
  };

  const updateQazaRecord = useCallback((qazaRecord) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev, qazaRecord };
      localStorage.setItem('namazly_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateQazaRecord }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
