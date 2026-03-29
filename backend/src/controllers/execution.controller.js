/**
 * execution.controller.js — Handles code execution HTTP requests
 */

const executionService = require('../services/execution.service');
const { logger } = require('../utils/logger');

/**
 * POST /api/run
 * Body: { code: string, input?: string }
 * Returns: { status, output, error, timedOut, timeMs }
 */
async function runCode(req, res, next) {
  try {
    const { code, input } = req.body;
    const result = await executionService.runCode(code, input || '');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/execute
 * Body: { code: string, testCases?: Array, onlyRun?: boolean, input?: string }
 * Legacy endpoint — supports both run-only and test-case modes
 */
async function execute(req, res, next) {
  try {
    const { code, testCases, onlyRun, input } = req.body;

    if (onlyRun || !testCases || testCases.length === 0) {
      // Run-only mode
      const result = await executionService.runCode(code, input || '');
      res.json(result);
    } else {
      // Test-case mode
      const result = await executionService.runWithTests(code, testCases);
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { runCode, execute };
