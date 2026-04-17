/**
 * Dynamic Content Injection Engine
 *
 * Replaces {variables} in lesson content with actual user data.
 * Falls back to safe defaults if data is missing.
 */

const FALLBACKS = {
  userName:         'Студент',
  goal:             'навчання',
  time:             '30',
  level:            'початківець',
  streak:           '0',
  lessonsCompleted: '0',
  planType:         'practical',
  greeting:         'Привіт',
};

const GOAL_LABELS = {
  job:        'роботу',
  university: 'університет',
  games:      'геймдев',
  fun:        'хобі',
};

const LEVEL_LABELS = {
  zero:         'початківець',
  basic:        'базовий',
  intermediate: 'середній',
};

/**
 * Inject user data into content string.
 * Supports: {userName}, {goal}, {time}, {level}, {streak},
 *           {lessonsCompleted}, {planType}, {greeting}
 *
 * @param {string} content — raw content with {variables}
 * @param {object} userData — user profile + stats
 * @returns {string}
 */
export function inject(content, userData = {}) {
  if (!content || typeof content !== 'string') return content || '';

  const hour = new Date().getHours();
  const greeting = hour < 6  ? 'Доброї ночі' :
                   hour < 12 ? 'Доброго ранку' :
                   hour < 18 ? 'Доброго дня' : 'Доброго вечора';

  const vars = {
    userName:         userData.name || userData.userName || FALLBACKS.userName,
    goal:             GOAL_LABELS[userData.goal] || userData.goal || FALLBACKS.goal,
    time:             String(userData.time || FALLBACKS.time),
    level:            LEVEL_LABELS[userData.level] || userData.level || FALLBACKS.level,
    streak:           String(userData.streak ?? FALLBACKS.streak),
    lessonsCompleted: String(userData.lessonsCompleted ?? userData.completedLessons?.length ?? FALLBACKS.lessonsCompleted),
    planType:         userData.plan?.type || userData.planType || FALLBACKS.planType,
    greeting,
  };

  return content.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
}

/**
 * Inject into an entire lesson object (explanation, practiceTask, code, hint).
 */
export function injectLesson(lesson, userData) {
  if (!lesson) return lesson;

  return {
    ...lesson,
    explanation: inject(lesson.explanation, userData),
    practiceTask: inject(lesson.practiceTask, userData),
    code: inject(lesson.code, userData),
    hint: inject(lesson.hint, userData),
    title: inject(lesson.title, userData),
  };
}
