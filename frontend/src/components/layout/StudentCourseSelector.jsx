import { useState, useEffect } from 'react';
import useAppStore from '@/stores/useAppStore';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function StudentCourseSelector({ collapsed }) {
  const { activeCourse, setActiveCourse } = useAppStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        if (data.length > 0 && (!activeCourse || data.find(c => c.id === activeCourse)?.comingSoon)) {
          // Find first available course that is not coming soon
          const firstAvailable = data.find(c => !c.comingSoon);
          if (firstAvailable) {
            setActiveCourse(firstAvailable.id);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, [activeCourse, setActiveCourse]);

  if (loading) return null;

  const currentCourse = courses.find(c => c.id === activeCourse);

  if (collapsed) {
    return (
      <div className="flex justify-center py-3 border-b border-surface-700/50" title={currentCourse?.name}>
        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-200">
           {currentCourse?.icon || <BookOpen size={16} />}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-surface-700/50">
      <label className="text-[10px] uppercase font-bold tracking-wider text-surface-500 mb-1.5 block">
        Курс
      </label>
      <div className="relative">
        <select
          value={activeCourse || ''}
          onChange={(e) => setActiveCourse(e.target.value)}
          className="w-full appearance-none bg-surface-800 border border-surface-700 text-surface-50 text-sm py-2 pl-3 pr-8 rounded-lg outline-none focus:border-accent transition-colors cursor-pointer"
        >
          {courses.map(course => (
            <option key={course.id} value={course.id} disabled={course.comingSoon}>
              {course.icon} {course.name} {course.comingSoon ? '(Скоро)' : ''}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}
