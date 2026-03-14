import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsAPI } from '../services/apiService';
import { 
  CircularProgressChart, 
  ScoreDistributionChart, 
  PerformanceLineChart,
  BarChart
} from '../components/AnalyticsCharts';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getStudent()
      .then((r) => {
        setData(r.data.analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const scores = data?.quizScores || [];
  const recentEight = scores.slice(0, 8).reverse();
  const labels = recentEight.map((s) => new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const values = recentEight.map((s) => s.score);

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-primary to-blue-800 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 font-heading">Performance Analytics</h1>
              <p className="text-blue-100 max-w-lg">Track your learning progress, quiz scores, and course mastery through interactive insights.</p>
            </div>
            <div className="w-40 h-40 bg-white/10 rounded-3xl backdrop-blur-md p-4 flex flex-col items-center justify-center border border-white/20">
              <CircularProgressChart score={data?.overallScore || 0} title="Overall Mastery" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            label="Attempts & Submissions" 
            value={data?.totalAttempts || 0} 
            icon="🎯" 
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
          />
          <StatsCard 
            label="Average Score" 
            value={`${data?.overallScore || 0}%`} 
            icon="📈" 
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
          />
          <StatsCard 
            label="XP Points Gained" 
            value={data?.studentId?.xpPoints || 1250} 
            icon="✨" 
            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Main Chart Area */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 font-heading text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Recent Performance Trend
            </h3>
            <div className="h-72">
              {scores.length > 0 ? (
                <PerformanceLineChart labels={labels} data={values} />
              ) : (
                <EmptyChartPlaceholder />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 font-heading text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Score Distribution
            </h3>
            <div className="h-72">
              {data?.scoreDistribution ? (
                <ScoreDistributionChart distribution={data.scoreDistribution} />
              ) : (
                <EmptyChartPlaceholder />
              )}
            </div>
          </div>
        </div>

        {/* Detailed Records */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 font-heading text-gray-800 dark:text-white">Recent Quiz Attempts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Quiz/Assignment Name</th>
                  <th className="pb-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Type</th>
                  <th className="pb-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Date</th>
                  <th className="pb-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Score</th>
                  <th className="pb-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 font-medium dark:text-gray-200">{s.title || 'Untitled'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${s.type === 'Assignment' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {s.type || 'Quiz'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`font-bold ${s.score >= 80 ? 'text-emerald-500' : s.score >= 50 ? 'text-blue-500' : 'text-orange-500'}`}>
                        {s.score}%
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.score >= 50 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                        {s.score >= 50 ? 'PASSED' : 'RETAKE'}
                      </span>
                    </td>
                  </tr>
                ))}
                {scores.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-400 italic">No quiz attempts yet. Start learning to see your stats!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatsCard({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function EmptyChartPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
      <div className="text-4xl mb-2">📊</div>
      <p className="text-sm">Not enough data to display chart</p>
    </div>
  );
}
