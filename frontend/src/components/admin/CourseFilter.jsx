import { useState, useEffect } from 'react';
import useAppStore from '@/stores/useAppStore';

export default function CourseFilter() {
  const { activeAdminCourse, setActiveAdminCourse, token } = useAppStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        
        // If current active is not in list, set to first available
        if (data.length > 0 && !data.find(c => c.id === activeAdminCourse)) {
          setActiveAdminCourse(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch courses for filter:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg"></div>;

  return (
    <div className="flex items-center space-x-3 mb-6 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
      <span className="text-slate-400 text-sm font-medium">Поточний курс:</span>
      <select
        value={activeAdminCourse || ''}
        onChange={(e) => setActiveAdminCourse(e.target.value)}
        className="bg-slate-700 text-white rounded-md px-3 py-1.5 border border-slate-600 outline-none focus:border-indigo-500 transition-colors"
      >
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.icon} {course.name}
          </option>
        ))}
      </select>
    </div>
  );
}
