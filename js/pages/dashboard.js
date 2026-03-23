/* js/pages/dashboard.js — Dashboard користувача */

const DashboardPage = (() => {
  function render() {
    const state = State.get();
    const lessons = window.LESSONS_DATA || [];
    const quizzes = window.QUIZZES_DATA || [];
    const projects = window.PROJECTS_DATA || [];
    const lvlData = State.getLevel(state.xp);
    const xpInfo = State.getXPToNextLevel(state.xp);
    const achievements = State.ACHIEVEMENTS;

    const completedLessons = (state.completedLessons||[]).length;
    const completedQuizzes = (state.completedQuizzes||[]).length;
    const startedProjects = (state.startedProjects||[]).length;

    UI.render(`
      <div class="section-header animate-fadeIn">
        <div class="section-tag">🏆 Прогрес</div>
        <h2>Мій прогрес</h2>
        <p>Відстежуйте своє навчання та досягнення</p>
      </div>

      <!-- TOP STATS -->
      <div class="grid-4 stagger-children mb-xl">
        <div class="stat-card">
          <div class="stat-number">${UI.formatNumber(state.xp)}</div>
          <div class="stat-label">⭐ Загальний XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${lvlData.level}</div>
          <div class="stat-label">🏅 Рівень · ${lvlData.name}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${state.streak || 0}</div>
          <div class="stat-label">🔥 Днів поспіль</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${(state.unlockedAchievements||[]).length}</div>
          <div class="stat-label">🏆 Досягнень</div>
        </div>
      </div>

      <!-- XP & LEVEL -->
      <div class="card mb-xl animate-fadeIn">
        <div class="flex-between mb-md" style="flex-wrap:wrap;gap:0.5rem">
          <div>
            <h4>📈 До наступного рівня</h4>
            <p class="text-muted mt-sm" style="font-size:0.85rem">
              ${lvlData.name} → ${State.LEVELS[Math.min(lvlData.level, State.LEVELS.length-1)]?.name || 'Максимум'}
            </p>
          </div>
          <div style="text-align:right">
            <div style="font-size:0.85rem;color:var(--text-muted)">${UI.formatNumber(xpInfo.current)} / ${UI.formatNumber(xpInfo.needed)} XP</div>
            <div class="gradient-text" style="font-weight:800;font-size:1.2rem">${xpInfo.pct}%</div>
          </div>
        </div>
        <div class="progress-bar progress-bar-xl">
          <div class="progress-fill" style="width:${xpInfo.pct}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:0.5rem;font-size:0.8rem;color:var(--text-muted)">
          <span>Рівень ${lvlData.level}</span>
          <span>Рівень ${Math.min(lvlData.level + 1, 10)}</span>
        </div>
      </div>

      <!-- PROGRESS DETAILS -->
      <div class="grid-3 mb-xl stagger-children" style="gap:1.25rem">
        <div class="card card-gradient">
          <div style="font-size:1.5rem;margin-bottom:0.5rem">📚</div>
          <h4>Уроки</h4>
          <div style="font-size:2rem;font-weight:800;color:var(--accent-blue);margin:0.5rem 0">${completedLessons}/${lessons.length}</div>
          <div class="progress-bar mt-sm">
            <div class="progress-fill" style="width:${lessons.length ? Math.round(completedLessons/lessons.length*100) : 0}%"></div>
          </div>
          <a href="#lessons" class="btn btn-outline btn-sm mt-md" style="width:100%">Продовжити →</a>
        </div>
        <div class="card card-gradient">
          <div style="font-size:1.5rem;margin-bottom:0.5rem">🧠</div>
          <h4>Тести</h4>
          <div style="font-size:2rem;font-weight:800;color:var(--accent-purple);margin:0.5rem 0">${completedQuizzes}/${quizzes.length}</div>
          <div class="progress-bar mt-sm">
            <div class="progress-fill" style="width:${quizzes.length ? Math.round(completedQuizzes/quizzes.length*100) : 0}%"></div>
          </div>
          <a href="#quizzes" class="btn btn-outline btn-sm mt-md" style="width:100%">До тестів →</a>
        </div>
        <div class="card card-gradient">
          <div style="font-size:1.5rem;margin-bottom:0.5rem">🚀</div>
          <h4>Проєкти</h4>
          <div style="font-size:2rem;font-weight:800;color:var(--accent-orange);margin:0.5rem 0">${startedProjects}/${projects.length}</div>
          <div class="progress-bar mt-sm">
            <div class="progress-fill" style="width:${projects.length ? Math.round(startedProjects/projects.length*100) : 0}%"></div>
          </div>
          <a href="#projects" class="btn btn-outline btn-sm mt-md" style="width:100%">До проєктів →</a>
        </div>
      </div>

      <!-- ACHIEVEMENTS -->
      <div class="mb-xl">
        <div class="section-header">
          <div class="section-tag">🏅 Досягнення</div>
          <h3>Мої нагороди</h3>
        </div>
        <div class="grid-4 stagger-children" style="gap:0.75rem">
          ${achievements.map(ach => {
            const unlocked = (state.unlockedAchievements||[]).includes(ach.id);
            return `
              <div class="achievement-card ${unlocked ? 'unlocked' : ''}" title="${ach.desc}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-title">${ach.title}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-top:0.25rem">${ach.desc}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- COMPLETED LESSONS LIST -->
      ${completedLessons > 0 ? `
        <div class="mb-xl">
          <div class="section-header">
            <div class="section-tag">✅ Завершені</div>
            <h3>Пройдені уроки</h3>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
            ${(state.completedLessons||[]).map(id => {
              const lesson = lessons.find(l => l.id === id);
              return lesson ? `<span class="badge badge-green" style="cursor:pointer" onclick="Router.go('lesson/${id}')">${lesson.icon} ${lesson.title}</span>` : '';
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- RESET -->
      <div class="card" style="border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.04)">
        <h4 style="color:var(--accent-red);margin-bottom:0.5rem">⚠️ Небезпечна зона</h4>
        <p style="font-size:0.9rem;margin-bottom:1rem">Скинути увесь прогрес. Цю дію не можна відмінити!</p>
        <button class="btn btn-danger btn-sm" onclick="if(confirm('Скинути весь прогрес?')){State.resetState();DashboardPage.render();UI.toast('Прогрес скинуто','error')}">
          🗑️ Скинути прогрес
        </button>
      </div>
    `);
  }

  return { render };
})();
