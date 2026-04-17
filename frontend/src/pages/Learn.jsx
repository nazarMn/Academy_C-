import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, ChevronRight, Zap, Target, BookOpen, Clock } from 'lucide-react';
import { Card, Badge, ProgressBar, Button } from '@/components/ui';
import useAppStore from '@/stores/useAppStore';
import { LEVEL_COLORS } from '@/lib/constants';
import { getLanguageConfig } from '@/lib/languages';

const LEVEL_GROUPS = [
  { key: 'beginner', title: 'Основи', desc: 'Базовий синтаксис та типи даних' },
  { key: 'intermediate', title: 'Контроль', desc: 'Умови, цикли та функції' },
  { key: 'advanced', title: 'Пам\'ять', desc: 'Покажчики та масиви' },
  { key: 'oop', title: 'ООП', desc: 'Класи та об\'єкти' }
];

export default function Learn() {
  const { completedLessons, isLessonCompleted, onboardingProfile, activeCourse, user } = useAppStore();
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'interactive'
  const [lessons, setLessons] = useState([]);
  const [interactiveLessons, setInteractiveLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const langConfig = getLanguageConfig(activeCourse);
  const isComingSoon = !langConfig.active && user?.role !== 'admin';

  useEffect(() => {
    async function load() {
      if (isComingSoon) {
        setLoading(false);
        return;
      }
      try {
        const [resL, resI] = await Promise.all([
          fetch(`http://localhost:3001/api/lessons?courseId=${activeCourse}`),
          fetch(`http://localhost:3001/api/interactive?courseId=${activeCourse}`)
        ]);
        if (resL.ok) setLessons(await resL.json());
        if (resI.ok) setInteractiveLessons(await resI.json());
      } catch (err) {
        console.error('Failed to load lessons', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeCourse]);

  const totalLessons = lessons.length + interactiveLessons.length;
  // Count only completed lessons that belong to the current course (i.e. exist in fetched lessons)
  const completedCount = completedLessons.filter(
    id => lessons.some(l => l.id === id) || interactiveLessons.some(l => l.id === id)
  ).length;
  const overallPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header & Personalization */}
      <div>
        <h1 className="text-3xl font-bold text-surface-50 mb-2">Навчальний шлях</h1>
        {onboardingProfile ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-surface-900 border border-surface-700 p-4 rounded-xl mt-4">
            <div className="bg-accent/20 p-2.5 rounded-lg">
              <Target className="text-accent" size={24} />
            </div>
            <div>
              <h2 className="text-surface-100 font-semibold mb-0.5">Персоналізована програма</h2>
              <p className="text-sm text-surface-400">
                Темп: <span className="text-surface-300 font-medium">{onboardingProfile.plan?.pace === 'fast' ? 'Інтенсивний' : 'Середній'}</span> •
                Урок на день: <span className="text-surface-300 font-medium">{onboardingProfile.plan?.dailyLessons || 2}</span>
              </p>
            </div>
            {/* Soft encouragement depending on profile */}
            {onboardingProfile.plan?.pace === 'fast' && (
              <Badge color="warning" className="sm:ml-auto self-start mt-2 sm:mt-0">Швидкий темп 🚀</Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-surface-400">
            Структурований шлях від основ до просунутих тем
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-900/50 p-1 rounded-lg w-fit border border-surface-800">
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'academic' ? 'bg-surface-800 text-surface-50 shadow-sm' : 'text-surface-400 hover:text-surface-200'
            }`}
        >
          <BookOpen size={16} /> Академічні
        </button>
        <button
          onClick={() => setActiveTab('interactive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'interactive' ? 'bg-surface-800 text-surface-50 shadow-sm' : 'text-surface-400 hover:text-surface-200'
            }`}
        >
          <Zap size={16} className={activeTab === 'interactive' ? 'text-warning' : ''} /> Інтерактивні
        </button>
      </div>

      {isComingSoon ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in border border-surface-700/50 rounded-2xl bg-surface-900/40">
          <Clock size={48} className="text-surface-600 mb-4" />
          <h2 className="text-2xl font-bold text-surface-100 mb-2">Курс у розробці</h2>
          <p className="text-surface-400 max-w-md mx-auto mb-6">
            Ми активно працюємо над створенням уроків для {langConfig.name}. Слідкуйте за оновленнями!
          </p>
          {user?.role !== 'admin' && (
             <Button variant="secondary" onClick={() => window.history.back()}>
                Повернутися назад
             </Button>
          )}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'academic' ? (
        <>
          {/* Overall progress */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-surface-200">Загальний прогрес</span>
              <span className="text-sm font-mono text-accent">{completedCount}/{totalLessons} уроків</span>
            </div>
            <ProgressBar value={overallPct} size="lg" />
            <div className="flex justify-between text-xs text-surface-500 mt-2">
              <span>{overallPct > 100 ? 100 : overallPct}% завершено</span>
              <span>{Math.max(0, totalLessons - completedCount)} залишилось</span>
            </div>
          </Card>

          {/* Level sections */}
          <div className="space-y-6 stagger">
            {LEVEL_GROUPS.map(group => {
              const groupLessons = lessons.filter(l => l.level === group.key);
              if (groupLessons.length === 0) return null;

              const groupCompleted = groupLessons.filter(l => isLessonCompleted(l.id)).length;
              const colors = LEVEL_COLORS[group.key] || LEVEL_COLORS.beginner;
              const isFullyCompleted = groupCompleted === groupLessons.length;

              return (
                <LevelSection
                  key={group.key}
                  group={group}
                  lessons={groupLessons}
                  allLessons={lessons}
                  completedCount={groupCompleted}
                  colors={colors}
                  isFullyCompleted={isFullyCompleted}
                  isLessonCompleted={isLessonCompleted}
                  type="academic"
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <Card variant="gradient" className="border-warning/30 to-warning/5">
            <h3 className="text-lg font-bold text-warning mb-2 flex items-center gap-2">
              <Zap size={20} /> Інтерактивні виклики
            </h3>
            <p className="text-sm text-surface-300">
              Виправи код, який містить помилки або логічний баг. Це динамічні тести, в яких система відслідковує патерни помилок!
            </p>
          </Card>

          <div className="space-y-6 stagger">
            {LEVEL_GROUPS.map(group => {
              const groupLessons = interactiveLessons.filter(l => l.level === group.key);
              if (groupLessons.length === 0) return null;

              const groupCompleted = groupLessons.filter(l => isLessonCompleted(l.id)).length;
              const colors = LEVEL_COLORS[group.key] || LEVEL_COLORS.beginner;

              return (
                <LevelSection
                  key={group.key}
                  group={group}
                  lessons={groupLessons}
                  allLessons={interactiveLessons}
                  completedCount={groupCompleted}
                  colors={colors}
                  isFullyCompleted={groupCompleted === groupLessons.length}
                  isLessonCompleted={isLessonCompleted}
                  type="interactive"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Level Section ───
function LevelSection({ group, lessons, allLessons, completedCount, colors, isFullyCompleted, isLessonCompleted, type }) {
  const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  // Let's assume Interactive lessons don't strict lock (or lock only upon each other)
  const isLockedForType = (globalIdx) => {
    if (globalIdx === 0) return false;
    const prevId = allLessons[globalIdx - 1]?.id;
    return prevId && !isLessonCompleted(prevId);
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          <div>
            <h2 className="text-base font-semibold text-surface-50">{group.title}</h2>
            <p className="text-xs text-surface-500">{group.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-500">
            {completedCount}/{lessons.length}
          </span>
          {isFullyCompleted && (
            <Badge color="success" size="sm">Завершено</Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 pl-5 border-l-2 border-surface-800 ml-1">
        <ProgressBar
          value={pct}
          size="sm"
          color={
            group.key === 'beginner' ? 'success' :
              group.key === 'intermediate' ? 'warning' :
                group.key === 'oop' ? 'accent' : 'info'
          }
        />
      </div>

      {/* Lesson cards */}
      <div className="space-y-1.5 pl-5 border-l-2 border-surface-800 ml-1 ">
        {lessons.map((lesson) => {
          const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
          const completed = isLessonCompleted(lesson.id);
          const locked = isLockedForType(globalIdx);

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={completed}
              locked={locked}
              colors={colors}
              type={type}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Lesson Card ───
function LessonCard({ lesson, completed, locked, colors, type }) {
  const content = (
    <div
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-lg
        border transition-all duration-200
        ${completed
          ? 'bg-success-muted border-success/20'
          : locked
            ? 'bg-surface-900/50 border-surface-800 opacity-60 cursor-not-allowed'
            : 'bg-surface-900 border-surface-700 hover:border-surface-600 hover:bg-surface-800 cursor-pointer'
        }
      `}
    >
      {/* Status indicator */}
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
        ${completed
          ? 'bg-success/20'
          : locked
            ? 'bg-surface-800'
            : `${colors.bg}`
        }
      `}>
        {completed ? (
          <Check size={14} className="text-success" />
        ) : locked ? (
          <Lock size={12} className="text-surface-600" />
        ) : type === 'interactive' ? (
          <Zap size={14} className="text-warning" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium truncate ${completed ? 'text-surface-300' :
          locked ? 'text-surface-600' :
            'text-surface-100 group-hover:text-surface-50'
          }`}>
          {lesson.title}
        </h3>
      </div>

      {/* XP badge */}
      {!locked && (
        <Badge
          color={completed ? 'success' : 'default'}
          size="sm"
        >
          +{lesson.xp} XP
        </Badge>
      )}

      {/* Arrow */}
      {!locked && !completed && (
        <ChevronRight size={16} className="text-surface-600 group-hover:text-surface-400 transition-colors" />
      )}
    </div>
  );

  if (locked) return content;

  return (
    <Link to={type === 'interactive' ? `/learn/interactive/${lesson.id}` : `/learn/${lesson.id}`} className="block">
      {content}
    </Link>
  );
}
