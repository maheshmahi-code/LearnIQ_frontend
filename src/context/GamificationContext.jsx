import React, { createContext, useContext, useState, useEffect } from 'react';
import { gamificationAPI } from '../services/apiService';
import { useAuth } from './AuthContext';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return setProfile(null);
    gamificationAPI
      .getProfile()
      .then((res) => setProfile(res.data.profile))
      .catch(() => setProfile(null));
  }, [user?.id]);

  const refresh = () => {
    if (user) gamificationAPI.getProfile().then((res) => setProfile(res.data.profile));
  };

  return (
    <GamificationContext.Provider value={{ profile, refresh }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext) ?? { profile: null, refresh: () => {} };
