import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notesAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const STANDARDS = [
  'All', '1st to 10th', 'Intermediate', 'B.Tech', 'Engineering', 'Medical', 'Arts', 'Science', 'Others'
];

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStandard, setFilterStandard] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    standard: '1st to 10th',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await notesAPI.getAll({ search: searchTerm, standard: filterStandard });
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStandard]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.subject) {
      alert('Please provide both a subject and a PDF file.');
      return;
    }

    if (formData.file.type !== 'application/pdf' && !formData.file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed.');
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('standard', formData.standard);
    data.append('file', formData.file);

    try {
      const res = await notesAPI.upload(data);
      if (res.data.success) {
        setFormData({ subject: '', standard: '1st to 10th', file: null });
        setShowUpload(false);
        fetchNotes();
        alert('Notes uploaded successfully! 🎉');
      } else {
        alert('Upload failed: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upload notes. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this note?')) return;
    try {
      await notesAPI.delete(id);
      fetchNotes();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-heading mb-2 flex items-center gap-3">
            <span className="text-4xl">🗒️</span> PDF Study Notes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Collaborative note-sharing platform for all departments and standards.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUpload(!showUpload)}
          className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          {showUpload ? '✕ Close Form' : '➕ Upload My Notes'}
        </motion.button>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-10 overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl border border-primary/10 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Enter Note Details
              </h3>
              <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1">Subject Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Physics, Data Structures"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1">Standard / Grade</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary transition-all dark:text-white"
                    value={formData.standard}
                    onChange={(e) => setFormData({...formData, standard: e.target.value})}
                  >
                    {STANDARDS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2 ml-1">PDF File</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-accent hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                  >
                    {isUploading ? '📤 Uploading to Cloudinary...' : 'Confirm & Share Notes'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by subject name..."
            className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white dark:bg-gray-800 border-none shadow-sm rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
          value={filterStandard}
          onChange={(e) => setFilterStandard(e.target.value)}
        >
          {STANDARDS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Standards' : s}</option>)}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => (
            <motion.div 
              key={note._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  {note.uploadedBy === user?.id && (
                    <button onClick={() => handleDelete(note._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">✕</button>
                  )}
                </div>
                <h4 className="font-bold text-lg dark:text-white mb-1 line-clamp-1">{note.subject}</h4>
                <p className="text-[10px] font-black uppercase text-accent tracking-widest mb-4">{note.standard}</p>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold">
                    {note.studentName?.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-500 truncate">{note.studentName}</span>
                </div>

                <a 
                  href={note.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full text-center py-3 bg-gray-50 dark:bg-gray-700 hover:bg-primary hover:text-white dark:text-white rounded-xl text-sm font-bold transition-all"
                >
                  View PDF Note
                </a>
              </div>
            </motion.div>
          ))}

          {notes.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <span className="text-6xl block mb-4 grayscale opacity-40">🌙</span>
              <h3 className="text-xl font-bold dark:text-white">No Notes Found</h3>
              <p className="text-gray-500">Be the first to share notes for this subject!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
