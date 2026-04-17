import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';
import AppShell from '@/components/layout/AppShell';
import CommandPalette from '@/components/layout/CommandPalette';
import SoftConversionPopup from '@/components/auth/SoftConversionPopup';
import AuthModal from '@/components/auth/AuthModal';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// Pages
import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Learn from '@/pages/Learn';
import LessonIDE from '@/pages/LessonIDE';
import InteractiveLesson from '@/pages/InteractiveLesson';
import Practice from '@/pages/Practice';
import Quizzes from '@/pages/Quizzes';
import Projects from '@/pages/Projects';
import ProjectIDE from '@/pages/ProjectIDE';
import Profile from '@/pages/Profile';

// Admin placeholders (we will create these)
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLessons from '@/pages/admin/AdminLessons';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminLanguages from '@/pages/admin/AdminLanguages';
import AdminQuizzes from '@/pages/admin/AdminQuizzes';
import AdminPractice from '@/pages/admin/AdminPractice';
import ExamArchives from '@/pages/ExamArchives';
import ExamArchiveIDE from '@/pages/ExamArchiveIDE';
import AdminExamArchives from '@/pages/admin/AdminExamArchives';

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
      </ToastProvider>
    </BrowserRouter>
  );
}
