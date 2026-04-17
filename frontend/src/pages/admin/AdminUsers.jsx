import { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Search } from 'lucide-react';
import useAppStore from '@/stores/useAppStore';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { token, user: currentUser } = useAppStore();
  const { addToast } = useToast();

  const fetchUsers = () => {
    fetch('http://localhost:3001/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        addToast('success', 'Роль успішно змінено.');
        fetchUsers();
      } else {
        const error = await res.json();
        addToast('error', error.message || 'Помилка');
      }
    } catch (err) {
      addToast('error', 'Помилка мережі');
    }
  };

  const toggleBan = async (userId, currentBanStatus) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ banned: !currentBanStatus })
      });
      if (res.ok) {
        addToast('success', !currentBanStatus ? 'Користувача заблоковано' : 'Користувача розблоковано');
        fetchUsers();
      } else {
        const error = await res.json();
        addToast('error', error.message || 'Помилка');
      }
    } catch (err) {
      addToast('error', 'Помилка мережі');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Користувачі</h1>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Шукати..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm text-surface-50 focus:border-accent outline-none"
          />
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-800 text-surface-400">
            <tr>
              <th className="p-4 font-medium">Ім'я</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Роль</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800 text-surface-100">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-surface-800/50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-surface-400">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${
                    u.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-surface-700 text-surface-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.banned ? (
                    <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                      <Ban size={14} /> Заблокований
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <CheckCircle size={14} /> Активний
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Role Toggle Button */}
                    <button
                      onClick={() => toggleRole(u._id, u.role)}
                      disabled={u._id === currentUser?._id}
                      className="p-1.5 text-surface-400 hover:text-accent hover:bg-accent/10 rounded disabled:opacity-30"
                      title={u.role === 'admin' ? "Забрати адміна" : "Дати адміна"}
                    >
                      <Shield size={16} />
                    </button>
                    
                    {/* Ban Toggle Button */}
                    <button
                      onClick={() => toggleBan(u._id, u.banned)}
                      disabled={u._id === currentUser?._id || u.role === 'admin'}
                      className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-400/10 rounded disabled:opacity-30"
                      title={u.banned ? "Розблокувати" : "Заблокувати"}
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-surface-500">
                  Нікого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
