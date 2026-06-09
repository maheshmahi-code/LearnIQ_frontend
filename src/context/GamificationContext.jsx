import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

  const refresh = useCallback(() => {
    if (user) gamificationAPI.getProfile().then((res) => setProfile(res.data.profile));
  }, [user]);

  const value = useMemo(() => ({ profile, refresh }), [profile, refresh]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext) ?? { profile: null, refresh: () => {} };
