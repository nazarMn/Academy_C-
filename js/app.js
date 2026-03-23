/* js/app.js — Ініціалізація застосунку */

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

  // Запускаємо роутер
  Router.init();
})();
