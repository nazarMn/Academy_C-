/**
 * quizzes.routes.js — Quiz public API (MongoDB)
 */
const { Router } = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const Quiz = require('../models/quiz.model');

const router = Router();

router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const quizzes = await Quiz.find(filter).sort({ order: 1 });
    res.json(quizzes);
  } catch (err) { next(err); }
});

router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { next(err); }
});

module.exports = router;
