/**
 * lessons.controller.js — Handles lesson CRUD HTTP requests
 */

const lessonsService = require('../services/lessons.service');

/**
 * GET /api/lessons
 */
async function getAll(req, res, next) {
  try {
    const lessons = await lessonsService.getAllLessons(req.query.courseId);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/lessons/:id
 */
async function getById(req, res, next) {
  try {
    const lesson = await lessonsService.getLessonById(req.params.id);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/lessons
 */
async function create(req, res, next) {
  try {
    const lesson = await lessonsService.createLesson(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/lessons/:id
 */
async function update(req, res, next) {
  try {
    const lesson = await lessonsService.updateLesson(req.params.id, req.body);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/lessons/:id
 */
async function remove(req, res, next) {
  try {
    await lessonsService.deleteLesson(req.params.id);
    res.json({ success: true, message: `Урок "${req.params.id}" видалено.` });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
