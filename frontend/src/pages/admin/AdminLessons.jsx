import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, BookOpen, Zap, ArrowUp, ArrowDown, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';
import { useToast } from '@/components/ui/Toast';
import CourseFilter from '@/components/admin/CourseFilter';

const LEVEL_GROUPS = [
  { key: 'beginner', title: 'Основи', desc: 'Базовий синтаксис та типи даних', dot: 'bg-emerald-400' },
  { key: 'intermediate', title: 'Контроль', desc: 'Умови, цикли та функції', dot: 'bg-amber-400' },
  { key: 'advanced', title: "Пам'ять", desc: 'Покажчики та масиви', dot: 'bg-red-400' },
  { key: 'oop', title: 'ООП', desc: 'Класи та об\'єкти', dot: 'bg-violet-400' },
];

const DEFAULT_LESSON = {
  id: '',
  title: '',
  type: 'academic',
  level: 'beginner',
  xp: 10,
  content: '',
  // academic
  explanation: '',
  practiceTask: '',
  starterCode: '',
  expectedOutput: '',
  solution: '',
  hints: [],
  // interactive
  brokenCode: '',
  templates: [],
};

const DEFAULT_TEMPLATE = { code: '', errorType: '', solution: '' };

export default function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [formData, setFormData] = useState(DEFAULT_LESSON);
  const [isEditing, setIsEditing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [collapsedLevels, setCollapsedLevels] = useState({});
  const { token, activeAdminCourse } = useAppStore();
  const toast = useToast();

  const fetchLessons = () => {
    if (!activeAdminCourse) return;
    fetch(`/api/admin/lessons?courseId=${activeAdminCourse}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setLessons)
      .catch(console.error);
  };

  useEffect(() => {
    if (view === 'list') fetchLessons();
  }, [view, token, activeAdminCourse]);

  const handleEdit = (lesson) => {
    setFormData({ ...DEFAULT_LESSON, ...lesson });
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!confirm('Видалити урок? Це неможливо скасувати.')) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Урок видалено');
        fetchLessons();
      }
    } catch (e) {
      toast.error('Помилка видалення');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!isEditing) formData.courseId = activeAdminCourse; // force course assignment
      const url = `/api/admin/lessons${isEditing ? `/${formData.id}` : ''}`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEditing ? 'Урок оновлено' : 'Урок створено');
        setView('list');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Помилка збереження');
      }
    } catch (e) {
      toast.error('Помилка мережі');
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-4xl max-h-full overflow-y-auto pr-4 pb-16 space-y-6">
        <button onClick={() => setView('list')} className="text-surface-400 flex items-center gap-2 hover:text-white">
          <ArrowLeft size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Редагувати урок' : 'Новий урок'}</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Основна інформація</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">ID (Slug) *</label>
                <input required value={formData.id} disabled={isEditing} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Назва *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Тип *</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-white">
                  <option value="academic">Академічний</option>
                  <option value="interactive">Інтерактивний</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Рівень</label>
                <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="oop">OOP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Нагорода (XP)</label>
                <input type="number" value={formData.xp} onChange={e => setFormData({ ...formData, xp: +e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Універсальний Контент</h2>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Теорія / Сценарій Markdown (Підтримує {'{userName}'})</label>
              <textarea value={formData.explanation} onChange={e => setFormData({ ...formData, explanation: e.target.value })} rows={6} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Текст завдання (practiceTask)</label>
              <textarea value={formData.practiceTask} onChange={e => setFormData({ ...formData, practiceTask: e.target.value })} rows={2} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
            </div>
          </div>

          {formData.type === 'academic' && (
            <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold border-b border-surface-800 pb-2 flex items-center gap-2"><BookOpen size={18} className="text-emerald-400" /> Дані Академічного Уроку</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Стартовий Код</label>
                  <textarea value={formData.starterCode} onChange={e => setFormData({ ...formData, starterCode: e.target.value })} rows={4} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none text-emerald-400 font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-sm text-surface-400 mb-1">Очікуваний Вивід</label>
                  <textarea value={formData.expectedOutput} onChange={e => setFormData({ ...formData, expectedOutput: e.target.value })} rows={4} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none text-blue-400 font-mono text-xs" />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'interactive' && (
            <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold border-b border-surface-800 pb-2 flex items-center gap-2"><Zap size={18} className="text-warning" /> Інтерактивний Конструктор</h2>

              <div>
                <label className="block text-sm text-surface-400 mb-1">Зламаний Код (brokenCode)</label>
                <textarea value={formData.brokenCode} onChange={e => setFormData({ ...formData, brokenCode: e.target.value })} rows={3} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none text-red-400 font-mono text-xs bg-red-950/20" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-surface-400">Шаблони Помилок</label>
                  <button type="button" onClick={() => setFormData({ ...formData, templates: [...formData.templates, { ...DEFAULT_TEMPLATE }] })} className="px-3 py-1 bg-surface-800 text-xs rounded hover:bg-surface-700">
                    + Додати
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.templates.map((tpl, i) => (
                    <div key={i} className="flex gap-2 items-start border border-dashed border-surface-700 p-3 rounded bg-surface-950/50">
                      <div className="flex-1 space-y-2">
                        <input placeholder="Код який вводить юзер (Regex або точна стрічка)" value={tpl.code} onChange={(e) => {
                          const nT = [...formData.templates]; nT[i].code = e.target.value; setFormData({ ...formData, templates: nT });
                        }} className="w-full p-2 rounded bg-surface-900 text-xs font-mono border border-surface-700 outline-none" />

                        <input placeholder="Тип помилки (напр. wrong_operator)" value={tpl.errorType} onChange={(e) => {
                          const nT = [...formData.templates]; nT[i].errorType = e.target.value; setFormData({ ...formData, templates: nT });
                        }} className="w-full p-2 rounded bg-surface-900 text-xs font-mono border border-surface-700 outline-none text-red-300" />

                        <input placeholder="Підказка або Рішення (solution)" value={tpl.solution} onChange={(e) => {
                          const nT = [...formData.templates]; nT[i].solution = e.target.value; setFormData({ ...formData, templates: nT });
                        }} className="w-full p-2 rounded bg-surface-900 text-xs font-mono border border-surface-700 outline-none text-emerald-300" />
                      </div>
                      <button type="button" onClick={() => {
                        const nT = [...formData.templates]; nT.splice(i, 1); setFormData({ ...formData, templates: nT });
                      }} className="p-2 text-surface-500 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.templates.length === 0 && <p className="text-xs text-surface-600">Немає шаблонів (користувач не побачить динамічних підказок).</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-colors">
              Зберегти Урок
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Reorder helper — optimistic UI update + backend persist
  const handleReorder = async (lesson, direction, groupLessons) => {
    const sorted = [...groupLessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(l => l.id === lesson.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder = sorted.map((l, i) => ({ id: l.id, order: i }));
    const tempOrder = newOrder[idx].order;
    newOrder[idx].order = newOrder[swapIdx].order;
    newOrder[swapIdx].order = tempOrder;

    // Optimistic update — change local state immediately
    setLessons(prev => prev.map(l => {
      const match = newOrder.find(o => o.id === l.id);
      return match ? { ...l, order: match.order } : l;
    }));

    try {
      await Promise.all([
        fetch(`/api/admin/lessons/${newOrder[idx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[idx].order })
        }),
        fetch(`/api/admin/lessons/${newOrder[swapIdx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[swapIdx].order })
        })
      ]);
    } catch {
      toast.error('Помилка оновлення порядку');
      fetchLessons(); // rollback on error
    }
  };

  // Normalize order — optimistic UI update + backend persist
  const normalizeOrder = async (groupLessons) => {
    const sorted = [...groupLessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    const orderMap = sorted.map((l, i) => ({ id: l.id, order: i }));

    // Optimistic update
    setLessons(prev => prev.map(l => {
      const match = orderMap.find(o => o.id === l.id);
      return match ? { ...l, order: match.order } : l;
    }));
    toast.success('Порядок пронумеровано');

    try {
      await Promise.all(
        orderMap.map(({ id, order }) =>
          fetch(`/api/admin/lessons/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ order })
          })
        )
      );
    } catch {
      toast.error('Помилка нумерації');
      fetchLessons(); // rollback on error
    }
  };

  const toggleLevel = (key) => setCollapsedLevels(prev => ({ ...prev, [key]: !prev[key] }));

  const filteredLessons = lessons.filter(l => typeFilter === 'all' || l.type === typeFilter);
  const showGrouped = typeFilter !== 'all';

  // LIST VIEW
  return (
    <div className="space-y-6 max-h-full overflow-y-auto pr-2 pb-16">
      <CourseFilter />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Керування Уроками</h1>
        <button
          onClick={() => {
            setFormData(DEFAULT_LESSON);
            setIsEditing(false);
            setView('form');
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={16} /> Створити
        </button>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-1 p-1 bg-surface-900 border border-surface-800 rounded-lg w-fit">
        {[
          { key: 'all', label: 'Всі', icon: null },
          { key: 'academic', label: 'Академічні', icon: <BookOpen size={14} /> },
          { key: 'interactive', label: 'Інтерактивні', icon: <Zap size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${typeFilter === tab.key
                ? 'bg-accent text-white shadow-sm'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
              }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${typeFilter === tab.key ? 'bg-white/20' : 'bg-surface-800'
              }`}>
              {tab.key === 'all' ? lessons.length : lessons.filter(l => l.type === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grouped by level */}
      {showGrouped ? (
        <div className="space-y-4">
          {LEVEL_GROUPS.map(group => {
            const groupLessons = filteredLessons
              .filter(l => l.level === group.key)
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            if (groupLessons.length === 0) return null;

            const isCollapsed = collapsedLevels[group.key];

            return (
              <div key={group.key} className="bg-surface-900/50 border border-surface-800 rounded-xl overflow-hidden">
                {/* Level header */}
                <div
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-800/50 transition-colors cursor-pointer"
                  onClick={() => toggleLevel(group.key)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${group.dot}`} />
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-surface-100">{group.title}</h3>
                    <p className="text-xs text-surface-500">{group.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); normalizeOrder(groupLessons); }}
                    className="text-[10px] px-2 py-0.5 bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-white rounded transition"
                    title="Присвоїти послідовні номери порядку"
                  >
                    Авто-нумерація
                  </button>
                  <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
                    {groupLessons.length}
                  </span>
                  {isCollapsed
                    ? <ChevronRight size={16} className="text-surface-500" />
                    : <ChevronDown size={16} className="text-surface-500" />
                  }
                </div>

                {/* Lessons in this level */}
                {!isCollapsed && (
                  <div className="border-t border-surface-800">
                    {groupLessons.map((lesson, idx) => (
                      <div
                        key={lesson._id || lesson.id}
                        className="flex items-center gap-3 px-5 py-3 border-b border-surface-800/50 last:border-b-0 hover:bg-surface-800/30 transition-colors"
                      >
                        {/* Order number */}
                        <div className="flex items-center gap-1">
                          <GripVertical size={14} className="text-surface-700" />
                          <span className="text-xs font-mono text-surface-500 w-5 text-center">{idx + 1}</span>
                        </div>

                        {/* Up/Down */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleReorder(lesson, 'up', groupLessons)}
                            disabled={idx === 0}
                            className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => handleReorder(lesson, 'down', groupLessons)}
                            disabled={idx === groupLessons.length - 1}
                            className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className="w-8 h-8 rounded bg-surface-800 flex items-center justify-center flex-shrink-0 text-lg">
                          {lesson.icon || '📝'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-surface-50 truncate flex items-center gap-2">
                            {lesson.title}
                            {lesson.type === 'interactive' && <Zap size={12} className="text-warning" />}
                          </h3>
                          <p className="text-[11px] text-surface-600 font-mono">{lesson.id}</p>
                        </div>

                        {/* Meta */}
                        <span className="text-xs text-surface-500">{lesson.xp} XP</span>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 ml-2">
                          <button onClick={() => handleEdit(lesson)} className="p-1.5 text-surface-400 hover:text-white bg-surface-800 rounded hover:bg-surface-700 transition"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(lesson.id)} className="p-1.5 text-surface-400 hover:text-red-400 bg-surface-800 rounded hover:bg-red-500/20 transition"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat list for "Всі" tab */
        <div className="grid gap-3">
          {filteredLessons.sort((a, b) => (a.order || 0) - (b.order || 0)).map(lesson => (
            <div key={lesson._id || lesson.id} className="bg-surface-900 border border-surface-800 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-surface-800 flex items-center justify-center flex-shrink-0 text-xl">
                {lesson.icon || '📝'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-surface-50 truncate flex items-center gap-2">
                  {lesson.title}
                  {lesson.type === 'interactive' && <Zap size={14} className="text-warning" />}
                </h3>
                <p className="text-xs text-surface-500 font-mono mt-0.5">{lesson.id}</p>
              </div>
              <div className="flex flex-col items-end text-xs text-surface-400">
                <span>{lesson.xp} XP</span>
                <span className="uppercase tracking-wide mt-1">{lesson.level}</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => handleEdit(lesson)} className="p-2 text-surface-400 hover:text-white bg-surface-800 rounded hover:bg-surface-700 transition"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(lesson.id)} className="p-2 text-surface-400 hover:text-red-400 bg-surface-800 rounded hover:bg-red-500/20 transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {lessons.length === 0 && <p className="text-surface-500 text-center py-8">Уроків не знайдено.</p>}
        </div>
      )}
    </div>
  );
}
