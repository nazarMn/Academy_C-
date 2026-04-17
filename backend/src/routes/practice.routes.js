/**
 * practice.routes.js — Practice tasks public API (MongoDB)
 */
const { Router } = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const Practice = require('../models/practice.model');

const router = Router();

router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const tasks = await Practice.find(filter).sort({ order: 1 });
    res.json(tasks);
  } catch (err) { next(err); }
});

router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const task = await Practice.findOne({ id: req.params.id });
    if (!task) return res.status(404).json({ message: 'Practice task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

module.exports = router;
