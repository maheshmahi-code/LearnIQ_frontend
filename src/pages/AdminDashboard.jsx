import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/apiService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsAPI.getAdminOverview()
      .then((r) => setStats(r.data.stats))
      .catch(() => setStats({ totalStudents: 0, totalCourses: 0, totalQuizAttempts: 0 }));
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <p className="text-3xl font-bold">{stats?.totalStudents ?? '—'}</p>
          <p className="text-gray-500">Total Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <p className="text-3xl font-bold">{stats?.totalCourses ?? '—'}</p>
          <p className="text-gray-500">Courses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <p className="text-3xl font-bold">{stats?.totalQuizAttempts ?? '—'}</p>
          <p className="text-gray-500">Quiz Attempts</p>
        </div>
      </div>
    </div>
  );
}
