import { useState, useEffect } from 'react';
import {
  Trophy, Flame, Award, BookOpen, Star, Crown,
  Medal, Sparkles, User as UserIcon, Shield, CheckCircle2
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import useAppStore from '@/stores/useAppStore';
import { getLevel, formatNumber } from '@/lib/utils';

export default function Leaderboard() {
  const { user: currentUser, xp: currentXp, streak: currentStreak } = useAppStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all'

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leaderboard?limit=50');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Find user's rank
  const userRankIndex = leaderboard.findIndex(
    u => u.id === currentUser?.id || u.name === currentUser?.name
  );
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-50">Таблиця лідерів</h1>
          </div>
          <p className="text-sm text-surface-400 mt-1">
            Змагайтеся зі студентами C++ Academy, заробляйте XP та підкорюйте вершину рейтингу!
          </p>
        </div>

        {/* Current User Rank Badge */}
        {userRank && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-900 border border-surface-700 shadow-sm shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase font-semibold text-surface-400">Ваша позиція</p>
              <p className="text-lg font-bold text-accent">#{userRank} місце</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent">
              {userRank <= 3 ? ['🥇', '🥈', '🥉'][userRank - 1] : `#${userRank}`}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-surface-500">Завантаження рейтингу...</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="text-center py-12">
          <Trophy size={40} className="mx-auto text-surface-600 mb-3" />
          <p className="text-surface-300 font-medium">Рейтинг формується...</p>
          <p className="text-xs text-surface-500 mt-1">Вирішуйте завдання та станьте першим у списку!</p>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="order-2 md:order-1 flex flex-col items-center">
                  <div className="relative group mb-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg shadow-slate-500/10">
                      <div className="w-full h-full rounded-2xl bg-surface-900 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-lg font-bold text-slate-200">
                          {top3[1].name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-slate-300 text-surface-950 font-bold text-xs flex items-center justify-center shadow">
                      2
                    </div>
                  </div>

                  <div className="w-full bg-surface-900 border border-slate-700/60 rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Medal size={16} className="text-slate-300" />
                      <span className="font-bold text-surface-100 text-sm truncate max-w-[140px]">{top3[1].name}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-accent font-semibold font-mono">
                      <Star size={12} />
                      {formatNumber(top3[1].xp)} XP
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[11px] text-surface-400 pt-1 border-t border-surface-800">
                      <span className="flex items-center gap-1"><Flame size={11} className="text-orange-400" /> {top3[1].streak} дні</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {top3[1].lessonsCompleted}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place (Center, elevated) */}
              {top3[0] && (
                <div className="order-1 md:order-2 flex flex-col items-center -mt-4">
                  <div className="relative group mb-3">
                    <Crown size={28} className="text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-1 shadow-xl shadow-amber-500/20">
                      <div className="w-full h-full rounded-2xl bg-surface-900 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-2xl font-bold text-amber-300">
                          {top3[0].name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-surface-950 font-black text-xs shadow-md">
                      1 МІСЦЕ
                    </div>
                  </div>

                  <div className="w-full bg-gradient-to-b from-amber-500/10 to-surface-900 border border-amber-500/40 rounded-2xl p-5 text-center space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-center gap-1.5">
                      <Trophy size={18} className="text-amber-400" />
                      <span className="font-bold text-surface-50 text-base truncate max-w-[160px]">{top3[0].name}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm font-mono border border-amber-500/30">
                      <Sparkles size={13} />
                      {formatNumber(top3[0].xp)} XP
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-surface-300 pt-2 border-t border-amber-500/20">
                      <span className="flex items-center gap-1"><Flame size={13} className="text-orange-400" /> {top3[0].streak} дні</span>
                      <span className="flex items-center gap-1"><BookOpen size={13} className="text-emerald-400" /> {top3[0].lessonsCompleted} уроків</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="order-3 flex flex-col items-center">
                  <div className="relative group mb-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 p-0.5 shadow-lg shadow-amber-900/20">
                      <div className="w-full h-full rounded-2xl bg-surface-900 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-lg font-bold text-amber-500">
                          {top3[2].name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center shadow">
                      3
                    </div>
                  </div>

                  <div className="w-full bg-surface-900 border border-amber-800/50 rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Medal size={16} className="text-amber-600" />
                      <span className="font-bold text-surface-100 text-sm truncate max-w-[140px]">{top3[2].name}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-accent font-semibold font-mono">
                      <Star size={12} />
                      {formatNumber(top3[2].xp)} XP
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[11px] text-surface-400 pt-1 border-t border-surface-800">
                      <span className="flex items-center gap-1"><Flame size={11} className="text-orange-400" /> {top3[2].streak} дні</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {top3[2].lessonsCompleted}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-surface-100 flex items-center gap-2">
                <span>Всі учасники</span>
                <span className="text-xs font-mono text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
                  {leaderboard.length}
                </span>
              </h2>
            </div>

            <div className="divide-y divide-surface-800">
              {leaderboard.map((student) => {
                const isMe = student.id === currentUser?.id || student.name === currentUser?.name;
                const levelInfo = getLevel(student.xp);

                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors ${
                      isMe
                        ? 'bg-accent/10 border-l-4 border-accent'
                        : 'hover:bg-surface-800/40'
                    }`}
                  >
                    {/* Rank & User Details */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-7 text-center font-mono font-bold text-sm text-surface-400">
                        {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`}
                      </div>

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isMe
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-surface-800 text-surface-200 border border-surface-700'
                      }`}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold truncate ${isMe ? 'text-accent' : 'text-surface-100'}`}>
                            {student.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                              Ви
                            </span>
                          )}
                          {student.role === 'admin' && (
                            <span title="Адміністратор">
                              <Shield size={13} className="text-red-400" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-surface-400 truncate">
                          Рівень {levelInfo.level} • {levelInfo.name}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-surface-400">
                        <Flame size={14} className={student.streak > 0 ? 'text-orange-400' : 'text-surface-600'} />
                        <span>{student.streak} дн.</span>
                      </div>

                      <div className="hidden md:flex items-center gap-1.5 text-xs text-surface-400">
                        <BookOpen size={14} className="text-emerald-400" />
                        <span>{student.lessonsCompleted} ур.</span>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-bold font-mono text-accent flex items-center justify-end gap-1">
                          <Star size={13} className="text-accent" />
                          {formatNumber(student.xp)}
                        </span>
                        <span className="text-[10px] text-surface-500 font-mono">XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
