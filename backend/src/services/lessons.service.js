/**
 * lessons.service.js — Lesson CRUD with MongoDB
 */
const Lesson = require('../models/lesson.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { logger } = require('../utils/logger');

async function getAllLessons(courseId) {
  const filter = { type: 'academic' };
  if (courseId) filter.courseId = courseId;
  const lessons = await Lesson.find(filter).sort({ order: 1 });
  return lessons;
}

async function getLessonById(id) {
  const lesson = await Lesson.findOne({ id, type: 'academic' });
  if (!lesson) {
    throw new NotFoundError(`Урок з ID "${id}" не знайдено.`);
  }
  return lesson;
}

async function createLesson(data) {
  const existing = await Lesson.findOne({ id: data.id });
  if (existing) {
    throw new ValidationError(`Урок з ID "${data.id}" вже існує.`);
  }
  const lesson = new Lesson({ ...data, type: 'academic' });
  await lesson.save();
  logger.info('Lessons', `Created lesson: ${lesson.id}`);
  return lesson;
}

async function updateLesson(id, data) {
  const lesson = await Lesson.findOneAndUpdate({ id }, data, { new: true });
  if (!lesson) throw new NotFoundError(`Урок з ID "${id}" не знайдено.`);
  logger.info('Lessons', `Updated lesson: ${id}`);
  return lesson;
}

async function deleteLesson(id) {
  const lesson = await Lesson.findOneAndDelete({ id });
  if (!lesson) throw new NotFoundError(`Урок з ID "${id}" не знайдено.`);
  logger.info('Lessons', `Deleted lesson: ${id}`);
  return true;
}

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
