import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/lib/constants';
import { getLevel, getXPToNextLevel, formatNumber } from '@/lib/utils';
import useAppStore from '@/stores/useAppStore';
import ProgressBar from '@/components/ui/ProgressBar';
import * as Icons from 'lucide-react';
import { Moon, Sun, ChevronLeft, ChevronRight, LogIn, X } from 'lucide-react';
import StudentCourseSelector from './StudentCourseSelector';

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }) {
  const { xp, theme, setTheme, isGuest, openAuthModal } = useAppStore();
  const lvl = getLevel(xp);
  const xpInfo = getXPToNextLevel(xp);
  const location = useLocation();

  // On mobile: always show full sidebar (not collapsed)
  const isCollapsed = mobileOpen ? false : collapsed;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50
        bg-surface-900 border-r border-surface-700/50
        flex flex-col
        transition-all duration-300 ease-smooth
        ${isCollapsed ? 'w-[68px]' : 'w-[240px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className={`
        flex items-center gap-3 px-4 h-14
        border-b border-surface-700/50
        ${isCollapsed ? 'justify-center' : ''}
      `}>
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white font-mono font-bold text-sm">C+</span>
        </div>
        {!isCollapsed && (
          <span className="font-bold text-sm text-surface-50 whitespace-nowrap">
            C++ Academy
          </span>
        )}
        {/* Desktop: collapse button */}
        {!isCollapsed && (
          <button
            onClick={() => onCollapse(true)}
            className="ml-auto text-surface-500 hover:text-surface-300 transition-colors hidden lg:block"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {/* Mobile: close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="ml-auto text-surface-500 hover:text-surface-300 transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Collapsed: expand button */}
      {isCollapsed && (
        <button
          onClick={() => onCollapse(false)}
          className="hidden lg:flex items-center justify-center h-8 text-surface-500 hover:text-surface-300 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}

      <StudentCourseSelector collapsed={isCollapsed} />

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = Icons[item.icon] || Icons.Circle;
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={isCollapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 h-10 rounded-lg
                text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-accent-subtle text-accent'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-surface-500 group-hover:text-surface-300'}`}
              />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-surface-700/50 p-3 space-y-2">
        {/* Login button for guests */}
        {isGuest && (
          <button
            onClick={() => { openAuthModal(); onMobileClose?.(); }}
            className={`
              flex items-center gap-3 w-full px-3 h-9 rounded-lg
              text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20
              border border-accent/20 transition-all duration-200
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title="Увійти / Реєстрація"
          >
            <LogIn size={16} />
            {!isCollapsed && <span>Увійти</span>}
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`
            flex items-center gap-3 w-full px-3 h-9 rounded-lg
            text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800
            transition-all duration-200
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}
          title="Змінити тему"
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          {!isCollapsed && <span>Тема</span>}
        </button>

        {/* XP progress */}
        {!isCollapsed && (
          <div className="px-3 py-2 rounded-lg bg-surface-800/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-surface-500">
                Рівень {lvl.level}
              </span>
              <span className="text-xs font-mono text-accent">
                {formatNumber(xp)} XP
              </span>
            </div>
            <ProgressBar value={xpInfo.pct} size="sm" />
          </div>
        )}
      </div>
    </aside>
  );
}
