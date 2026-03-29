/**
 * lessons.controller.js — Handles lesson CRUD HTTP requests
 */

const lessonsService = require('../services/lessons.service');

/**
 * GET /api/lessons
 */
function getAll(req, res, next) {
  try {
    const lessons = lessonsService.getAllLessons();
    res.json(lessons);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/lessons/:id
 */
function getById(req, res, next) {
  try {
    const lesson = lessonsService.getLessonById(req.params.id);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/lessons
 */
function create(req, res, next) {
  try {
    const lesson = lessonsService.createLesson(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/lessons/:id
 */
function update(req, res, next) {
  try {
    const lesson = lessonsService.updateLesson(req.params.id, req.body);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/lessons/:id
 */
function remove(req, res, next) {
  try {
    lessonsService.deleteLesson(req.params.id);
    res.json({ success: true, message: `Урок "${req.params.id}" видалено.` });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
