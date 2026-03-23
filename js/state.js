/* js/state.js — Стан застосунку та прогрес користувача */

const State = (() => {
  const STORAGE_KEY = 'cpp_academy_state';

  const LEVELS = [
    { level: 1, name: 'Новачок',      xpRequired: 0 },
    { level: 2, name: 'Учень',        xpRequired: 200 },
    { level: 3, name: 'Практикант',   xpRequired: 500 },
    { level: 4, name: 'Розробник',    xpRequired: 1000 },
    { level: 5, name: 'Спеціаліст',   xpRequired: 2000 },
    { level: 6, name: 'Майстер',      xpRequired: 3500 },
    { level: 7, name: 'Експерт',      xpRequired: 5500 },
    { level: 8, name: 'Архітектор',   xpRequired: 8000 },
    { level: 9, name: 'Гуру C++',     xpRequired: 12000 },
    { level: 10,name: 'Легенда',      xpRequired: 20000 },
  ];

  const ACHIEVEMENTS = [
    { id: 'first_lesson',   icon: '🎯', title: 'Перший крок',   desc: 'Завершіть перший урок',          check: s => s.completedLessons.length >= 1 },
    { id: 'five_lessons',   icon: '📚', title: 'Бібліотекар',   desc: 'Завершіть 5 уроків',             check: s => s.completedLessons.length >= 5 },
    { id: 'ten_lessons',    icon: '🏆', title: 'Наполегливий',  desc: 'Завершіть 10 уроків',            check: s => s.completedLessons.length >= 10 },
    { id: 'all_lessons',    icon: '👑', title: 'Майстер',       desc: 'Завершіть усі уроки',            check: s => s.completedLessons.length >= (window.LESSONS_DATA || []).length },
    { id: 'first_quiz',     icon: '🧠', title: 'Розумник',      desc: 'Пройдіть перший тест',           check: s => s.completedQuizzes.length >= 1 },
    { id: 'perfect_quiz',   icon: '⭐', title: 'Відмінник',     desc: 'Отримайте 100% на будь-якому тесті', check: s => s.perfectQuizzes && s.perfectQuizzes.length >= 1 },
    { id: 'first_project',  icon: '🚀', title: 'Будівельник',   desc: 'Розпочніть перший проєкт',      check: s => s.startedProjects && s.startedProjects.length >= 1 },
    { id: 'streak_3',       icon: '🔥', title: 'Мотивований',   desc: '3 дні поспіль',                  check: s => s.streak >= 3 },
    { id: 'streak_7',       icon: '⚡', title: 'Тиждень',       desc: '7 днів поспіль',                 check: s => s.streak >= 7 },
    { id: 'xp_500',         icon: '💎', title: 'Збирач XP',     desc: 'Наберіть 500 XP',               check: s => s.xp >= 500 },
    { id: 'xp_2000',        icon: '🌟', title: 'Ветеран',       desc: 'Наберіть 2000 XP',              check: s => s.xp >= 2000 },
    { id: 'oop_master',     icon: '🏛️', title: 'ООП Майстер',  desc: 'Завершіть усі ООП уроки',        check: s => {
        const oopLessons = (window.LESSONS_DATA || []).filter(l => l.level === 'oop').map(l => l.id);
        return oopLessons.every(id => s.completedLessons.includes(id));
      }
    },
  ];

  // Завантажуємо або ініціалізуємо стан
  let _state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return {
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      completedQuizzes: [],
      perfectQuizzes: [],
      startedProjects: [],
      unlockedAchievements: [],
      practiceCompleted: [],
      quizScores: {},
    };
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch(e) {}
  }

  function getLevel(xp) {
    let lvl = LEVELS[0];
    for (const l of LEVELS) { if (xp >= l.xpRequired) lvl = l; }
    return lvl;
  }

  function getXPToNextLevel(xp) {
    const current = getLevel(xp);
    const nextIdx = LEVELS.findIndex(l => l.level === current.level + 1);
    if (nextIdx === -1) return { current: xp, needed: xp, pct: 100 };
    const next = LEVELS[nextIdx];
    return {
      current: xp - current.xpRequired,
      needed: next.xpRequired - current.xpRequired,
      pct: Math.min(100, Math.round(((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100)),
    };
  }

  function addXP(amount) {
    const oldLevel = getLevel(_state.xp).level;
    _state.xp += amount;
    const newLevel = getLevel(_state.xp).level;
    _state.level = newLevel;
    saveState();
    checkAchievements();
    updateStreakUI();
    if (newLevel > oldLevel) {
      const lvlData = getLevel(_state.xp);
      UI.toast(`🎉 Новий рівень! ${lvlData.name} (${newLevel})`, 'gold');
    }
    return _state.xp;
  }

  function completeLesson(lessonId, xp) {
    if (!_state.completedLessons.includes(lessonId)) {
      _state.completedLessons.push(lessonId);
      saveState();
      addXP(xp);
      UI.showXPPopup(`+${xp} XP`);
      checkAchievements();
    }
  }

  function completeQuiz(quizId, score, total, xp) {
    if (!_state.completedQuizzes.includes(quizId)) {
      _state.completedQuizzes.push(quizId);
    }
    _state.quizScores[quizId] = Math.max(_state.quizScores[quizId] || 0, score);
    if (score === total && !(_state.perfectQuizzes || []).includes(quizId)) {
      _state.perfectQuizzes = _state.perfectQuizzes || [];
      _state.perfectQuizzes.push(quizId);
    }
    saveState();
    addXP(xp);
    checkAchievements();
  }

  function startProject(projectId) {
    _state.startedProjects = _state.startedProjects || [];
    if (!_state.startedProjects.includes(projectId)) {
      _state.startedProjects.push(projectId);
      saveState();
      checkAchievements();
    }
  }

  function isLessonCompleted(id) {
    return _state.completedLessons.includes(id);
  }

  function isLessonLocked(index) {
    // Перший урок завжди доступний, інші — якщо попередній пройдено
    if (index === 0) return false;
    const lessons = window.LESSONS_DATA || [];
    const prevId = lessons[index - 1]?.id;
    return prevId && !_state.completedLessons.includes(prevId);
  }

  function checkAchievements() {
    let newUnlock = false;
    for (const ach of ACHIEVEMENTS) {
      if (!_state.unlockedAchievements.includes(ach.id) && ach.check(_state)) {
        _state.unlockedAchievements.push(ach.id);
        newUnlock = true;
        setTimeout(() => UI.toast(`🏆 Досягнення: ${ach.title}!`, 'gold'), 500);
      }
    }
    if (newUnlock) saveState();
  }

  function updateStreak() {
    const today = new Date().toDateString();
    if (_state.lastActiveDate !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (_state.lastActiveDate === yesterday.toDateString()) {
        _state.streak++;
      } else if (_state.lastActiveDate !== today) {
        _state.streak = 1;
      }
      _state.lastActiveDate = today;
      saveState();
    }
  }

  function updateStreakUI() {
    const el = document.getElementById('sidebarXPValue');
    if (el) el.textContent = _state.xp;
    const fill = document.getElementById('sidebarXPFill');
    if (fill) fill.style.width = getXPToNextLevel(_state.xp).pct + '%';
  }

  function resetState() {
    _state = {
      xp: 0, level: 1, streak: 0, lastActiveDate: null,
      completedLessons: [], completedQuizzes: [], perfectQuizzes: [],
      startedProjects: [], unlockedAchievements: [], practiceCompleted: [], quizScores: {},
    };
    saveState();
  }

  return {
    get: () => _state,
    getLevel, getXPToNextLevel,
    addXP, completeLesson, completeQuiz, startProject,
    isLessonCompleted, isLessonLocked,
    LEVELS, ACHIEVEMENTS,
    updateStreakUI, updateStreak, checkAchievements, resetState,
  };
})();
