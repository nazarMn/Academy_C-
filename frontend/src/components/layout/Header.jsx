import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Flame, Search, Menu, LogIn, LogOut, User } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';

// Route to breadcrumb label mapping
const routeLabels = {
  'dashboard': 'Головна',
  'learn':     'Навчання',
  'practice':  'Практика',
  'assess':    'Тести',
  'build':     'Проєкти',
  'profile':   'Профіль',
  'archives':  'Архів',
};

export default function Header({ onMenuClick, onSearchClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { streak, isGuest, openAuthModal, user, logout } = useAppStore();

  // Build breadcrumbs from path
  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] || seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-surface-700/50 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Left: Menu + Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-surface-400 hover:text-surface-200 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-surface-600">/</span>
              )}
              {crumb.isLast ? (
                <span className="text-surface-200 font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search / Command Palette */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 h-8 px-3 rounded-lg bg-surface-900 border border-surface-700 text-surface-500 hover:border-surface-600 hover:text-surface-300 transition-all text-sm"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Пошук</span>
          <kbd className="hidden sm:inline text-xs text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded font-mono ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-muted text-warning text-xs font-medium">
            <Flame size={14} />
            <span>{streak}</span>
          </div>
        )}

        {/* Auth: Login button or User menu */}
        {isGuest ? (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-all text-sm font-medium"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Увійти</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-800/50 border border-surface-700/50">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <User size={12} className="text-accent" />
              </div>
              <span className="text-xs font-medium text-surface-300 hidden sm:inline max-w-[100px] truncate">
                {user?.name || 'Студент'}
              </span>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
              title="Вийти"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
