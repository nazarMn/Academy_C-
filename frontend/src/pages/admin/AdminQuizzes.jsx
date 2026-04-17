import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, Brain, Zap, ChevronDown, ChevronRight, ArrowUp, ArrowDown, GripVertical, X } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';
import { useToast } from '@/components/ui/Toast';
import CourseFilter from '@/components/admin/CourseFilter';

const LEVEL_GROUPS = [
  { key: 'beginner', title: 'Основи', dot: 'bg-emerald-400' },
  { key: 'intermediate', title: 'Контроль', dot: 'bg-amber-400' },
  { key: 'advanced', title: 'Просунутий', dot: 'bg-red-400' },
  { key: 'oop', title: 'ООП', dot: 'bg-violet-400' },
];

const DEFAULT_QUIZ = {
  id: '',
  title: '',
  level: 'beginner',
  xp: 30,
  questions: [],
};

const DEFAULT_QUESTION = { q: '', opts: ['', '', '', ''], correct: 0 };

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState(DEFAULT_QUIZ);
  const [isEditing, setIsEditing] = useState(false);
  const { token, activeAdminCourse } = useAppStore();
  const { addToast } = useToast();

  const fetchQuizzes = () => {
    if (!activeAdminCourse) return;
    fetch(`http://localhost:3001/api/admin/quizzes?courseId=${activeAdminCourse}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setQuizzes)
      .catch(console.error);
  };

  useEffect(() => {
    if (view === 'list') fetchQuizzes();
  }, [view, token, activeAdminCourse]);

  const handleEdit = (quiz) => {
    setFormData({ ...DEFAULT_QUIZ, ...quiz });
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!confirm('Видалити тест? Це неможливо скасувати.')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('success', 'Тест видалено');
        fetchQuizzes();
      }
    } catch {
      addToast('error', 'Помилка видалення');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      addToast('error', 'Додайте хоча б одне питання');
      return;
    }
    try {
      if (!isEditing) formData.courseId = activeAdminCourse;
      const url = `http://localhost:3001/api/admin/quizzes${isEditing ? `/${formData.id}` : ''}`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('success', isEditing ? 'Тест оновлено ✅' : 'Тест створено ✅');
        setView('list');
      } else {
        const err = await res.json();
        addToast('error', err.message || 'Помилка збереження');
      }
    } catch {
      addToast('error', 'Помилка мережі');
    }
  };

  // Question helpers
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...DEFAULT_QUESTION, opts: ['', '', '', ''] }]
    });
  };

  const updateQuestion = (idx, field, value) => {
    const qs = [...formData.questions];
    qs[idx] = { ...qs[idx], [field]: value };
    setFormData({ ...formData, questions: qs });
  };

  const updateOption = (qIdx, optIdx, value) => {
    const qs = [...formData.questions];
    const opts = [...qs[qIdx].opts];
    opts[optIdx] = value;
    qs[qIdx] = { ...qs[qIdx], opts };
    setFormData({ ...formData, questions: qs });
  };

  const removeQuestion = (idx) => {
    const qs = [...formData.questions];
    qs.splice(idx, 1);
    setFormData({ ...formData, questions: qs });
  };

  // Reorder
  const handleReorder = async (quiz, direction, groupQuizzes) => {
    const sorted = [...groupQuizzes].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(q => q.id === quiz.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder = sorted.map((q, i) => ({ id: q.id, order: i }));
    const temp = newOrder[idx].order;
    newOrder[idx].order = newOrder[swapIdx].order;
    newOrder[swapIdx].order = temp;

    setQuizzes(prev => prev.map(q => {
      const match = newOrder.find(o => o.id === q.id);
      return match ? { ...q, order: match.order } : q;
    }));

    try {
      await Promise.all([
        fetch(`http://localhost:3001/api/admin/quizzes/${newOrder[idx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[idx].order })
        }),
        fetch(`http://localhost:3001/api/admin/quizzes/${newOrder[swapIdx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder[swapIdx].order })
        })
      ]);
    } catch {
      addToast('error', 'Помилка оновлення порядку');
      fetchQuizzes();
    }
  };

  const [collapsedLevels, setCollapsedLevels] = useState({});

  // ======================== FORM VIEW ========================
  if (view === 'form') {
    return (
      <div className="max-w-4xl max-h-full overflow-y-auto pr-4 pb-16 space-y-6">
        <button onClick={() => setView('list')} className="text-surface-400 flex items-center gap-2 hover:text-white">
          <ArrowLeft size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Редагувати тест' : 'Новий тест'}</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold border-b border-surface-800 pb-2">Основна інформація</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-1">ID (Slug) *</label>
                <input required value={formData.id} disabled={isEditing} onChange={e => setFormData({ ...formData, id: e.target.value })} placeholder="quiz-basics" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-1">Назва *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Основи C++" className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm text-surface-400 mb-1">XP</label>
                <input type="number" value={formData.xp} onChange={e => setFormData({ ...formData, xp: +e.target.value })} className="w-full p-2 rounded bg-surface-950 border border-surface-700 outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-surface-900 border border-surface-800 p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-800 pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain size={18} className="text-accent" /> Питання ({formData.questions.length})
              </h2>
              <button type="button" onClick={addQuestion} className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg flex items-center gap-1">
                <Plus size={14} /> Додати питання
              </button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question, qIdx) => (
                <div key={qIdx} className="border border-surface-700 rounded-lg p-4 bg-surface-950/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-surface-500 mb-1">Питання #{qIdx + 1}</label>
                      <input
                        value={question.q}
                        onChange={e => updateQuestion(qIdx, 'q', e.target.value)}
                        placeholder="Яка функція є точкою входу?"
                        className="w-full p-2 rounded bg-surface-900 border border-surface-700 outline-none focus:border-accent text-sm"
                      />
                    </div>
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="p-1.5 text-surface-500 hover:text-red-400 mt-5">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {question.opts.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIdx, 'correct', optIdx)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition ${question.correct === optIdx
                              ? 'bg-emerald-500 text-white'
                              : 'bg-surface-800 text-surface-500 hover:bg-surface-700'
                            }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </button>
                        <input
                          value={opt}
                          onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Варіант ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 p-1.5 rounded bg-surface-900 border border-surface-700 outline-none focus:border-accent text-xs"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-surface-600">Натисніть на літеру щоб позначити правильну відповідь</p>
                </div>
              ))}
              {formData.questions.length === 0 && (
                <p className="text-sm text-surface-600 text-center py-4">Немає питань. Натисніть "Додати питання" щоб почати.</p>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-colors">
              Зберегти Тест
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
        <h1 className="text-2xl font-bold">Керування Тестами</h1>
        <button
          onClick={() => {
            setFormData({ ...DEFAULT_QUIZ, questions: [] });
            setIsEditing(false);
            setView('form');
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={16} /> Створити
        </button>
      </div>

      {/* Grouped by level */}
      <div className="space-y-4">
        {LEVEL_GROUPS.map(group => {
          const groupQuizzes = quizzes
            .filter(q => q.level === group.key)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          if (groupQuizzes.length === 0) return null;

          const isCollapsed = collapsedLevels[group.key];

          return (
            <div key={group.key} className="bg-surface-900/50 border border-surface-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setCollapsedLevels(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-800/50 transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${group.dot}`} />
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-surface-100">{group.title}</h3>
                </div>
                <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
                  {groupQuizzes.length}
                </span>
                {isCollapsed ? <ChevronRight size={16} className="text-surface-500" /> : <ChevronDown size={16} className="text-surface-500" />}
              </button>

              {!isCollapsed && (
                <div className="border-t border-surface-800">
                  {groupQuizzes.map((quiz, idx) => (
                    <div key={quiz._id || quiz.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-800/50 last:border-b-0 hover:bg-surface-800/30 transition-colors">
                      <div className="flex items-center gap-1">
                        <GripVertical size={14} className="text-surface-700" />
                        <span className="text-xs font-mono text-surface-500 w-5 text-center">{idx + 1}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleReorder(quiz, 'up', groupQuizzes)} disabled={idx === 0} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition">
                          <ArrowUp size={12} />
                        </button>
                        <button onClick={() => handleReorder(quiz, 'down', groupQuizzes)} disabled={idx === groupQuizzes.length - 1} className="p-0.5 text-surface-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition">
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <div className="w-8 h-8 rounded bg-surface-800 flex items-center justify-center flex-shrink-0">
                        <Brain size={14} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-surface-50 truncate">{quiz.title}</h3>
                        <p className="text-[11px] text-surface-600 font-mono">{quiz.id} · {quiz.questions?.length || 0} питань</p>
                      </div>
                      <span className="text-xs text-surface-500">{quiz.xp} XP</span>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button onClick={() => handleEdit(quiz)} className="p-1.5 text-surface-400 hover:text-white bg-surface-800 rounded hover:bg-surface-700 transition"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(quiz.id)} className="p-1.5 text-surface-400 hover:text-red-400 bg-surface-800 rounded hover:bg-red-500/20 transition"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {quizzes.length === 0 && <p className="text-surface-500 text-center py-8">Тестів не знайдено.</p>}
      </div>
    </div>
  );
}
