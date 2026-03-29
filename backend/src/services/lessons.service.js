/**
 * lessons.service.js — Lesson CRUD with JSON file storage
 *
 * Lessons are stored as individual JSON files in /backend/data/lessons/
 * This makes adding/editing lessons trivial — just drop a JSON file.
 * An in-memory cache avoids repeated disk reads.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');

const LESSONS_DIR = path.join(__dirname, '../../data/lessons');

// In-memory cache
let lessonsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Ensure the lessons data directory exists
 */
function ensureDir() {
  if (!fs.existsSync(LESSONS_DIR)) {
    fs.mkdirSync(LESSONS_DIR, { recursive: true });
    logger.info('Lessons', `Created lessons directory: ${LESSONS_DIR}`);
  }
}

/**
 * Generate a URL-safe slug from a title
 */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\sа-яіїєґ'-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

/**
 * Read all lesson JSON files from disk (with caching)
 * @param {boolean} forceReload - Bypass cache
 * @returns {Array<Object>} sorted lessons
 */
function getAllLessons(forceReload = false) {
  const now = Date.now();

  if (!forceReload && lessonsCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return lessonsCache;
  }

  ensureDir();

  const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.json'));
  const lessons = [];

  for (const file of files) {
    try {
      const filePath = path.join(LESSONS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const lesson = JSON.parse(raw);
      lessons.push(lesson);
    } catch (err) {
      logger.warn('Lessons', `Failed to parse ${file}: ${err.message}`);
    }
  }

  // Sort by 'order' field, then by filename
  lessons.sort((a, b) => (a.order || 999) - (b.order || 999));

  lessonsCache = lessons;
  cacheTimestamp = now;

  logger.debug('Lessons', `Loaded ${lessons.length} lessons from disk`);
  return lessons;
}

/**
 * Get a single lesson by ID
 * @param {string} id
 * @returns {Object} lesson data
 */
function getLessonById(id) {
  const lessons = getAllLessons();
  const lesson = lessons.find(l => l.id === id);

  if (!lesson) {
    throw new NotFoundError(`Урок з ID "${id}" не знайдено.`);
  }

  return lesson;
}

/**
 * Create a new lesson
 * @param {Object} data - Lesson data
 * @returns {Object} created lesson
 */
function createLesson(data) {
  ensureDir();

  const id = data.id || slugify(data.title);
  const existing = getAllLessons().find(l => l.id === id);
  if (existing) {
    throw new ValidationError(`Урок з ID "${id}" вже існує.`);
  }

  // Determine order: put at end
  const maxOrder = Math.max(0, ...getAllLessons().map(l => l.order || 0));

  const lesson = {
    id,
    title: data.title,
    level: data.level || 'beginner',
    xp: data.xp || 10,
    levelLabel: data.levelLabel || getLevelLabel(data.level || 'beginner'),
    icon: data.icon || '📝',
    order: data.order || maxOrder + 1,
    videos: data.videos || [],
    explanation: data.explanation || '',
    code: data.code || '',
    codeExplanation: data.codeExplanation || [],
    practiceTask: data.practiceTask || '',
    expectedOutput: data.expectedOutput || '',
    hint: data.hint || '',
  };

  const filePath = path.join(LESSONS_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2), 'utf8');

  // Invalidate cache
  lessonsCache = null;

  logger.info('Lessons', `Created lesson: ${id} ("${lesson.title}")`);
  return lesson;
}

/**
 * Update an existing lesson
 * @param {string} id - Lesson ID
 * @param {Object} data - Fields to update
 * @returns {Object} updated lesson
 */
function updateLesson(id, data) {
  const existing = getLessonById(id);  // throws if not found
  const filePath = path.join(LESSONS_DIR, `${id}.json`);

  const updated = { ...existing, ...data, id }; // Never change the ID
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');

  // Invalidate cache
  lessonsCache = null;

  logger.info('Lessons', `Updated lesson: ${id}`);
  return updated;
}

/**
 * Delete a lesson
 * @param {string} id
 * @returns {boolean}
 */
function deleteLesson(id) {
  getLessonById(id); // throws if not found
  const filePath = path.join(LESSONS_DIR, `${id}.json`);

  fs.unlinkSync(filePath);

  // Invalidate cache
  lessonsCache = null;

  logger.info('Lessons', `Deleted lesson: ${id}`);
  return true;
}

/**
 * Map level code to Ukrainian label
 */
function getLevelLabel(level) {
  const labels = {
    beginner: 'Початківець',
    intermediate: 'Середній',
    advanced: 'Просунутий',
    oop: 'ООП',
  };
  return labels[level] || 'Початківець';
}

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
