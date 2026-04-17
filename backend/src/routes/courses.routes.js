/**
 * courses.routes.js — Public courses API (MongoDB)
 */
const { Router } = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const Course = require('../models/language.model');

const router = Router();

// Return enabled courses or courses marked as comingSoon
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const courses = await Course.find({ 
      $or: [{ enabled: true }, { comingSoon: true }] 
    }).sort({ order: 1 });
    res.json(courses);
  } catch (err) { next(err); }
});

router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { next(err); }
});

module.exports = router;
