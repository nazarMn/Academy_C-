import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, BookOpen, Code2, ClipboardCheck,
  Boxes, User, ArrowRight, Moon, Sun
} from 'lucide-react';
import useAppStore from '@/stores/useAppStore';

const NAV_COMMANDS = [
  { id: 'dashboard', label: 'Головна', icon: LayoutDashboard, path: '/dashboard', section: 'Навігація' },
  { id: 'learn', label: 'Навчання', icon: BookOpen, path: '/learn', section: 'Навігація' },
  { id: 'practice', label: 'Практика', icon: Code2, path: '/practice', section: 'Навігація' },
  { id: 'quizzes', label: 'Тести', icon: ClipboardCheck, path: '/assess', section: 'Навігація' },
  { id: 'projects', label: 'Проєкти', icon: Boxes, path: '/build', section: 'Навігація' },
  { id: 'profile', label: 'Профіль', icon: User, path: '/profile', section: 'Навігація' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lessons, setLessons] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(() => {});
  }, []);

  const allCommands = useMemo(() => {
    const lessonCommands = lessons.map(l => ({
      id: `lesson-${l.id}`,
      label: l.title,
      icon: BookOpen,
      path: `/learn/${l.id}`,
      section: 'Уроки',
      meta: l.level,
    }));

    const actionCommands = [
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        section: 'Дії',
      },
    ];

    return [...NAV_COMMANDS, ...actionCommands, ...lessonCommands];
  }, [theme, setTheme, lessons]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands.slice(0, 12);
    const q = query.toLowerCase();
    return allCommands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.section.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, allCommands]);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.code === 'KeyK')) {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIdx(0);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Focus input
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection on filter change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  const execute = (cmd) => {
    if (cmd.action) {
      cmd.action();
    } else if (cmd.path) {
      navigate(cmd.path);
    }
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIdx]) execute(filtered[selectedIdx]);
    }
  };

  if (!open) return null;

  // Group by section
  const sections = {};
  filtered.forEach(cmd => {
    if (!sections[cmd.section]) sections[cmd.section] = [];
    sections[cmd.section].push(cmd);
  });

  let flatIdx = 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 animate-slide-down">
        <div className="bg-surface-900 rounded-xl border border-surface-700 shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-700/50">
            <Search size={18} className="text-surface-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Пошук сторінок, уроків, дій..."
              className="flex-1 bg-transparent text-sm text-surface-100 outline-none placeholder-surface-500"
            />
            <kbd className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-surface-500">
                Нічого не знайдено
              </div>
            )}

            {Object.entries(sections).map(([section, commands]) => (
              <div key={section}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  {section}
                </div>
                {commands.map(cmd => {
                  const idx = flatIdx++;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${idx === selectedIdx
                          ? 'bg-accent/10 text-accent'
                          : 'text-surface-300 hover:bg-surface-800'
                        }`}
                    >
                      <Icon size={16} className={idx === selectedIdx ? 'text-accent' : 'text-surface-500'} />
                      <span className="flex-1 text-left truncate">{cmd.label}</span>
                      {cmd.meta && (
                        <span className="text-[10px] text-surface-600">{cmd.meta}</span>
                      )}
                      <ArrowRight size={12} className={`${idx === selectedIdx ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
