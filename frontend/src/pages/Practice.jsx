import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Code2, Play, RotateCcw, CheckCircle, Loader2, Star,
  ChevronRight, Lock, Trophy
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar, InteractiveTerminal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import MonacoEditor from '@/components/editor/MonacoEditor';
import useAppStore from '@/stores/useAppStore';
import { executeCode } from '@/lib/api';

const diffColors = {
  easy: { badge: 'success', label: 'Легко' },
  medium: { badge: 'warning', label: 'Середньо' },
  hard: { badge: 'danger', label: 'Складно' },
};

export default function Practice() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const terminalRef = useRef(null);

  const { practiceCompleted, completePractice, saveCode, loadCode, removeCode, activeCourse } = useAppStore();
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:3001/api/practice?courseId=${activeCourse}`);
        if (res.ok) setTasks(await res.json());
      } catch (err) {
        console.error('Failed to load practice tasks', err);
      } finally {
        setLoadingTasks(false);
      }
    }
    load();
  }, [activeCourse]);

  const completedCount = practiceCompleted.filter(id => tasks.some(t => t.id === id)).length;
  const pct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleSelect = (task) => {
    setSelectedTask(task);
    const saved = loadCode(task.id);
    setCode(saved || task.starter);
  };

  useEffect(() => {
    if (!selectedTask || !code) return;
    if (code === selectedTask.starter) return;

    const timer = setTimeout(() => {
      saveCode(selectedTask.id, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, selectedTask, saveCode]);

  const handleReset = () => {
    if (selectedTask) {
      setCode(selectedTask.starter);
      removeCode(selectedTask.id);
    }
  };

  const handleRun = useCallback(() => {
    if (!code.trim()) return;
    terminalRef.current?.run();
  }, [code]);

  const handleComplete = () => {
    if (!selectedTask) return;
    const isNew = completePractice(selectedTask.id, selectedTask.xp);
    if (isNew) {
      toast.success(`Завдання виконано! +${selectedTask.xp} XP`);
    }
  };

  // Mobile panel for practice IDE
  const [practicePanel, setPracticePanel] = useState('editor');

  // IDE mode
  if (selectedTask) {
    return (
      <div className="animate-fade-in -m-4 sm:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-surface-700/50 bg-surface-900/50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSelectedTask(null)}
              className="text-surface-500 hover:text-surface-300 transition-colors text-sm flex items-center gap-1 flex-shrink-0"
            >
              ← <span className="hidden sm:inline">Назад</span>
            </button>
            <span className="text-surface-700 hidden sm:inline">|</span>
            <h2 className="text-xs sm:text-sm font-semibold text-surface-100 truncate">{selectedTask.title}</h2>
            <Badge color={diffColors[selectedTask.difficulty].badge} size="sm" className="hidden sm:flex">
              {diffColors[selectedTask.difficulty].label}
            </Badge>
          </div>
          <Badge color="accent" size="sm">+{selectedTask.xp} XP</Badge>
        </div>

        {/* Mobile panel tabs */}
        <div className="flex lg:hidden border-b border-surface-700/50 bg-surface-900/30 flex-shrink-0">
          {[
            { key: 'desc', label: 'Завдання' },
            { key: 'editor', label: 'Код' },
            { key: 'output', label: 'Вивід' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setPracticePanel(tab.key)}
              className={`flex-1 flex items-center justify-center py-2.5 text-xs font-medium transition-colors ${
                practicePanel === tab.key
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* IDE panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Task description */}
          <div className={`
            w-full lg:w-[280px] border-r border-surface-700/50 p-4 sm:p-5 bg-surface-950 overflow-y-auto lg:flex-shrink-0
            ${practicePanel === 'desc' ? 'block' : 'hidden lg:block'}
          `}>
            <div className="p-4 rounded-lg border border-accent/20 bg-accent-subtle mb-4">
              <h3 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                <Code2 size={14} />
                Завдання
              </h3>
              <p className="text-sm text-surface-300 leading-relaxed">{selectedTask.desc}</p>
            </div>
            {practiceCompleted.includes(selectedTask.id) && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle size={16} />
                Вже виконано
              </div>
            )}
            {/* Mobile: go to code */}
            <button
              onClick={() => setPracticePanel('editor')}
              className="lg:hidden w-full mt-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium"
            >
              Перейти до коду →
            </button>
          </div>

          {/* Editor */}
          <div className={`
            flex-1 flex flex-col min-w-0
            ${practicePanel === 'editor' ? 'flex' : 'hidden lg:flex'}
          `}>
            <div className="flex-1 min-h-[200px]">
              <MonacoEditor value={code} onChange={(val) => setCode(val || '')} />
            </div>
            <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-t border-surface-700/50 bg-surface-900/50">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button variant="primary" size="sm" onClick={handleRun} disabled={running}>
                  {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  <span className="hidden sm:inline">{running ? 'Запуск...' : 'Запустити'}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset} title="Скинути код до базового">
                  <RotateCcw size={14} />
                </Button>
              </div>
              {!practiceCompleted.includes(selectedTask.id) && (
                <Button variant="success" size="sm" onClick={handleComplete}>
                  <CheckCircle size={14} /> <span className="hidden sm:inline">Завершити</span>
                </Button>
              )}
            </div>
          </div>

          {/* Output */}
          <div className={`
            w-full lg:w-[350px] border-l border-surface-700/50 flex flex-col lg:flex-shrink-0 bg-surface-950
            ${practicePanel === 'output' ? 'flex' : 'hidden lg:flex'}
          `}>
            <InteractiveTerminal
              ref={terminalRef}
              code={code}
              language={activeCourse || 'cpp'}
              onRunStatusChange={setRunning}
            />
          </div>
        </div>
      </div>
    );
  }

  // Task list mode
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Практика</h1>
        <p className="text-sm text-surface-400 mt-1">Вирішуйте завдання та відточуйте навички</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-surface-200">Прогрес</span>
          <span className="text-sm font-mono text-accent">{completedCount}/{tasks.length}</span>
        </div>
        <ProgressBar value={pct} size="lg" />
      </Card>

      {loadingTasks ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
          {tasks.map(task => {
            const done = practiceCompleted.includes(task.id);
            const diff = diffColors[task.difficulty];
            return (
              <button
                key={task.id}
                onClick={() => handleSelect(task)}
                className={`text-left group ${done ? '' : ''}`}
              >
                <Card hover padding="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {done ? (
                        <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                          <CheckCircle size={14} className="text-success" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center">
                          <Code2 size={14} className="text-surface-500" />
                        </div>
                      )}
                      <h3 className={`text-sm font-medium ${done ? 'text-surface-400' : 'text-surface-100'}`}>
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={diff.badge} size="sm">{diff.label}</Badge>
                      <ChevronRight size={16} className="text-surface-600 group-hover:text-surface-400 transition-colors" />
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 ml-9">{task.desc}</p>
                  <div className="flex items-center gap-2 mt-2 ml-9">
                    <Badge color={done ? 'success' : 'default'} size="sm">+{task.xp} XP</Badge>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {tasks.length === 0 && !loadingTasks && (
        <p className="text-surface-500 text-center py-8">Практичних завдань поки немає.</p>
      )}
    </div>
  );
}
