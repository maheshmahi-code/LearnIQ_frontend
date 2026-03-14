import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gamificationAPI } from '../services/apiService';

export default function Leaderboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationAPI.getLeaderboard(50)
      .then((r) => setList(r.data.leaderboard || []))
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  // Determine highest XP to scale the stacked bar
  const maxXP = list.length > 0 ? Math.max(...list.map(u => u.totalXP)) : 1000;
  // Fallback top level threshold, assuming level 1 is 100XP, 2 is 300XP etc. Just for visual scaling.
  const visualMaxXP = maxXP < 500 ? 500 : maxXP + 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="p-6 min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-base sm:text-lg">
            See how you rank against <span className="font-bold text-primary">{list.length}</span> active learners worldwide.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <div className="col-span-1 text-center font-heading">Rank</div>
          <div className="col-span-4 lg:col-span-3">Learner</div>
          <div className="col-span-7 lg:col-span-8">Level Progression & XP</div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : list.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
            {list.map((row, idx) => {
              const isTop3 = idx < 3;
              const rankColor = idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                idx === 1 ? 'bg-gray-200 text-gray-600' : 
                                idx === 2 ? 'bg-orange-100 text-orange-700' : 
                                'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300';
              
              const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${row.rank}`;
              
              // Calculate width for horizontal bar.
              const percentage = Math.min((row.totalXP / visualMaxXP) * 100, 100);
              
              return (
                <motion.div 
                  key={row.studentId} 
                  variants={rowVariants}
                  className={`grid grid-cols-12 gap-2 sm:gap-4 items-center p-3 sm:p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/40 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 ${isTop3 ? 'shadow-sm' : ''}`}
                >
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg ${rankColor}`}>
                      {rankIcon}
                    </div>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4 lg:col-span-3 flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base">
                      {row.name ? row.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white capitalize truncate">{row.name || 'Anonymous'}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Lvl {row.level || 1}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-4 sm:col-span-7 lg:col-span-8 flex items-center gap-4">
                    {/* The Stacked Bar implementation - hidden on very small screens */}
                    <div className="hidden sm:block flex-grow h-3 sm:h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }}
                        className={`h-full relative rounded-full ${
                          idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                          idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                          idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 
                          'bg-gradient-to-r from-primary to-blue-500'
                        }`}
                      >
                         <div className="absolute inset-0 bg-white/20 w-1/4 skew-x-12"></div>
                      </motion.div>
                    </div>
                    
                    {/* Explicit XP text */}
                    <div className="flex-grow sm:flex-none sm:w-20 text-right font-bold text-xs sm:text-base text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {row.totalXP.toLocaleString()} <span className="text-[10px] sm:text-sm font-normal text-gray-500">XP</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No rankings yet</h3>
            <p className="text-gray-500">Be the first to complete a quiz and earn XP!</p>
          </div>
        )}
      </div>
    </div>
  );
}
