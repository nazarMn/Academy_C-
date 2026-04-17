import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Target, Clock, BarChart3, Code2,
  Briefcase, GraduationCap, Gamepad2, Heart,
  ArrowRight, ArrowLeft, Check, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';
import useAppStore from '@/stores/useAppStore';
import { generatePlan } from '@/lib/planGenerator';

const STEPS = [
  { id: 'name',      title: 'Як вас звати?',          icon: User },
  { id: 'goal',      title: 'Яка ваша мета?',         icon: Target },
  { id: 'time',      title: 'Скільки часу на день?',   icon: Clock },
  { id: 'level',     title: 'Ваш рівень зараз?',      icon: BarChart3 },
  { id: 'languages', title: 'Які мови ви знаєте?',     icon: Code2 },
];

const GOALS = [
  { id: 'job',        label: 'Робота в IT',       icon: Briefcase,    desc: 'Хочу стати розробником' },
  { id: 'university', label: 'Університет',        icon: GraduationCap, desc: 'Підготовка до іспитів' },
  { id: 'games',      label: 'Геймдев',            icon: Gamepad2,     desc: 'Розробка ігор та движків' },
  { id: 'fun',        label: 'Хобі / Цікавість',   icon: Heart,        desc: 'Просто хочу навчитись' },
];

const TIMES = [
  { value: 15, label: '15 хв', desc: 'Швидкі сесії' },
  { value: 30, label: '30 хв', desc: 'Оптимальний темп' },
  { value: 60, label: '60 хв', desc: 'Глибоке занурення' },
];

const LEVELS = [
  { id: 'zero',         label: 'Повний нуль',    desc: 'Ніколи не програмував' },
  { id: 'basic',        label: 'Є основи',       desc: 'Знаю змінні та цикли' },
  { id: 'intermediate', label: 'Середній',        desc: 'Знаю функції та масиви' },
];

const KNOWN_LANGUAGES = [
  'Python', 'JavaScript', 'Java', 'C', 'C#', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    goal: '',
    time: 30,
    level: 'zero',
    languagesKnown: [],
  });
  const navigate = useNavigate();
  const { setOnboardingProfile, setUser } = useAppStore();

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const toggleLang = (lang) => {
    setData(prev => ({
      ...prev,
      languagesKnown: prev.languagesKnown.includes(lang)
        ? prev.languagesKnown.filter(l => l !== lang)
        : [...prev.languagesKnown, lang],
    }));
  };

  const canProceed = () => {
    if (step === 0) return data.name.trim().length >= 2;
    if (step === 1) return data.goal !== '';
    return true;
  };

  const finish = () => {
    const plan = generatePlan(data);
    const profile = { ...data, plan, completedAt: new Date().toISOString() };
    setOnboardingProfile(profile);
    setUser({ name: data.name.trim() });
    navigate('/dashboard');
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const StepIcon = STEPS[step].icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-surface-500">Крок {step + 1} з {STEPS.length}</span>
            <span className="text-xs text-accent font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <div className="bg-surface-900 rounded-2xl border border-surface-700 p-8">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <StepIcon size={20} className="text-accent" />
            </div>
            <h2 className="text-xl font-bold text-surface-50">{STEPS[step].title}</h2>
          </div>

          {/* Step content */}
          <div className="min-h-[240px]">
            {step === 0 && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={data.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Введіть ваше ім'я..."
                  autoFocus
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-surface-50 placeholder-surface-500 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-lg"
                  onKeyDown={e => e.key === 'Enter' && canProceed() && next()}
                />
                <p className="text-sm text-surface-500">
                  Це ім'я буде використовуватись для персоналізації вашого досвіду навчання
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => {
                  const Icon = g.icon;
                  const active = data.goal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => update('goal', g.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                        active
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'bg-surface-800/50 border-surface-700 hover:border-surface-600 text-surface-300'
                      }`}
                    >
                      <Icon size={24} className={active ? 'text-accent' : 'text-surface-500'} />
                      <span className="text-sm font-medium">{g.label}</span>
                      <span className="text-[11px] text-surface-500">{g.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {TIMES.map(t => {
                  const active = data.time === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => update('time', t.value)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                        active
                          ? 'bg-accent/10 border-accent'
                          : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <Clock size={20} className={active ? 'text-accent' : 'text-surface-500'} />
                      <div className="text-left">
                        <span className={`text-base font-semibold ${active ? 'text-accent' : 'text-surface-200'}`}>
                          {t.label}
                        </span>
                        <p className="text-xs text-surface-500">{t.desc}</p>
                      </div>
                      {active && <Check size={18} className="text-accent ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {LEVELS.map(l => {
                  const active = data.level === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => update('level', l.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                        active
                          ? 'bg-accent/10 border-accent'
                          : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <BarChart3 size={20} className={active ? 'text-accent' : 'text-surface-500'} />
                      <div className="text-left">
                        <span className={`text-base font-semibold ${active ? 'text-accent' : 'text-surface-200'}`}>
                          {l.label}
                        </span>
                        <p className="text-xs text-surface-500">{l.desc}</p>
                      </div>
                      {active && <Check size={18} className="text-accent ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm text-surface-400 mb-4">
                  Оберіть мови, з якими маєте досвід (необов'язково)
                </p>
                <div className="flex flex-wrap gap-2">
                  {KNOWN_LANGUAGES.map(lang => {
                    const active = data.languagesKnown.includes(lang);
                    return (
                      <button
                        key={lang}
                        onClick={() => toggleLang(lang)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          active
                            ? 'bg-accent/10 border-accent text-accent'
                            : 'bg-surface-800/50 border-surface-700 text-surface-400 hover:border-surface-600'
                        }`}
                      >
                        {lang}
                        {active && <Check size={12} className="inline ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-surface-600 mt-3">
                  Можна пропустити, якщо це ваша перша мова
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-surface-700/50">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Назад
            </Button>

            <Button
              onClick={next}
              disabled={!canProceed()}
              className="gap-2"
            >
              {step === STEPS.length - 1 ? (
                <>
                  <Sparkles size={16} />
                  Почати навчання
                </>
              ) : (
                <>
                  Далі
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-center mt-4 text-xs text-surface-600 hover:text-surface-400 transition-colors"
        >
          Пропустити налаштування →
        </button>
      </div>
    </div>
  );
}
