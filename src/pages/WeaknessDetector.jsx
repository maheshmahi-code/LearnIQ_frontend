import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { weaknessAPI, coursesAPI, quizAPI } from '../services/apiService';
import WeaknessChart from '../components/WeaknessChart';

export default function WeaknessDetector() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    coursesAPI.getAll({ enrolled: 'true' }).then((res) => {
      const courses = res.data.courses || [];
      setEnrolledCourses(courses);
      if (courses.length > 0) {
        setSelectedCourseId(courses[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      setLoading(true);
      setPrediction(null);
      weaknessAPI.getReport(null, selectedCourseId)
        .then((r) => setReport(r.data.report))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setReport(null);
    }
  }, [selectedCourseId]);

  const handlePredict = async () => {
    if (!report || report.weakSubtopics.length === 0) return;
    setPredicting(true);
    try {
      const subScores = {};
      report.weakSubtopics.forEach(w => {
        subScores[w.subtopic] = w.accuracyRate;
      });
      
      const res = await weaknessAPI.predictScore({
        subtopic_scores: subScores,
        study_hours: 5, // Default estimate
        attempt_count: report.weakSubtopics.reduce((acc, w) => acc + w.attemptCount, 0)
      });
      setPrediction(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  const handleTargetedPractice = async () => {
    if (!report || report.weakSubtopics.length === 0) return;
    setGeneratingQuiz(true);
    try {
      const topicString = report.weakSubtopics.map(w => w.subtopic).join(', ');
      const res = await quizAPI.generate({
        topic: `Weak Areas: ${topicString}`,
        courseId: selectedCourseId,
        questionCount: 15,
        difficulty: 'medium'
      });
      navigate(`/quiz-play/${res.data.quiz._id}`);
    } catch (err) {
      alert('Failed to generate targeted quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const getMetricColor = (val) => {
    if (val < 0.4) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (val < 0.7) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
  };

  const getProgressBarColor = (val) => {
    if (val < 0.4) return 'bg-red-500';
    if (val < 0.7) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white font-heading mb-2">
              Weakness Detector <span className="text-primary text-2xl">⚡</span>
            </h1>
            <p className="text-gray-500">AI-powered analysis of your learning gaps and personalized recovery plans.</p>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full md:w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
            >
              {enrolledCourses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
              {enrolledCourses.length === 0 && <option value="">No courses enrolled</option>}
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
               key="loading"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="py-20 flex flex-col items-center"
            >
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium">Analyzing your performance data...</p>
            </motion.div>
          ) : report && (report.weakSubtopics?.length > 0 || report.predictedScore) ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Data & Chart */}
              <div className="lg:col-span-2 space-y-8">
                {/* Accuracy Breakdown Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-6 font-heading text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                    Topic Proficiency Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {report.weakSubtopics.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-gray-50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-700/20">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-700 dark:text-gray-200 line-clamp-1">{item.subtopic}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${getMetricColor(item.accuracyRate)}`}>
                            {Math.round(item.accuracyRate * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.accuracyRate * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full ${getProgressBarColor(item.accuracyRate)}`}
                          ></motion.div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                          Based on {item.attemptCount} practice attempts
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="h-64 sm:h-80">
                    <WeaknessChart weakSubtopics={report.weakSubtopics} />
                  </div>
                </div>

                {/* Score Prediction Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2 font-heading italic">ML Score Prediction</h3>
                    <p className="text-indigo-100 mb-6 text-sm max-w-md">Our machine learning model analyzes your current subtopic mastery and predicts your final exam score if you continue at this pace.</p>
                    
                    {!prediction ? (
                      <button 
                        onClick={handlePredict}
                        disabled={predicting}
                        className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {predicting ? 'Calculating Probabilities...' : 'Predict My Final Score'}
                      </button>
                    ) : (
                      <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex items-center justify-center p-4 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md">
                          <div className="text-center">
                            <span className="text-5xl font-black tracking-tighter">{prediction.predictedScore}%</span>
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Predicted Score</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-medium"><span className="font-black text-amber-300">💡 Tip:</span> {prediction.improvementTips?.[0] || 'Focus more on weak areas to boost this score by ~15%.'}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold opacity-60">Confidence Level:</span>
                            <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-400" style={{ width: `${(prediction.confidence || 0.85) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Targeted Practice & Study Plan */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                    <span className="text-2xl">🏗️</span> Targeted Action
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 font-medium">
                    Our AI has identified specific patterns in your errors. Boost your accuracy by taking a quiz focused only on these topics.
                  </p>
                  <button 
                    onClick={handleTargetedPractice}
                    disabled={generatingQuiz}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    {generatingQuiz ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Crafting Quiz...</span>
                      </>
                    ) : (
                      <>
                        <span>🎯</span>
                        <span>Start Targeted Practice</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 lg:sticky lg:top-20">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold font-heading text-gray-800 dark:text-white">AI Learning Path</h3>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">Step-by-Step</span>
                  </div>

                  <div className="space-y-6">
                    {report.studyPlanGenerated?.length > 0 ? (
                      report.studyPlanGenerated.map((step, i) => (
                        <div key={i} className="relative pl-10 group">
                          {/* Timeline connector */}
                          {i < report.studyPlanGenerated.length - 1 && (
                            <div className="absolute top-8 left-[19px] bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700 group-hover:bg-primary/30 transition-colors"></div>
                          )}
                          
                          {/* Step circle */}
                          <div className="absolute top-0 left-0 w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-400 font-black z-10 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                            {i + 1}
                          </div>
                          
                          <div className="pt-2">
                             <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                               {step}
                             </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 opacity-40">
                         <span className="text-4xl mb-2 block">🗓️</span>
                         <p className="text-sm font-bold">Complete 3+ quizzes to build your roadmap</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="empty"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Insufficient Performance Data</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                To identify your learning gaps, we need you to complete more quizzes for the course <span className="text-primary font-bold">"{enrolledCourses.find(c => c._id === selectedCourseId)?.title}"</span>.
              </p>
              <button 
                onClick={() => navigate('/quiz-generator')}
                className="bg-primary text-white font-bold py-4 px-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Go to Quiz Lab
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
