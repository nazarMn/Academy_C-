/* js/app.js — Ініціалізація застосунку */

/**
 * Auto-detect backend URL:
 * - In production (same origin): use relative /api paths
 * - In development (file:// or different port): use localhost:3001
 */
window.BACKEND_URL = (() => {
  const loc = window.location;
  // If serving from the backend (same origin), use relative URLs
  if (loc.protocol === 'http:' || loc.protocol === 'https:') {
    // Check if we're on the backend server
    if (loc.port === '3001' || loc.hostname !== 'localhost') {
      return loc.origin;
    }
  }
  // Fallback: development mode
  return 'http://localhost:3001';
})();

(function () {
  // Ініціалізуємо тему
  UI.initTheme();

  // Оновлюємо серію
  State.updateStreak();

  // XP в сайдбарі
  State.updateStreakUI();

  // Ініціалізуємо Monaco Editor
  if (typeof EditorManager !== 'undefined') {
    EditorManager.init();
  }

  // Кнопка зміни теми (sidebar)
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', UI.toggleTheme);
  }

  // Кнопка зміни теми (mobile)
  const mobileThemeBtn = document.getElementById('themeToggleMobile');
  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
      UI.toggleTheme();
      mobileThemeBtn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙' : '☀️';
    });
  }

  // Мобільне меню
  UI.initMobileMenu();

  // Try to load lessons, quizzes, and projects from API (enhances embedded data)
  Promise.all([
    loadLessonsFromAPI(),
    loadQuizzesFromAPI(),
    loadProjectsFromAPI()
  ]).then(() => {
    // Запускаємо роутер
    Router.init();
  });

  async function loadLessonsFromAPI() {
    try {
      const response = await fetch(`${window.BACKEND_URL}/api/lessons`, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error('API unavailable');
      const lessons = await response.json();
      if (Array.isArray(lessons) && lessons.length > 0) {
        window.LESSONS_DATA = lessons;
        console.log(`[App] ✅ Loaded ${lessons.length} lessons from API`);
      }
    } catch (err) {
      console.log('[App] ℹ️ Using embedded lesson data (backend offline)');
    }
  }

  async function loadQuizzesFromAPI() {
    try {
      const response = await fetch(`${window.BACKEND_URL}/api/quizzes`, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        window.QUIZZES_DATA = data;
        console.log(`[App] ✅ Loaded ${data.length} quizzes from API`);
      }
    } catch (err) {
      console.log('[App] ℹ️ Using embedded quizzes data (backend offline)');
    }
  }

  async function loadProjectsFromAPI() {
    try {
      const response = await fetch(`${window.BACKEND_URL}/api/projects`, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        window.PROJECTS_DATA = data;
        console.log(`[App] ✅ Loaded ${data.length} projects from API`);
      }
    } catch (err) {
      console.log('[App] ℹ️ Using embedded projects data (backend offline)');
    }
  }
})();
