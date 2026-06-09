import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/apiService';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsAPI.getAdminOverview()
      .then((r) => setStats(r.data.stats))
      .catch(() => setStats({ totalStudents: 0, totalCourses: 0, totalQuizAttempts: 0 }));
  }, []);

  const cardVariants = {
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-heading tracking-tight">
          🛡️ Control Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage courses, review system metrics, and track student success metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/students">
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group cursor-pointer h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Total Students</p>
            <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">{stats?.totalStudents ?? '—'}</p>
            <span className="text-xs text-blue-500 font-semibold mt-4 block">Manage Students →</span>
          </motion.div>
        </Link>

        <Link to="/admin/courses">
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group cursor-pointer h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Courses</p>
            <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">{stats?.totalCourses ?? '—'}</p>
            <span className="text-xs text-emerald-500 font-semibold mt-4 block">Manage Curriculum →</span>
          </motion.div>
        </Link>

        <Link to="/admin/quizzes">
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group cursor-pointer h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Quiz Attempts</p>
            <p className="text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-heading">{stats?.totalQuizAttempts ?? '—'}</p>
            <span className="text-xs text-amber-500 font-semibold mt-4 block">Manage Assessments →</span>
          </motion.div>
        </Link>

        <Link to="/admin/performance">
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group cursor-pointer h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">System Telemetry</p>
            <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 font-heading">⚡ Active</p>
            <span className="text-xs text-purple-500 font-semibold mt-4 block">Audit Performance →</span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
