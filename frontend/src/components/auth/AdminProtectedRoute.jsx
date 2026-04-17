import { Navigate, Outlet } from 'react-router-dom';
import useAppStore from '@/stores/useAppStore';

export default function AdminProtectedRoute() {
  const { user, token } = useAppStore();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Only allow admin role
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
