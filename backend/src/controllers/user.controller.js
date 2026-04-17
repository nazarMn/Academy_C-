const User = require('../models/user.model');

/**
 * Handle sync payload from frontend.
 * Merges localStorage data into MongoDB.
 * POST /api/user/sync
 */
const syncUserData = async (req, res, next) => {
  try {
    const { 
      xp, streak, level, lastActiveDate, // Basic Stats
      completedLessons, completedQuizzes, perfectQuizzes, 
      practiceCompleted, startedProjects, unlockedAchievements,
      quizScores, activityLog, codeStorage, onboardingProfile 
    } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Merge logic
    if (xp !== undefined && xp > user.stats.xp) user.stats.xp = xp;
    if (streak !== undefined && streak > user.stats.streak) user.stats.streak = streak;
    if (lastActiveDate !== undefined) user.stats.lastActiveDate = lastActiveDate;
    if (level !== undefined && level !== 'zero') user.level = level.toString(); // Just safe-cast

    if (Array.isArray(completedLessons)) {
      const existingIds = user.progress.map(p => p.lessonId);
      completedLessons.forEach(id => {
        if (!existingIds.includes(id)) {
          user.progress.push({ lessonId: id, completed: true });
        }
      });
      user.stats.lessonsCompleted = user.progress.length;
    }

    // Simple arrays
    if (Array.isArray(completedQuizzes)) user.completedQuizzes = Array.from(new Set([...user.completedQuizzes, ...completedQuizzes]));
    if (Array.isArray(perfectQuizzes)) user.perfectQuizzes = Array.from(new Set([...user.perfectQuizzes, ...perfectQuizzes]));
    if (Array.isArray(practiceCompleted)) user.practiceCompleted = Array.from(new Set([...user.practiceCompleted, ...practiceCompleted]));
    if (Array.isArray(startedProjects)) user.startedProjects = Array.from(new Set([...user.startedProjects, ...startedProjects]));
    if (Array.isArray(unlockedAchievements)) user.unlockedAchievements = Array.from(new Set([...user.unlockedAchievements, ...unlockedAchievements]));
    
    // Complex objects
    if (quizScores && typeof quizScores === 'object') {
      for (const [quizId, score] of Object.entries(quizScores)) {
        if (!user.quizScores) user.quizScores = new Map();
        const existingScore = user.quizScores.get(quizId) || 0;
        if (score > existingScore) {
          user.quizScores.set(quizId, score);
        }
      }
    }

    if (Array.isArray(activityLog)) {
      // Overwrite activity log with whatever the client provides, or merge intelligently
      activityLog.forEach(incomingLog => {
        const existing = user.activityLog.find(log => log.date === incomingLog.date);
        if (existing) {
           if (incomingLog.actions > existing.actions) existing.actions = incomingLog.actions;
        } else {
           user.activityLog.push(incomingLog);
        }
      });
    }

    if (codeStorage && typeof codeStorage === 'object') {
      Object.entries(codeStorage).forEach(([lessonId, code]) => {
        const existing = user.codeStorage.find(c => c.lessonId === lessonId);
        if (existing) {
          existing.code = code;
          existing.updatedAt = Date.now();
        } else {
          user.codeStorage.push({ lessonId, code });
        }
      });
    }

    // Only update onboarding profile if the user's current goal is default
    if (onboardingProfile && user.goal === 'fun') {
       user.goal = onboardingProfile.goal;
       user.time = onboardingProfile.time;
       user.level = onboardingProfile.level || 'zero';
       if (onboardingProfile.languagesKnown) user.languagesKnown = onboardingProfile.languagesKnown;
       if (onboardingProfile.plan) user.plan = onboardingProfile.plan;
    }

    await user.save();
    res.json({ message: 'Синхронізація успішна', user });

  } catch (error) {
    next(error);
  }
};

/**
 * Save code for a specific lesson
 * POST /api/user/save-code
 */
const saveCode = async (req, res, next) => {
  try {
    const { lessonId, code } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const existing = user.codeStorage.find(c => c.lessonId === lessonId);
    
    // If code is specifically sent as null or empty string and they want it deleted
    if (code === null || code === undefined || code === '') {
       if (existing) {
         user.codeStorage = user.codeStorage.filter(c => c.lessonId !== lessonId);
       }
    } else {
      if (existing) {
        existing.code = code;
        existing.updatedAt = Date.now();
      } else {
        user.codeStorage.push({ lessonId, code });
      }
    }

    await user.save();
    res.json({ message: 'Код збережено', codeStorage: user.codeStorage });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncUserData,
  saveCode
};
