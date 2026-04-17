import { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, isGuest, onboardingProfile, xp, streak, completedLessons, codeStorage, login, syncToServer } = useAppStore();
  const toast = useToast();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = {
        email: formData.email,
        password: formData.password,
      };

      if (mode === 'register') {
        body.name = formData.name;
        // Pass guest data if registering
        if (isGuest) {
          body.guestData = {
            onboardingProfile,
            xp,
            streak,
            completedLessons,
            codeStorage
          };
        }
      }

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Помилка авторизації');
      }

      // Automatically sets isGuest to false and closes modal
      login(data.token, data.userData);
      localStorage.setItem('token', data.token);

      toast.success(mode === 'login' ? 'Успішний вхід!' : 'Акаунт створено!');

      // Sync any local data remaining upwards if we just logged in
      if (mode === 'login' && isGuest) {
        await syncToServer();
      }

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-md shadow-2xl relative animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-surface-500 hover:text-surface-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-surface-50 mb-6">
            {mode === 'login' ? 'Вхід в акаунт' : 'Створення акаунту'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-300">Ім'я</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl py-2.5 pl-10 pr-4 text-surface-50 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    placeholder="Ваше ім'я"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl py-2.5 pl-10 pr-4 text-surface-50 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-300">Пароль</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input 
                  type="password" 
                  name="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl py-2.5 pl-10 pr-4 text-surface-50 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-6" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Увійти' : 'Зареєструватись')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-400">
            {mode === 'login' ? 'Немає акаунту? ' : 'Вже є акаунт? '}
            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-accent hover:underline font-medium"
            >
              {mode === 'login' ? 'Створити зараз' : 'Увійти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
