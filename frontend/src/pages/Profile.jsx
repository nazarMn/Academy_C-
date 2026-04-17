import {
  User, Calendar, Flame, Star, Award, BookOpen, Code2,
  Brain, Trophy, Boxes, Target, Zap
} from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import ActivityGraph from '@/components/charts/ActivityGraph';
import useAppStore from '@/stores/useAppStore';
import { getLevel, getXPToNextLevel, formatNumber, relativeTime } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/lib/constants';
import { useState, useEffect } from 'react';
const ACHIEVEMENT_ICONS = {
  'first_lesson':  BookOpen,
  'five_lessons':  Star,
  'ten_lessons':   Trophy,
  'all_lessons':   Target,
  'first_quiz':    Brain,
  'perfect_quiz':  Zap,
  'first_project': Boxes,
  'streak_3':      Flame,
  'streak_7':      Flame,
  'xp_500':        Star,
  'xp_2000':       Award,
  'oop_master':    Trophy,
};

export default function Profile() {
  const {
    user, xp, level, streak, completedLessons, completedQuizzes,
    practiceCompleted, startedProjects, unlockedAchievements,
    activityLog, lastActiveDate,
  } = useAppStore();

  const levelInfo = getLevel(xp);
  const progressObj = getXPToNextLevel(xp);
  const [totalLessons, setTotalLessons] = useState(25); // Fallback estimate

  useEffect(() => {
    fetch('http://localhost:3001/api/lessons')
      .then(res => res.json())
      .then(data => setTotalLessons(data.length))
      .catch(() => {});
  }, []);
  const memberSince = user.joinedAt ? new Date(user.joinedAt) : new Date();

  // Determine badge level tier
  let badgeTier = 'beginner';
  if (levelInfo.level >= 4) badgeTier = 'intermediate';
  if (levelInfo.level >= 7) badgeTier = 'advanced';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Profile header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-50">{user.name}</h1>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-sm text-surface-400 flex items-center gap-1.5">
              <Calendar size={14} />
              Учасник з {memberSince.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-sm text-surface-400 flex items-center gap-1.5">
              <Flame size={14} className={streak > 0 ? 'text-orange-400' : ''} />
              {streak} {streak === 1 ? 'день' : streak < 5 ? 'дні' : 'днів'} серія
            </span>
          </div>
        </div>
        <Badge.Level level={badgeTier} />
      </div>

      {/* Level & XP */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-semibold text-surface-100">Рівень {levelInfo.level}</span>
            <span className="text-xs text-surface-500 ml-2">{levelInfo.name}</span>
          </div>
          <span className="text-sm font-mono text-accent">{formatNumber(xp)} XP</span>
        </div>
        <ProgressBar value={progressObj.pct} size="lg" />
        <div className="flex justify-between text-xs text-surface-500 mt-2">
          <span>Рівень {levelInfo.level}</span>
          <span>{formatNumber(progressObj.needed - progressObj.current)} XP до рівня {levelInfo.level + 1}</span>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Загальний XP',   value: formatNumber(xp),        icon: Star,    color: 'text-yellow-400' },
          { label: 'Уроків',          value: `${completedLessons.length}/${totalLessons}`, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Тестів',          value: completedQuizzes.length,  icon: Brain,   color: 'text-violet-400' },
          { label: 'Завдань',         value: practiceCompleted.length,  icon: Code2,   color: 'text-blue-400' },
        ].map(stat => (
          <Card key={stat.label} padding="p-4">
            <stat.icon size={18} className={`${stat.color} mb-2`} />
            <div className="text-lg font-bold text-surface-50">{stat.value}</div>
            <div className="text-xs text-surface-500">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Activity heatmap — full size */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-100">Активність</h2>
          <span className="text-xs text-surface-500">
            {activityLog.reduce((sum, a) => sum + a.actions, 0)} дій за останній рік
          </span>
        </div>
        <ActivityGraph data={activityLog} />
      </Card>

      {/* Achievements */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-100">Досягнення</h2>
          <span className="text-xs text-surface-500">
            {unlockedAchievements.length}/{ACHIEVEMENTS.length} відкрито
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = unlockedAchievements.includes(ach.id);
            const IconComp = ACHIEVEMENT_ICONS[ach.id] || Award;

            return (
              <div
                key={ach.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  unlocked
                    ? 'border-accent/30 bg-accent-subtle'
                    : 'border-surface-800 bg-surface-900/50 opacity-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  unlocked ? 'bg-accent/20' : 'bg-surface-800'
                }`}>
                  <IconComp size={18} className={unlocked ? 'text-accent' : 'text-surface-600'} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    unlocked ? 'text-surface-100' : 'text-surface-500'
                  }`}>
                    {ach.title}
                  </p>
                  <p className="text-[10px] text-surface-600 truncate">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Course progress breakdown */}
      <Card>
        <h2 className="text-base font-semibold text-surface-100 mb-4">Прогрес курсу</h2>
        <div className="space-y-3">
          {[
            { label: 'Уроки', done: completedLessons.length, total: totalLessons, color: 'success' },
            { label: 'Практика', done: practiceCompleted.length, total: 12, color: 'accent' },
            { label: 'Тести', done: completedQuizzes.length, total: 6, color: 'warning' },
            { label: 'Проєкти', done: startedProjects.length, total: 5, color: 'info' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-surface-300">{item.label}</span>
                <span className="text-xs text-surface-500 font-mono">{item.done}/{item.total}</span>
              </div>
              <ProgressBar
                value={item.total ? Math.round((item.done / item.total) * 100) : 0}
                size="sm"
                color={item.color}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
