import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';
import AppShell from '@/components/layout/AppShell';
import CommandPalette from '@/components/layout/CommandPalette';
import SoftConversionPopup from '@/components/auth/SoftConversionPopup';
import AuthModal from '@/components/auth/AuthModal';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// Immediate Pages (Fast First Paint)
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';

// Lazy-Loaded App Pages
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Learn = lazy(() => import('@/pages/Learn'));
const LessonIDE = lazy(() => import('@/pages/LessonIDE'));
const InteractiveLesson = lazy(() => import('@/pages/InteractiveLesson'));
const Practice = lazy(() => import('@/pages/Practice'));
const Quizzes = lazy(() => import('@/pages/Quizzes'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectIDE = lazy(() => import('@/pages/ProjectIDE'));
const Profile = lazy(() => import('@/pages/Profile'));
const ExamArchives = lazy(() => import('@/pages/ExamArchives'));
const ExamArchiveIDE = lazy(() => import('@/pages/ExamArchiveIDE'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));

// Lazy-Loaded Admin Pages (Loaded only when admin visits /admin)
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminLessons = lazy(() => import('@/pages/admin/AdminLessons'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'));
const AdminLanguages = lazy(() => import('@/pages/admin/AdminLanguages'));
const AdminQuizzes = lazy(() => import('@/pages/admin/AdminQuizzes'));
const AdminPractice = lazy(() => import('@/pages/admin/AdminPractice'));
const AdminExamArchives = lazy(() => import('@/pages/admin/AdminExamArchives'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-surface-500">Завантаження...</span>
      </div>
    </div>
  );
}

export default function App() {
  const { isGuest, loadFromServer } = useAppStore();

  useEffect(() => {
    if (!isGuest) {
      loadFromServer();
    }
  }, [isGuest, loadFromServer]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <CommandPalette />
        <SoftConversionPopup />
        <AuthModal />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Standalone pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* App routes — wrapped in AppShell */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:lessonId" element={<LessonIDE />} />
              <Route path="/learn/interactive/:lessonId" element={<InteractiveLesson />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/assess" element={<Quizzes />} />
              <Route path="/assess/:quizId" element={<Quizzes />} />
              <Route path="/build" element={<Projects />} />
              <Route path="/build/:projectId" element={<ProjectIDE />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/archives" element={<ExamArchives />} />
              <Route path="/archives/:archiveId" element={<ExamArchiveIDE />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>

            {/* Admin panel routes */}
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="lessons" element={<AdminLessons />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="quizzes" element={<AdminQuizzes />} />
                <Route path="practice" element={<AdminPractice />} />
                <Route path="languages" element={<AdminLanguages />} />
                <Route path="exam-archives" element={<AdminExamArchives />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}
