/* js/pages/projects.js — Секція проєктів */

const ProjectsPage = (() => {
  function render() {
    const projects = window.PROJECTS_DATA || [];
    UI.render(`
      <div class="section-header animate-fadeIn">
        <div class="section-tag">🚀 Проєкти</div>
        <h2>Реальні проєкти</h2>
        <p>Застосуйте знання на практиці та поповніть своє портфоліо</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:1.5rem;margin-top:1.5rem" class="stagger-children">
        ${projects.map(p => renderProjectCard(p)).join('')}
      </div>
    `);
  }

  function renderProjectCard(p) {
    const started = (State.get().startedProjects||[]).includes(p.id);
    return `
      <div class="project-card" id="proj-${p.id}">
        <div class="project-card-top">
          <div class="project-icon">${p.icon}</div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap">
            <div>
              <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap">
                ${UI.levelBadge(p.level)}
                <span class="badge badge-orange">+${p.xp} XP</span>
                <span class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-muted)">${p.difficulty}</span>
              </div>
              <h3>${p.title}</h3>
            </div>
            ${started ? '<span class="badge badge-green">✅ Розпочато</span>' : ''}
          </div>
        </div>
        <div class="project-card-body">
          <p>${p.description}</p>
          <div style="margin-top:1rem">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.5rem">🛠️ Навички:</div>
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
              ${p.skills.map(s => `<span class="badge badge-blue">${s}</span>`).join('')}
            </div>
          </div>
          <div style="margin-top:1rem">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.5rem">✅ Вимоги:</div>
            <ul style="padding-left:1.25rem;display:flex;flex-direction:column;gap:0.3rem">
              ${p.requirements.map(r => `<li style="font-size:0.88rem;color:var(--text-secondary)">${r}</li>`).join('')}
            </ul>
          </div>
          <div style="display:flex;gap:0.75rem;margin-top:1.25rem;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="ProjectsPage.toggleSteps('${p.id}')">
              📋 Покроковий план
            </button>
            ${!started ? `<button class="btn btn-outline" onclick="ProjectsPage.startProject('${p.id}')">🚀 Почати проєкт</button>` : ''}
          </div>
        </div>
        <div class="project-steps" id="steps-${p.id}">
          <h4 style="margin-bottom:1rem">📄 Покрокове виконання</h4>
          ${p.steps.map((step, i) => `
            <div class="step-item">
              <div class="step-num">${i + 1}</div>
              <p style="font-size:0.9rem">${step}</p>
            </div>
          `).join('')}
          ${p.starterCode ? `
            <div class="mt-lg">
              <h4 style="margin-bottom:0.75rem">💻 Стартовий код</h4>
              ${UI.codeBlock(p.starterCode)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function toggleSteps(id) {
    const el = document.getElementById(`steps-${id}`);
    if (el) el.classList.toggle('visible');
  }

  function startProject(id) {
    State.startProject(id);
    UI.toast('🚀 Проєкт розпочато! Успіхів!', 'info');
    ProjectsPage.render();
  }

  return { render, toggleSteps, startProject };
})();
