import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/curriculum', label: 'Curriculum', icon: '📚' },
  { to: '/assignments', label: 'Assignments', icon: '📝' },
  { to: '/quiz-generator', label: 'Quiz', icon: '❓' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/weakness-detector', label: 'Weakness', icon: '🎯' },
  { to: '/ai-study-assistant', label: 'AI Tutor', icon: '🤖' },
  { to: '/pdf-flashcards', label: 'Flashcards', icon: '🃏' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏅' },
  { to: '/community', label: 'Community', icon: '💬' },
  { to: '/notes', label: 'Notes', icon: '🗒️' },
];

export default function Sidebar({ isOpen, onClose }) {
  const loc = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        overflow-y-auto transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block flex-shrink-0
      `}>
        <nav className="p-4 space-y-1.5 pt-6 lg:pt-4">
          <div className="lg:hidden flex items-center justify-between mb-6 px-2">
            <span className="font-heading text-primary text-xl font-bold">Menu</span>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {links.map((l) => {
            const active = loc.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} onClick={() => { if(window.innerWidth < 1024) onClose(); }}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">{l.icon}</span>
                  <span className="font-medium">{l.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
