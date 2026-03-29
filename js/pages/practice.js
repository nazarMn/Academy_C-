/* js/pages/practice.js — Секція практики з Monaco Editor */

const PracticePage = (() => {

  const TASKS = [
    {
      id: 'p1', title: 'Привітання', difficulty: '🌱 Легко', xp: 50,
      desc: 'Напишіть програму, яка виводить "Привіт, C++!" на екран.',
      expected: 'Привіт, C++!',
      hint: 'Використайте cout << "Привіт, C++!" << endl;',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // ваш код\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: 'Привіт, C++!' }],
    },
    {
      id: 'p2', title: 'Сума двох чисел', difficulty: '🌱 Легко', xp: 60,
      desc: 'Визначте два числа a=10, b=25. Виведіть їхню суму.',
      expected: '35',
      hint: 'int a = 10; int b = 25; cout << a + b;',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10, b = 25;\n    // виведіть суму\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '35' }],
    },
    {
      id: 'p3', title: 'Таблиця множення', difficulty: '⚙️ Середньо', xp: 80,
      desc: 'Виведіть таблицю множення числа 5 від 1 до 5 у форматі "5 x 1 = 5".',
      expected: '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25',
      hint: 'Використайте цикл for від i=1 до 5.',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        // виведіть рядок\n    }\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25' }],
    },
    {
      id: 'p4', title: 'Парне чи непарне', difficulty: '⚙️ Середньо', xp: 70,
      desc: 'Для числа 42 виведіть "Парне" або "Непарне".',
      expected: 'Парне',
      hint: 'Якщо 42 % 2 == 0 — парне.',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 42;\n    // перевірте парність\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: 'Парне' }],
    },
    {
      id: 'p5', title: 'Факторіал', difficulty: '🔥 Складно', xp: 100,
      desc: 'Обчисліть факторіал числа 6 (6! = 720). Виведіть результат.',
      expected: '720',
      hint: 'Факторіал = 1*2*3*4*5*6. Використайте цикл або рекурсію.',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 6, fact = 1;\n    // обчисліть факторіал\n    cout << fact;\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '720' }],
    },
    {
      id: 'p6', title: 'Клас Прямокутник', difficulty: '🏛️ ООП', xp: 150,
      desc: 'Створіть клас Прямокутник з полями ширина=4, висота=5. Виведіть площу та периметр.',
      expected: '20\n18',
      hint: 'Площа = ширина * висота, Периметр = 2 * (ширина + висота).',
      template: '#include <iostream>\nusing namespace std;\n\nclass Rectangle {\npublic:\n    int width, height;\n    // додайте методи\n};\n\nint main() {\n    Rectangle r;\n    r.width = 4;\n    r.height = 5;\n    // виведіть площу та периметр\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '20\n18' }],
    },
    {
      id: 'p7', title: 'Реверс масиву', difficulty: '⚙️ Середньо', xp: 90,
      desc: 'Створіть масив {1, 2, 3, 4, 5} і виведіть його у зворотному порядку.',
      expected: '5 4 3 2 1',
      hint: 'Використайте цикл від кінця масиву до початку: for(int i = 4; i >= 0; i--)',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    // виведіть у зворотному порядку\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '5 4 3 2 1' }],
    },
    {
      id: 'p8', title: 'Числа Фібоначчі', difficulty: '🔥 Складно', xp: 120,
      desc: 'Виведіть перші 10 чисел Фібоначчі через пробіл.',
      expected: '0 1 1 2 3 5 8 13 21 34',
      hint: 'F(0)=0, F(1)=1, F(n) = F(n-1) + F(n-2). Використайте цикл.',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Виведіть 10 чисел Фібоначчі\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '0 1 1 2 3 5 8 13 21 34' }],
    },
    {
      id: 'p9', title: 'Пошук максимуму', difficulty: '⚙️ Середньо', xp: 80,
      desc: 'Знайдіть найбільше число у масиві {12, 45, 7, 23, 56, 89, 34}.',
      expected: '89',
      hint: 'Збережіть перше як max, пройдіться циклом: if(arr[i] > max) max = arr[i].',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {12, 45, 7, 23, 56, 89, 34};\n    int n = 7;\n    // знайдіть максимум\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '89' }],
    },
    {
      id: 'p10', title: 'Калькулятор (switch)', difficulty: '⚙️ Середньо', xp: 100,
      desc: 'Створіть функцію calculate(a, op, b). Протестуйте: calculate(10, \'+\', 5) → 15.',
      expected: '15',
      hint: 'Використайте switch(op) з випадками +, -, *, /',
      template: '#include <iostream>\nusing namespace std;\n\nint calculate(int a, char op, int b) {\n    // реалізуйте\n    return 0;\n}\n\nint main() {\n    cout << calculate(10, \'+\', 5);\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '15' }],
    },
    {
      id: 'p11', title: 'Сортування бульбашкою', difficulty: '🔥 Складно', xp: 130,
      desc: 'Відсортуйте масив {64, 34, 25, 12, 22, 11, 90} бульбашковим сортуванням.',
      expected: '11 12 22 25 34 64 90',
      hint: 'Два вкладені цикли: зовнішній і-рази, внутрішній порівнює сусідні елементи.',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = 7;\n    // сортування бульбашкою\n    // виведіть відсортований масив\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '11 12 22 25 34 64 90' }],
    },
    {
      id: 'p12', title: 'Стек (LIFO)', difficulty: '🏛️ ООП / STL', xp: 160,
      desc: 'Використайте std::stack: покладіть 10, 20, 30. Витягніть та виведіть усі елементи.',
      expected: '30 20 10',
      hint: 'stack<int> s; s.push(10); ... while(!s.empty()) { cout << s.top(); s.pop(); }',
      template: '#include <iostream>\n#include <stack>\nusing namespace std;\n\nint main() {\n    stack<int> s;\n    // ваш код\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '30 20 10' }],
    },
  ];

  let currentTask = null;

  function render() {
    const state = State.get();
    UI.render(`
      <div class="section-header animate-fadeIn">
        <div class="section-tag">💻 Практика</div>
        <h2>Практичні завдання</h2>
        <p>Вирішуйте завдання та отримуйте XP за кожне виконане</p>
      </div>

      <div style="display:grid;grid-template-columns:320px 1fr;gap:2rem;align-items:start">
        <!-- TASK LIST -->
        <div>
          <div class="card mb-md" style="padding:1rem">
            <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.3rem">Виконано завдань</div>
            <div style="font-size:1.5rem;font-weight:800" class="gradient-text">
              ${(state.practiceCompleted||[]).length} / ${TASKS.length}
            </div>
            <div class="progress-bar mt-sm">
              <div class="progress-fill" style="width:${TASKS.length ? Math.round(((state.practiceCompleted||[]).length / TASKS.length) * 100) : 0}%"></div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.4rem" id="taskList">
            ${TASKS.map(t => {
              const done = (state.practiceCompleted||[]).includes(t.id);
              return `
                <div class="lesson-card ${done ? 'completed' : ''}" onclick="PracticePage.selectTask('${t.id}')">
                  <div class="lesson-card-body">
                    <div class="lesson-card-title">${t.title}</div>
                    <div class="lesson-card-meta">
                      <span>${t.difficulty}</span>
                      <span class="lesson-card-xp">+${t.xp} XP</span>
                      ${done ? '<span style="color:var(--accent-green);font-size:0.78rem">✓</span>' : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- EDITOR AREA -->
        <div id="taskEditor">
          <div class="card" style="text-align:center;padding:3rem">
            <div style="font-size:4rem;margin-bottom:1rem">👈</div>
            <h3>Оберіть завдання</h3>
            <p class="mt-sm">Виберіть завдання зі списку зліва щоб розпочати</p>
          </div>
        </div>
      </div>

      <style>
        @media(max-width:768px){
          #taskEditor{grid-column:1/-1}
          [style*="grid-template-columns:320px"]{grid-template-columns:1fr!important}
        }
      </style>
    `);
  }

  function selectTask(taskId) {
    currentTask = TASKS.find(t => t.id === taskId);
    if (!currentTask) return;
    const done = (State.get().practiceCompleted||[]).includes(taskId);
    const savedCode = EditorManager.loadSavedCode(`task-${taskId}`);
    const el = document.getElementById('taskEditor');
    if (!el) return;

    el.innerHTML = `
      <div class="card mb-md card-gradient">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem">
          <div>
            <div class="badge badge-blue mb-md">${currentTask.difficulty}</div>
            <h3>${currentTask.title}</h3>
            <p class="mt-sm">${currentTask.desc}</p>
          </div>
          <span class="badge badge-orange">+${currentTask.xp} XP</span>
        </div>
        <div class="mt-md" style="font-size:0.85rem;color:var(--text-muted)">
          Очікуваний вивід: <code style="background:var(--bg-tertiary);padding:0.2rem 0.5rem;border-radius:4px;font-family:var(--font-code)">${currentTask.expected.replace(/\n/g,'\\n')}</code>
        </div>
      </div>

      <div class="monaco-editor-wrapper mb-md">
        <div class="monaco-editor-header">
          <div class="code-dots"><div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div></div>
          <span style="font-size:0.78rem;color:var(--text-muted);font-family:var(--font-code)">solution.cpp</span>
          <span class="monaco-status" id="taskStatus">● Готовий</span>
        </div>
        <div id="taskMonacoEditor" class="monaco-container" style="height:300px;"></div>
        <div id="taskStdinSection" style="display:none;margin-top:0.5rem;">
          <label style="font-size:0.82rem;color:var(--text-muted);display:block;margin-bottom:0.3rem">⌨️ Ввід програми (stdin):</label>
          <textarea id="taskStdinInput" rows="2" style="width:100%;background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;font-family:var(--font-code);font-size:0.85rem;resize:vertical" placeholder="Введіть дані для cin..."></textarea>
        </div>
        <div class="code-output" id="codeOutput" style="display:none;min-height:60px"></div>
      </div>

      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="PracticePage.runCode()">▶ Запустити</button>
        <button class="btn btn-ghost" onclick="PracticePage.showHint()">💡 Підказка</button>
        <button class="btn btn-ghost" onclick="PracticePage.resetTask()">🔄 Скинути</button>
      </div>
      <div id="practiceHint" style="display:none" class="card mt-md">
        <p>💡 <strong>Підказка:</strong> ${currentTask.hint}</p>
      </div>
      ${done ? '<div class="card mt-md" style="border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.05)"><p>✅ <strong>Завдання вже виконане!</strong> Ви отримали XP за нього.</p></div>' : ''}
    `;

    // Ініціалізуємо Monaco
    EditorManager.onReady(() => {
      EditorManager.create('taskMonacoEditor', savedCode || currentTask.template, {});
    });
  }

  async function runCode() {
    const code = EditorManager.getCode('taskMonacoEditor') || '';
    const outEl = document.getElementById('codeOutput');
    if (!outEl || !currentTask) return;
    outEl.style.display = 'block';

    if (code.trim().length < 10) {
      outEl.className = 'code-output output-error';
      outEl.textContent = '❌ Код занадто короткий. Напишіть своє рішення.';
      return;
    }

    outEl.className = 'code-output';
    outEl.textContent = '⏳ Компіляція...';
    setTaskStatus('Виконання...');

    try {
      const stdinEl = document.getElementById('taskStdinInput');
      const input = stdinEl ? stdinEl.value : '';
      const response = await fetch(`${window.BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input, testCases: currentTask.testCases }),
      });

      if (!response.ok) throw new Error('Backend unavailable');
      const result = await response.json();

      if (result.status === 'compile_error') {
        outEl.className = 'code-output output-error';
        outEl.textContent = `❌ Помилка компіляції:\n\n${result.compileError}`;
      } else if (result.status === 'accepted') {
        outEl.className = 'code-output output-success';
        const testResults = (result.testResults || []).map((t, i) =>
          `Тест ${i+1}: ✅ Пройдений (${t.timeMs}мс)`
        ).join('\n');
        outEl.textContent = `✅ Всі тести пройдено!\n\n${testResults}`;
        markPracticeComplete();
      } else if (result.status === 'time_limit') {
        outEl.className = 'code-output output-error';
        outEl.textContent = '⏱️ Перевищено час виконання. Перевірте нескінченні цикли!';
      } else {
        outEl.className = 'code-output output-hint';
        const testResults = (result.testResults || []).map((t, i) =>
          `Тест ${i+1}: ${t.passed ? '✅ Пройдений' : '❌ Провалений'}\n  Очікувано: ${t.expected}\n  Отримано:  ${t.actual}`
        ).join('\n\n');
        outEl.textContent = `⚠️ Не всі тести пройдено:\n\n${testResults}`;
      }
      setTaskStatus('Готовий');
    } catch (err) {
      // Fallback без backend
      fallbackRun(code, outEl);
    }
  }

  function fallbackRun(code, outEl) {
    const hasMain = code.includes('main');
    const hasCout = code.includes('cout') || code.includes('printf');
    const hasInclude = code.includes('#include');
    const codeClean = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''); // без коментарів

    // Задачо-специфічні евристики
    const taskChecks = {
      'p1': () => codeClean.includes('"') && codeClean.includes('cout'),
      'p2': () => codeClean.includes('+') || codeClean.includes('sum'),
      'p3': () => codeClean.includes('for') || codeClean.includes('while'),
      'p4': () => codeClean.includes('%') || codeClean.includes('mod'),
      'p5': () => (codeClean.includes('for') || codeClean.includes('while') || codeClean.includes('factorial') || codeClean.includes('fact')),
      'p6': () => codeClean.includes('class') || codeClean.includes('struct'),
      'p7': () => (codeClean.includes('for') || codeClean.includes('while')) && codeClean.includes('arr'),
      'p8': () => (codeClean.includes('for') || codeClean.includes('while')),
      'p9': () => codeClean.includes('max') || (codeClean.includes('>') && codeClean.includes('arr')),
      'p10': () => codeClean.includes('switch') || codeClean.includes('if'),
      'p11': () => codeClean.includes('for') && (codeClean.includes('swap') || codeClean.includes('temp') || codeClean.includes('>')),
      'p12': () => codeClean.includes('stack') && codeClean.includes('push'),
    };

    const taskSpecific = taskChecks[currentTask.id] ? taskChecks[currentTask.id]() : true;
    const codeLength = codeClean.replace(/\s/g, '').length;

    if (hasMain && hasCout && hasInclude && taskSpecific && codeLength > 50) {
      outEl.className = 'code-output output-success';
      outEl.textContent = `✅ Код виглядає правильно! (офлайн режим)\n\nОчікуваний вивід:\n${currentTask.expected}\n\n💡 Для точної перевірки запустіть backend.`;
      markPracticeComplete();
    } else {
      outEl.className = 'code-output output-hint';
      let missing = [];
      if (!hasMain) missing.push('функцію main()');
      if (!hasCout) missing.push('вивід (cout)');
      if (!hasInclude) missing.push('#include');
      if (!taskSpecific) missing.push('логіку рішення');
      outEl.textContent = `⚠️ Перевірте код (офлайн режим).\n\n${missing.length ? 'Не вистачає: ' + missing.join(', ') + '\n\n' : ''}Очікуваний вивід:\n${currentTask.expected}\n\n💡 Запустіть backend для точної перевірки.`;
    }
    setTaskStatus('Offline');
  }

  function markPracticeComplete() {
    if (!currentTask) return;
    if (!(State.get().practiceCompleted||[]).includes(currentTask.id)) {
      State.get().practiceCompleted = State.get().practiceCompleted || [];
      State.get().practiceCompleted.push(currentTask.id);
      State.addXP(currentTask.xp);
      UI.showXPPopup(`+${currentTask.xp} XP`);
      UI.toast('🎉 Завдання виконано!', 'success');
      try { localStorage.setItem('cpp_academy_state', JSON.stringify(State.get())); } catch(e){}
    }
  }

  function showHint() {
    const el = document.getElementById('practiceHint');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  function resetTask() {
    if (!currentTask) return;
    EditorManager.setCode('taskMonacoEditor', currentTask.template);
    const out = document.getElementById('codeOutput');
    if (out) out.style.display = 'none';
    try { localStorage.removeItem(`cpp_editor_task-${currentTask.id}`); } catch(e) {}
  }

  function setTaskStatus(text) {
    const el = document.getElementById('taskStatus');
    if (el) el.textContent = `● ${text}`;
  }

  function getTemplate() { return currentTask?.template || ''; }

  return { render, selectTask, runCode, showHint, resetTask, getTemplate };
})();
