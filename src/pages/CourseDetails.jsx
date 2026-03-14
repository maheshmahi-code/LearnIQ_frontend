import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await coursesAPI.getOne(id);
        if (res.data.success) {
          setCourse(res.data.course);
        } else {
          setError('Failed to load course details.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching course.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 h-full bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center shadow-sm max-w-2xl mx-auto mt-20">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error || 'Course not found.'}</p>
          <button 
            onClick={() => navigate('/curriculum')}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-medium"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enroll(id);
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll.');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = user?.enrolledCourses?.some(cId => (cId._id || cId).toString() === id);

  if (!isEnrolled) {
    return (
      <div className="p-6 h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto">🛡️</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">You are not enrolled in this course yet</h2>
          <p className="text-gray-500 mb-8 text-lg">Enroll now to access all modules, lessons, and AI-powered assignments tailored to this curriculum.</p>
          <button 
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3"
          >
            {enrolling ? 'Enrolling...' : 'Enroll in Course Now'}
          </button>
          <button onClick={() => navigate('/curriculum')} className="mt-4 text-gray-500 hover:underline">Go back to Browse</button>
        </motion.div>
      </div>
    );
  }

  const currentModule = course.modules?.[activeModule];
  const currentLesson = currentModule?.lessons?.[activeLesson];

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar / Syllabus */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto flex-shrink-0 hide-scrollbar">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => navigate('/curriculum')} className="text-sm text-gray-500 hover:text-primary flex items-center gap-2 mb-4 transition-colors">
            <span>←</span> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{course.title}</h1>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>
        </div>

        <div className="p-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">Course Modules</h3>
          {course.modules?.map((mdl, mIdx) => (
            <div key={mIdx} className="mb-4">
              <div 
                className={`font-semibold text-sm mb-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeModule === mIdx ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => { setActiveModule(mIdx); setActiveLesson(0); }}
              >
                Module {mIdx + 1}: {mdl.title}
              </div>
              
              <AnimatePresence initial={false}>
                {activeModule === mIdx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    className="pl-4 border-l-2 border-gray-100 dark:border-gray-700 ml-5 overflow-hidden"
                  >
                    {mdl.lessons?.map((lsn, lIdx) => (
                      <div 
                        key={lIdx}
                        onClick={() => setActiveLesson(lIdx)}
                        className={`text-sm py-2 px-3 my-1 rounded-lg cursor-pointer transition-colors ${
                          activeLesson === lIdx
                            ? 'bg-accent/10 text-accent font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${activeLesson === lIdx ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                          <span className="truncate">{lsn.title}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-full relative scroll-smooth p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {currentLesson ? (
            <motion.div
              key={`${activeModule}-${activeLesson}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider text-xs">Module {activeModule + 1}</span>
                <span>•</span>
                <span>Lesson {activeLesson + 1}</span>
                {currentLesson.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">⏱️ {currentLesson.duration} mins</span>
                  </>
                )}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                {currentLesson.title}
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-blue-600 prose-img:rounded-2xl prose-img:shadow-md">
                <ReactMarkdown>{currentLesson.content || '*No content available for this lesson.*'}</ReactMarkdown>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <button
                  onClick={() => {
                    if (activeLesson > 0) setActiveLesson(activeLesson - 1);
                    else if (activeModule > 0) {
                      setActiveModule(activeModule - 1);
                      setActiveLesson(course.modules[activeModule - 1].lessons.length - 1);
                    }
                  }}
                  disabled={activeModule === 0 && activeLesson === 0}
                  className="px-6 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                
                <button
                  onClick={() => {
                    if (activeLesson < course.modules[activeModule].lessons.length - 1) {
                      setActiveLesson(activeLesson + 1);
                    } else if (activeModule < course.modules.length - 1) {
                      setActiveModule(activeModule + 1);
                      setActiveLesson(0);
                    }
                  }}
                  disabled={activeModule === course.modules.length - 1 && activeLesson === course.modules[activeModule].lessons.length - 1}
                  className="px-6 py-3 rounded-xl font-medium bg-primary text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                >
                  Next Lesson →
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>Select a lesson from the sidebar to start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
