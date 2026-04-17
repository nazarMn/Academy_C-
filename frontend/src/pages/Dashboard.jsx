import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Code2, ClipboardCheck, Trophy,
  Flame, Star, TrendingUp, Zap
} from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import ActivityGraph from '@/components/charts/ActivityGraph';
import useAppStore from '@/stores/useAppStore';
import { getLevel, getXPToNextLevel, formatNumber } from '@/lib/utils';
import { getGreeting, getPlanTip } from '@/lib/planGenerator';

export default function Dashboard() {
  const {
    user, xp, streak, completedLessons, completedQuizzes,
    startedProjects, practiceCompleted, activityLog,
    unlockedAchievements, onboardingProfile, activeCourse
  } = useAppStore();

  const [courseData, setCourseData] = useState({
    lessons: [],
    quizzes: [],
    projects: [],
    practice: []
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [l, q, prj, prac] = await Promise.all([
          fetch(`http://localhost:3001/api/lessons?courseId=${activeCourse}`).then(r => r.json()),
          fetch(`http://localhost:3001/api/quizzes?courseId=${activeCourse}`).then(r => r.json()),
          fetch(`http://localhost:3001/api/projects?courseId=${activeCourse}`).then(r => r.json()),
          fetch(`http://localhost:3001/api/practice?courseId=${activeCourse}`).then(r => r.json())
        ]);
        setCourseData({ lessons: l, quizzes: q, projects: prj, practice: prac });
      } catch(e) {
        console.error(e);
      }
    }
    loadStats();
  }, [activeCourse]);

  const greeting = getGreeting();
  const userName = user.name || 'Студент';
  const planTip = onboardingProfile?.plan ? getPlanTip(onboardingProfile.plan.type) : null;

  const lvl = getLevel(xp);
  const xpInfo = getXPToNextLevel(xp);

  // Computed stats filtered by active course
  const courseLessonsCompleted = completedLessons.filter(id => courseData.lessons.some(l => l.id === id)).length;
  const courseQuizzesCompleted = completedQuizzes.filter(id => courseData.quizzes.some(q => q.id === id)).length;
  const courseProjectsStarted = startedProjects.filter(id => courseData.projects.some(p => p.id === id)).length;
  const coursePracticeCompleted = practiceCompleted.filter(id => courseData.practice.some(p => p.id === id)).length;

  const totalLessons = courseData.lessons.length;
  const totalQuizzes = courseData.quizzes.length;
  const totalProjects = courseData.projects.length;
  const totalPractice = courseData.practice.length;

  const lessonPct = totalLessons ? Math.round((courseLessonsCompleted / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome + Continue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main CTA Card */}
        <Card variant="gradient" className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-surface-50 mb-1">
                {greeting}, {userName}! 👋
              </h1>
              <p className="text-sm text-surface-400 mb-3">
                {planTip && <span className="text-accent">{planTip}. </span>}
                {courseLessonsCompleted === 0
                  ? 'Розпочніть свій шлях прямо зараз'
                  : `Ви пройшли ${courseLessonsCompleted} з ${totalLessons} уроків. Продовжуйте!`
                }
              </p>
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 h-10 px-5 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-hover transition-colors shadow-sm hover:shadow-glow"
              >
                {courseLessonsCompleted === 0 ? 'Почати навчання' : 'Продовжити'}
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Progress ring */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" strokeWidth="6" fill="none" className="stroke-surface-800" />
                  <circle
                    cx="40" cy="40" r="34"
                    strokeWidth="6" fill="none"
                    className="stroke-accent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - lessonPct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-surface-50">
                  {lessonPct}%
                </span>
              </div>
              <span className="text-xs text-surface-500">Прогрес курсу</span>
            </div>
          </div>
        </Card>

        {/* Level & XP Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
              <Zap size={20} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium text-surface-50">Рівень {lvl.level}</div>
              <div className="text-xs text-surface-500">{lvl.name}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-surface-500">XP до наступного</span>
              <span className="text-accent font-mono">{formatNumber(xp)} XP</span>
            </div>
            <ProgressBar value={xpInfo.pct} size="md" />
            <div className="flex justify-between text-[11px] text-surface-600">
              <span>Рівень {lvl.level}</span>
              <span>Рівень {Math.min(lvl.level + 1, 10)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={Star}
          label="Загальний XP"
          value={formatNumber(xp)}
          color="text-warning"
          bgColor="bg-warning-muted"
        />
        <StatCard
          icon={Flame}
          label="Серія днів"
          value={streak}
          color="text-danger"
          bgColor="bg-danger-muted"
        />
        <StatCard
          icon={BookOpen}
          label="Уроків пройдено"
          value={`${courseLessonsCompleted}/${totalLessons}`}
          color="text-accent"
          bgColor="bg-accent-subtle"
        />
        <StatCard
          icon={Trophy}
          label="Досягнень"
          value={`${unlockedAchievements.length}/12`}
          color="text-success"
          bgColor="bg-success-muted"
        />
      </div>

      {/* Activity Graph */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-surface-50">Активність</h2>
            <p className="text-xs text-surface-500 mt-0.5">
              {activityLog.reduce((sum, a) => sum + a.actions, 0)} дій за останній рік
            </p>
          </div>
          <Link to="/profile" className="text-xs text-surface-500 hover:text-accent transition-colors">
            Детальніше →
          </Link>
        </div>
        <ActivityGraph activityLog={activityLog} />
      </Card>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        <QuickAccessCard
          icon={Code2}
          title="Практика"
          desc={`${coursePracticeCompleted}/${totalPractice || 0} завдань виконано`}
          link="/practice"
          color="text-success"
          bgColor="bg-success-muted"
          pct={totalPractice ? Math.round((coursePracticeCompleted / totalPractice) * 100) : 0}
        />
        <QuickAccessCard
          icon={ClipboardCheck}
          title="Тести"
          desc={`${courseQuizzesCompleted}/${totalQuizzes} тестів пройдено`}
          link="/assess"
          color="text-info"
          bgColor="bg-info-muted"
          pct={totalQuizzes ? Math.round((courseQuizzesCompleted / totalQuizzes) * 100) : 0}
        />
        <QuickAccessCard
          icon={TrendingUp}
          title="Проєкти"
          desc={`${courseProjectsStarted}/${totalProjects} розпочато`}
          link="/build"
          color="text-warning"
          bgColor="bg-warning-muted"
          pct={totalProjects ? Math.round((courseProjectsStarted / totalProjects) * 100) : 0}
        />
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <Card padding="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        <div>
          <div className="text-lg font-bold text-surface-50">{value}</div>
          <div className="text-xs text-surface-500">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function QuickAccessCard({ icon: Icon, title, desc, link, color, bgColor, pct }) {
  return (
    <Link to={link}>
      <Card hover>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon size={18} className={color} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-surface-50">{title}</h3>
            <p className="text-xs text-surface-500">{desc}</p>
          </div>
        </div>
        <ProgressBar value={pct} size="sm" />
      </Card>
    </Link>
  );
}
