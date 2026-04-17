import { Link } from 'react-router-dom';
import { ArrowRight, Code2, GitBranch, BarChart3 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-surface-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-mono font-bold text-sm">C+</span>
          </div>
          <span className="font-bold text-surface-50">Academy</span>
        </div>
        <Link
          to="/dashboard"
          className="h-9 px-4 bg-accent text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 hover:bg-accent-hover transition-colors"
        >
          Почати
          <ArrowRight size={16} />
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-subtle" />
            Безкоштовно · Українською · Інтерактивно
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-surface-50 leading-tight mb-6">
            Опануй{' '}
            <span className="text-gradient">C++ програмування</span>
          </h1>

          <p className="text-lg text-surface-400 leading-relaxed mb-10 max-w-lg mx-auto">
            Інтерактивна платформа з IDE у браузері, структурованим курсом та
            професійною геймфікацією.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/dashboard"
              className="h-12 px-6 bg-accent text-white rounded-lg font-semibold text-base inline-flex items-center gap-2 hover:bg-accent-hover transition-all shadow-glow hover:shadow-glow-lg"
            >
              Почати навчання
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/learn"
              className="h-12 px-6 border border-surface-700 text-surface-300 rounded-lg font-medium text-base inline-flex items-center gap-2 hover:bg-surface-900 hover:border-surface-600 transition-all"
            >
              Переглянути курс
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {[
            { icon: Code2,     title: 'Інтерактивне IDE', desc: 'Monaco Editor прямо у браузері з підсвіткою C++' },
            { icon: GitBranch, title: 'Структурований шлях', desc: '24+ уроків від основ до ООП та просунутих тем' },
            { icon: BarChart3, title: 'Відстеження прогресу', desc: 'XP, рівні, досягнення та графік активності' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl bg-surface-900 border border-surface-700/50 hover:border-surface-600 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center mb-3 group-hover:shadow-glow transition-shadow">
                <Icon size={20} className="text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-surface-50 mb-1">{title}</h3>
              <p className="text-xs text-surface-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-surface-600">
        C++ Academy · 2026
      </footer>
    </div>
  );
}
