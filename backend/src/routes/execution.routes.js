/**
 * execution.routes.js — Code execution API routes
 */

const { Router } = require('express');
const controller = require('../controllers/execution.controller');
const { validateExecutionBody } = require('../middleware/validator');
const { executionLimiter } = require('../middleware/rateLimiter');

const router = Router();

// POST /api/run — Execute code with optional stdin input
router.post('/run', executionLimiter, validateExecutionBody, controller.runCode);

// POST /api/execute — Legacy endpoint (backward compatible)
router.post('/execute', executionLimiter, validateExecutionBody, controller.execute);

module.exports = router;
