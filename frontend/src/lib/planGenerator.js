/**
 * Plan Generator — creates a personalized learning plan from onboarding answers.
 * Pure rule-based, no AI.
 */

const GOAL_TO_TYPE = {
  job:        'practical',
  university: 'academic',
  games:      'interactive',
  fun:        'light',
};

const TIME_TO_PACE = {
  15: 'slow',
  30: 'medium',
  60: 'fast',
};

const LEVEL_TO_DIFFICULTY = {
  zero:         'easy',
  basic:        'normal',
  intermediate: 'hard',
};

/**
 * Generate a structured learning plan from onboarding data.
 * @param {{ goal: string, time: number, level: string }} data
 * @returns {{ type: string, pace: string, difficulty: string, dailyLessons: number, focusAreas: string[] }}
 */
export function generatePlan({ goal, time, level }) {
  const type = GOAL_TO_TYPE[goal] || 'practical';
  const pace = TIME_TO_PACE[time] || 'medium';
  const difficulty = LEVEL_TO_DIFFICULTY[level] || 'easy';

  // How many lessons per day based on pace
  const dailyLessons = pace === 'slow' ? 1 : pace === 'medium' ? 2 : 3;

  // Focus areas based on goal
  const focusAreas = {
    job:        ['ООП', 'Шаблони', 'STL', 'Проєкти'],
    university: ['Теорія', 'Алгоритми', 'Пам\'ять', 'Рекурсія'],
    games:      ['ООП', 'Поліморфізм', 'Покажчики', 'Класи'],
    fun:        ['Основи', 'Цикли', 'Функції', 'Практика'],
  };

  return {
    type,
    pace,
    difficulty,
    dailyLessons,
    focusAreas: focusAreas[goal] || focusAreas.fun,
  };
}

/**
 * Get a greeting message based on time of day.
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6)  return 'Доброї ночі';
  if (hour < 12) return 'Доброго ранку';
  if (hour < 18) return 'Доброго дня';
  return 'Доброго вечора';
}

/**
 * Get a motivational tip based on plan type.
 */
export function getPlanTip(planType) {
  const tips = {
    practical:   'Фокусуйтесь на проєктах та практичних задачах',
    academic:    'Важлива теорія та глибоке розуміння концепцій',
    interactive: 'Вчіться через виправлення коду та експерименти',
    light:       'Рухайтесь у своєму темпі, головне — регулярність',
  };
  return tips[planType] || tips.light;
}
