/**
 * execution.controller.js — Handles code execution HTTP requests
 */

const executionService = require('../services/execution/execution.service');
const Lesson = require('../models/lesson.model');
const { logger } = require('../utils/logger');

async function validateLanguage(lessonId, language) {
  if (lessonId) {
    const lesson = await Lesson.findOne({ id: lessonId });
    if (lesson && lesson.executionEngines && lesson.executionEngines.length > 0) {
      if (!lesson.executionEngines.includes(language)) {
         const err = new Error(`Language '${language}' is not allowed for this lesson`);
         err.status = 403;
         throw err;
      }
    }
  }
}

/**
 * POST /api/run
 * Body: { code: string, input?: string, language?: string, lessonId?: string }
 * Returns: { status, output, error, timedOut, timeMs }
 */
async function runCode(req, res, next) {
  try {
    const { code, input, language = 'cpp', lessonId } = req.body;
    await validateLanguage(lessonId, language);
    const result = await executionService.runCode(code, input || '', language);
    res.json(result);
  } catch (err) {
    if (err.status) res.status(err.status).json({ success: false, message: err.message });
    else next(err);
  }
}

/**
 * POST /api/execute
 * Body: { code: string, testCases?: Array, onlyRun?: boolean, input?: string, language?: string, lessonId?: string }
 */
async function execute(req, res, next) {
  try {
    const { code, testCases, onlyRun, input, language = 'cpp', lessonId } = req.body;
    await validateLanguage(lessonId, language);

    if (onlyRun || !testCases || testCases.length === 0) {
      // Run-only mode
      const result = await executionService.runCode(code, input || '', language);
      res.json(result);
    } else {
      // Test-case mode
      const result = await executionService.runWithTests(code, testCases, language);
      res.json(result);
    }
  } catch (err) {
    if (err.status) res.status(err.status).json({ success: false, message: err.message });
    else next(err);
  }
}

module.exports = { runCode, execute };
