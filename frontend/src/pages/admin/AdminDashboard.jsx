import { useState, useEffect } from 'react';
import { Users, BookOpen, FolderKanban, ShieldAlert, ClipboardCheck, Code2, GraduationCap } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { token } = useAppStore();

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Огляд платформи</h1>
      
      {!stats ? (
        <div className="text-surface-400">Завантаження аналітики...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Користувачів" value={stats.totalUsers} icon={Users} color="text-blue-400" />
          <StatCard title="Адміністраторів" value={stats.admins} icon={ShieldAlert} color="text-red-400" />
          <StatCard title="Уроків" value={stats.totalLessons} icon={BookOpen} color="text-emerald-400" />
          <StatCard title="Проєктів" value={stats.totalProjects} icon={FolderKanban} color="text-violet-400" />
          <StatCard title="Тестів" value={stats.totalQuizzes || 0} icon={ClipboardCheck} color="text-amber-400" />
          <StatCard title="Практика" value={stats.totalPractice || 0} icon={Code2} color="text-cyan-400" />
          <StatCard title="Курсів" value={stats.totalCourses || 0} icon={GraduationCap} color="text-pink-400" />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="p-5 rounded-xl bg-surface-900 border border-surface-800 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-surface-800 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-surface-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
