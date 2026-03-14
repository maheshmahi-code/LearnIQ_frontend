import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { quizAPI, coursesAPI, analyticsAPI } from '../services/apiService';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [recentAttempts, setRecentAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    coursesAPI.getAll({ enrolled: 'true' }).then((r) => {
      const courses = r.data.courses || [];
      setEnrolledCourses(courses);
    });
    analyticsAPI.getStudent().then((r) => {
      // Filter out only Quizzes
      const qs = (r.data.analytics?.quizScores || []).filter(s => s.type !== 'Assignment');
      setRecentAttempts(qs.slice(0, 5));
    }).catch(() => {});
  }, []);

  // Update topic automatically if a course is selected
  useEffect(() => {
    if (selectedCourseId) {
      const course = enrolledCourses.find((c) => c._id === selectedCourseId);
      if (course) setTopic(course.title);
    }
  }, [selectedCourseId, enrolledCourses]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const { data } = await quizAPI.generate({
        topic: topic.trim(),
        difficulty,
        questionCount: count,
        courseId: selectedCourseId || undefined,
      });
      navigate(`/quiz-play/${data.quiz._id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to generate quiz. The AI might be busy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-gradient-to-br from-indigo-600 via-primary to-blue-600 rounded-t-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 text-[180px] leading-none pointer-events-none">🧠</div>
          <div className="relative z-10">
            <h1 className="font-heading text-4xl font-extrabold mb-3">AI Quiz Generator</h1>
            <p className="text-blue-100 text-lg max-w-lg leading-relaxed">
              Challenge yourself. Select an enrolled course or enter a custom topic, and our AI will build a personalized assessment based on your precise weaknesses and skill level.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-b-3xl p-8 md:p-10 shadow-xl border border-t-0 border-gray-100 dark:border-gray-700">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {enrolledCourses.length > 0 && (
              <div>
                <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Target Course (Optional)
                </label>
                <div className="relative">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium transition-all"
                  >
                    <option value="">-- Manual Topic --</option>
                    {enrolledCourses.map(c => (
                      <option key={c._id} value={c._id}>{c.title} ({c.category})</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">
                Quiz Topic <span className="text-red-500">*</span>
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Algebra, Photosynthesis, Thermodynamics"
                required
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Difficulty Level
                </label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium transition-all"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Number of Questions: <span className="text-primary">{count}</span>
                </label>
                <div className="pt-3 pb-1 px-1">
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-semibold">
                    <span>5 Qs</span>
                    <span>15 Qs</span>
                    <span>30 Qs</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full mt-4 bg-primary hover:bg-blue-600 text-white py-5 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating AI Quiz...
                </>
              ) : (
                <>
                  <span>⚡</span> Generate Mastery Quiz
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Recent Attempts Section */}
        {recentAttempts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 w-full"
          >
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-primary">🕒</span> Recent Quiz Attempts
            </h2>
            <div className="space-y-4">
              {recentAttempts.map((attempt, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{attempt.title || 'Untitled Quiz'}</h3>
                    <p className="text-sm text-gray-500">{new Date(attempt.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-lg font-bold ${attempt.score >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {attempt.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/analytics')}
                className="text-primary font-bold hover:underline"
              >
                View full history ➔
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
