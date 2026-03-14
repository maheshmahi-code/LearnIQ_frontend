import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const CATEGORIES = [
  { id: '1-10', label: 'Classes 1st to 10th', icon: '🎒' },
  { id: 'intermediate', label: 'Intermediate (11-12th)', icon: '🏫' },
  { id: 'btech', label: 'B.Tech / Engineering', icon: '🎓' },
  { id: 'technology', label: 'Technologies & Tools', icon: '💻' },
  { id: 'other', label: 'Other Skills', icon: '🌟' }
];

export default function Curriculum() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);
  
  // AI Generator state
  const [showGenerator, setShowGenerator] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genDifficulty, setGenDifficulty] = useState('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const fetchCourses = () => {
    setLoading(true);
    coursesAPI.getAll({ category: activeCategory })
      .then((r) => setCourses(r.data.courses || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [activeCategory]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genTopic.trim()) return;
    
    setIsGenerating(true);
    setGenError('');
    try {
      const res = await coursesAPI.generate({
        topic: genTopic,
        category: activeCategory,
        difficulty: genDifficulty
      });
      await refreshUser();
      navigate(`/curriculum/${res.data.course._id}`);
    } catch (err) {
      setGenError(err.response?.data?.message || 'Failed to generate course. The AI might be busy.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-4 px-2 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            📚 Global Curriculum
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Explore academics and technologies or generate a custom AI curriculum.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(!showGenerator)}
          className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-accent/30 flex items-center gap-2"
        >
          <span>✨</span> Generate AI Course
        </motion.button>
      </div>

      {/* Categories Bar */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-6 hide-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg sm:text-xl">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* AI Generator Panel */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 text-9xl">✨</div>
              <h2 className="text-2xl font-bold mb-2">Build a Custom Course with AI</h2>
              <p className="text-blue-200 mb-6 max-w-2xl">
                Enter a topic to dynamically generate a fully fleshed-out curriculum using our AI. We'll automatically build the modules, subtopics, and lesson content for you.
              </p>
              
              <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 relative z-10">
                <input
                  type="text"
                  placeholder="e.g. 10th Grade Polynomials, Rust Programming, Quantum Physics"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="flex-grow bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white [&>option]:text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-accent hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center min-w-[160px]"
                >
                  {isGenerating ? (
                    <span className="animate-pulse flex items-center gap-2">Generating...</span>
                  ) : (
                    'Generate Now'
                  )}
                </button>
              </form>
              {genError && <p className="text-red-300 mt-4 text-sm font-medium bg-red-900/40 p-3 rounded-lg border border-red-500/50">{genError}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-72 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-100 dark:border-gray-700"></div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm mt-4">
          <div className="text-6xl mb-4">🏜️</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            It looks like this section is empty. Be the first to generate a curriculum for "{CATEGORIES.find(c => c.id === activeCategory)?.label}" using our AI Course Generator!
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Create from AI Prompt
          </button>
        </div>
      )}
    </div>
  );
}
