import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Code2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';
import { useToast } from '@/components/ui/Toast';
import CourseFilter from '@/components/admin/CourseFilter';

const DIFF_LABELS = {
  easy: { label: 'Легко', color: 'text-emerald-400' },
  medium: { label: 'Середньо', color: 'text-amber-400' },
  hard: { label: 'Складно', color: 'text-red-400' },
};

const DEFAULT_TASK = {
  id: '',
  title: '',
  difficulty: 'easy',
  xp: 15,
  desc: '',
  starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    return 0;\n}',
};

export default function AdminPractice() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState(DEFAULT_TASK);
  const [isEditing, setIsEditing] = useState(false);
  const { token, activeAdminCourse } = useAppStore();
  const { addToast } = useToast();

  const fetchTasks = () => {
    if (!activeAdminCourse) return;
    fetch(`http://localhost:3001/api/admin/practice?courseId=${activeAdminCourse}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setTasks)
      .catch(console.error);
  };

  useEffect(() => {
    if (view === 'list') fetchTasks();
  }, [view, token, activeAdminCourse]);

  const handleEdit = (task) => {
    setFormData({ ...DEFAULT_TASK, ...task });
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!confirm('Видалити завдання? Це неможливо скасувати.')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/practice/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('success', 'Завдання видалено');
        fetchTasks();
      }
    } catch {
      addToast('error', 'Помилка видалення');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!isEditing) formData.courseId = activeAdminCourse;
      const url = `http://localhost:3001/api/admin/practice${isEditing ? `/${formData.id}` : ''}`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('success', isEditing ? 'Завдання оновлено ✅' : 'Завдання створено ✅');
        setView('list');
      } else {
        const err = await res.json();
        addToast('error', err.message || 'Помилка збереження');
      }
    } catch {
      addToast('error', 'Помилка мережі');
    }
  };

  // Reorder
  const handleReorder = async (task, direction) => {
    const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(t => t.id === task.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder = sorted.map((t, i) => ({ id: t.id, order: i }));
    const temp = newOrder[idx].order;
    newOrder[idx].order = newOrder[swapIdx].order;
    newOrder[swapIdx].order = temp;

    setTasks(prev => prev.map(t => {
      const match = newOrder.find(o => o.id === t.id);
      return match ? { ...t, order: match.order } : t;
    }));

    try {
      await Promise.all([
        fetch(`http://localhost:3001/api/admin/practice/${newOrder[idx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[idx].order })
        }),
        fetch(`http://localhost:3001/api/admin/practice/${newOrder[swapIdx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[swapIdx].order })
        })
      ]);
    } catch {
      addToast('error', 'Помилка оновлення порядку');
      fetchTasks();
    }
  };

  // ======================== FORM VIEW ========================
  if (view === 'form') {
    return (
      <div className="max-w-4xl max-h-full overflow-y-auto pr-4 pb-16 space-y-6">
        <button onClick={() => setView('list')} className="text-surface-400 flex items-center gap-2 hover:text-white">
          <ArrowLeft size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Редагувати завдання' : 'Нове завдання'}</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Основна інформація</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">ID (Slug) *</label>
                <input required value={formData.id} disabled={isEditing} onChange={e => setFormData({ ...formData, id: e.target.value })} placeholder="p1" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Назва *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Hello World" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Складність</label>
                <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-white">
                  <option value="easy">Легко</option>
                  <option value="medium">Середньо</option>
                  <option value="hard">Складно</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">XP</label>
                <input type="number" value={formData.xp} onChange={e => setFormData({ ...formData, xp: +e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Контент</h2>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Опис завдання</label>
              <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} rows={3} placeholder='Виведіть "Hello, World!" на екран' className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
            </div>
          </div>

          {/* Starter Code */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2 flex items-center gap-2">
              <Code2 size={18} className="text-accent" /> Стартовий Код
            </h2>
            <textarea
              value={formData.starter}
              onChange={e => setFormData({ ...formData, starter: e.target.value })}
              rows={10}
              placeholder="#include <iostream>..."
              className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none text-emerald-400 font-mono text-xs"
            />
          </div>

          {/* Save */}
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-colors">
              Зберегти Завдання
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ======================== LIST VIEW ========================
  const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 max-h-full overflow-y-auto pr-2 pb-16">
      <CourseFilter />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Керування Практикою</h1>
        <button
          onClick={() => {
            setFormData({ ...DEFAULT_TASK });
            setIsEditing(false);
            setView('form');
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={16} /> Створити
        </button>
      </div>

      <div className="bg-surface-900/50 border border-surface-800 rounded-xl overflow-hidden">
        {sorted.map((task, idx) => {
          const diff = DIFF_LABELS[task.difficulty] || DIFF_LABELS.easy;
          return (
            <div key={task._id || task.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-800/50 last:border-b-0 hover:bg-surface-800/30 transition-colors">
              <div className="flex items-center gap-1">
                <GripVertical size={14} className="text-surface-700" />
                <span className="text-xs font-mono text-surface-500 w-5 text-center">{idx + 1}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleReorder(task, 'up')} disabled={idx === 0} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition">
                  <ArrowUp size={12} />
                </button>
                <button onClick={() => handleReorder(task, 'down')} disabled={idx === sorted.length - 1} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition">
                  <ArrowDown size={12} />
                </button>
              </div>
              <div className="w-8 h-8 rounded bg-surface-800 flex items-center justify-center flex-shrink-0">
                <Code2 size={14} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-surface-50 truncate">{task.title}</h3>
                <p className="text-[11px] text-surface-600 font-mono">{task.id}</p>
              </div>
              <span className={`text-xs font-semibold ${diff.color}`}>{diff.label}</span>
              <span className="text-xs text-surface-500">{task.xp} XP</span>
              <div className="flex items-center gap-1.5 ml-2">
                <button onClick={() => handleEdit(task)} className="p-1.5 text-surface-400 hover:text-white bg-surface-800 rounded hover:bg-surface-700 transition"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(task.id)} className="p-1.5 text-surface-400 hover:text-red-400 bg-surface-800 rounded hover:bg-red-500/20 transition"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-surface-500 text-center py-8">Практичних завдань не знайдено.</p>}
      </div>
    </div>
  );
}
