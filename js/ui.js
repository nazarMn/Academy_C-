/* js/ui.js — Утиліти інтерфейсу */

const UI = (() => {
  const app = () => document.getElementById('app');

  // Рендер сторінки
  function render(html) {
    // Знищуємо попередні Monaco редактори
    if (typeof EditorManager !== 'undefined') EditorManager.disposeAll();

    const el = app();
    el.innerHTML = html;
    el.classList.remove('page-enter');
    void el.offsetWidth;
    el.classList.add('page-enter');
    updateNav();
    State.updateStreakUI();
  }

  // Підсвічує активне посилання навбару
  function updateNav() {
    const hash = location.hash.replace('#', '').split('/')[0] || 'home';
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === hash);
    });
  }

  // Toast повідомлення
  function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      el.addEventListener('animationend', () => el.remove());
    }, 3200);
  }

  // XP попап
  function showXPPopup(text) {
    const popup = document.getElementById('xpPopup');
    if (!popup) return;
    popup.textContent = text;
    popup.classList.remove('active');
    void popup.offsetWidth;
    popup.classList.add('active');
    popup.addEventListener('animationend', () => popup.classList.remove('active'), { once: true });
  }

  // Підсвічування синтаксису (тільки для відображення — ніколи для виконання)
  function highlightCode(code) {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Єдиний regex для лексичного аналізу, щоб уникнути заміни слів всередині згенерованих <span>
    const tokenizer = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(&quot;[^&]*?&quot;|'[^']*?')|(#\w+)|(\b(?:int|double|float|char|bool|string|void|return|if|else|for|while|do|class|struct|public|private|protected|new|delete|nullptr|true|false|const|static|virtual|override|auto|using|namespace|include|endl|cout|cin|this|switch|case|break|continue|enum|template|typename|friend|operator|try|catch|throw|sizeof)\b)|(\b(?:vector|map|set|pair|list|queue|stack|deque|ostream|istream|ifstream|ofstream|unique_ptr|shared_ptr|weak_ptr)\b)|(\b\d+\.?\d*\b)/g;

    return escaped.replace(tokenizer, (match, comment, str, dir, kw, type, num) => {
      if (comment) return `<span class="hl-comment">${comment}</span>`;
      if (str) return `<span class="hl-string">${str}</span>`;
      if (dir) return `<span class="hl-include">${dir}</span>`;
      if (kw) return `<span class="hl-keyword">${kw}</span>`;
      if (type) return `<span class="hl-type">${type}</span>`;
      if (num) return `<span class="hl-number">${num}</span>`;
      return match;
    });
  }

  // Будує блок коду (тільки відображення, зберігає чистий код у data-raw)
  function codeBlock(code, lang = 'C++') {
    return `
      <div class="code-header">
        <div class="code-dots"><div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div></div>
        <span class="code-lang">${lang}</span>
        <button class="code-copy" onclick="UI.copyCode(this)">📋 Копіювати</button>
      </div>
      <pre class="code-block" data-raw-code="${encodeURIComponent(code)}">${highlightCode(code)}</pre>
    `;
  }

  // Копіюємо ЧИСТИЙ код (без HTML тегів підсвітки)
  function copyCode(btn) {
    const pre = btn.closest('.code-header').nextElementSibling;
    // Використовуємо data-raw-code якщо є, інакше textContent
    let rawCode = pre.getAttribute('data-raw-code');
    if (rawCode) {
      rawCode = decodeURIComponent(rawCode);
    } else {
      rawCode = pre.textContent;
    }
    navigator.clipboard.writeText(rawCode).then(() => {
      btn.textContent = '✅ Скопійовано!';
      setTimeout(() => { btn.textContent = '📋 Копіювати'; }, 2000);
    }).catch(() => {
      btn.textContent = '❌ Помилка';
    });
  }

  // Тема
  function initTheme() {
    const saved = localStorage.getItem('cpp_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cpp_theme', next);
    // Оновлюємо Monaco Editor тему
    if (typeof EditorManager !== 'undefined') EditorManager.updateTheme();
    // Оновлюємо іконку на мобільному
    const mobileBtn = document.getElementById('themeToggleMobile');
    if (mobileBtn) mobileBtn.textContent = next === 'dark' ? '🌙' : '☀️';
  }

  // Мобільне меню
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (!btn) return;
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
    // Закриваємо меню при навігації
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    });
  }

  // Бейдж рівня
  function levelBadge(level) {
    const map = { beginner: 'green', intermediate: 'orange', oop: 'blue', advanced: 'purple' };
    const labels = { beginner: '🌱 Початківець', intermediate: '⚙️ Середній', oop: '🏛️ ООП', advanced: '⚡ Просунутий' };
    const color = map[level] || 'blue';
    return `<span class="badge badge-${color}">${labels[level] || level}</span>`;
  }

  // Форматування числа (1000 → 1 000)
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  return {
    render, toast, showXPPopup, highlightCode, codeBlock, copyCode,
    updateNav, initTheme, toggleTheme, initMobileMenu, levelBadge, formatNumber,
  };
})();
