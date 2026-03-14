import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBotUI from '../components/ChatBotUI';
import { aiAPI } from '../services/apiService';
import { PerformanceLineChart } from '../components/AnalyticsCharts';
import WeaknessChart from '../components/WeaknessChart';
import { analyticsAPI, weaknessAPI, coursesAPI } from '../services/apiService';

export default function AIStudyAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  
  // Optional Insights
  const [showInsights, setShowInsights] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [weaknessReport, setWeaknessReport] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await aiAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectConv = async (id) => {
    try {
      const res = await aiAPI.getConversation(id);
      setActiveConv(res.data.conversation);
      setShowInsights(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await aiAPI.createConversation();
      setActiveConv(res.data.conversation);
      fetchHistory();
      setShowInsights(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConv = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this doubt?')) return;
    try {
      await aiAPI.deleteConversation(id);
      if (activeConv?._id === id) setActiveConv(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleInsights = async () => {
    if (!showInsights) {
      try {
        const [aRes, cRes] = await Promise.all([
          analyticsAPI.getStudent(),
          coursesAPI.getAll({ enrolled: 'true' })
        ]);
        setAnalyticsData(aRes.data.analytics);
        const enrolled = cRes.data.courses || [];
        setCourses(enrolled);
        if (enrolled.length > 0 && !selectedCourseId) {
          setSelectedCourseId(enrolled[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setShowInsights(!showInsights);
  };

  useEffect(() => {
    if (showInsights && selectedCourseId) {
      weaknessAPI.getReport(null, selectedCourseId)
        .then(res => setWeaknessReport(res.data.report))
        .catch(err => console.error(err));
    }
  }, [showInsights, selectedCourseId]);

  const scores = analyticsData?.quizScores || [];
  const recentEight = scores.slice(0, 8).reverse();
  const labels = recentEight.map((s) => new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const values = recentEight.map((s) => s.score);

  return (
    <div className="p-0 h-full bg-gray-50 dark:bg-gray-900 overflow-hidden flex relative">
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Chat History */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 640 ? '280px' : '320px') : 0, 
          opacity: isSidebarOpen ? 1 : 0,
          x: (isSidebarOpen || window.innerWidth > 1024) ? 0 : -320 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className={`fixed lg:static inset-y-0 left-0 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-800 overflow-hidden flex flex-col z-40 transition-shadow ${isSidebarOpen ? 'shadow-2xl lg:shadow-none' : ''}`}
      >
        <div className="p-5 sm:p-6 w-72 sm:w-80 flex-shrink-0">
          <button 
            onClick={() => { handleNewChat(); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 sm:py-4 rounded-2xl mb-6 sm:mb-10 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> New Chat
          </button>

          <h3 className="text-[10px] sm:text-xs font-black uppercase text-gray-400 tracking-widest mb-4 ml-2">Recent Doubts</h3>
          
          <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(100vh-20rem)] sm:max-h-[calc(100vh-22rem)] pr-2 custom-scrollbar">
            {conversations.length > 0 ? conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => { handleSelectConv(c._id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all group relative ${
                  activeConv?._id === c._id 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' 
                    : 'bg-transparent border-gray-50 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-bold truncate ${activeConv?._id === c._id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {c.lastMessage}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-medium italic">
                      {new Date(c.lastMessageAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteConv(e, c._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                    title="Delete Doubt"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </button>
            )) : (
              <p className="text-center text-xs text-gray-400 py-10 italic">No previous chats</p>
            )}
          </div>

          <button 
            onClick={() => { toggleInsights(); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className={`mt-10 sm:mt-12 w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              showInsights 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span>📉</span> {showInsights ? 'Hide Insights' : 'Show Insights'}
          </button>
        </div>
      </motion.div>

      {/* Main Area: Chat */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="flex items-center gap-4 p-4 border-b dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
             title={isSidebarOpen ? "Minimize Sidebar" : "Expand Sidebar"}
           >
             {isSidebarOpen ? '⬅️' : '📂'}
           </button>
           <h2 className="font-bold text-gray-800 dark:text-white">
             {activeConv ? "Developing Doubt" : "Ask Anything"}
           </h2>
        </div>

        <div className="flex-1 min-h-0 bg-white dark:bg-gray-900">
           <ChatBotUI 
              conversationId={activeConv?._id} 
              initialMessages={activeConv?.messages} 
           />
        </div>

        {/* Floating Toggle for Insights when Sidebar is closed */}
        {!isSidebarOpen && !showInsights && (
          <button 
            onClick={toggleInsights}
            className="absolute bottom-20 right-4 sm:bottom-24 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-gray-800 shadow-xl rounded-full flex items-center justify-center text-lg sm:text-xl hover:scale-110 active:scale-95 transition-all z-20 border border-gray-100 dark:border-gray-700"
          >
            📊
          </button>
        )}
      </div>

      {/* Slide-out Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed lg:absolute top-0 right-0 w-full sm:w-96 h-full bg-white dark:bg-gray-800 shadow-2xl z-50 border-l dark:border-gray-700 overflow-y-auto p-5 sm:p-8"
          >
            <div className="flex justify-between items-center mb-10 mt-14 sm:mt-0">
               <h2 className="text-2xl font-black font-heading dark:text-white flex items-center gap-2">
                 <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                 Detailed Insights
               </h2>
               <button onClick={() => setShowInsights(false)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-10">
              <section>
                 <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <span className="text-lg">📈</span> Performance Trend
                 </h4>
                 <div className="h-48">
                    {values.length > 0 ? (
                      <PerformanceLineChart labels={labels} data={values} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-700/30 rounded-2xl">Not enough data</div>
                    )}
                 </div>
              </section>

              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                       <span className="text-lg">🔭</span> Learning Gaps
                    </h4>
                    {courses.length > 0 && (
                      <select 
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="text-[10px] bg-gray-50 dark:bg-gray-700 border-none rounded-lg font-bold px-2 py-1 outline-none"
                      >
                        {courses.map(c => (
                          <option key={c._id} value={c._id}>{c.title.slice(0, 10)}...</option>
                        ))}
                      </select>
                    )}
                 </div>
                 <div className="h-48">
                    <WeaknessChart weakSubtopics={weaknessReport?.weakSubtopics || []} />
                 </div>
              </section>

              <section className="bg-gradient-to-br from-primary to-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-primary/20">
                 <h5 className="font-bold flex items-center gap-2 mb-2">
                   <span>⚡</span> Study Recommendation
                 </h5>
                 <p className="text-xs text-blue-50 opacity-90 leading-relaxed">
                   Focus your next question on <span className="font-black">"{weaknessReport?.weakSubtopics?.[0]?.subtopic || 'core concepts'}"</span> to maximize your progress today.
                 </p>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
