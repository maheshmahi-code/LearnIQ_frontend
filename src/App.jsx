import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import CourseDetails from './pages/CourseDetails';
import Assignments from './pages/Assignments';
import QuizGenerator from './pages/QuizGenerator';
import QuizPlay from './pages/QuizPlay';
import QuizResults from './pages/QuizResults';
import Analytics from './pages/Analytics';
import WeaknessDetector from './pages/WeaknessDetector';
import AIStudyAssistant from './pages/AIStudyAssistant';
import PDFFlashcards from './pages/PDFFlashcards';
import Leaderboard from './pages/Leaderboard';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminAssignments from './pages/AdminAssignments';
import AdminStudents from './pages/AdminStudents';
import Notes from './pages/Notes';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function Layout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {user && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        <main className={`flex-1 overflow-y-auto w-full transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  useEffect(() => {
    if (localStorage.getItem('dark') === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/curriculum" element={<ProtectedRoute><Layout><Curriculum /></Layout></ProtectedRoute>} />
      <Route path="/curriculum/:id" element={<ProtectedRoute><Layout><CourseDetails /></Layout></ProtectedRoute>} />
      <Route path="/curriculum-course/:id" element={<ProtectedRoute><Layout><CourseDetails /></Layout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><Layout><Assignments /></Layout></ProtectedRoute>} />
      <Route path="/quiz-generator" element={<ProtectedRoute><Layout><QuizGenerator /></Layout></ProtectedRoute>} />
      <Route path="/quiz-play/:id" element={<ProtectedRoute><Layout><QuizPlay /></Layout></ProtectedRoute>} />
      <Route path="/quiz-results/:id" element={<ProtectedRoute><Layout><QuizResults /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
      <Route path="/weakness-detector" element={<ProtectedRoute><Layout><WeaknessDetector /></Layout></ProtectedRoute>} />
      <Route path="/ai-study-assistant" element={<ProtectedRoute><Layout><AIStudyAssistant /></Layout></ProtectedRoute>} />
      <Route path="/pdf-flashcards" element={<ProtectedRoute><Layout><PDFFlashcards /></Layout></ProtectedRoute>} />

      <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
      <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Layout><Notes /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute><Layout><AdminCourses /></Layout></ProtectedRoute>} />
      <Route path="/admin/quizzes" element={<ProtectedRoute><Layout><AdminQuizzes /></Layout></ProtectedRoute>} />
      <Route path="/admin/assignments" element={<ProtectedRoute><Layout><AdminAssignments /></Layout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute><Layout><AdminStudents /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GamificationProvider>
          <AppRoutes />
        </GamificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
