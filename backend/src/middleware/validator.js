/**
 * validator.js — Request validation middleware
 */

const { ValidationError } = require('../utils/errors');

/**
 * Validate execution request body
 */
function validateExecutionBody(req, _res, next) {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      throw new ValidationError('Поле "code" обов\'язкове і повинно бути рядком.');
    }

    if (req.body.input !== undefined && typeof req.body.input !== 'string') {
      throw new ValidationError('Поле "input" повинно бути рядком.');
    }

    if (req.body.testCases !== undefined) {
      if (!Array.isArray(req.body.testCases)) {
        throw new ValidationError('Поле "testCases" повинно бути масивом.');
      }
      for (const tc of req.body.testCases) {
        if (typeof tc !== 'object' || tc === null) {
          throw new ValidationError('Кожен тест-кейс повинен бути об\'єктом.');
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Validate lesson body for create/update
 */
function validateLessonBody(req, _res, next) {
  try {
    const { title, level, explanation, code } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      throw new ValidationError('Поле "title" обов\'язкове (мінімум 2 символи).');
    }

    const validLevels = ['beginner', 'intermediate', 'advanced', 'oop'];
    if (level && !validLevels.includes(level)) {
      throw new ValidationError(`Поле "level" має бути одним з: ${validLevels.join(', ')}`);
    }

    if (explanation !== undefined && typeof explanation !== 'string') {
      throw new ValidationError('Поле "explanation" повинно бути рядком.');
    }

    if (code !== undefined && typeof code !== 'string') {
      throw new ValidationError('Поле "code" повинно бути рядком.');
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Simple API key authentication for admin endpoints
 */
function requireAdminKey(req, _res, next) {
  const adminKey = process.env.ADMIN_API_KEY;

  // If no admin key is set, allow access (development mode)
  if (!adminKey) {
    return next();
  }

  const provided = req.headers['x-admin-key'] || req.query.adminKey;

  if (!provided || provided !== adminKey) {
    const { AuthError } = require('../utils/errors');
    return next(new AuthError('Невірний або відсутній ключ адміністратора.'));
  }

  next();
}

module.exports = { validateExecutionBody, validateLessonBody, requireAdminKey };
