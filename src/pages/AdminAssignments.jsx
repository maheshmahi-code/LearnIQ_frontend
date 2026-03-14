import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { assignmentsAPI, coursesAPI } from '../services/apiService';
import api from '../services/apiService';

export default function AdminAssignments() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    coursesAPI.getAll().then((res) => {
      setCourses(res.data.courses || []);
      if (res.data.courses?.length > 0) {
        setCourseId(res.data.courses[0]._id);
      }
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/assignments', {
        courseId,
        title,
        description,
        dueDate,
        maxScore
      });
      setMessage('✅ Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setMaxScore(100);
    } catch (error) {
      setMessage('❌ Failed to create assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-full bg-gray-50 dark:bg-gray-900">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="font-heading text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Manage Course Assignments</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Create New Assignment</h2>
            <p className="text-blue-100">Only users enrolled in the selected course will be able to see and submit this assignment.</p>
          </div>
          
          <form className="p-8 space-y-6" onSubmit={handleCreate}>
            {message && (
              <div className={`p-4 rounded-xl text-center font-bold ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">Target Course</label>
              <select 
                value={courseId} 
                onChange={(e) => setCourseId(e.target.value)} 
                required
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              >
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">Assignment Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="e.g. Build a REST API"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">Description / Instructions</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                rows="4" 
                placeholder="Detailed instructions for the assignment..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  required 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-2">Max Score</label>
                <input 
                  type="number" 
                  min="1" 
                  value={maxScore} 
                  onChange={(e) => setMaxScore(Number(e.target.value))} 
                  required 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-primary/30 mt-4"
            >
              {loading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
