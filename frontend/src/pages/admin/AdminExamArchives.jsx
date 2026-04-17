import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import {
  Archive, Plus, Trash2, Edit3, Save, X, Upload,
  ChevronDown, ChevronRight, Image as ImageIcon,
  BookOpen, Loader2, ArrowUp, ArrowDown, GripVertical
} from 'lucide-react';
import useAppStore from '@/stores/useAppStore';

const API = '/api';
const AVAILABLE_LANGUAGES = [
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
];

const SUBJECT_ICONS = [
  'BookOpen', 'Code2', 'Cpu', 'Database', 'Binary',
  'Calculator', 'Brain', 'Layers', 'Network', 'GraduationCap',
  'FileCode', 'GitBranch', 'Boxes', 'Puzzle', 'Sigma',
];

export default function AdminExamArchives() {
  const { token } = useAppStore();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const [subjects, setSubjects] = useState([]);
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('archives');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState('all');

  // Subject form
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ id: '', name: '', icon: 'BookOpen', description: '', order: 0 });

  // Archive form
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [editingArchive, setEditingArchive] = useState(null);
  const [archiveForm, setArchiveForm] = useState({
    id: '', subjectId: '', title: '', description: '', session: '', order: 0,
    images: [],  // archive-level images
    tasks: [],
  });

  const [expandedTask, setExpandedTask] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [subjRes, archRes] = await Promise.all([
        fetch(`${API}/admin/subjects`, { headers }),
        fetch(`${API}/admin/exam-archives`, { headers }),
      ]);
      if (subjRes.ok) setSubjects(await subjRes.json());
      if (archRes.ok) setArchives(await archRes.json());
    } catch (err) { console.error('Failed to load', err); }
    finally { setLoading(false); }
  }

  // ═══════ SUBJECTS ═══════
  const resetSubjectForm = () => {
    setSubjectForm({ id: '', name: '', icon: 'BookOpen', description: '', order: 0 });
    setEditingSubject(null);
    setShowSubjectForm(false);
  };

  const handleSubjectSubmit = async () => {
    try {
      const method = editingSubject ? 'PUT' : 'POST';
      const url = editingSubject ? `${API}/admin/subjects/${editingSubject.id}` : `${API}/admin/subjects`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(subjectForm) });
      if (res.ok) { await loadData(); resetSubjectForm(); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Видалити предмет?')) return;
    await fetch(`${API}/admin/subjects/${id}`, { method: 'DELETE', headers });
    await loadData();
  };

  const startEditSubject = (sub) => {
    setSubjectForm({ id: sub.id, name: sub.name, icon: sub.icon || 'BookOpen', description: sub.description || '', order: sub.order || 0 });
    setEditingSubject(sub);
    setShowSubjectForm(true);
  };

  const handleReorderSubject = async (subject, direction) => {
    const list = sortedSubjectsList;
    const idx = list.findIndex(s => s.id === subject.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    const newOrder = list.map((s, i) => ({ id: s.id, order: i }));
    const temp = newOrder[idx].order;
    newOrder[idx].order = newOrder[swapIdx].order;
    newOrder[swapIdx].order = temp;

    setSubjects(prev => prev.map(s => {
      const match = newOrder.find(o => o.id === s.id);
      return match ? { ...s, order: match.order } : s;
    }));

    try {
      await Promise.all([
        fetch(`${API}/admin/subjects/${newOrder[idx].id}`, {
          method: 'PUT', headers, body: JSON.stringify({ order: newOrder[idx].order })
        }),
        fetch(`${API}/admin/subjects/${newOrder[swapIdx].id}`, {
          method: 'PUT', headers, body: JSON.stringify({ order: newOrder[swapIdx].order })
        })
      ]);
    } catch {
      loadData();
    }
  };

  // ═══════ ARCHIVES ═══════
  const resetArchiveForm = () => {
    setArchiveForm({ id: '', subjectId: '', title: '', description: '', session: '', order: 0, images: [], tasks: [] });
    setEditingArchive(null);
    setShowArchiveForm(false);
    setExpandedTask(null);
  };

  const handleArchiveSubmit = async () => {
    try {
      const method = editingArchive ? 'PUT' : 'POST';
      const url = editingArchive ? `${API}/admin/exam-archives/${editingArchive.id}` : `${API}/admin/exam-archives`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(archiveForm) });
      if (res.ok) { await loadData(); resetArchiveForm(); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteArchive = async (id) => {
    if (!confirm('Видалити архів та всі фото?')) return;
    await fetch(`${API}/admin/exam-archives/${id}`, { method: 'DELETE', headers });
    await loadData();
  };

  const startEditArchive = (arch) => {
    setArchiveForm({
      id: arch.id, subjectId: arch.subjectId, title: arch.title,
      description: arch.description || '', session: arch.session || '',
      order: arch.order || 0, images: arch.images || [], tasks: arch.tasks || [],
    });
    setEditingArchive(arch);
    setShowArchiveForm(true);
  };

  // ── Archive-level image upload ──
  const handleArchiveImageUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) formData.append('images', file);
      const res = await fetch(`${API}/admin/upload-images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const results = await res.json();
        setArchiveForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...results.map(r => r.url)],
        }));
      }
    } catch (err) { console.error('Upload failed', err); }
    finally { setUploading(false); }
  };

  const removeArchiveImage = (imgIdx) => {
    setArchiveForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imgIdx),
    }));
  };

  // ── Task management ──
  const addTask = () => {
    const num = archiveForm.tasks.length + 1;
    setArchiveForm(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        taskNumber: num, title: '', languages: ['cpp'],
        starterCode: { cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    return 0;\n}\n' },
      }],
    }));
    setExpandedTask(archiveForm.tasks.length);
  };

  const updateTask = (index, field, value) => {
    setArchiveForm(prev => {
      const tasks = [...prev.tasks];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...prev, tasks };
    });
  };

  const removeTask = (index) => {
    if (!confirm('Видалити завдання?')) return;
    setArchiveForm(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index).map((t, i) => ({ ...t, taskNumber: i + 1 })),
    }));
  };

  const toggleLanguage = (taskIndex, lang) => {
    setArchiveForm(prev => {
      const tasks = [...prev.tasks];
      const task = { ...tasks[taskIndex] };
      const langs = task.languages || [];
      if (langs.includes(lang)) {
        task.languages = langs.filter(l => l !== lang);
        const sc = { ...task.starterCode }; delete sc[lang]; task.starterCode = sc;
      } else {
        task.languages = [...langs, lang];
        task.starterCode = { ...task.starterCode, [lang]: getDefaultStarter(lang) };
      }
      tasks[taskIndex] = task;
      return { ...prev, tasks };
    });
  };

  const updateStarterCode = (taskIndex, lang, code) => {
    setArchiveForm(prev => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = { ...tasks[taskIndex], starterCode: { ...tasks[taskIndex].starterCode, [lang]: code } };
      return { ...prev, tasks };
    });
  };

  const sortedSubjectsList = [...subjects].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const filteredArchives = activeSubjectFilter === 'all' 
    ? [...archives] 
    : archives.filter(a => a.subjectId === activeSubjectFilter);
  filteredArchives.sort((a, b) => (a.order || 0) - (b.order || 0));

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || id;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-3">
          <Archive size={24} className="text-amber-400" />
          Архів екзаменів
        </h1>
        <p className="text-sm text-surface-400 mt-1">Управління предметами, архівами та завданнями</p>
      </div>

      {/* Tab toggle */}
      <div className="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1 w-fit">
        {['archives', 'subjects'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-accent text-white' : 'text-surface-400 hover:text-surface-200'}`}>
            {tab === 'archives' ? `Архіви (${archives.length})` : `Предмети (${subjects.length})`}
          </button>
        ))}
      </div>

      {/* ═══════ SUBJECTS TAB ═══════ */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <button onClick={() => { resetSubjectForm(); setShowSubjectForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 text-sm font-medium transition-all">
            <Plus size={16} /> Додати предмет
          </button>

          {showSubjectForm && (
            <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-200">{editingSubject ? 'Редагувати предмет' : 'Новий предмет'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="ID (slug)" value={subjectForm.id} onChange={v => setSubjectForm(p => ({ ...p, id: v }))} placeholder="oop" disabled={!!editingSubject} />
                <InputField label="Назва" value={subjectForm.name} onChange={v => setSubjectForm(p => ({ ...p, name: v }))} placeholder="ООП" />
                <div className="md:col-span-2">
                  <InputField label="Опис" value={subjectForm.description} onChange={v => setSubjectForm(p => ({ ...p, description: v }))} placeholder="Об'єктно-орієнтоване програмування" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-surface-400 mb-1.5">Іконка</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECT_ICONS.map(iconName => {
                    const IconComponent = Icons[iconName] || Icons.Circle;
                    return (
                      <button key={iconName} onClick={() => setSubjectForm(p => ({ ...p, icon: iconName }))}
                        className={`p-2 rounded-lg text-xs transition-all ${subjectForm.icon === iconName ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-surface-700/30 text-surface-400 hover:bg-surface-700/60 border border-transparent'}`}
                        title={iconName}
                      >
                        <IconComponent size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleSubjectSubmit} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all">
                  <Save size={14} /> Зберегти
                </button>
                <button onClick={resetSubjectForm} className="px-4 py-2 rounded-lg text-sm text-surface-400 hover:text-surface-200 transition-all">Скасувати</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {sortedSubjectsList.map((sub, idx) => {
              const SubIcon = Icons[sub.icon] || Icons.BookOpen;
              return (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-surface-800/30 border border-surface-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5 mr-2">
                      <button onClick={() => handleReorderSubject(sub, 'up')} disabled={idx === 0} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 transition"><ArrowUp size={12} /></button>
                      <button onClick={() => handleReorderSubject(sub, 'down')} disabled={idx === sortedSubjectsList.length - 1} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 transition"><ArrowDown size={12} /></button>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0"><SubIcon size={16} className="text-accent" /></div>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{sub.name}</p>
                      <p className="text-xs text-surface-500">ID: {sub.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditSubject(sub)} className="p-2 rounded-lg text-surface-400 hover:text-accent hover:bg-surface-700/50 transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => handleDeleteSubject(sub.id)} className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-950/30 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
            {subjects.length === 0 && <p className="text-center py-8 text-surface-500 text-sm">Предметів ще немає</p>}
          </div>
        </div>
      )}

      {/* ═══════ ARCHIVES TAB ═══════ */}
      {activeTab === 'archives' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => { resetArchiveForm(); setShowArchiveForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 text-sm font-medium transition-all">
              <Plus size={16} /> Додати архів
            </button>
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1">
              <button onClick={() => setActiveSubjectFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${activeSubjectFilter === 'all' ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}>
                Усі
              </button>
              {sortedSubjectsList.map(s => (
                <button key={s.id} onClick={() => setActiveSubjectFilter(s.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${activeSubjectFilter === s.id ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Archive form */}
          {showArchiveForm && (
            <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-200">{editingArchive ? 'Редагувати архів' : 'Новий архів'}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="ID (slug)" value={archiveForm.id} onChange={v => setArchiveForm(p => ({...p, id: v}))} placeholder="oop-winter-2024" disabled={!!editingArchive} />
                <div>
                  <label className="block text-xs text-surface-400 mb-1.5">Предмет</label>
                  <select value={archiveForm.subjectId} onChange={e => setArchiveForm(p => ({...p, subjectId: e.target.value}))}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700/50 rounded-lg text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent/40">
                    <option value="">Оберіть предмет</option>
                    {sortedSubjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <InputField label="Назва" value={archiveForm.title} onChange={v => setArchiveForm(p => ({...p, title: v}))} placeholder="ООП — Зимова сесія 2024" />
                <InputField label="Сесія" value={archiveForm.session} onChange={v => setArchiveForm(p => ({...p, session: v}))} placeholder="Зима 2024" />
                <InputField label="Опис" value={archiveForm.description} onChange={v => setArchiveForm(p => ({...p, description: v}))} placeholder="Опис архіву" />
                <InputField label="Порядок" type="number" value={archiveForm.order} onChange={v => setArchiveForm(p => ({...p, order: Number(v)}))} />
              </div>

              {/* ── Archive-level photos ── */}
              <div>
                <label className="block text-xs text-surface-400 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-amber-400" />
                  Фото білету (на одному фото може бути кілька завдань)
                </label>

                {archiveForm.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {archiveForm.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="relative group w-28 h-28 rounded-lg overflow-hidden border border-surface-700/50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeArchiveImage(imgIdx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                          Фото {imgIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-surface-700/50 hover:border-accent/40 cursor-pointer transition-all">
                  {uploading
                    ? <Loader2 size={16} className="animate-spin text-accent" />
                    : <Upload size={16} className="text-surface-500" />}
                  <span className="text-xs text-surface-400">
                    {uploading ? 'Завантаження...' : 'Натисніть для завантаження фото білету'}
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={(e) => handleArchiveImageUpload(e.target.files)} disabled={uploading} />
                </label>
              </div>

              {/* ── Tasks ── */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-surface-300">Завдання ({archiveForm.tasks.length})</h4>
                  <button onClick={addTask} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700/50 text-surface-300 hover:text-surface-100 text-xs font-medium transition-all">
                    <Plus size={12} /> Додати завдання
                  </button>
                </div>

                {archiveForm.tasks.map((task, tIdx) => (
                  <div key={tIdx} className="border border-surface-700/50 rounded-lg overflow-hidden">
                    <button onClick={() => setExpandedTask(expandedTask === tIdx ? null : tIdx)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-800/50 hover:bg-surface-800 transition-all">
                      <div className="flex items-center gap-2">
                        {expandedTask === tIdx ? <ChevronDown size={14} className="text-accent" /> : <ChevronRight size={14} />}
                        <span className="text-sm font-medium text-surface-200">Завдання {task.taskNumber}</span>
                        {task.languages?.map(l => (
                          <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-400 font-mono">{l}</span>
                        ))}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeTask(tIdx); }}
                        className="p-1 rounded text-surface-500 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </button>

                    {expandedTask === tIdx && (
                      <div className="p-4 space-y-4 border-t border-surface-700/30">
                        <InputField label="Назва завдання" value={task.title} onChange={v => updateTask(tIdx, 'title', v)} placeholder="Класи та наслідування" />

                        <div>
                          <label className="block text-xs text-surface-400 mb-1.5">Мови програмування</label>
                          <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map(lang => (
                              <button key={lang.id} onClick={() => toggleLanguage(tIdx, lang.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  task.languages?.includes(lang.id) ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-surface-700/30 text-surface-400 hover:bg-surface-700/60 border border-transparent'
                                }`}>{lang.label}</button>
                            ))}
                          </div>
                        </div>

                        {task.languages?.map(lang => (
                          <div key={lang}>
                            <label className="block text-xs text-surface-400 mb-1.5">
                              Шаблон коду — {AVAILABLE_LANGUAGES.find(l => l.id === lang)?.label || lang}
                            </label>
                            <textarea value={task.starterCode?.[lang] || ''} onChange={e => updateStarterCode(tIdx, lang, e.target.value)}
                              className="w-full h-32 px-3 py-2 bg-surface-900 border border-surface-700/50 rounded-lg text-xs font-mono text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y"
                              placeholder={`// Starter code for ${lang}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-surface-700/30">
                <button onClick={handleArchiveSubmit} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all">
                  <Save size={14} /> Зберегти архів
                </button>
                <button onClick={resetArchiveForm} className="px-4 py-2 rounded-lg text-sm text-surface-400 hover:text-surface-200 transition-all">Скасувати</button>
              </div>
            </div>
          )}

          {/* Archives list */}
          <div className="space-y-2">
            {filteredArchives.map(arch => (
              <div key={arch.id} className="flex items-center justify-between p-4 bg-surface-800/30 border border-surface-700/50 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0"><Archive size={16} className="text-amber-400" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{arch.title}</p>
                    <p className="text-xs text-surface-500">
                      Порядок: {arch.order || 0} • {getSubjectName(arch.subjectId)} • {arch.session || 'Без сесії'} • {arch.tasks?.length || 0} завдань • {arch.images?.length || 0} фото
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEditArchive(arch)} className="p-2 rounded-lg text-surface-400 hover:text-accent hover:bg-surface-700/50 transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => handleDeleteArchive(arch.id)} className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-950/30 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {filteredArchives.length === 0 && <p className="text-center py-8 text-surface-500 text-sm">Архівів ще немає</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <div>
      <label className="block text-xs text-surface-400 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2 bg-surface-800 border border-surface-700/50 rounded-lg text-sm text-surface-200 placeholder:text-surface-600 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 transition-all" />
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
