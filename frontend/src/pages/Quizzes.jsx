import { useState, useEffect } from 'react';
import {
  ClipboardCheck, ChevronRight, CheckCircle, XCircle,
  ArrowRight, RotateCcw, Trophy, Brain
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';
import { LEVEL_COLORS } from '@/lib/constants';

export default function Quizzes() {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [quizzesList, setQuizzesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const { completedQuizzes, quizScores, completeQuiz, activeCourse } = useAppStore();
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:3001/api/quizzes?courseId=${activeCourse}`);
        if (res.ok) {
          const data = await res.json();
          setQuizzesList(data.map(q => ({ ...q, questionCount: q.questions?.length || 0 })));
        }
      } catch (err) {
        console.error('Failed to load quizzes', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeCourse]);

  // Start quiz
  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  };

  // Answer
  const handleAnswer = (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const isCorrect = optIdx === activeQuiz.questions[currentQ].correct;
    setAnswers(prev => [...prev, isCorrect]);
  };

  // Next question
  const handleNext = () => {
    if (currentQ < activeQuiz.questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
    } else {
      setShowResult(true);
      const score = answers.filter(Boolean).length;
      const xpEarned = Math.round(activeQuiz.xp * (score / activeQuiz.questions.length));
      completeQuiz(activeQuiz.id, score, activeQuiz.questions.length, xpEarned);
      if (score === activeQuiz.questions.length) {
        toast.success(`Ідеальний результат! +${activeQuiz.xp} XP`);
      } else {
        toast.info(`Тест завершено: ${score}/${activeQuiz.questions.length}`);
      }
    }
  };

  // Results screen
  if (showResult && activeQuiz) {
    const score = answers.filter(Boolean).length;
    const total = activeQuiz.questions.length;
    const perfect = score === total;

    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-6 py-8">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            perfect ? 'bg-success-muted' : 'bg-accent-subtle'
          }`}>
            {perfect ? <Trophy size={28} className="text-success" /> : <Brain size={28} className="text-accent" />}
          </div>
          <h2 className="text-xl font-bold text-surface-50">
            {perfect ? 'Бездоганно!' : score >= total * 0.7 ? 'Непогано!' : 'Потрібно повторити'}
          </h2>
          <p className="text-surface-400 text-sm mt-1">{activeQuiz.title}</p>
        </div>

        <Card className="text-center">
          <div className="text-4xl font-bold text-surface-50 mb-1">{score}/{total}</div>
          <p className="text-sm text-surface-500">правильних відповідей</p>
          <ProgressBar
            value={Math.round((score / total) * 100)}
            color={perfect ? 'success' : score >= total * 0.7 ? 'accent' : 'warning'}
            size="lg"
            className="mt-4"
          />
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => startQuiz(activeQuiz)}>
            <RotateCcw size={14} /> Спробувати знову
          </Button>
          <Button variant="primary" onClick={() => { setActiveQuiz(null); setShowResult(false); }}>
            До списку тестів
          </Button>
        </div>
      </div>
    );
  }

  // Quiz flow
  if (activeQuiz) {
    const question = activeQuiz.questions[currentQ];
    const total = activeQuiz.questions.length;

    return (
      <div className="max-w-2xl mx-auto animate-fade-in space-y-6 py-4">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-sm text-surface-500 hover:text-surface-300 transition-colors"
          >
            ← Вийти
          </button>
          <span className="text-sm text-surface-400">{currentQ + 1} / {total}</span>
        </div>
        <ProgressBar value={Math.round(((currentQ + 1) / total) * 100)} size="sm" />

        {/* Question */}
        <Card padding="p-6">
          <h2 className="text-lg font-semibold text-surface-50 mb-6">{question.q}</h2>

          <div className="space-y-3">
            {question.opts.map((opt, i) => {
              let style = 'border-surface-700 bg-surface-800/50 hover:bg-surface-800 hover:border-surface-600 cursor-pointer';
              if (selected !== null) {
                if (i === question.correct) {
                  style = 'border-success bg-success-muted text-success';
                } else if (i === selected && i !== question.correct) {
                  style = 'border-danger bg-danger-muted text-danger';
                } else {
                  style = 'border-surface-800 bg-surface-900 opacity-50 cursor-default';
                }
              }

              return (
                <button
                  key={i}
                  disabled={selected !== null}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${style}`}
                >
                  <span className="w-7 h-7 rounded-full bg-surface-900 border border-surface-700 flex items-center justify-center text-xs font-mono text-surface-400 flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-surface-200">{opt}</span>
                  {selected !== null && i === question.correct && <CheckCircle size={18} className="ml-auto text-success" />}
                  {selected === i && i !== question.correct && <XCircle size={18} className="ml-auto text-danger" />}
                </button>
              );
            })}
          </div>
        </Card>

        {selected !== null && (
          <div className="flex justify-end animate-fade-in">
            <Button onClick={handleNext}>
              {currentQ < total - 1 ? 'Далі' : 'Результати'} <ArrowRight size={14} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Quiz list
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Тести</h1>
        <p className="text-sm text-surface-400 mt-1">Перевірте свої знання з кожної теми</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {quizzesList.map(quiz => {
            const done = completedQuizzes.includes(quiz.id);
            const score = quizScores[quiz.id];
            const colors = LEVEL_COLORS[quiz.level] || LEVEL_COLORS.beginner;

            return (
              <button key={quiz.id} onClick={() => startQuiz(quiz)} className="text-left">
                <Card hover padding="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <ClipboardCheck size={20} className={colors.text} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-surface-100">{quiz.title}</h3>
                      <p className="text-xs text-surface-500">{quiz.questionCount} питань · +{quiz.xp} XP</p>
                    </div>
                    {done && (
                      <Badge color="success" size="sm">
                        {score}/{quiz.questionCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge.Level level={quiz.level} />
                    <ChevronRight size={16} className="text-surface-600" />
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {quizzesList.length === 0 && !loading && (
        <p className="text-surface-500 text-center py-8">Тестів поки немає.</p>
      )}
    </div>
  );
}
