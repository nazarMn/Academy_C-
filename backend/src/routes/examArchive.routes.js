/**
 * examArchive.routes.js — Public + Authenticated API for Exam Archives
 */
const { Router } = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const ExamArchive = require('../models/examArchive.model');
const UserSolution = require('../models/userSolution.model');

const router = Router();

// ── PUBLIC: List all archives (optionally filter by subject) ──
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const filter = req.query.subjectId ? { subjectId: req.query.subjectId } : {};
    const archives = await ExamArchive.find(filter).sort({ order: 1 });
    res.json(archives);
  } catch (err) { next(err); }
});

// ── PUBLIC: Get single archive ──
router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const archive = await ExamArchive.findOne({ id: req.params.id });
    if (!archive) return res.status(404).json({ message: 'Archive not found' });
    res.json(archive);
  } catch (err) { next(err); }
});

// ── AUTHENTICATED: Get user solutions for an archive ──
router.get('/:id/solutions', apiLimiter, protect, async (req, res, next) => {
  try {
    const solutions = await UserSolution.find({
      userId: req.user._id,
      archiveId: req.params.id,
    });
    // Return as a map: { "0_cpp": "code...", "1_python": "code..." }
    const solutionMap = {};
    solutions.forEach(s => {
      solutionMap[`${s.taskIndex}_${s.language}`] = s.code;
    });
    res.json(solutionMap);
  } catch (err) { next(err); }
});

// ── AUTHENTICATED: Save or delete user solution ──
router.post('/:id/solutions', apiLimiter, protect, async (req, res, next) => {
  try {
    const { taskIndex, language, code } = req.body;
    const filter = {
      userId: req.user._id,
      archiveId: req.params.id,
      taskIndex,
      language,
    };

    // If code is null/empty → delete the solution (code was reset to default)
    if (code === null || code === undefined) {
      await UserSolution.findOneAndDelete(filter);
      return res.json({ success: true, deleted: true });
    }

    await UserSolution.findOneAndUpdate(
      filter,
      { code },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
