import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, X, Plus, Play, Loader2,
  Image as ImageIcon, Code2, RotateCcw, ZoomIn,
  ArrowLeft
} from 'lucide-react';
import { Badge, Button, Lightbox } from '@/components/ui';
import { InteractiveTerminal } from '@/components/ui';
import MonacoEditor from '@/components/editor/MonacoEditor';
import useAppStore from '@/stores/useAppStore';

const API = '/api';
const LANG_LABELS = { c: 'C', cpp: 'C++', python: 'Python', javascript: 'JavaScript', java: 'Java', csharp: 'C#' };
const LANG_MONACO = { c: 'c', cpp: 'cpp', python: 'python', javascript: 'javascript', java: 'java', csharp: 'csharp' };

const getStorageKey = (archiveId) => `exam-archive-${archiveId}`;

export default function ExamArchiveIDE() {
  const { archiveId } = useParams();
  const navigate = useNavigate();
  const { token, isGuest } = useAppStore();

  const [archive, setArchive] = useState(null);
  const [loading, setLoading] = useState(true);

  // Accordion state
  const [expandedTasks, setExpandedTasks] = useState({});

  // Multi-tab state
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tabCodes, setTabCodes] = useState({});

  // Image viewer
  const [lightboxImg, setLightboxImg] = useState(null);
  const [showImages, setShowImages] = useState(true);

  // Terminal
  const [running, setRunning] = useState(false);
  const terminalRef = useRef(null);

  // Mobile panel state
  const [mobilePanel, setMobilePanel] = useState('tasks');

  // ── Load archive ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/exam-archives/${archiveId}`);
        if (res.ok) setArchive(await res.json());
      } catch (err) {
        console.error('Failed to load archive', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [archiveId]);

  // ── Restore tabs + code from localStorage on mount ──
  useEffect(() => {
    if (!archive) return;
    const saved = localStorage.getItem(getStorageKey(archiveId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tabs?.length > 0) {
          setTabs(parsed.tabs);
          setActiveTabId(parsed.activeTabId || parsed.tabs[0].id);
          setTabCodes(parsed.tabCodes || {});
          setExpandedTasks(parsed.expandedTasks || {});
          return;
        }
      } catch (e) { /* ignore */ }
    }
    if (archive.tasks?.length > 0) setExpandedTasks({ 0: true });
  }, [archive, archiveId]);

  // ── Load solutions from MongoDB → auto-open tabs with saved code ──
  useEffect(() => {
    if (!archive || isGuest || !token) return;
    async function loadSolutions() {
      try {
        const res = await fetch(`${API}/exam-archives/${archiveId}/solutions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const solutionMap = await res.json();
          const serverKeys = Object.keys(solutionMap);
          if (serverKeys.length === 0) return;

          // Build tabs and codes from server solutions
          const newTabs = [];
          const newCodes = {};
          const newExpanded = {};

          serverKeys.forEach(key => {
            const [taskIdx, lang] = key.split('_');
            const taskIndex = parseInt(taskIdx, 10);
            const tabId = `${taskIndex}-${lang}`;
            const task = archive.tasks[taskIndex];
            if (!task) return;

            // Only create tab if code differs from starter (user actually wrote something)
            const starterCode = task.starterCode?.[lang] || getDefaultStarter(lang);
            const savedCode = solutionMap[key];
            if (savedCode && savedCode !== starterCode) {
              newTabs.push({
                id: tabId,
                taskIndex,
                language: lang,
                label: `Завд. ${task.taskNumber} (${LANG_LABELS[lang] || lang})`,
              });
              newCodes[tabId] = savedCode;
              newExpanded[taskIndex] = true;
            }
          });

          if (newTabs.length > 0) {
            // Merge with existing tabs (localStorage may have some already)
            setTabs(prevTabs => {
              const existingIds = new Set(prevTabs.map(t => t.id));
              const merged = [...prevTabs];
              newTabs.forEach(tab => {
                if (!existingIds.has(tab.id)) merged.push(tab);
              });
              return merged;
            });

            // Server code overrides localStorage code
            setTabCodes(prev => ({ ...prev, ...newCodes }));

            // Expand tasks that have solutions
            setExpandedTasks(prev => ({ ...prev, ...newExpanded }));

            // If no active tab, activate the first server tab
            setActiveTabId(prev => prev || newTabs[0].id);
          }
        }
      } catch (err) { console.error('Failed to load solutions', err); }
    }
    loadSolutions();
  }, [archive, archiveId, token, isGuest]);

  // ── Save to localStorage ──
  useEffect(() => {
    if (!archive || tabs.length === 0) return;
    localStorage.setItem(getStorageKey(archiveId), JSON.stringify({
      tabs, activeTabId, tabCodes, expandedTasks,
    }));
  }, [tabs, activeTabId, tabCodes, expandedTasks, archiveId, archive]);

  // ── Save to MongoDB (debounced) — sends null if code is default to delete ──
  const saveTimerRef = useRef(null);
  const saveToServer = useCallback((taskIndex, language, code) => {
    if (isGuest || !token || !archive) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const task = archive.tasks[taskIndex];
        const starterCode = task?.starterCode?.[language] || getDefaultStarter(language);
        // If code matches starter → send null to delete from MongoDB
        const payload = (code === starterCode) ? null : code;
        await fetch(`${API}/exam-archives/${archiveId}/solutions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ taskIndex, language, code: payload }),
        });
      } catch (err) { console.error('Failed to save solution', err); }
    }, 2000);
  }, [archiveId, token, isGuest, archive]);

  // ── Tab helpers ──
  const openTab = (taskIndex, language) => {
    const tabId = `${taskIndex}-${language}`;
    if (tabs.find(t => t.id === tabId)) { setActiveTabId(tabId); return; }
    const task = archive.tasks[taskIndex];
    const starterCode = task.starterCode?.[language] || getDefaultStarter(language);
    setTabs(prev => [...prev, {
      id: tabId, taskIndex, language,
      label: `Завд. ${task.taskNumber} (${LANG_LABELS[language] || language})`,
    }]);
    setActiveTabId(tabId);
    setTabCodes(prev => prev[tabId] ? prev : { ...prev, [tabId]: starterCode });
  };

  const closeTab = (tabId, e) => {
    e?.stopPropagation();
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
      return newTabs;
    });
  };

  const updateTabCode = (tabId, code) => {
    setTabCodes(prev => ({ ...prev, [tabId]: code }));
    const tab = tabs.find(t => t.id === tabId);
    if (tab) saveToServer(tab.taskIndex, tab.language, code);
  };

  const resetTabCode = () => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    const task = archive.tasks[tab.taskIndex];
    const starter = task?.starterCode?.[tab.language] || getDefaultStarter(tab.language);
    setTabCodes(prev => ({ ...prev, [activeTabId]: starter }));
    // Delete from MongoDB immediately (code is now default)
    if (!isGuest && token) {
      fetch(`${API}/exam-archives/${archiveId}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskIndex: tab.taskIndex, language: tab.language, code: null }),
      }).catch(() => {});
    }
  };

  const toggleTask = (index) => setExpandedTasks(prev => ({ ...prev, [index]: !prev[index] }));

  const handleRun = useCallback(() => {
    if (!tabCodes[activeTabId]?.trim()) return;
    terminalRef.current?.run();
  }, [activeTabId, tabCodes]);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeCode = activeTabId ? (tabCodes[activeTabId] || '') : '';
  const activeLanguage = activeTab?.language || 'cpp';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!archive) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-400">Архів не знайдено</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/archives')}>← Назад</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in -m-4 sm:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-surface-700/50 bg-surface-900/50 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => navigate('/archives')} className="text-surface-500 hover:text-surface-300 transition-colors text-sm flex items-center gap-1 flex-shrink-0">
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Архіви</span>
          </button>
          <span className="text-surface-700 hidden sm:inline">|</span>
          <h2 className="text-xs sm:text-sm font-semibold text-surface-100 truncate">{archive.title}</h2>
          {archive.session && <Badge color="warning" size="sm" className="hidden sm:flex">{archive.session}</Badge>}
        </div>
        <Badge color="accent" size="sm">{archive.tasks?.length || 0} завд.</Badge>
      </div>

      {/* Mobile panel tabs */}
      <div className="flex lg:hidden border-b border-surface-700/50 bg-surface-900/30 flex-shrink-0">
        {[
          { key: 'tasks', icon: ImageIcon, label: 'Завдання' },
          { key: 'editor', icon: Code2, label: 'Код' },
          { key: 'terminal', icon: Play, label: 'Вивід' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setMobilePanel(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              mobilePanel === tab.key
                ? 'text-accent border-b-2 border-accent'
                : 'text-surface-500 hover:text-surface-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar: Images + Tasks ── */}
        <div className={`
          w-full lg:w-[300px] border-r border-surface-700/50 bg-surface-950 overflow-y-auto lg:flex-shrink-0
          ${mobilePanel === 'tasks' ? 'block' : 'hidden lg:block'}
        `}>
          {/* Archive-level images */}
          {archive.images?.length > 0 && (
            <div className="border-b border-surface-700/50">
              <button
                onClick={() => setShowImages(!showImages)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-surface-400 uppercase tracking-wider hover:bg-surface-800/50 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-amber-400" />
                  Фото білету ({archive.images.length})
                </span>
                {showImages ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {showImages && (
                <div className="px-3 pb-3 space-y-2 animate-fade-in">
                  {archive.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxImg(img)}
                      className="relative w-full rounded-lg overflow-hidden border border-surface-700/50 hover:border-accent/50 transition-all group"
                    >
                      <img
                        src={img}
                        alt={`Білет — фото ${idx + 1}`}
                        className="w-full h-auto object-cover max-h-[250px]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
                        Фото {idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks accordion */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 px-1">
              Завдання
            </h3>
            <div className="space-y-1">
              {archive.tasks?.map((task, index) => {
                const isExpanded = expandedTasks[index];
                return (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleTask(index)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all ${
                        isExpanded ? 'bg-surface-800 text-surface-100' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                      }`}
                    >
                      {isExpanded
                        ? <ChevronDown size={14} className="text-accent flex-shrink-0" />
                        : <ChevronRight size={14} className="flex-shrink-0" />}
                      <span className="text-sm font-medium truncate">
                        Завдання {task.taskNumber}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        {task.languages?.map(lang => (
                          <span key={lang} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-400">
                            {LANG_LABELS[lang] || lang}
                          </span>
                        ))}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 bg-surface-800/30 space-y-2 animate-fade-in">
                        {task.title && (
                          <p className="text-xs text-surface-300 px-1">{task.title}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {task.languages?.map(lang => (
                            <button
                              key={lang}
                              onClick={() => { openTab(index, lang); setMobilePanel('editor'); }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                                bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all"
                            >
                              <Code2 size={12} />
                              Відкрити в {LANG_LABELS[lang] || lang}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Center: Multi-tab Editor ── */}
        <div className={`
          flex-1 flex flex-col min-w-0
          ${mobilePanel === 'editor' ? 'flex' : 'hidden lg:flex'}
        `}>
          {/* Tab bar */}
          <div className="flex items-center bg-surface-900/80 border-b border-surface-700/50 overflow-x-auto flex-shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-medium border-r border-surface-700/30 whitespace-nowrap transition-all ${
                  activeTabId === tab.id
                    ? 'bg-surface-950 text-surface-100 border-b-2 border-b-accent'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
                }`}
              >
                <Code2 size={12} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">З.{archive.tasks[tab.taskIndex]?.taskNumber}</span>
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="ml-1 p-0.5 rounded hover:bg-surface-700 transition-colors"
                >
                  <X size={10} />
                </button>
              </button>
            ))}
            {tabs.length === 0 && (
              <div className="px-3 sm:px-4 py-2 text-xs text-surface-500 italic">
                <span className="hidden sm:inline">← Оберіть завдання та мову з панелі зліва</span>
                <span className="sm:hidden">Оберіть завдання</span>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {activeTabId ? (
              <>
                <div className="flex-1 min-h-[200px]">
                  <MonacoEditor
                    key={activeTabId}
                    value={activeCode}
                    onChange={(val) => updateTabCode(activeTabId, val || '')}
                    language={LANG_MONACO[activeLanguage] || activeLanguage}
                  />
                </div>
                <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-t border-surface-700/50 bg-surface-900/50">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button variant="primary" size="sm" onClick={handleRun} disabled={running}>
                      {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                      <span className="hidden sm:inline">{running ? 'Запуск...' : 'Запустити'}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={resetTabCode} title="Скинути код">
                      <RotateCcw size={14} />
                    </Button>
                    {/* Mobile: switch to terminal after run */}
                    <button
                      onClick={() => { handleRun(); setMobilePanel('terminal'); }}
                      className="lg:hidden flex items-center gap-1 px-2 py-1 rounded text-[10px] text-accent bg-accent/10"
                    >
                      Запуск + Вивід
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="default" size="sm">{LANG_LABELS[activeLanguage] || activeLanguage}</Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-surface-950">
                <div className="text-center px-4">
                  <Code2 size={40} className="mx-auto text-surface-700 mb-3" />
                  <p className="text-surface-500 text-sm">Відкрийте завдання</p>
                  <p className="text-surface-600 text-xs mt-1">
                    <span className="hidden lg:inline">Натисніть на мову під завданням у панелі зліва</span>
                    <span className="lg:hidden">Перейдіть до вкладки "Завдання"</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Terminal ── */}
        <div className={`
          w-full lg:w-[350px] border-l border-surface-700/50 flex flex-col lg:flex-shrink-0 bg-surface-950
          ${mobilePanel === 'terminal' ? 'flex' : 'hidden'}
          ${activeTabId ? 'lg:flex' : 'lg:hidden'}
        `}>
          <InteractiveTerminal ref={terminalRef} code={activeCode} language={activeLanguage} onRunStatusChange={setRunning} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <Lightbox 
          src={lightboxImg} 
          onClose={() => setLightboxImg(null)} 
        />
      )}
    </div>
  );
}

function getDefaultStarter(language) {
  switch (language) {
    case 'c': return '#include <stdio.h>\n\nint main() {\n    // Ваш код тут\n    return 0;\n}\n';
    case 'cpp': return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    return 0;\n}\n';
    case 'python': return '# Ваш код тут\n\n';
    case 'javascript': return '// Ваш код тут\n\n';
    case 'java': return 'public class Main {\n    public static void main(String[] args) {\n        // Ваш код тут\n    }\n}\n';
    default: return '// Ваш код тут\n';
  }
}
