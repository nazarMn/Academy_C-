/**
 * subject.routes.js — Public API for Subjects
 */
const { Router } = require('express');
const { apiLimiter } = require('../middleware/rateLimiter');
const Subject = require('../models/subject.model');

const router = Router();

// List all subjects
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 });
    res.json(subjects);
  } catch (err) { next(err); }
});

// Get single subject
router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ id: req.params.id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) { next(err); }
});

module.exports = router;
