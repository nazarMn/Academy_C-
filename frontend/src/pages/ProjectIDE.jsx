import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save, CheckCircle, FileCode2, Terminal as TerminalIcon, Loader2, AlertCircle, RotateCcw, BookOpen } from 'lucide-react';
import { Button, Badge, InteractiveTerminal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';
import { executeCode } from '@/lib/api';
import MonacoEditor from '@/components/editor/MonacoEditor';
import { getLanguageConfig } from '@/lib/languages';

export default function ProjectIDE() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { saveCode, loadCode, startedProjects, startProject, removeCode, activeCourse, user } = useAppStore();

  const terminalRef = useRef(null);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);

  // Mobile panel
  const [activePanel, setActivePanel] = useState('editor');

  // Security Check & Course Navigation Sync
  useEffect(() => {
    if (!project) return;
    const langConfig = getLanguageConfig(project.courseId || activeCourse || 'cpp');

    if (!langConfig.active && user?.role !== 'admin') {
      toast.error('Цей курс ще перебуває в розробці!');
      navigate('/build');
      return;
    }

    if (project.courseId && activeCourse !== project.courseId) {
      navigate('/build');
    }
  }, [project, activeCourse, user, navigate, toast]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          if (!startedProjects.includes(data.id)) {
            startProject(data.id);
          }
          const saved = loadCode(data.id);
          const langConfig = getLanguageConfig(data.courseId || activeCourse || 'cpp');
          setCode(saved || data.starterCode || langConfig.starterCode);
        } else {
          setProject(null);
        }
      } catch {
        setProject(null);
      }
      setLoading(false);
    }
    load();
  }, [projectId, startedProjects, loadCode, startProject]);

  // Auto-save code with debounce
  useEffect(() => {
    if (!projectId || !code || !project) return;

    const langConfig = getLanguageConfig(project.courseId || activeCourse || 'cpp');
    const baseCode = project.starterCode || langConfig.starterCode;
    if (code === baseCode) return;

    const timer = setTimeout(() => {
      saveCode(projectId, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, projectId, saveCode, project]);

  const handleReset = useCallback(() => {
    if (project) {
      const langConfig = getLanguageConfig(project.courseId || activeCourse || 'cpp');
      const baseCode = project.starterCode || langConfig.starterCode;
      setCode(baseCode);
      removeCode(project.id);
    }
  }, [project, removeCode]);

  const handleRun = useCallback(() => {
    if (!code.trim()) {
      toast.error('Напишіть код перед запуском.');
      return;
    }
    terminalRef.current?.run();
  }, [code, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleRun]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle size={48} className="text-surface-600" />
        <p className="text-surface-400">Проєкт не знайдено</p>
        <Link to="/build">
          <Button variant="secondary">Повернутися до проєктів</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in -m-4 sm:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-surface-700/50 bg-surface-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/build" className="text-surface-500 hover:text-surface-300 transition-colors flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Badge.Level level={project.level || 'intermediate'} />
            <h1 className="text-xs sm:text-sm font-semibold text-surface-100 truncate">
              {project.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="success" onClick={() => toast.success('Прогрес збережено!')} className="gap-1.5">
            <Save size={14} />
            <span className="hidden sm:inline">Зберегти</span>
          </Button>
        </div>
      </div>

      {/* Mobile panel tabs */}
      <div className="flex lg:hidden border-b border-surface-700/50 bg-surface-900/30">
        {[
          { key: 'requirements', icon: BookOpen, label: 'Завдання' },
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
        {/* Left: Requirements panel */}
        <div className={`
          w-full lg:w-[35%] border-r border-surface-700/50 overflow-y-auto bg-surface-950 p-4 sm:p-6
          ${activePanel === 'requirements' ? 'block' : 'hidden lg:block'}
        `}>
          <h2 className="text-lg sm:text-xl font-bold text-surface-50 mb-2">Технічне завдання</h2>
          <p className="text-sm text-surface-400 mb-6 leading-relaxed bg-surface-900 p-3 sm:p-4 rounded-lg border border-surface-700">
            {project.desc || project.description}
          </p>

          <h3 className="text-sm font-semibold text-surface-200 mb-3 border-b border-surface-700 pb-2">Вимоги</h3>
          <ul className="space-y-2 mb-8">
            {(project.requirements || ['Написати чистий код', 'Уникати глобальних змінних', 'Вивести результат в консоль']).map((req, i) => (
              <li key={i} className="flex gap-2 text-sm text-surface-300">
                <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>

          {/* Mobile: button to switch to code */}
          <button
            onClick={() => setActivePanel('editor')}
            className="lg:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-white text-sm font-medium mt-4"
          >
            <FileCode2 size={16} />
            Перейти до коду
          </button>
        </div>

        {/* Right: Editor & Terminal */}
        <div className={`
          w-full lg:w-[65%] flex flex-col
          ${activePanel !== 'requirements' ? 'flex' : 'hidden lg:flex'}
        `}>
          {/* Editor */}
          <div className={`
            flex-1 flex flex-col border-b border-surface-700/50
            ${activePanel === 'editor' ? 'flex' : 'hidden lg:flex'}
          `}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-900 border-b border-surface-700/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-800 text-xs text-surface-200">
                  <FileCode2 size={12} className="text-accent" />
                  main.{getLanguageConfig(project.courseId || activeCourse || 'cpp').extension}
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[200px]">
              <MonacoEditor value={code} onChange={(val) => setCode(val || '')} />
            </div>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-t border-surface-700/50 bg-surface-900/50">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button variant="primary" size="sm" onClick={handleRun} disabled={running}>
                  {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  <span className="hidden sm:inline">{running ? 'Запуск...' : 'Запустити'}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset} title="Скинути код до початкового">
                  <RotateCcw size={14} />
                </Button>
                <kbd className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded font-mono hidden sm:block">Ctrl+Enter</kbd>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className={`
            lg:h-[40%] flex flex-col bg-surface-950
            ${activePanel === 'output' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'}
          `}>
            <InteractiveTerminal
              ref={terminalRef}
              code={code}
              language={project.courseId || activeCourse || 'cpp'}
              onRunStatusChange={setRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
