import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Hammer, Zap } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';
import { useToast } from '@/components/ui/Toast';
import CourseFilter from '@/components/admin/CourseFilter';

const DEFAULT_PROJECT = {
  id: '',
  title: '',
  icon: '🔧',
  level: 'beginner',
  description: '',
  starterCode: '',
  xp: 100,
  requirements: [],
  tags: [],
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState(DEFAULT_PROJECT);
  const [isEditing, setIsEditing] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const { token, activeAdminCourse } = useAppStore();
  const toast = useToast();

  const fetchProjects = () => {
    if (!activeAdminCourse) return;
    fetch(`http://localhost:3001/api/admin/projects?courseId=${activeAdminCourse}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
  };

  useEffect(() => {
    if (view === 'list') fetchProjects();
  }, [view, token, activeAdminCourse]);

  const handleEdit = (project) => {
    setFormData({ ...DEFAULT_PROJECT, ...project });
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!confirm('Видалити проєкт? Це неможливо скасувати.')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Проєкт видалено');
        fetchProjects();
      }
    } catch (e) {
      toast.error('Помилка видалення');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!isEditing) formData.courseId = activeAdminCourse; // force course assignment
      const url = `http://localhost:3001/api/admin/projects${isEditing ? `/${formData.id}` : ''}`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEditing ? 'Проєкт оновлено ✅' : 'Проєкт створено ✅');
        setView('list');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Помилка збереження');
      }
    } catch (e) {
      toast.error('Помилка мережі');
    }
  };

  // Array-field helper
  const addToArray = (field, value, setter) => {
    const v = value.trim();
    if (v && !formData[field].includes(v)) {
      setFormData({ ...formData, [field]: [...formData[field], v] });
    }
    setter('');
  };

  const removeFromArray = (field, idx) => {
    const arr = [...formData[field]];
    arr.splice(idx, 1);
    setFormData({ ...formData, [field]: arr });
  };

  // ======================== FORM VIEW ========================
  if (view === 'form') {
    return (
      <div className="max-w-4xl max-h-full overflow-y-auto pr-4 pb-16 space-y-6">
        <button onClick={() => setView('list')} className="text-surface-400 flex items-center gap-2 hover:text-white">
          <ArrowLeft size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Редагувати проєкт' : 'Новий проєкт'}</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Основна інформація</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">ID (Slug) *</label>
                <input required value={formData.id} disabled={isEditing} onChange={e => setFormData({ ...formData, id: e.target.value })} placeholder="banking_system" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Назва *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Банківська система" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Іконка</label>
                <input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-center text-xl" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Рівень</label>
                <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-white">
                  <option value="beginner">beginner</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                  <option value="oop">oop</option>
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
              <label className="block text-sm text-surface-400 mb-1">Опис проєкту</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Повнофункціональна банківська система з рахунками..." className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
            </div>
          </div>

          {/* Starter Code */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2 flex items-center gap-2">
              <Hammer size={18} className="text-accent" /> Стартовий Код
            </h2>
            <textarea
              value={formData.starterCode}
              onChange={e => setFormData({ ...formData, starterCode: e.target.value })}
              rows={10}
              placeholder="#include <iostream>..."
              className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none text-emerald-400 font-mono text-xs"
            />
          </div>

          {/* Requirements */}
          <ArraySection
            title="Вимоги (requirements)"
            items={formData.requirements}
            inputValue={reqInput}
            setInputValue={setReqInput}
            onAdd={() => addToArray('requirements', reqInput, setReqInput)}
            onRemove={(i) => removeFromArray('requirements', i)}
            placeholder="Базовий клас з віртуальними методами"
          />

          {/* Save */}
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-colors">
              Зберегти Проєкт
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ======================== LIST VIEW ========================
  return (
    <div className="space-y-6 max-h-full overflow-y-auto pr-2 pb-16">
      <CourseFilter />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Керування Проєктами</h1>
        <button
          onClick={() => {
            setFormData(DEFAULT_PROJECT);
            setIsEditing(false);
            setView('form');
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={16} /> Створити
        </button>
      </div>

      <div className="grid gap-3">
        {projects.map(project => {
          return (
            <div key={project._id || project.id} className="bg-surface-900 border border-surface-800 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-surface-800 flex items-center justify-center flex-shrink-0 text-xl">
                {project.icon || '🔧'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-surface-50 truncate flex items-center gap-2">
                  {project.title}
                  <span className="text-xs font-normal text-surface-500 uppercase">{project.level}</span>
                </h3>
                <p className="text-xs text-surface-500 font-mono mt-0.5">{project.id}</p>
              </div>
              <div className="flex flex-col items-end text-xs text-surface-400 gap-1">
                <span className="flex items-center gap-1"><Zap size={12} className="text-accent" />{project.xp} XP</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => handleEdit(project)} className="p-2 text-surface-400 hover:text-white bg-surface-800 rounded hover:bg-surface-700 transition"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(project.id)} className="p-2 text-surface-400 hover:text-red-400 bg-surface-800 rounded hover:bg-red-500/20 transition"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && <p className="text-surface-500 text-center py-8">Проєктів не знайдено.</p>}
      </div>
    </div>
  );
}

// Reusable array section component
function ArraySection({ title, items, inputValue, setInputValue, onAdd, onRemove, placeholder }) {
  return (
    <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
      <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">{title}</h2>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          className="flex-1 p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-sm"
        />
        <button type="button" onClick={onAdd} className="px-4 py-2 bg-surface-800 rounded hover:bg-surface-700 text-sm">
          Додати
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-surface-950 border border-surface-700/50 rounded px-3 py-2 text-sm text-surface-200">
            <span className="text-surface-600 font-mono text-xs w-6">{i + 1}.</span>
            <span className="flex-1">{item}</span>
            <button type="button" onClick={() => onRemove(i)} className="text-surface-500 hover:text-red-400 text-xs">&times;</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-surface-600">Немає елементів.</p>}
      </div>
    </div>
  );
}
