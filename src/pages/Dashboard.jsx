import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { coursesAPI, analyticsAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import CourseCard from '../components/CourseCard';
import { CircularProgressChart } from '../components/AnalyticsCharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useGamification();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    coursesAPI.getAll({ enrolled: 'true' }).then((r) => setCourses(r.data.courses || []));
    analyticsAPI.getStudent().then((r) => setAnalytics(r.data.analytics)).catch(() => {});
  }, []);

  const progMap = {};
  (user?.learningProgress || []).forEach((p) => {
    progMap[p.courseId] = p.percentComplete;
  });

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'Student'}! 👋</h1>
        <p className="text-gray-500 mt-1">Here is what's happening with your learning today.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-3xl shadow-inner">
              🔥
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{profile?.currentStreak || 0}</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Day streak</p>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-3xl shadow-inner">
              ⭐
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{profile?.xpPoints || 0}</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Total XP</p>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-3xl shadow-inner">
              📊
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{analytics?.overallScore ?? '0'}%</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Avg score</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">My Enrolled Courses</h2>
            <Link to="/curriculum" className="text-sm font-semibold text-primary hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {courses.map((c) => (
              <motion.div
                key={c._id}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <Link to={`/curriculum-course/${c._id}`} className="block h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-center transition-all hover:shadow-md hover:border-primary/30 min-h-[120px]">
                    <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors text-center">
                      {c.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 text-center border border-blue-100 dark:border-blue-800/30">
                <span className="text-4xl mb-4 block">📚</span>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">No courses yet</h3>
                <p className="text-blue-700 dark:text-blue-300 mb-6">Explore the curriculum and enroll in a course to start learning!</p>
                <Link to="/curriculum" className="inline-block bg-primary text-white font-medium rounded-xl px-6 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link
                to="/quiz-generator"
                className="group relative overflow-hidden block bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-5 font-semibold shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span>Take a Quiz</span>
                  <span className="text-2xl group-hover:scale-125 transition-transform">❓</span>
                </div>
              </Link>
              
              <Link
                to="/ai-study-assistant"
                className="group relative overflow-hidden block bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-5 font-semibold shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span>Ask AI Tutor</span>
                  <span className="text-2xl group-hover:scale-125 transition-transform">🤖</span>
                </div>
              </Link>
              
              <Link
                to="/pdf-flashcards"
                className="group relative overflow-hidden block bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-5 font-semibold border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span>Generate AI Flashcards</span>
                  <span className="text-2xl group-hover:scale-125 transition-transform">📄</span>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-heading text-xl font-bold mb-4">Overall Score</h3>
            <div className="h-48 relative flex justify-center items-center">
              <CircularProgressChart score={analytics?.overallScore || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
