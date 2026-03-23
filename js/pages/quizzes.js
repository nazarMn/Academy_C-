/* js/pages/quizzes.js — Тести та вікторини */

const QuizzesPage = (() => {
  let quizState = null;

  function render() {
    const state = State.get();
    const quizzes = window.QUIZZES_DATA || [];
    UI.render(`
      <div class="section-header animate-fadeIn">
        <div class="section-tag">🧠 Тести</div>
        <h2>Перевір свої знання</h2>
        <p>Пройдіть тести після вивчення кожної теми</p>
      </div>
      <div class="grid-auto stagger-children">
        ${quizzes.map(quiz => {
          const done = (state.completedQuizzes||[]).includes(quiz.id);
          const score = state.quizScores?.[quiz.id] || 0;
          return `
            <div class="card hover-lift" style="cursor:pointer" onclick="Router.go('quiz/${quiz.id}')">
              <div style="font-size:2.5rem;margin-bottom:0.75rem">${quiz.icon}</div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem">
                <h3 style="font-size:1rem">${quiz.title}</h3>
                ${done ? '<span class="badge badge-green">✅</span>' : ''}
              </div>
              ${UI.levelBadge(quiz.level)}
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;font-size:0.85rem;color:var(--text-muted)">
                <span>❓ ${quiz.questions.length} питань</span>
                <span class="badge badge-orange">+${quiz.xp} XP</span>
              </div>
              ${done ? `<div class="mt-sm" style="font-size:0.82rem;color:var(--accent-green)">Кращий результат: ${score}/${quiz.questions.length}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `);
  }

  function renderQuiz(quizId) {
    const quiz = (window.QUIZZES_DATA || []).find(q => q.id === quizId);
    if (!quiz) { render(); return; }

    quizState = {
      quiz, current: 0, score: 0, answers: [],
      answered: false, finished: false,
    };

    showQuestion();
  }

  function showQuestion() {
    if (!quizState) return;
    const { quiz, current, score, finished } = quizState;

    if (finished || current >= quiz.questions.length) {
      showResults();
      return;
    }

    const q = quiz.questions[current];
    const pct = Math.round(((current) / quiz.questions.length) * 100);

    UI.render(`
      <div style="max-width:700px;margin:0 auto">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">
          <a href="#quizzes" class="btn btn-ghost btn-sm" onclick="quizState=null">← Тести</a>
          <h3>${quiz.title}</h3>
        </div>

        <!-- PROGRESS -->
        <div class="card mb-lg">
          <div class="flex-between mb-md">
            <span style="font-size:0.85rem;color:var(--text-muted)">Питання ${current + 1} з ${quiz.questions.length}</span>
            <span style="font-size:0.85rem;color:var(--text-muted)">Рахунок: ${score}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>

        <!-- QUESTION -->
        <div class="card mb-lg animate-scaleIn">
          <div class="badge badge-blue mb-md">Питання ${current + 1}</div>
          <h3 style="margin-bottom:1.5rem;line-height:1.5">${q.question}</h3>
          <div style="display:flex;flex-direction:column;gap:0.6rem" id="options">
            ${q.options.map((opt, i) => `
              <div class="quiz-option" id="opt-${i}" onclick="QuizzesPage.answer(${i})">
                <div class="quiz-letter">${String.fromCharCode(65+i)}</div>
                <span>${opt}</span>
              </div>
            `).join('')}
          </div>
          <div id="explanation" style="display:none" class="card mt-lg" style="border-color:rgba(99,102,241,0.3)">
            <p></p>
          </div>
        </div>

        <div id="nextBtn" style="display:none;text-align:right">
          <button class="btn btn-primary" onclick="QuizzesPage.next()">
            ${current + 1 < quiz.questions.length ? 'Наступне →' : 'Результати 🏆'}
          </button>
        </div>
      </div>
    `);
  }

  function answer(optionIdx) {
    if (quizState.answered) return;
    quizState.answered = true;
    const q = quizState.quiz.questions[quizState.current];

    // Показуємо правильний/неправильний
    q.options.forEach((_, i) => {
      const el = document.getElementById(`opt-${i}`);
      if (!el) return;
      if (i === q.correct) el.classList.add('correct');
      else if (i === optionIdx) el.classList.add('wrong');
      el.style.pointerEvents = 'none';
    });

    if (optionIdx === q.correct) {
      quizState.score++;
      UI.toast('✅ Правильно!', 'success');
    } else {
      UI.toast('❌ Неправильно', 'error');
    }

    // Пояснення
    const expEl = document.getElementById('explanation');
    if (expEl) {
      expEl.style.display = 'block';
      expEl.querySelector('p').innerHTML = `💡 ${q.explanation}`;
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.style.display = 'block';
    quizState.answers.push(optionIdx);
  }

  function next() {
    if (!quizState) return;
    quizState.current++;
    quizState.answered = false;
    if (quizState.current >= quizState.quiz.questions.length) {
      quizState.finished = true;
      showResults();
    } else {
      showQuestion();
    }
  }

  function showResults() {
    const { quiz, score } = quizState;
    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;

    State.completeQuiz(quiz.id, score, total, passed ? quiz.xp : Math.round(quiz.xp * 0.3));

    UI.render(`
      <div style="max-width:600px;margin:0 auto;text-align:center" class="animate-scaleIn">
        <div style="font-size:5rem;margin-bottom:1rem">${pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</div>
        <h2>${pct >= 80 ? 'Чудово!' : pct >= 60 ? 'Добре!' : 'Продовжуй вчитися!'}</h2>
        <div class="stat-card mt-lg mb-lg">
          <div class="stat-number">${pct}%</div>
          <div class="stat-label">${score} з ${total} правильних відповідей</div>
        </div>
        <div class="progress-bar progress-bar-xl mb-lg">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <p class="mb-lg">${passed ? `✅ Тест зараховано! Ви отримали <strong style="color:var(--accent-orange)">+${quiz.xp} XP</strong>` : '❌ Набрано менше 60%. Повторіть матеріал та спробуйте ще!'}</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="QuizzesPage.renderQuiz('${quiz.id}')">🔄 Спробувати ще</button>
          <a href="#quizzes" class="btn btn-outline">← Всі тести</a>
          <a href="#lessons" class="btn btn-ghost">📚 До уроків</a>
        </div>
      </div>
    `);
  }

  return { render, renderQuiz, answer, next, showResults };
})();
