/**
 * execution.service.js — High-level C++ code execution pipeline
 *
 * Pipeline: receive code → sanitize → create temp dir → write main.cpp →
 *           compile with g++ → run with stdin → capture stdout/stderr →
 *           cleanup → return result
 */

const fs = require('fs');
const { logger } = require('../utils/logger');
const { sanitizeCode, validateCode, sanitizeInput, normalizeOutput } = require('../utils/sanitizer');
const { formatCompileError } = require('../utils/errors');
const sandbox = require('./sandbox.service');

/**
 * Execute C++ code with optional stdin input
 * @param {string} rawCode - Raw C++ source code
 * @param {string} rawInput - Raw stdin input
 * @returns {Promise<Object>} execution result
 */
async function runCode(rawCode, rawInput = '') {
  // 1. Sanitize and validate
  const code = sanitizeCode(rawCode);
  validateCode(code);
  const input = sanitizeInput(rawInput);

  logger.info('Execution', `Running code (${code.length} chars) with input (${input.length} chars)`);

  // 2. Create temp environment
  const { dir, srcFile, binFile } = sandbox.createTempFiles();

  try {
    // 3. Write source file
    fs.writeFileSync(srcFile, code, 'utf8');

    // 4. Compile
    const compileResult = await sandbox.compile(srcFile, binFile);

    if (!compileResult.success) {
      logger.info('Execution', 'Compile error');
      return {
        status: 'compile_error',
        compileError: formatCompileError(compileResult.stderr),
        output: '',
        error: compileResult.stderr,
      };
    }

    // 5. Execute with stdin
    const runResult = await sandbox.execute(binFile, input);

    if (runResult.timedOut) {
      logger.warn('Execution', `Timeout after ${runResult.timeMs}ms`);
      return {
        status: 'time_limit',
        output: runResult.stdout,
        error: 'Перевищено час виконання (5 сек). Можливо, нескінченний цикл?',
        timedOut: true,
        timeMs: runResult.timeMs,
      };
    }

    logger.info('Execution', `Completed in ${runResult.timeMs}ms`);
    return {
      status: 'ok',
      output: runResult.stdout,
      error: runResult.stderr,
      timedOut: false,
      timeMs: runResult.timeMs,
    };
  } finally {
    // 6. Always cleanup
    sandbox.cleanup(dir);
  }
}

/**
 * Execute C++ code against test cases
 * @param {string} rawCode - Raw C++ source code
 * @param {Array<{input: string, expectedOutput: string}>} testCases
 * @returns {Promise<Object>} test results
 */
async function runWithTests(rawCode, testCases = []) {
  const code = sanitizeCode(rawCode);
  validateCode(code);

  logger.info('Execution', `Running ${testCases.length} test cases`);

  const { dir, srcFile, binFile } = sandbox.createTempFiles();

  try {
    // Write and compile
    fs.writeFileSync(srcFile, code, 'utf8');
    const compileResult = await sandbox.compile(srcFile, binFile);

    if (!compileResult.success) {
      return {
        status: 'compile_error',
        compileError: formatCompileError(compileResult.stderr),
        testResults: [],
        passed: 0,
        total: testCases.length,
      };
    }

    // Run each test case
    const results = [];
    for (const tc of testCases) {
      const input = sanitizeInput(tc.input || '');
      const runResult = await sandbox.execute(binFile, input);

      const actual = normalizeOutput(runResult.stdout);
      const expected = normalizeOutput(tc.expectedOutput || '');

      results.push({
        input: tc.input || '',
        expected,
        actual,
        passed: actual === expected,
        error: runResult.stderr,
        timedOut: runResult.timedOut,
        timeMs: runResult.timeMs,
      });
    }

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const hasTimeout = results.some(r => r.timedOut);
    const hasRuntimeError = results.some(r => r.error && r.error.trim());

    let status = 'accepted';
    if (passed < total) {
      status = hasTimeout ? 'time_limit' : hasRuntimeError ? 'runtime_error' : 'wrong_answer';
    }

    logger.info('Execution', `Tests: ${passed}/${total} passed (${status})`);

    return {
      status,
      passed,
      total,
      testResults: results,
    };
  } finally {
    sandbox.cleanup(dir);
  }
}

module.exports = { runCode, runWithTests };
