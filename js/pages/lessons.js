/* js/pages/lessons.js — Список уроків */

const LessonsPage = (() => {
  const LEVELS = [
    { id: 'beginner',     label: '🌱 Початківець', color: 'var(--accent-green)' },
    { id: 'intermediate', label: '⚙️ Середній',    color: 'var(--accent-orange)' },
    { id: 'oop',          label: '🏛️ ООП',         color: 'var(--accent-blue)' },
    { id: 'advanced',     label: '⚡ Просунутий',  color: 'var(--accent-purple)' },
  ];

  function render() {
    const state = State.get();
    const allLessons = window.LESSONS_DATA || [];
    const completed = allLessons.filter(l => State.isLessonCompleted(l.id)).length;
    const pct = allLessons.length ? Math.round((completed / allLessons.length) * 100) : 0;

    const levelGroups = LEVELS.map(lvl => {
      const lessons = allLessons.filter(l => l.level === lvl.id);
      return { ...lvl, lessons };
    }).filter(g => g.lessons.length > 0);

    UI.render(`
      <div class="section-header animate-fadeIn">
        <div class="section-tag">📚 Курс</div>
        <h2>Уроки C++</h2>
        <p>Структурований шлях від основ до ООП та просунутих тем</p>
      </div>

      <!-- PROGRESS SUMMARY -->
      <div class="card card-gradient mb-xl animate-fadeIn" style="padding:1.5rem">
        <div class="flex-between mb-md" style="flex-wrap:wrap; gap:0.5rem">
          <div>
            <div style="font-weight:700; font-size:1.1rem">Загальний прогрес</div>
            <div class="text-muted" style="font-size:0.85rem">${completed} з ${allLessons.length} уроків завершено</div>
          </div>
          <div style="font-size:1.8rem; font-weight:800" class="gradient-text">${pct}%</div>
        </div>
        <div class="progress-bar progress-bar-lg">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div style="display:flex; gap:1rem; margin-top:1rem; flex-wrap:wrap">
          <div style="font-size:0.85rem; color:var(--text-muted)">⭐ XP: <strong style="color:var(--accent-orange)">${UI.formatNumber(state.xp)}</strong></div>
          <div style="font-size:0.85rem; color:var(--text-muted)">🏆 Рівень: <strong style="color:var(--accent-blue)">${State.getLevel(state.xp).name}</strong></div>
          <div style="font-size:0.85rem; color:var(--text-muted)">🔥 Серія: <strong style="color:var(--accent-red)">${state.streak} днів</strong></div>
        </div>
      </div>

      <!-- LESSON GROUPS BY LEVEL -->
      <div class="stagger-children">
        ${levelGroups.map((group, groupIdx) => `
          <div class="level-section">
            <div class="level-section-header" style="border-left: 3px solid ${group.color}">
              <span class="level-section-icon">${group.label.split(' ')[0]}</span>
              <span class="level-section-title" style="color:${group.color}">${group.label}</span>
              <span style="margin-left:auto; font-size:0.8rem; color:var(--text-muted)">
                ${group.lessons.filter(l => State.isLessonCompleted(l.id)).length}/${group.lessons.length}
              </span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem">
              ${group.lessons.map((lesson, idx) => {
                const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                const done = State.isLessonCompleted(lesson.id);
                const locked = State.isLessonLocked(globalIdx);
                return `
                  <div class="lesson-card ${done ? 'completed' : ''} ${locked ? 'locked' : ''}"
                       onclick="${locked ? '' : `Router.go('lesson/${lesson.id}')`}"
                       style="cursor:${locked ? 'default' : 'pointer'}">
                    <div class="lesson-card-icon" style="${done ? 'background:var(--accent-green)' : ''}">
                      ${done ? '✅' : locked ? '🔒' : lesson.icon}
                    </div>
                    <div class="lesson-card-body">
                      <div class="lesson-card-title">${lesson.title}</div>
                      <div class="lesson-card-meta">
                        <span>${lesson.levelLabel}</span>
                        <span class="lesson-card-xp">+${lesson.xp} XP</span>
                        ${done ? '<span style="color:var(--accent-green);font-size:0.78rem">✓ Завершено</span>' : ''}
                        ${locked ? '<span style="color:var(--text-muted);font-size:0.78rem">🔒 Завершіть попередній</span>' : ''}
                      </div>
                    </div>
                    ${!locked ? '<span style="color:var(--text-muted);font-size:1.1rem">›</span>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `);
  }

  return { render };
})();
