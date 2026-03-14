import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { profile } = useGamification();
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem('dark') === 'true');
  const [menu, setMenu] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    localStorage.setItem('dark', !dark);
    document.documentElement.classList.toggle('dark', !dark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenu(false);
  };

  const xpPercent = profile ? Math.min(100, ((profile.xpPoints || 0) % 100)) : 0;

  return (
    <nav className="w-full z-50 bg-white dark:bg-bgDark border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" className="font-heading text-primary text-xl font-bold">
            LearnIQ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                  <motion.div
                    className="h-full bg-accent rounded"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Lvl {profile?.level || 1}
                </span>
                {profile?.currentStreak > 0 && (
                  <span className="text-warning text-sm">🔥 {profile.currentStreak}</span>
                )}
              </div>
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {dark ? '☀️' : '🌙'}
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenu(!menu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 ring-primary"
                >
                  <img
                    src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                </button>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setMenu(false)}
                    >
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMenu(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-danger hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-primary font-medium">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
