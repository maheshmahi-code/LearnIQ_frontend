import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.token) localStorage.setItem('token', res.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.token) localStorage.setItem('token', res.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async (data) => {
    const res = await authAPI.google(data);
    if (res.token) localStorage.setItem('token', res.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await authAPI.me();
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, googleLogin, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
