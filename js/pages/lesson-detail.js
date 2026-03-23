/* js/pages/lesson-detail.js — Детальна сторінка уроку з Monaco Editor */

const LessonDetailPage = (() => {
  const BACKEND_URL = 'http://localhost:3001';
  let currentEditorId = null;

  function render(lessonId) {
    const lessons = window.LESSONS_DATA || [];
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) { UI.render('<div class="card" style="text-align:center;padding:3rem"><h3>Урок не знайдено</h3><a href="#lessons" class="btn btn-primary mt-lg">Назад</a></div>'); return; }

    const idx = lessons.findIndex(l => l.id === lessonId);
    const prev = lessons[idx - 1];
    const next = lessons[idx + 1];
    const done = State.isLessonCompleted(lessonId);

    // Відновлюємо збережений код
    const savedCode = EditorManager.loadSavedCode(`practice-${lessonId}`);
    const defaultCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    \n    return 0;\n}`;

    UI.render(`
      <!-- BREADCRUMB -->
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;font-size:0.85rem;color:var(--text-muted)">
        <a href="#lessons" style="color:var(--accent-blue);text-decoration:none">← Всі уроки</a>
        <span>/</span>
        <span>${lesson.levelLabel}</span>
        <span>/</span>
        <span style="color:var(--text-primary)">${lesson.title}</span>
      </div>

      <div class="lesson-layout animate-fadeIn">
        <!-- MAIN CONTENT -->
        <div>
          <!-- HEADER -->
          <div class="card card-gradient mb-lg">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
              <div style="font-size:3rem">${lesson.icon}</div>
              <div>
                ${UI.levelBadge(lesson.level)}
                <h2 style="margin-top:0.3rem">${lesson.title}</h2>
              </div>
            </div>
            <div style="display:flex;gap:1rem;flex-wrap:wrap">
              <span class="badge badge-orange">⭐ +${lesson.xp} XP</span>
              ${done ? '<span class="badge badge-green">✅ Завершено</span>' : '<span class="badge" style="background:rgba(255,255,255,0.05)">⏳ Не завершено</span>'}
            </div>
          </div>

          <!-- EXPLANATION -->
          <div class="card mb-lg">
            <h3 style="margin-bottom:1rem">📖 Пояснення</h3>
            <div class="lesson-explanation" style="line-height:1.8">${lesson.explanation}</div>
          </div>

          <!-- CODE EXAMPLE -->
          <div class="mb-lg">
            <h3 style="margin-bottom:1rem">💻 Приклад коду</h3>
            ${UI.codeBlock(lesson.code)}
          </div>

          <!-- CODE EXPLANATION -->
          <div class="card mb-lg">
            <h3 style="margin-bottom:1rem">🔍 Розбір коду</h3>
            <ol style="padding-left:1.25rem;display:flex;flex-direction:column;gap:0.6rem">
              ${lesson.codeExplanation.map(item => `<li style="color:var(--text-secondary);font-size:0.95rem;line-height:1.6">${item}</li>`).join('')}
            </ol>
          </div>

          <!-- VIDEO -->
          <div class="mb-lg">
            <h3 style="margin-bottom:1rem">📺 Відео уроки</h3>
            <div style="display:flex;flex-direction:column;gap:1.5rem">
              ${(lesson.videos || [{id: lesson.videoId}]).map(v => `
              <div class="video-container">
                <div class="video-wrapper">
                  <iframe src="https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen loading="lazy"></iframe>
                </div>
                ${v.title ? `<p class="text-muted mt-sm" style="font-size:0.85rem">🎥 ${v.title}</p>` : ''}
              </div>
              `).join('')}
            </div>
            <p class="text-muted mt-md" style="font-size:0.8rem">📺 Навчальні канали українською мовою</p>
          </div>

          <!-- PRACTICE TASK WITH MONACO EDITOR -->
          <div class="card mb-lg" style="border-color:rgba(99,102,241,0.3)">
            <h3 style="margin-bottom:0.5rem">🧪 Практичне завдання</h3>
            <p style="margin-bottom:1rem">${lesson.practiceTask}</p>
            <div class="monaco-editor-wrapper">
              <div class="monaco-editor-header">
                <div class="code-dots"><div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div></div>
                <span style="font-size:0.78rem;color:var(--text-muted);font-family:var(--font-code)">main.cpp</span>
                <span class="monaco-status" id="editorStatus">● Готовий</span>
              </div>
              <div id="practiceEditor" class="monaco-container" style="height:280px;"></div>
              <div class="code-output" id="practiceOutput" style="display:none"></div>
            </div>
            <div style="display:flex;gap:0.75rem;margin-top:1rem;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="LessonDetailPage.runCode('${lessonId}')">▶ Запустити</button>
              <button class="btn btn-success" onclick="LessonDetailPage.checkCode('${lessonId}')">✅ Перевірити</button>
              <button class="btn btn-ghost" onclick="LessonDetailPage.showHint('${lessonId}')">💡 Підказка</button>
              <button class="btn btn-ghost" onclick="LessonDetailPage.resetCode('${lessonId}')">🔄 Скинути</button>
            </div>
            <div id="hintBox" style="display:none" class="card mt-md">
              <p>💡 <strong>Підказка:</strong> ${lesson.hint}</p>
            </div>
          </div>

          <!-- NAVIGATION -->
          <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:1rem">
            ${prev ? `<a href="#lesson/${prev.id}" class="btn btn-ghost">← ${prev.title}</a>` : '<div></div>'}
            ${!done ? `<button class="btn btn-success" onclick="LessonDetailPage.markDone('${lessonId}', ${lesson.xp})">✅ Позначити як завершений (+${lesson.xp} XP)</button>` :
            `<button class="btn btn-ghost" disabled>✅ Вже завершено</button>`}
            ${next ? `<a href="#lesson/${next.id}" class="btn btn-outline">→ ${next.title}</a>` : '<a href="#lessons" class="btn btn-outline">📚 Всі уроки</a>'}
          </div>
        </div>

        <!-- SIDEBAR -->
        <div class="lesson-sidebar-sticky">
          <!-- LESSON INFO -->
          <div class="card mb-lg">
            <h4 style="margin-bottom:1rem">📋 Про урок</h4>
            <div style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.88rem">
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Рівень</span><span>${UI.levelBadge(lesson.level)}</span></div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Нагорода</span><span class="badge badge-orange">+${lesson.xp} XP</span></div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Статус</span><span>${done ? '✅ Завершено' : '⏳ Не розпочато'}</span></div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Урок</span><span>${idx + 1} / ${lessons.length}</span></div>
            </div>
          </div>

          <!-- QUICK CONTENTS -->
          <div class="card">
            <h4 style="margin-bottom:0.75rem">📑 Зміст</h4>
            <div style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem">
              <a href="#" class="nav-link" style="padding:0.4rem 0.6rem;border-radius:6px">📖 Пояснення</a>
              <a href="#" class="nav-link" style="padding:0.4rem 0.6rem;border-radius:6px">💻 Код</a>
              <a href="#" class="nav-link" style="padding:0.4rem 0.6rem;border-radius:6px">📺 Відео</a>
              <a href="#" class="nav-link" style="padding:0.4rem 0.6rem;border-radius:6px">🧪 Практика</a>
            </div>
          </div>
        </div>
      </div>
    `);

    // Ініціалізуємо Monaco Editor
    currentEditorId = `practice-${lessonId}`;
    const codeToLoad = savedCode || defaultCode;
    EditorManager.onReady(() => {
      EditorManager.create('practiceEditor', codeToLoad, { });
    });
  }

  // Запускаємо код через backend
  async function runCode(lessonId) {
    const code = getEditorCode();
    const outputEl = document.getElementById('practiceOutput');
    if (!outputEl) return;
    outputEl.style.display = 'block';

    // ── DEBUG: Log raw code ──
    console.log('[LessonDetail:runCode] Raw editor code:', code.substring(0, 120));
    console.log('[LessonDetail:runCode] Has <iostream>?', code.includes('<iostream>'));

    if (!code || code.trim().length < 15) {
      outputEl.className = 'code-output output-error';
      outputEl.textContent = '❌ Введіть ваш код у редактор';
      return;
    }

    outputEl.className = 'code-output';
    outputEl.textContent = '⏳ Компіляція та виконання...';
    setStatus('Виконання...');

    try {
      const response = await fetch(`${BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, onlyRun: true }),
      });

      if (!response.ok) throw new Error('Сервер недоступний');
      const result = await response.json();

      if (result.status === 'compile_error') {
        outputEl.className = 'code-output output-error';
        outputEl.textContent = `❌ Помилка компіляції:\n\n${result.compileError}`;
      } else if (result.timedOut) {
        outputEl.className = 'code-output output-error';
        outputEl.textContent = '⏱️ Перевищено час виконання (5 сек). Можливо нескінченний цикл?';
      } else if (result.error) {
        outputEl.className = 'code-output output-hint';
        outputEl.textContent = `⚠️ Помилка виконання:\n\n${result.error}`;
      } else {
        outputEl.className = 'code-output output-success';
        outputEl.textContent = `✅ Програма виконана!\n\n> Вивід:\n${result.output || '(порожній вивід)'}`;
      }
      setStatus('Готовий');
    } catch (err) {
      // Fallback: симуляція без backend
      outputEl.className = 'code-output output-hint';
      outputEl.textContent = `⚠️ Backend недоступний.\n\n💡 Для реального виконання:\n1. cd backend\n2. npm install\n3. node server.js\n\n📝 Ваш код збережено. Перевірте логіку вручну.`;
      setStatus('Offline');
    }
  }

  // Перевіряємо код (з тест-кейсами)
  async function checkCode(lessonId) {
    const lesson = (window.LESSONS_DATA || []).find(l => l.id === lessonId);
    const code = getEditorCode();
    const outputEl = document.getElementById('practiceOutput');
    if (!outputEl || !lesson) return;
    outputEl.style.display = 'block';

    if (!code || code.trim().length < 15) {
      outputEl.className = 'code-output output-error';
      outputEl.textContent = '❌ Введіть ваш код у редактор';
      return;
    }

    // Спочатку пробуємо backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          testCases: [{ input: '', expectedOutput: lesson.expectedOutput.replace(/\\\\n/g, '\n') }],
        }),
      });

      if (!response.ok) throw new Error('Backend unavailable');
      const result = await response.json();

      if (result.status === 'compile_error') {
        outputEl.className = 'code-output output-error';
        outputEl.textContent = `❌ Помилка компіляції:\n\n${result.compileError}`;
      } else if (result.status === 'accepted') {
        outputEl.className = 'code-output output-success';
        outputEl.textContent = `✅ Всі тести пройдено!\n\n` +
          result.testResults.map((t, i) => `Тест ${i+1}: ✅ Пройдений (${t.timeMs}мс)`).join('\n');
        State.completeLesson(lessonId, lesson.xp);
        UI.toast('🎉 Практику виконано!', 'success');
      } else {
        outputEl.className = 'code-output output-hint';
        const results = (result.testResults || []).map((t, i) =>
          `Тест ${i+1}: ${t.passed ? '✅' : '❌'}\n  Очікувано: ${t.expected}\n  Отримано:  ${t.actual}`
        ).join('\n\n');
        outputEl.textContent = `⚠️ Не всі тести пройдено!\n\n${results}`;
      }
    } catch (err) {
      // Fallback: перевірка структури коду (покращена)
      fallbackCheck(code, lesson, lessonId, outputEl);
    }
  }

  // Fallback перевірка без backend — аналізуємо структуру коду
  function fallbackCheck(code, lesson, lessonId, outputEl) {
    // Видаляємо коментарі для аналізу
    const codeClean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Базові перевірки
    const hasMain = codeClean.includes('main');
    const hasCout = codeClean.includes('cout') || codeClean.includes('printf');
    const hasInclude = codeClean.includes('#include');
    const codeSize = codeClean.replace(/\s/g, '').length;

    // Перевірка осмисленого коду (не шаблон)
    const hasAssignment = /[a-zA-Z_]\w*\s*=\s*[^=]/.test(codeClean);
    const hasLoop = /\b(for|while|do)\b/.test(codeClean);
    const hasCondition = /\b(if|switch)\b/.test(codeClean);
    const hasClass = /\bclass\b/.test(codeClean);

    // Код має бути достатньо змістовним (не просто шаблон)
    const meaningfulCode = hasAssignment || hasLoop || hasCondition || hasClass;
    const isEnoughCode = codeSize > 60;

    if (hasMain && hasCout && hasInclude && meaningfulCode && isEnoughCode) {
      outputEl.className = 'code-output output-success';
      outputEl.textContent = `✅ Код виглядає правильно! (офлайн перевірка)\n\nОчікуваний вивід:\n${lesson.expectedOutput.replace(/\\\\n/g, '\n')}\n\n💡 Для точної перевірки запустіть backend.`;
      State.completeLesson(lessonId, lesson.xp);
      UI.toast('🎉 Практику виконано!', 'success');
    } else {
      let missing = [];
      if (!hasMain) missing.push('функцію main()');
      if (!hasCout) missing.push('вивід (cout)');
      if (!hasInclude) missing.push('#include');
      if (!meaningfulCode) missing.push('логіку рішення (код занадто простий)');
      outputEl.className = 'code-output output-hint';
      outputEl.textContent = `⚠️ Перевірте код (офлайн перевірка).\n\n${missing.length ? 'Не вистачає: ' + missing.join(', ') + '\n\n' : ''}Очікуваний вивід:\n${lesson.expectedOutput.replace(/\\\\n/g, '\n')}\n\n💡 Для точної перевірки запустіть backend.`;
    }
  }

  function getEditorCode() {
    // Monaco повертає RAW текст — <iostream> збережено
    const code = EditorManager.getCode('practiceEditor');
    if (code) {
      console.log('[LessonDetail:getEditorCode] Monaco returned:', code.substring(0, 80));
      return code;
    }
    // Fallback на textarea
    const ta = document.getElementById('practiceCode');
    return ta ? ta.value : '';
  }

  function showHint(lessonId) {
    const box = document.getElementById('hintBox');
    if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }

  function resetCode(lessonId) {
    const defaultCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    \n    return 0;\n}`;
    EditorManager.setCode('practiceEditor', defaultCode);
    const out = document.getElementById('practiceOutput');
    if (out) out.style.display = 'none';
    // Очищаємо збережений код
    try { localStorage.removeItem(`cpp_editor_practice-${lessonId}`); } catch(e) {}
  }

  function markDone(lessonId, xp) {
    State.completeLesson(lessonId, xp);
    UI.toast('🎉 Урок завершено! +' + xp + ' XP', 'gold');
    LessonDetailPage.render(lessonId);
  }

  function setStatus(text) {
    const el = document.getElementById('editorStatus');
    if (el) el.textContent = `● ${text}`;
  }

  return { render, runCode, checkCode, showHint, resetCode, markDone };
})();
