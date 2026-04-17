import { LEVELS } from './constants';

/**
 * Get level data for a given XP amount
 */
export function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) lvl = l;
  }
  return lvl;
}

/**
 * Get XP progress to next level
 */
export function getXPToNextLevel(xp) {
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

/**
 * Format number with space separator (1000 → 1 000)
 */
export function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Get relative time string (e.g., "2 дні тому")
 */
export function relativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'щойно';
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays < 7) return `${diffDays} дн тому`;
  return then.toLocaleDateString('uk-UA');
}

/**
 * Generate activity data for heatmap (last 365 days)
 */
export function generateHeatmapData(activityLog = []) {
  const today = new Date();
  const days = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = activityLog.find(a => a.date === dateStr);
    days.push({
      date: dateStr,
      count: entry ? entry.actions : 0,
      dayOfWeek: date.getDay(),
    });
  }

  return days;
}

/**
 * Classnames utility (like clsx, but zero-dep)
 */
export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
