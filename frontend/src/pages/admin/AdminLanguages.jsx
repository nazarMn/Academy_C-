import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, ArrowUp, ArrowDown, GripVertical, Eye, EyeOff, Clock } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES = [
  { key: 'programming', label: 'Програмування', emoji: '💻' },
  { key: 'business', label: 'Бізнес', emoji: '📊' },
  { key: 'humanities', label: 'Гуманітарні', emoji: '📚' },
  { key: 'other', label: 'Інше', emoji: '🧩' },
];

const DEFAULT_COURSE = {
  id: '',
  name: '',
  icon: '📘',
  description: '',
  category: 'programming',
  color: '#6366f1',
  enabled: false,
  comingSoon: true,
  order: 0,
};

export default function AdminLanguages() {
  const [courses, setCourses] = useState([]);
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState(DEFAULT_COURSE);
  const [isEditing, setIsEditing] = useState(false);
  const { token } = useAppStore();
  const { addToast } = useToast();

  const fetchCourses = () => {
    fetch('/api/admin/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCourses)
      .catch(console.error);
  };

  useEffect(() => {
    if (view === 'list') fetchCourses();
  }, [view, token]);

  const handleEdit = (course) => {
    setFormData({ ...DEFAULT_COURSE, ...course });
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!confirm('Видалити курс? Це неможливо скасувати.')) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('success', 'Курс видалено');
        fetchCourses();
      }
    } catch {
      addToast('error', 'Помилка видалення');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = `/api/admin/courses${isEditing ? `/${formData.id}` : ''}`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('success', isEditing ? 'Курс оновлено ✅' : 'Курс створено ✅');
        setView('list');
      } else {
        const err = await res.json();
        addToast('error', err.message || 'Помилка збереження');
      }
    } catch {
      addToast('error', 'Помилка мережі');
    }
  };

  const toggleField = async (course, field) => {
    const newValue = !course[field];
    const updates = { [field]: newValue };
    // If enabling, turn off comingSoon
    if (field === 'enabled' && newValue) updates.comingSoon = false;
    // If setting comingSoon, disable
    if (field === 'comingSoon' && newValue) updates.enabled = false;

    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, ...updates } : c));

    try {
      await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
    } catch {
      addToast('error', 'Помилка оновлення');
      fetchCourses();
    }
  };

  // Reorder
  const handleReorder = async (course, direction) => {
    const sorted = [...courses].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(c => c.id === course.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder = sorted.map((c, i) => ({ id: c.id, order: i }));
    const temp = newOrder[idx].order;
    newOrder[idx].order = newOrder[swapIdx].order;
    newOrder[swapIdx].order = temp;

    setCourses(prev => prev.map(c => {
      const match = newOrder.find(o => o.id === c.id);
      return match ? { ...c, order: match.order } : c;
    }));

    try {
      await Promise.all([
        fetch(`/api/admin/courses/${newOrder[idx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[idx].order })
        }),
        fetch(`/api/admin/courses/${newOrder[swapIdx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[swapIdx].order })
        })
      ]);
    } catch {
      addToast('error', 'Помилка оновлення порядку');
      fetchCourses();
    }
  };

  // ======================== FORM VIEW ========================
  if (view === 'form') {
    return (
      <div className="max-w-3xl max-h-full overflow-y-auto pr-4 pb-16 space-y-6">
        <button onClick={() => setView('list')} className="text-surface-400 flex items-center gap-2 hover:text-white">
          <ArrowLeft size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Редагувати курс' : 'Новий курс'}</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Основна інформація</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">ID (Slug) *</label>
                <input required value={formData.id} disabled={isEditing} onChange={e => setFormData({ ...formData, id: e.target.value })} placeholder="python" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Назва *</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Python" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">Іконка (емодзі)</label>
                <input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-2xl text-center" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Категорія</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent text-white">
                  {CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Колір</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                  <input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="flex-1 p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent font-mono text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-surface-400 mb-1">Опис</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Короткий опис курсу..." className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
            </div>
          </div>

          {/* Status */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Статус</h2>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setFormData(f => ({ ...f, enabled: !f.enabled, comingSoon: !f.enabled ? false : f.comingSoon }))}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${formData.enabled ? 'bg-emerald-500' : 'bg-surface-700'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-surface-300">Активний</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setFormData(f => ({ ...f, comingSoon: !f.comingSoon, enabled: !f.comingSoon ? false : f.enabled }))}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${formData.comingSoon ? 'bg-amber-500' : 'bg-surface-700'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.comingSoon ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-surface-300">Скоро</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-colors">
              Зберегти Курс
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ======================== LIST VIEW ========================
  const sorted = [...courses].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    courses: sorted.filter(c => c.category === cat.key),
  })).filter(g => g.courses.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Керування Курсами</h1>
          <p className="text-sm text-surface-500 mt-1">Мови програмування та інші предмети</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...DEFAULT_COURSE });
            setIsEditing(false);
            setView('form');
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={16} /> Додати курс
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{courses.filter(c => c.enabled).length}</p>
          <p className="text-xs text-surface-500 mt-1">Активних</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{courses.filter(c => c.comingSoon).length}</p>
          <p className="text-xs text-surface-500 mt-1">Скоро</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-surface-300">{courses.length}</p>
          <p className="text-xs text-surface-500 mt-1">Всього</p>
        </div>
      </div>

      {/* Courses grouped by category */}
      <div className="space-y-4">
        {grouped.map(group => (
          <div key={group.key} className="bg-surface-900/50 border border-surface-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-800 flex items-center gap-2">
              <span className="text-lg">{group.emoji}</span>
              <h3 className="text-sm font-semibold text-surface-100">{group.label}</h3>
              <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full ml-auto">
                {group.courses.length}
              </span>
            </div>

            <div>
              {group.courses.map((course, idx) => (
                <div key={course._id || course.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-800/50 last:border-b-0 hover:bg-surface-800/30 transition-colors">
                  {/* Reorder */}
                  <div className="flex items-center gap-1">
                    <GripVertical size={14} className="text-surface-700" />
                    <span className="text-xs font-mono text-surface-500 w-5 text-center">{course.order + 1}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => handleReorder(course, 'up')} disabled={idx === 0} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"><ArrowUp size={12} /></button>
                    <button onClick={() => handleReorder(course, 'down')} disabled={idx === group.courses.length - 1} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"><ArrowDown size={12} /></button>
                  </div>

                  {/* Icon + Color */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${course.color}20`, color: course.color }}
                  >
                    {course.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-surface-50 truncate">{course.name}</h3>
                    <p className="text-[11px] text-surface-600 truncate">{course.description || course.id}</p>
                  </div>

                  {/* Status toggles */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleField(course, 'enabled')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition ${course.enabled
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-surface-800 text-surface-500 hover:bg-surface-700'
                        }`}
                      title="Активний"
                    >
                      {course.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                      {course.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => toggleField(course, 'comingSoon')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition ${course.comingSoon
                          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-surface-800 text-surface-500 hover:bg-surface-700'
                        }`}
                      title="Скоро"
                    >
                      <Clock size={12} />
                      {course.comingSoon ? 'СКОРО' : '—'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <button onClick={() => handleEdit(course)} className="p-1.5 text-surface-400 hover:text-white bg-surface-800 rounded hover:bg-surface-700 transition"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(course.id)} className="p-1.5 text-surface-400 hover:text-red-400 bg-surface-800 rounded hover:bg-red-500/20 transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {courses.length === 0 && <p className="text-surface-500 text-center py-8">Курсів не знайдено.</p>}
      </div>
    </div>
  );
}
