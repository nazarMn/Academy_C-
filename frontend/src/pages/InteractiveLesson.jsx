import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Lightbulb, Check, Eye,
  RotateCcw, ChevronRight, Zap, Code2,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import MonacoEditor from '@/components/editor/MonacoEditor';
import useAppStore from '@/stores/useAppStore';
import { checkCode, checkSolution, getProgressiveHint } from '@/lib/errorPatterns';

export default function InteractiveLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { completeLesson, isLessonCompleted, addXP, activeCourse } = useAppStore();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [hintIndex, setHintIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null); // { type: 'error'|'success'|'pattern', message }
  const [solved, setSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const alreadyDone = lesson ? isLessonCompleted(lesson.id) : false;

  useEffect(() => {
    async function fetchLesson() {
      setLoading(true);
      try {
        const res = await fetch(`/api/interactive/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
          setCode(data.brokenCode || '');
        }
      } catch (err) {
        console.error('Failed to load interactive lesson', err);
      } finally {
        setSolved(false);
        setHintIndex(-1);
        setFeedback(null);
        setAttempts(0);
        setShowSolution(false);
        setLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId]);

  // Real-time pattern check (debounced via onChange)
  const onCodeChange = useCallback((val) => {
    setCode(val);

    if (!lesson) return;

    // Check against lesson-specific patterns
    const patterns = lesson.errorPatterns || [];
    const result = checkCode(val, patterns);

    if (result.hasErrors && result.matched.length > 0) {
      setFeedback({
        type: 'pattern',
        message: result.matched[0].hint,
        line: result.matched[0].line,
      });
    } else if (feedback?.type === 'pattern') {
      setFeedback(null);
    }
  }, [lesson, feedback?.type]);

  // Submit / check solution
  const handleSubmit = () => {
    if (!lesson) return;
    setAttempts(a => a + 1);

    // Check if solution pattern is in code
    if (checkSolution(code, lesson.solution)) {
      setSolved(true);
      setFeedback({ type: 'success', message: 'Правильно! Код виправлено!' });

      if (!alreadyDone) {
        completeLesson(lesson.id, lesson.xp || 20);
      }
    } else {
      // Check for remaining errors
      const patterns = lesson.errorPatterns || [];
      const result = checkCode(code, patterns);

      if (result.hasErrors) {
        setFeedback({
          type: 'error',
          message: `Ще є помилки: ${result.matched[0].hint}`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Код змінено, але рішення поки неправильне. Спробуйте ще раз.',
        });
      }
    }
  };

  const handleHint = () => {
    if (!lesson?.hints) return;
    const nextIdx = hintIndex + 1;
    setHintIndex(nextIdx);

    const { hint, showSolution: showSol } = getProgressiveHint(lesson.hints, nextIdx);
    if (showSol) {
      setShowSolution(true);
    }
  };

  const handleReset = () => {
    if (lesson) {
      setCode(lesson.brokenCode || '');
      setFeedback(null);
      setSolved(false);
      setShowSolution(false);
    }
  };

  const [nextLesson, setNextLesson] = useState(null);
  useEffect(() => {
    if (solved && lesson) {
      fetch(`/api/interactive?courseId=${activeCourse}`)
        .then(r => r.json())
        .then(list => {
          const idx = list.findIndex(l => l.id === lessonId);
          if (idx >= 0 && idx < list.length - 1) setNextLesson(list[idx+1]);
        }).catch(() => {
          // ignore
        });
    }
  }, [solved, lesson, lessonId, activeCourse]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-50">Урок не знайдено</h2>
          <Link to="/learn" className="text-accent text-sm mt-2 block hover:underline">
            ← Повернутись до навчання
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/learn" className="text-surface-500 hover:text-surface-300 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <Badge color="accent" dot>Інтерактивний</Badge>
          <h1 className="text-lg font-bold text-surface-50">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {solved && <Badge color="success">✓ Розв'язано</Badge>}
          {alreadyDone && !solved && <Badge color="success">Завершено</Badge>}
          <Badge color="default">+{lesson.xp} XP</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — Scenario + hints */}
        <div className="space-y-4">
          {/* Scenario */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-warning" />
              <h3 className="text-sm font-semibold text-surface-100">Сценарій</h3>
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">{lesson.explanation || lesson.content || lesson.scenario}</p>
          </Card>

          {/* Task */}
          <Card variant="gradient">
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-accent">Завдання</h3>
            </div>
            <p className="text-sm text-surface-200">{lesson.practiceTask || lesson.task}</p>
          </Card>

          {/* Hints area */}
          <div className="space-y-2">
            {hintIndex >= 0 && lesson.hints?.slice(0, hintIndex + 1).map((hint, i) => (
              <Card key={i} padding="p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb size={14} className="text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-surface-300">{hint}</p>
                </div>
              </Card>
            ))}

            {showSolution && (
              <Card padding="p-3" variant="elevated">
                <div className="flex items-start gap-2">
                  <Eye size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-surface-500 mb-1">Рішення:</p>
                    <code className="text-sm text-accent font-mono">{lesson.solution}</code>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleHint}
              disabled={hintIndex >= (lesson.hints?.length || 0) - 1 && showSolution}
              className="gap-1.5"
            >
              <Lightbulb size={14} />
              Підказка {hintIndex >= 0 ? `(${hintIndex + 1}/${lesson.hints?.length})` : ''}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw size={14} />
              Скинути
            </Button>
          </div>
        </div>

        {/* Right — Code editor */}
        <div className="space-y-3">
          <div className="bg-surface-900 rounded-xl border border-surface-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-surface-700/50">
              <span className="text-xs text-surface-500 font-mono">fix.cpp</span>
              <span className="text-[10px] text-surface-600">Спроб: {attempts}</span>
            </div>
            <div className="h-[350px]">
              <MonacoEditor
                value={code}
                onChange={onCodeChange}
                language="cpp"
              />
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border animate-fade-in ${feedback.type === 'success'
                ? 'bg-success-muted border-success/30 text-success'
                : feedback.type === 'pattern'
                  ? 'bg-warning-muted border-warning/30 text-warning'
                  : 'bg-danger-muted border-danger/30 text-danger'
              }`}>
              {feedback.type === 'success' ? <Check size={18} /> :
                feedback.type === 'pattern' ? <AlertTriangle size={18} /> :
                  <AlertTriangle size={18} />}
              <div>
                <p className="text-sm font-medium">{feedback.message}</p>
                {feedback.line && (
                  <p className="text-xs opacity-70 mt-0.5">Рядок {feedback.line}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={solved}
              className="flex-1 gap-2"
            >
              <Check size={16} />
              {solved ? "Розв\u2019язано!" : 'Перевірити'}
            </Button>

            {solved && nextLesson && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/learn/interactive/${nextLesson.id}`)}
                className="gap-2"
              >
                Далі
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
