/**
 * quizzes.service.js — Quiz CRUD with JSON file storage
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');

const QUIZZES_DIR = path.join(__dirname, '../../data/quizzes');

let quizzesCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000;

function ensureDir() {
  if (!fs.existsSync(QUIZZES_DIR)) {
    fs.mkdirSync(QUIZZES_DIR, { recursive: true });
    logger.info('Quizzes', `Created quizzes directory: ${QUIZZES_DIR}`);
  }
}

function slugify(title) {
  return title.toLowerCase().replace(/[^\w\sа-яіїєґ'-]/gi, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}

function getAllQuizzes(forceReload = false) {
  const now = Date.now();
  if (!forceReload && quizzesCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return quizzesCache;
  }

  ensureDir();
  const files = fs.readdirSync(QUIZZES_DIR).filter(f => f.endsWith('.json'));
  const quizzes = [];

  for (const file of files) {
    try {
      const filePath = path.join(QUIZZES_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      quizzes.push(JSON.parse(raw));
    } catch (err) {
      logger.warn('Quizzes', `Failed to parse ${file}: ${err.message}`);
    }
  }

  quizzes.sort((a, b) => (a.order || 999) - (b.order || 999));
  quizzesCache = quizzes;
  cacheTimestamp = now;

  return quizzes;
}

function getQuizById(id) {
  const quizzes = getAllQuizzes();
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) throw new NotFoundError(`Тест з ID "${id}" не знайдено.`);
  return quiz;
}

function createQuiz(data) {
  ensureDir();
  const id = data.id || slugify(data.title);
  if (getAllQuizzes().find(q => q.id === id)) {
    throw new ValidationError(`Тест з ID "${id}" вже існує.`);
  }

  const maxOrder = Math.max(0, ...getAllQuizzes().map(q => q.order || 0));
  const quiz = {
    id,
    title: data.title,
    level: data.level || 'beginner',
    icon: data.icon || '🧠',
    xp: data.xp || 15,
    order: data.order || maxOrder + 1,
    questions: data.questions || []
  };

  const filePath = path.join(QUIZZES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2), 'utf8');
  quizzesCache = null;
  return quiz;
}

function updateQuiz(id, data) {
  const existing = getQuizById(id);
  const updated = { ...existing, ...data, id };
  const filePath = path.join(QUIZZES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
  quizzesCache = null;
  return updated;
}

function deleteQuiz(id) {
  getQuizById(id);
  fs.unlinkSync(path.join(QUIZZES_DIR, `${id}.json`));
  quizzesCache = null;
  return true;
}

module.exports = { getAllQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz };
