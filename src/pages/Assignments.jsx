import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assignmentsAPI, coursesAPI } from '../services/apiService';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assnRes, coursesRes] = await Promise.all([
        assignmentsAPI.getAll(),
        coursesAPI.getAll({ enrolled: 'true' })
      ]);
      setAssignments(assnRes.data.assignments || []);
      
      const courses = coursesRes.data.courses || [];
      setEnrolledCourses(courses);
      if (courses.length > 0) setSelectedCourseId(courses[0]._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    
    setIsGenerating(true);
    setGenError('');
    try {
      await assignmentsAPI.generate({ courseId: selectedCourseId });
      setShowGenerator(false);
      fetchData(); // Refresh assignments list
    } catch (err) {
      setGenError(err.response?.data?.message || 'Failed to generate assignment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (id) => {
    setSubmittingId(id);
    try {
      await assignmentsAPI.submit(id, { attachments: [{ url: '#', name: 'Work.pdf' }] });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800/50';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/50';
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            📝 Assignments
          </h1>
          <p className="text-gray-500 mt-2">Test your knowledge with challenging assignments tailored to your courses.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(!showGenerator)}
          className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-accent/30 flex items-center gap-2"
        >
          <span>✨</span> Generate AI Assignment
        </motion.button>
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
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute left-0 bottom-0 -mb-10 -ml-10 opacity-10 text-9xl">🤖</div>
              <h2 className="text-2xl font-bold mb-2">Generate Smart Assignment</h2>
              <p className="text-purple-200 mb-6 max-w-2xl">
                Select an enrolled course, and our AI will read the course contents to generate a challenging, custom homework assignment based exactly on what you've learned.
              </p>
              
              {enrolledCourses.length > 0 ? (
                <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 relative z-10 w-full max-w-2xl">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white [&>option]:text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {enrolledCourses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
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
              ) : (
                <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-purple-200">
                  You are not enrolled in any courses yet. Go to Curriculum to enroll in one first!
                </div>
              )}
              {genError && <p className="text-red-300 mt-4 text-sm font-medium bg-red-900/40 p-3 rounded-lg border border-red-500/50 w-full max-w-2xl">{genError}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Assignments List */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
            Active Assignments
          </h2>
          {loading ? (
            <div>
              {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 animate-pulse h-32 border border-gray-100 dark:border-gray-700"></div>
              ))}
            </div>
          ) : assignments.filter(a => a.submissionStatus === 'pending').length > 0 ? (
             assignments.filter(a => a.submissionStatus === 'pending').map((a) => (
               <motion.div
                 key={a._id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4"
               >
                 <div className="flex-grow">
                   <div className="flex items-center gap-3 mb-2">
                     <span className="text-xs font-bold tracking-wider text-accent uppercase bg-accent/10 px-3 py-1 rounded-full">
                       {a.courseId?.title || 'Unknown Course'}
                     </span>
                     <span className={`text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${getStatusColor(a.submissionStatus)}`}>
                       PENDING
                     </span>
                   </div>
                   <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">{a.title}</h3>
                   <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{a.description}</p>
                   <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                     <div className="flex items-center gap-1">
                       <span>📅</span> Due: {new Date(a.dueDate).toLocaleDateString()}
                     </div>
                     <div className="flex items-center gap-1">
                       <span>🏆</span> Max Score: {a.maxScore}
                     </div>
                   </div>
                 </div>
                 
                 <div className="w-full">
                   <button
                     onClick={() => handleSubmit(a._id)}
                     disabled={submittingId === a._id}
                     className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                   >
                     {submittingId === a._id ? 'Submitting...' : 'Submit Work'}
                   </button>
                 </div>
               </motion.div>
             ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-700 shadow-sm mt-4">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active assignments</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                You're all caught up! Generate a new AI assignment to challenge yourself.
              </p>
            </div>
          )}
        </div>

        {/* Recently Completed Assignments List */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            Recently Completed Assignments
          </h2>
          {loading ? (
            <div>
              {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 animate-pulse h-32 border border-gray-100 dark:border-gray-700"></div>
              ))}
            </div>
          ) : assignments.filter(a => a.submissionStatus !== 'pending').length > 0 ? (
             assignments.filter(a => a.submissionStatus !== 'pending').slice(0, 10).map((a) => (
               <motion.div
                 key={a._id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4"
               >
                 <div className="flex-grow">
                   <div className="flex items-center gap-3 mb-2">
                     <span className="text-xs font-bold tracking-wider text-accent uppercase bg-accent/10 px-3 py-1 rounded-full">
                       {a.courseId?.title || 'Unknown Course'}
                     </span>
                     <span className={`text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${getStatusColor(a.submissionStatus)}`}>
                       {a.submissionStatus}
                     </span>
                   </div>
                   <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white mb-2">{a.title}</h3>
                   <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                     <div className="flex items-center gap-1">
                       <span>📅</span> Due: {new Date(a.dueDate).toLocaleDateString()}
                     </div>
                   </div>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                   {a.submissionStatus === 'graded' ? 'Your work has been graded' : 'Waiting for grading'}
                 </div>
               </motion.div>
             ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-700 shadow-sm mt-4">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No recent completions</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Complete your active assignments to see them here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
