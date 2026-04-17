import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, FolderKanban, LogOut, ClipboardCheck, Code2, GraduationCap, Archive, Menu, X } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';

const ADMIN_NAVS = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/admin/lessons', icon: BookOpen, label: 'Уроки' },
  { path: '/admin/users', icon: Users, label: 'Користувачі' },
  { path: '/admin/projects', icon: FolderKanban, label: 'Проєкти' },
  { path: '/admin/quizzes', icon: ClipboardCheck, label: 'Тести' },
  { path: '/admin/practice', icon: Code2, label: 'Практика' },
  { path: '/admin/languages', icon: GraduationCap, label: 'Курси' },
  { path: '/admin/exam-archives', icon: Archive, label: 'Архів' },
];

export default function AdminLayout() {
  const { logout, user } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navContent = (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {ADMIN_NAVS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-accent/10 text-accent font-medium' : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-800">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-accent">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors mb-1"
        >
          <BookOpen size={16} /> На сайт
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
        >
          <LogOut size={16} /> Вийти
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-950 flex text-surface-50 font-sans">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-surface-800 bg-surface-900/50 flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center mr-3">
            <span className="font-bold text-white leading-none">C+</span>
          </div>
          <span className="font-bold tracking-tight text-lg">Admin Panel</span>
        </div>
        {navContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 z-50 bg-surface-900 border-r border-surface-800
        flex flex-col md:hidden transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-800">
          <span className="font-bold tracking-tight text-lg">Admin Panel</span>
          <button onClick={() => setMobileOpen(false)} className="text-surface-400 hover:text-surface-200">
            <X size={20} />
          </button>
        </div>
        {navContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-surface-950">
        <header className="h-14 border-b border-surface-800 flex items-center justify-between px-4 sm:px-6 bg-surface-950 md:hidden sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="text-surface-400 hover:text-surface-200">
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm">Admin Panel</span>
          <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-accent">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
