/**
 * lessons.routes.js — Lesson CRUD API routes
 */

const { Router } = require('express');
const controller = require('../controllers/lessons.controller');
const { validateLessonBody, requireAdminKey } = require('../middleware/validator');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

// Public endpoints
router.get('/', apiLimiter, controller.getAll);
router.get('/:id', apiLimiter, controller.getById);

// Admin endpoints (require API key)
router.post('/', apiLimiter, requireAdminKey, validateLessonBody, controller.create);
router.put('/:id', apiLimiter, requireAdminKey, validateLessonBody, controller.update);
router.delete('/:id', apiLimiter, requireAdminKey, controller.remove);

module.exports = router;
