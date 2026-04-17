import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive, BookOpen, ChevronRight, Loader2, Search,
  FileText, Image as ImageIcon, Calendar, Filter
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import * as Icons from 'lucide-react';

const API = 'http://localhost:3001/api';

export default function ExamArchives() {
  const [archives, setArchives] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [archRes, subjRes] = await Promise.all([
          fetch(`${API}/exam-archives`),
          fetch(`${API}/subjects`),
        ]);
        if (archRes.ok) setArchives(await archRes.json());
        if (subjRes.ok) setSubjects(await subjRes.json());
      } catch (err) {
        console.error('Failed to load exam archives', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = archives.filter(a => {
    if (activeSubject !== 'all' && a.subjectId !== activeSubject) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by subject
  const grouped = {};
  filtered.forEach(a => {
    if (!grouped[a.subjectId]) grouped[a.subjectId] = [];
    grouped[a.subjectId].push(a);
  });

  // Sort subjects by order
  const sortedSubjects = [...subjects].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Sort items within each active subject by order
  Object.keys(grouped).forEach(subjectId => {
    grouped[subjectId].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || id;
  const getSubjectIcon = (id) => {
    const iconName = subjects.find(s => s.id === id)?.icon || 'BookOpen';
    return Icons[iconName] || Icons.BookOpen;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Archive size={20} className="text-amber-400" />
            </div>
            Архів екзаменів
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Пробники та зливи з попередніх сесій — практикуйтесь на реальних завданнях
          </p>
        </div>
        <Badge color="accent" size="sm">
          {archives.length} {archives.length === 1 ? 'архів' : 'архівів'}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Шукати архів..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-lg text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
          />
        </div>

        {/* Subject tabs */}
        <div className="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubject('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeSubject === 'all'
                ? 'bg-accent text-white shadow-sm'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Filter size={12} className="inline mr-1" />
            Усі
          </button>
          {sortedSubjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeSubject === sub.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Archives grid — grouped by subject */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <Archive size={48} className="mx-auto text-surface-600 mb-4" />
          <p className="text-surface-400 text-lg font-medium">Архівів поки немає</p>
          <p className="text-surface-500 text-sm mt-1">
            {search ? 'Спробуйте інший пошуковий запит' : 'Адміністратор ще не додав матеріали'}
          </p>
        </div>
      ) : (
        sortedSubjects.filter(sub => grouped[sub.id]).map(sub => {
          const subjectId = sub.id;
          const items = grouped[subjectId];
          const SubjectIcon = getSubjectIcon(subjectId);
          return (
            <div key={subjectId} className="space-y-3">
              <h2 className="text-lg font-semibold text-surface-200 flex items-center gap-2">
                <SubjectIcon size={18} className="text-accent" />
                {getSubjectName(subjectId)}
                <Badge color="default" size="sm">{items.length}</Badge>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(archive => (
                  <button
                    key={archive.id}
                    onClick={() => navigate(`/archives/${archive.id}`)}
                    className="text-left group w-full"
                  >
                    <Card hover padding="p-0" className="overflow-hidden">
                      {/* Top gradient bar */}
                      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-surface-100 truncate group-hover:text-accent transition-colors">
                              {archive.title}
                            </h3>
                            {archive.session && (
                              <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1">
                                <Calendar size={11} />
                                {archive.session}
                              </p>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-surface-600 group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
                        </div>

                        {archive.description && (
                          <p className="text-xs text-surface-400 mb-3 line-clamp-2">
                            {archive.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge color="accent" size="sm">
                            <FileText size={11} className="mr-1" />
                            {archive.tasks?.length || 0} завдань
                          </Badge>
                          {(() => {
                            const allLangs = new Set();
                            archive.tasks?.forEach(t => t.languages?.forEach(l => allLangs.add(l)));
                            return [...allLangs].map(lang => (
                              <Badge key={lang} color="default" size="sm">
                                {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : lang === 'javascript' ? 'JS' : lang}
                              </Badge>
                            ));
                          })()}
                          {(() => {
                            const totalImages = archive.images?.length || 0;
                            return totalImages > 0 ? (
                              <Badge color="warning" size="sm">
                                <ImageIcon size={11} className="mr-1" />
                                {totalImages} фото
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
