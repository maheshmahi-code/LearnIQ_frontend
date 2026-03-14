import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';

export default function Profile() {
  const { user } = useAuth();
  const { profile } = useGamification();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`}
          alt=""
          className="w-24 h-24 rounded-full mx-auto"
        />
        <h2 className="text-xl font-heading text-center mt-4">{user?.name}</h2>
        <p className="text-gray-500 text-center">{user?.email}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold">{profile?.xpPoints || 0}</p>
            <p className="text-sm text-gray-500">Total XP</p>
          </div>
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold">{profile?.level || 1}</p>
            <p className="text-sm text-gray-500">Level</p>
          </div>
        </div>
      </div>
    </div>
  );
}
