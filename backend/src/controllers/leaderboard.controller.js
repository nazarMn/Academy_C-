const User = require('../models/user.model');

/**
 * Get leaderboard rankings
 * GET /api/leaderboard
 */
async function getLeaderboard(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    const users = await User.find({ banned: { $ne: true } })
      .select('name stats progress practiceCompleted completedQuizzes role createdAt')
      .sort({ 'stats.xp': -1, 'stats.streak': -1 })
      .limit(limit)
      .lean();

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      id: u._id,
      name: u.name || 'Студент',
      xp: u.stats?.xp || 0,
      streak: u.stats?.streak || 0,
      lessonsCompleted: u.progress?.length || u.stats?.lessonsCompleted || 0,
      practiceCompleted: u.practiceCompleted?.length || 0,
      quizzesCompleted: u.completedQuizzes?.length || 0,
      role: u.role || 'user',
      joinedAt: u.createdAt
    }));

    res.json({
      total: leaderboard.length,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ message: 'Помилка завантаження рейтингу: ' + err.message });
  }
}

module.exports = { getLeaderboard };
