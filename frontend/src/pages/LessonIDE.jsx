import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, RotateCcw, CheckCircle, ChevronRight,
  ChevronLeft, FileCode2, Terminal as TerminalIcon, BookOpen,
  Loader2, AlertCircle
} from 'lucide-react';
import { Button, Badge, InteractiveTerminal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';
import { executeCode } from '@/lib/api';
import MonacoEditor from '@/components/editor/MonacoEditor';
import { injectLesson } from '@/lib/inject';
import { getLanguageConfig } from '@/lib/languages';
export default function LessonIDE() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { completeLesson, isLessonCompleted, addXP, saveCode, loadCode, user, onboardingProfile, removeCode, activeCourse } = useAppStore();

  // Build user data for injection
  const userData = { ...user, ...(onboardingProfile || {}) };

  // Lesson data
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const terminalRef = useRef(null);

  // Panel visibility (mobile)
  const [activePanel, setActivePanel] = useState('instructions');

  const completed = lesson ? isLessonCompleted(lesson.id) : false;
  const editorRef = useRef(null);

  const [prevLesson, setPrevLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);

  const languageId = lesson?.executionEngines?.[0] || lesson?.courseId || activeCourse || 'cpp';
  const langConfig = getLanguageConfig(languageId);

  // Security Check & Course Navigation Sync
  useEffect(() => {
    if (!lesson) return;

    // Protection logic for non-admins against coming soon modes
    if (!langConfig.active && user?.role !== 'admin') {
      toast.error('Цей курс ще перебуває в розробці!');
      navigate('/learn');
      return;
    }

    // Automatic redirect out of IDE if the user explicitly switches the global course context while here
    if (lesson.courseId && activeCourse !== lesson.courseId) {
      navigate('/learn');
    }
  }, [lesson, activeCourse, langConfig, user, navigate, toast]);

  // Load lesson data
  useEffect(() => {
    async function load() {
      setLoading(true);

      // Load current lesson
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          const injected = injectLesson(data, userData);
          setLesson(injected);
          const saved = loadCode(lessonId);
          setCode(saved || injected.code || injected.starterCode || getLanguageConfig(injected.executionEngines?.[0] || activeCourse || 'cpp').starterCode);
        } else {
          setLesson(null);
        }
      } catch {
        setLesson(null);
      }

      // Load list for next/prev
      try {
        const listRes = await fetch(`/api/lessons?courseId=${activeCourse}`);
        if (listRes.ok) {
          const list = await listRes.json();
          const currentIdx = list.findIndex(l => l.id === lessonId);
          if (currentIdx >= 0) {
            setPrevLesson(currentIdx > 0 ? list[currentIdx - 1] : null);
            setNextLesson(currentIdx < list.length - 1 ? list[currentIdx + 1] : null);
          }
        }
      } catch { /* ignore */ }

      setLoading(false);
    }
    load();
  }, [lessonId, activeCourse]);

  // Auto-save code with 1s debounce
  useEffect(() => {
    if (!lessonId || !code || !lesson) return;

    const baseCode = lesson.starterCode || langConfig.starterCode;
    const timer = setTimeout(() => {
      if (code !== baseCode) {
        saveCode(lessonId, code);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, lessonId, saveCode, lesson]);


  // Run code
  const handleRun = useCallback(() => {
    if (!code.trim()) {
      toast.error('Напишіть код перед запуском.');
      return;
    }
    terminalRef.current?.run();
  }, [code, toast]);

  // Complete lesson
  const handleComplete = useCallback(() => {
    if (!lesson) return;
    const isNew = completeLesson(lesson.id, lesson.xp);
    if (isNew) {
      toast.success(`Урок завершено! +${lesson.xp} XP`);
    }
  }, [lesson, completeLesson, toast]);

  // Reset code
  const handleReset = useCallback(() => {
    if (lesson) {
      const baseCode = lesson.starterCode || langConfig.starterCode;
      setCode(baseCode);
      removeCode(lessonId);
    }
  }, [lesson, lessonId, removeCode]);

  // Keyboard shortcuts (Ctrl+Enter from both window and Monaco custom event)
  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    }
    function handleEditorRun() { handleRun(); }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('editor:run', handleEditorRun);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('editor:run', handleEditorRun);
    };
  }, [handleRun]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-surface-600" />
        <p className="text-surface-400">Урок не знайдено</p>
        <Link to="/learn">
          <Button variant="secondary">Повернутися до курсу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in -m-4 sm:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-surface-700/50 bg-surface-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/learn"
            className="text-surface-500 hover:text-surface-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Badge.Level level={lesson.level} />
            <h1 className="text-sm font-semibold text-surface-100 hidden sm:block">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <Badge color="success" size="sm">
              <CheckCircle size={12} className="mr-1" />
              Завершено
            </Badge>
          )}
          <Badge color="accent" size="sm">+{lesson.xp} XP</Badge>
        </div>
      </div>

      {/* Mobile panel tabs */}
      <div className="flex lg:hidden border-b border-surface-700/50 bg-surface-900/30">
        {[
          { key: 'instructions', icon: BookOpen, label: 'Теорія' },
          { key: 'editor', icon: FileCode2, label: 'Код' },
          { key: 'output', icon: TerminalIcon, label: 'Вивід' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActivePanel(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activePanel === tab.key
              ? 'text-accent border-b-2 border-accent'
              : 'text-surface-500 hover:text-surface-300'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Instructions panel (Theory) */}
        <div className={`
          w-full lg:w-[40%] border-r border-surface-700/50 overflow-y-auto
          bg-surface-950
          ${activePanel === 'instructions' ? 'block' : 'hidden lg:block'}
        `}>
          <div className="p-5 space-y-4">
            {/* Practice task */}
            {lesson.practiceTask && (
              <div className="p-4 rounded-lg border border-accent/20 bg-accent-subtle">
                <h3 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                  <FileCode2 size={14} />
                  Завдання
                </h3>
                <p className="text-sm text-surface-300 leading-relaxed">
                  {lesson.practiceTask}
                </p>
                {lesson.hint && (
                  <details className="mt-3">
                    <summary className="text-xs text-surface-500 cursor-pointer hover:text-accent transition-colors">
                      Показати підказку
                    </summary>
                    <p className="text-xs text-surface-400 mt-2 font-mono bg-surface-900 px-3 py-2 rounded">
                      {lesson.hint}
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* Lesson content (HTML) */}
            <div
              className="prose prose-invert prose-sm max-w-none
                prose-headings:text-surface-100 prose-headings:font-semibold
                prose-p:text-surface-300 prose-p:leading-relaxed
                prose-code:text-accent prose-code:bg-surface-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-strong:text-surface-100
                prose-li:text-surface-300
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-table:border-surface-700
                prose-th:text-surface-200 prose-th:border-surface-700
                prose-td:border-surface-700"
              dangerouslySetInnerHTML={{ __html: lesson.explanation || '' }}
            />
          </div>
        </div>

        {/* Right side (Editor Top + Output Bottom) */}
        <div className={`
          w-full lg:w-[60%] flex-col
          ${activePanel !== 'instructions' ? 'flex' : 'hidden lg:flex'}
        `}>
          {/* Editor section */}
          <div className={`
            flex-1 flex flex-col border-b border-surface-700/50
            ${activePanel === 'editor' ? 'flex' : 'hidden lg:flex'}
          `}>
            {/* File tab */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-900 border-b border-surface-700/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-800 text-xs text-surface-200">
                  <FileCode2 size={12} className="text-accent" />
                  main.{langConfig.extension}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  title="Скинути код"
                >
                  <RotateCcw size={14} />
                </Button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <MonacoEditor
                value={code}
                onChange={(val) => setCode(val || '')}
              />
            </div>

            {/* Run toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-surface-700/50 bg-surface-900/50">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRun}
                  disabled={running}
                >
                  {running ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} />
                  )}
                  {running ? 'Запуск...' : 'Запустити'}
                </Button>
                <kbd className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded font-mono hidden sm:block">
                  Ctrl+Enter
                </kbd>
              </div>

              {!completed && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleComplete}
                >
                  <CheckCircle size={14} />
                  Завершити урок
                </Button>
              )}
            </div>
          </div>

          {/* Terminal section */}
          <div className={`
            lg:h-[40%] flex-col
            ${activePanel === 'output' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'}
          `}>
            <InteractiveTerminal
              ref={terminalRef}
              code={code}
              language={lesson?.executionEngines?.[0] || activeCourse || 'cpp'}
              onRunStatusChange={setRunning}
            />

            {/* Lesson navigation */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-surface-700/50 bg-surface-900/50">
              {prevLesson ? (
                <Link
                  to={`/learn/${prevLesson.id}`}
                  className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-300 transition-colors"
                >
                  <ChevronLeft size={14} />
                  Попередній
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  to={`/learn/${nextLesson.id}`}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  Наступний
                  <ChevronRight size={14} />
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

