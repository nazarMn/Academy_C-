/* js/pages/home.js — Головна сторінка */

const HomePage = (() => {
  function render() {
    UI.render(`
      <!-- HERO -->
      <section class="hero-section">
        <div class="hero-bg">
          <div class="hero-orb hero-orb-1"></div>
          <div class="hero-orb hero-orb-2"></div>
          <div class="hero-orb hero-orb-3"></div>
        </div>
        <div class="hero-content">
          <div class="hero-tag">⚡ Безкоштовно · Українською · Інтерактивно</div>
          <h1 class="hero-title">Стань <span class="gradient-text">C++ розробником</span><br>з нуля до Pro</h1>
          <p class="hero-desc">Інтерактивна платформа для вивчення C++ та ООП. Уроки, практика, проєкти та геймфікація — все, що потрібно для успішного старту в програмуванні.</p>
          <div class="hero-cta">
            <a href="#lessons" class="btn btn-primary btn-xl">🚀 Почати навчання</a>
            <a href="#dashboard" class="btn btn-outline btn-xl">📊 Мій прогрес</a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat-item"><div class="hero-stat-num">24+</div><div class="hero-stat-label">Уроків</div></div>
            <div class="hero-stat-item"><div class="hero-stat-num">12</div><div class="hero-stat-label">Практик</div></div>
            <div class="hero-stat-item"><div class="hero-stat-num">5</div><div class="hero-stat-label">Проєктів</div></div>
            <div class="hero-stat-item"><div class="hero-stat-num">12</div><div class="hero-stat-label">Досягнень</div></div>
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- FEATURES -->
      <section class="mt-xl stagger-children">
        <div class="section-header">
          <div class="section-tag">✨ Можливості</div>
          <h2>Чому <span class="gradient-text">C++ Академія</span>?</h2>
          <p>Ми зробили навчання максимально ефективним та цікавим</p>
        </div>
        <div class="grid-3">
          ${[
            ['💻', 'Практичний код', 'Кожен урок містить реальні приклади коду з поясненнями українською мовою'],
            ['🎮', 'Геймфікація', 'XP, рівні, досягнення та щоденні серії — навчання як гра'],
            ['🧪', 'Monaco Editor', 'Професійний C++ редактор прямо у браузері з підсвіткою та автодоповненням'],
            ['📺', 'Відео уроки', 'Вбудовані відео від українських YouTube-авторів'],
            ['🏆', 'Реальні проєкти', '5 повноцінних проєктів для портфоліо'],
            ['🧠', 'Тести та квізи', 'Перевіряйте знання після кожної теми'],
          ].map(([icon, title, desc]) => `
            <div class="feature-card hover-lift">
              <div class="feature-icon">${icon}</div>
              <h4>${title}</h4>
              <p class="mt-sm" style="font-size:0.9rem">${desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <div class="divider"></div>

      <!-- ROADMAP -->
      <section class="mt-xl">
        <div class="section-header">
          <div class="section-tag">🗺️ Дорожня карта</div>
          <h2>Шлях від <span class="gradient-text">нуля до Pro</span></h2>
          <p>Чітка структура навчання, що веде вас крок за кроком</p>
        </div>
        <div class="roadmap-track stagger-children">
          ${[
            { level:'🌱 Початківець', color:'var(--accent-green)', topics:['Вступ до C++', 'Змінні', 'Ввід/Вивід', 'Умовні оператори', 'Цикли', 'Функції'] },
            { level:'⚙️ Середній', color:'var(--accent-orange)', topics:['Масиви', 'Покажчики', 'Динамічна памʼять', 'Файли', 'Рекурсія'] },
            { level:'🏛️ ООП', color:'var(--accent-blue)', topics:['Класи', 'Конструктори', 'Інкапсуляція', 'Успадкування', 'Поліморфізм', 'Оператори', 'Абстракція'] },
            { level:'⚡ Просунутий', color:'var(--accent-purple)', topics:['STL контейнери', 'Шаблони', 'Алгоритми', 'Big-O', 'Smart Pointers'] },
          ].map(({ level, color, topics }) => `
            <div class="roadmap-node">
              <div class="card card-gradient" style="border-color:${color}30">
                <h4 style="color:${color}; margin-bottom:0.75rem">${level}</h4>
                <div style="display:flex; flex-wrap:wrap; gap:0.4rem">
                  ${topics.map(t => `<span class="badge" style="background:${color}15; color:${color}; border:1px solid ${color}30">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <div class="divider"></div>

      <!-- CTA -->
      <section class="mt-xl" style="text-align:center; padding:3rem 0">
        <h2>Готові <span class="gradient-text">розпочати</span>?</h2>
        <p class="mt-md" style="max-width:500px; margin:1rem auto">Приєднуйтесь до тисяч студентів, які вже навчаються C++ разом з нами</p>
        <div style="display:flex; gap:1rem; justify-content:center; margin-top:2rem; flex-wrap:wrap">
          <a href="#lessons" class="btn btn-primary btn-xl animate-glow">📚 До уроків</a>
          <a href="#projects" class="btn btn-outline btn-xl">🚀 Переглянути проєкти</a>
        </div>
      </section>
    `);
  }

  return { render };
})();
