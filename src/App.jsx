import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Curriculum = lazy(() => import('./pages/Curriculum'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const Assignments = lazy(() => import('./pages/Assignments'));
const QuizGenerator = lazy(() => import('./pages/QuizGenerator'));
const QuizPlay = lazy(() => import('./pages/QuizPlay'));
const QuizResults = lazy(() => import('./pages/QuizResults'));
const Analytics = lazy(() => import('./pages/Analytics'));
const WeaknessDetector = lazy(() => import('./pages/WeaknessDetector'));
const AIStudyAssistant = lazy(() => import('./pages/AIStudyAssistant'));
const PDFFlashcards = lazy(() => import('./pages/PDFFlashcards'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Community = lazy(() => import('./pages/Community'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const AdminQuizzes = lazy(() => import('./pages/AdminQuizzes'));
const AdminAssignments = lazy(() => import('./pages/AdminAssignments'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const Notes = lazy(() => import('./pages/Notes'));
const PerformanceDashboard = lazy(() => import('./pages/PerformanceDashboard'));

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

  const fallbackLoading = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-black text-primary uppercase tracking-widest animate-pulse">Loading LearnIQ...</p>
    </div>
  );

  return (
    <Suspense fallback={fallbackLoading}>
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
        <Route path="/admin/performance" element={<ProtectedRoute><Layout><PerformanceDashboard /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
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
