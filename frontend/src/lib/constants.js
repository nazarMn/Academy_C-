// ─── Level System ───
export const LEVELS = [
  { level: 1,  name: 'Новачок',    xpRequired: 0 },
  { level: 2,  name: 'Учень',      xpRequired: 200 },
  { level: 3,  name: 'Практикант', xpRequired: 500 },
  { level: 4,  name: 'Розробник',  xpRequired: 1000 },
  { level: 5,  name: 'Спеціаліст', xpRequired: 2000 },
  { level: 6,  name: 'Майстер',    xpRequired: 3500 },
  { level: 7,  name: 'Експерт',    xpRequired: 5500 },
  { level: 8,  name: 'Архітектор', xpRequired: 8000 },
  { level: 9,  name: 'Гуру C++',   xpRequired: 12000 },
  { level: 10, name: 'Легенда',    xpRequired: 20000 },
];

// ─── Achievements ───
export const ACHIEVEMENTS = [
  { id: 'first_lesson',  icon: 'Target',       title: 'Перший крок',   desc: 'Завершіть перший урок',                check: s => s.completedLessons.length >= 1 },
  { id: 'five_lessons',  icon: 'BookOpen',      title: 'Бібліотекар',   desc: 'Завершіть 5 уроків',                   check: s => s.completedLessons.length >= 5 },
  { id: 'ten_lessons',   icon: 'Trophy',        title: 'Наполегливий',  desc: 'Завершіть 10 уроків',                  check: s => s.completedLessons.length >= 10 },
  { id: 'all_lessons',   icon: 'Crown',         title: 'Майстер',       desc: 'Завершіть усі уроки',                  check: (s, data) => data.totalLessons > 0 && s.completedLessons.length >= data.totalLessons },
  { id: 'first_quiz',    icon: 'Brain',         title: 'Розумник',      desc: 'Пройдіть перший тест',                 check: s => s.completedQuizzes.length >= 1 },
  { id: 'perfect_quiz',  icon: 'Star',          title: 'Відмінник',     desc: 'Отримайте 100% на будь-якому тесті',   check: s => s.perfectQuizzes.length >= 1 },
  { id: 'first_project', icon: 'Rocket',        title: 'Будівельник',   desc: 'Розпочніть перший проєкт',             check: s => s.startedProjects.length >= 1 },
  { id: 'streak_3',      icon: 'Flame',         title: 'Мотивований',   desc: '3 дні поспіль',                        check: s => s.streak >= 3 },
  { id: 'streak_7',      icon: 'Zap',           title: 'Тиждень',       desc: '7 днів поспіль',                       check: s => s.streak >= 7 },
  { id: 'xp_500',        icon: 'Gem',           title: 'Збирач XP',     desc: 'Наберіть 500 XP',                      check: s => s.xp >= 500 },
  { id: 'xp_2000',       icon: 'Award',         title: 'Ветеран',       desc: 'Наберіть 2000 XP',                     check: s => s.xp >= 2000 },
  { id: 'oop_master',    icon: 'Landmark',      title: 'ООП Майстер',   desc: 'Завершіть усі ООП уроки',              check: (s, data) => {
      const oopLessons = (data.lessons || []).filter(l => l.level === 'oop').map(l => l.id);
      return oopLessons.length > 0 && oopLessons.every(id => s.completedLessons.includes(id));
    }
  },
];

// ─── Navigation ───
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Головна',   icon: 'LayoutDashboard' },
  { path: '/learn',     label: 'Навчання',  icon: 'GraduationCap' },
  { path: '/practice',  label: 'Практика',  icon: 'Code2' },
  { path: '/assess',    label: 'Тести',     icon: 'ClipboardCheck' },
  { path: '/build',     label: 'Проєкти',   icon: 'Boxes' },
  { path: '/archives',  label: 'Архів',     icon: 'Archive' },
  { path: '/profile',   label: 'Профіль',   icon: 'User' },
];

// ─── Level color system ───
export const LEVEL_COLORS = {
  beginner:     { dot: 'bg-success',  text: 'text-success',  bg: 'bg-success-muted' },
  intermediate: { dot: 'bg-warning',  text: 'text-warning',  bg: 'bg-warning-muted' },
  oop:          { dot: 'bg-accent',   text: 'text-accent',   bg: 'bg-accent-subtle' },
  advanced:     { dot: 'bg-info',     text: 'text-info',     bg: 'bg-info-muted' },
};

// ─── API Config ───
export const API_BASE = '/api';
export const API_TIMEOUT = 3000;
