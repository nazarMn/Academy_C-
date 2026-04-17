import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLevel } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/lib/constants';

const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── User (auth-ready structure) ───
      user: {
        id: 'local-user',
        name: 'Студент',
        avatar: null,
        joinedAt: new Date().toISOString(),
      },

      // ─── Auth state (JWT-ready) ───
      token: null,
      isGuest: true,
      isAuthModalOpen: false,

      // ─── Onboarding ───
      onboardingProfile: null,
      // { name, goal, time, level, languagesKnown, plan: { type, pace, difficulty, dailyLessons, focusAreas } }

      // ─── Admin State ───
      activeAdminCourse: 'cpp',

      // ─── Student State ───
      activeCourse: 'cpp',

      // ─── Theme ───
      theme: 'dark',

      // ─── Progress ───
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      completedQuizzes: [],
      perfectQuizzes: [],
      startedProjects: [],
      unlockedAchievements: [],
      practiceCompleted: [],
      quizScores: {},

      // ─── Code Persistence ───
      codeStorage: {},
      // { [lessonId]: string }

      // ─── Activity log (for heatmap) ───
      activityLog: [],

      // ─── Soft conversion tracking ───
      softConversionDismissed: false,
      softConversionShown: false,

      // ─── Actions ───

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('light', theme === 'light');
      },

      setUser: (updates) => {
        set(state => ({
          user: { ...state.user, ...updates },
        }));
      },

      setActiveAdminCourse: (courseId) => {
        set({ activeAdminCourse: courseId });
      },

      setActiveCourse: (courseId) => {
        set({ activeCourse: courseId });
      },

      setOnboardingProfile: (profile) => {
        set({ onboardingProfile: profile });
      },

      // ─── Auth actions ───

      login: (token, userData) => {
        set({
          token,
          isGuest: false,
          user: { ...get().user, ...userData },
          isAuthModalOpen: false,
        });

        // Immediately fetch synced data from the DB so the localStorage catches up
        get().loadFromServer();
      },

      logout: () => {
        set({
          token: null,
          isGuest: true,
          user: { id: 'local-user', name: 'Студент', avatar: null, joinedAt: new Date().toISOString() }
        });
        localStorage.removeItem('token');
      },

      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      dismissSoftConversion: () => {
        set({ softConversionDismissed: true });
      },

      markSoftConversionShown: () => {
        set({ softConversionShown: true });
      },

      // ─── Code Persistence ───

      saveCode: async (lessonId, code) => {
        set(state => ({
          codeStorage: { ...state.codeStorage, [lessonId]: code },
        }));

        const state = get();
        if (state.token && !state.isGuest) {
          try {
            await fetch('/api/user/save-code', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
              },
              body: JSON.stringify({ lessonId, code })
            });
          } catch (e) {
            console.error('Failed to sync code', e);
          }
        }
      },

      removeCode: async (lessonId) => {
        set(state => {
          const newStorage = { ...state.codeStorage };
          delete newStorage[lessonId];
          return { codeStorage: newStorage };
        });

        const state = get();
        if (state.token && !state.isGuest) {
          try {
            await fetch('/api/user/save-code', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
              },
              body: JSON.stringify({ lessonId, code: null }) // null will trigger deletion on backend
            });
          } catch (e) {
            console.error('Failed to remove code', e);
          }
        }
      },

      loadCode: (lessonId) => {
        return get().codeStorage[lessonId] || null;
      },

      // ─── XP + Progress ───

      addXP: (amount) => {
        const state = get();
        const oldLevel = getLevel(state.xp).level;
        const newXP = state.xp + amount;
        const newLevel = getLevel(newXP).level;

        set({
          xp: newXP,
          level: newLevel,
        });

        get().syncToServer();
        return newLevel > oldLevel ? getLevel(newXP) : null;
      },

      completeLesson: (lessonId, xp) => {
        const state = get();
        if (state.completedLessons.includes(lessonId)) return false;

        set({
          completedLessons: [...state.completedLessons, lessonId],
        });

        get().addXP(xp);
        get().logActivity();
        get().checkAchievements();
        get().syncToServer();
        return true;
      },

      completeQuiz: (quizId, score, total, xp) => {
        const state = get();
        const newCompleted = state.completedQuizzes.includes(quizId)
          ? state.completedQuizzes
          : [...state.completedQuizzes, quizId];

        const newScores = {
          ...state.quizScores,
          [quizId]: Math.max(state.quizScores[quizId] || 0, score),
        };

        const newPerfect = score === total && !state.perfectQuizzes.includes(quizId)
          ? [...state.perfectQuizzes, quizId]
          : state.perfectQuizzes;

        set({
          completedQuizzes: newCompleted,
          quizScores: newScores,
          perfectQuizzes: newPerfect,
        });

        get().addXP(xp);
        get().logActivity();
        get().checkAchievements();
        get().syncToServer();
      },

      completePractice: (taskId, xp) => {
        const state = get();
        if (state.practiceCompleted.includes(taskId)) return false;

        set({
          practiceCompleted: [...state.practiceCompleted, taskId],
        });

        get().addXP(xp);
        get().logActivity();
        get().checkAchievements();
        get().syncToServer();
        return true;
      },

      startProject: (projectId) => {
        const state = get();
        if (state.startedProjects.includes(projectId)) return;

        set({
          startedProjects: [...state.startedProjects, projectId],
        });
        get().logActivity();
        get().checkAchievements();
        get().syncToServer();
      },

      isLessonCompleted: (id) => {
        return get().completedLessons.includes(id);
      },

      isLessonLocked: (index, lessons) => {
        if (index === 0) return false;
        const state = get();
        const currentId = lessons[index]?.id;

        if (currentId && state.completedLessons.includes(currentId)) return false;

        const prevId = lessons[index - 1]?.id;
        return prevId && !state.completedLessons.includes(prevId);
      },

      // ─── Activity Tracking ───

      logActivity: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const log = [...state.activityLog];
        const todayEntry = log.find(a => a.date === today);

        if (todayEntry) {
          todayEntry.actions++;
        } else {
          log.push({ date: today, actions: 1 });
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 365);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        set({
          activityLog: log.filter(a => a.date >= cutoffStr),
        });
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();

        if (state.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          let newStreak;
          if (state.lastActiveDate === yesterday.toDateString()) {
            newStreak = state.streak + 1;
          } else if (state.lastActiveDate !== today) {
            newStreak = 1;
          } else {
            newStreak = state.streak;
          }

          set({
            streak: newStreak,
            lastActiveDate: today,
          });
          get().syncToServer();
        }
      },

      // ─── Achievement System ───

      checkAchievements: (extraData = {}) => {
        const state = get();
        let newUnlocks = [];

        for (const ach of ACHIEVEMENTS) {
          if (!state.unlockedAchievements.includes(ach.id) && ach.check(state, extraData)) {
            newUnlocks.push(ach);
          }
        }

        if (newUnlocks.length > 0) {
          set({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newUnlocks.map(a => a.id),
            ],
          });
        }

        return newUnlocks;
      },

      // ─── Reset ───

      resetState: () => {
        set({
          xp: 0,
          level: 1,
          streak: 0,
          lastActiveDate: null,
          completedLessons: [],
          completedQuizzes: [],
          perfectQuizzes: [],
          startedProjects: [],
          unlockedAchievements: [],
          practiceCompleted: [],
          quizScores: {},
          activityLog: [],
          codeStorage: {},
          onboardingProfile: null,
        });
      },

      // ─── Server sync (future) ───

      syncToServer: async () => {
        const state = get();
        if (!state.token || state.isGuest) return;
        try {
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`,
            },
            body: JSON.stringify({
              xp: state.xp,
              completedLessons: state.completedLessons,
              completedQuizzes: state.completedQuizzes,
              practiceCompleted: state.practiceCompleted,
              startedProjects: state.startedProjects,
              codeStorage: state.codeStorage,
              onboardingProfile: state.onboardingProfile,
              streak: state.streak,
              lastActiveDate: state.lastActiveDate,
              activityLog: state.activityLog,
              quizScores: state.quizScores,
              perfectQuizzes: state.perfectQuizzes,
              unlockedAchievements: state.unlockedAchievements,
              level: state.level
            }),
          }).catch(() => { });
        } catch {
          // Silently fail — localStorage is the primary store
        }
      },

      loadFromServer: async () => {
        const state = get();
        if (!state.token || state.isGuest) return;
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${state.token}` },
          });
          if (res.ok) {
            const data = await res.json();

            // Map MongoDB user document schema to Zustand store shape
            const incomingState = {
              user: {
                id: data._id,
                name: data.name,
                email: data.email,
                role: data.role || 'user',
              },
              xp: data.stats?.xp || state.xp,
              streak: data.stats?.streak || state.streak,
              level: data.level || state.level,
            };

            if (data.progress) {
              incomingState.completedLessons = data.progress
                .filter(p => p.completed)
                .map(p => p.lessonId);
            }

            if (data.codeStorage) {
              incomingState.codeStorage = data.codeStorage.reduce((acc, current) => {
                acc[current.lessonId] = current.code;
                return acc;
              }, {});
            }

            if (data.startedProjects) incomingState.startedProjects = data.startedProjects;
            if (data.completedQuizzes) incomingState.completedQuizzes = data.completedQuizzes;
            if (data.perfectQuizzes) incomingState.perfectQuizzes = data.perfectQuizzes;
            if (data.practiceCompleted) incomingState.practiceCompleted = data.practiceCompleted;
            if (data.unlockedAchievements) incomingState.unlockedAchievements = data.unlockedAchievements;
            if (data.activityLog) incomingState.activityLog = data.activityLog;
            if (data.quizScores) incomingState.quizScores = data.quizScores;

            set(incomingState);
          }
        } catch {
          // Silently fail
        }
      },
    }),
    {
      name: 'cpp-academy-v3',
      version: 4,
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        token: state.token,
        isGuest: state.isGuest,
        activeAdminCourse: state.activeAdminCourse,
        activeCourse: state.activeCourse,
        onboardingProfile: state.onboardingProfile,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        completedLessons: state.completedLessons,
        completedQuizzes: state.completedQuizzes,
        perfectQuizzes: state.perfectQuizzes,
        startedProjects: state.startedProjects,
        unlockedAchievements: state.unlockedAchievements,
        practiceCompleted: state.practiceCompleted,
        quizScores: state.quizScores,
        activityLog: state.activityLog,
        codeStorage: state.codeStorage,
        softConversionDismissed: state.softConversionDismissed,
      }),
    }
  )
);

export default useAppStore;
