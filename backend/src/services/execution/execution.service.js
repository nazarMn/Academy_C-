/**
 * execution.service.js — Router for execution engines
 */
const { normalizeOutput } = require('../../utils/sanitizer');
const { logger } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const ENGINES = {
  cpp: require('./engines/cpp.engine'),
  python: require('./engines/python.engine'),
  javascript: require('./engines/javascript.engine'),
};

/**
 * Execute code natively based on language
 */
async function runCode(code, input = '', language = 'cpp') {
  const engine = ENGINES[language];
  if (!engine) {
    throw new Error(`Language '${language}' is not supported yet.`);
  }

  logger.info('Execution', `Running ${language} code (${code.length} chars)`);
  return await engine.run(code, input);
}

/**
 * Execute code against test cases
 */
async function runWithTests(code, testCases = [], language = 'cpp') {
  const engine = ENGINES[language];
  if (!engine) {
    throw new Error(`Language '${language}' is not supported yet.`);
  }

  logger.info('Execution', `Running ${testCases.length} test cases in ${language}`);

  const results = [];
  let status = 'accepted';
  let hasTimeout = false;
  let hasRuntimeError = false;
  let hasCompileError = false;
  let firstCompileError = null;

  for (const tc of testCases) {
    // Note: This recompiles for every test case. For a production system 
    // we would extend engines to support compile() + executeCompiled(), 
    // but we use the unified run(code, input) interface.
    const result = await engine.run(code, tc.input || '');

    if (result.status === 'compile_error') {
      hasCompileError = true;
      firstCompileError = result.error;
      break; 
    }

    const actual = normalizeOutput(result.output);
    const expected = normalizeOutput(tc.expectedOutput || '');
    const passed = result.status === 'ok' && actual === expected;

    if (result.status === 'time_limit') hasTimeout = true;
    if (result.status === 'runtime_error') hasRuntimeError = true;

    results.push({
      input: tc.input || '',
      expected,
      actual,
      passed,
      error: result.error,
      timedOut: result.status === 'time_limit',
      timeMs: result.executionTimeMs,
    });
  }

  if (hasCompileError) {
    return {
      status: 'compile_error',
      compileError: firstCompileError,
      testResults: [],
      passed: 0,
      total: testCases.length,
    };
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = testCases.length;

  if (passedCount < totalCount) {
    status = hasTimeout ? 'time_limit' : hasRuntimeError ? 'runtime_error' : 'wrong_answer';
  }

  logger.info('Execution', `Tests: ${passedCount}/${totalCount} passed (${status})`);

  return {
    status,
    passed: passedCount,
    total: totalCount,
    testResults: results,
  };
}

module.exports = { runCode, runWithTests };
