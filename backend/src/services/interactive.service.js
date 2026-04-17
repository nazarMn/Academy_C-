const Lesson = require('../models/lesson.model');
const { NotFoundError } = require('../utils/errors');

async function getAllInteractive(courseId) {
  const filter = { type: 'interactive' };
  if (courseId) filter.courseId = courseId;
  return await Lesson.find(filter).sort({ order: 1 });
}

async function getInteractiveById(id) {
  const item = await Lesson.findOne({ id, type: 'interactive' });
  if (!item) throw new NotFoundError(`Interactive lesson ${id} not found.`);
  return item;
}

module.exports = { getAllInteractive, getInteractiveById };
