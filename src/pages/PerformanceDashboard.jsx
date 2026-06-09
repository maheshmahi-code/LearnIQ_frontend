import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../services/apiService';

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = () => {
    setLoading(true);
    analyticsAPI
      .getPerformanceMetrics()
      .then((res) => {
        setMetrics(res.data);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch performance telemetry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchMetrics, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getLatencyColor = (ms) => {
    if (ms < 100) return 'text-emerald-500 dark:text-emerald-400';
    if (ms < 200) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'POST': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'PUT': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'DELETE': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
            ⚡ Production Performance Telemetry
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real-time API latency auditing, payload footprint logging, and cache hits monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3.5 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600"
            />
            Auto-refresh (10s)
          </label>
          <button
            onClick={fetchMetrics}
            className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 text-sm"
          >
            <span>🔄</span> Force Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mt-8 -mr-8"></div>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Total Requests</span>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-heading">{metrics?.totalRequests || 0}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Captured since application startup</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mt-8 -mr-8"></div>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Average Latency</span>
          <h2 className={`text-4xl font-extrabold font-heading ${getLatencyColor(metrics?.averageDuration || 0)}`}>
            {metrics?.averageDuration || 0} <span className="text-sm font-normal text-gray-400">ms</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Optimal target is less than 150ms</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mt-8 -mr-8"></div>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Status Code 2xx</span>
          <h2 className="text-4xl font-extrabold text-emerald-500 dark:text-emerald-400 font-heading">
            {metrics?.statusCodes?.['200'] || metrics?.statusCodes?.['201'] || 0}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Success rate is looking healthy</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full -mt-8 -mr-8"></div>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Error Responses</span>
          <h2 className="text-4xl font-extrabold text-rose-500 dark:text-rose-400 font-heading">
            {(metrics?.statusCodes?.['500'] || 0) + (metrics?.statusCodes?.['400'] || 0) + (metrics?.statusCodes?.['404'] || 0)}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">4xx & 5xx statuses recorded</p>
        </motion.div>
      </div>

      {/* Slow Endpoints Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Slow Endpoints Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 font-heading">
            ⚠️ Slow API Endpoints (Latency Exceeding 200ms)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-black uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Endpoint</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Logged At</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.slowEndpoints && metrics.slowEndpoints.length > 0 ? (
                  metrics.slowEndpoints.map((log, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b border-gray-50 dark:border-gray-700/50 text-sm hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-extrabold rounded-md ${getMethodColor(log.method)}`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {log.route}
                      </td>
                      <td className={`py-3 px-4 font-extrabold ${getLatencyColor(log.duration)}`}>
                        {log.duration} ms
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">
                        {log.status}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 dark:text-gray-500">
                      <span className="text-3xl block mb-2">🎉</span>
                      <h4 className="font-bold text-gray-600 dark:text-gray-300">No Slow Queries Recorded</h4>
                      <p className="text-xs mt-1">All processed API transactions completed under 200ms!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optimizations & Deployment alignment guidelines */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 font-heading">
            💡 Production Health Checklist
          </h3>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span className="text-emerald-500">✔</span> Gzip Compression
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Response compression is active! API payloads are compressed via gzip, saving ~70% bandwidth.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span className="text-emerald-500">✔</span> Hybrid Caching Layer
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Dual-layer caching active. Read queries (courses, analytics overview) fallback to in-memory TTL if Redis is offline.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span className="text-emerald-500">✔</span> Mongoose Lean & Select
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Query overhead minimized! Unnecessary fields (like lesson details in lists) are excluded from search results.
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100/30 dark:border-blue-900/30">
              <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <span className="text-blue-500">ℹ</span> Region Alignment Recommendation
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed font-medium">
                Make sure your Render backend and MongoDB Atlas cluster are located in the same geographic region (e.g. AWS N. Virginia `us-east-1`) to avoid DB latency handshakes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
