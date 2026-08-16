const fs = require('fs');
const path = require('path');
const sandbox = require('../../sandbox.service');
const { normalizeOutput } = require('../../../utils/sanitizer');

async function run(code, input = '') {
  const dir = sandbox.createTempDirectory('py_');
  const srcFile = path.join(dir, 'main.py');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    const command = sandbox.isWindows ? 'python' : 'python3';
    const runResult = await sandbox.exec(command, [srcFile], { 
      timeoutMs: sandbox.EXECUTION_TIMEOUT_MS, 
      stdin: input,
      env: { PYTHONIOENCODING: 'utf-8' }
    });

    if (runResult.timedOut) {
      return {
        status: 'time_limit',
        output: runResult.stdout,
        error: 'Перевищено час виконання (5 сек). Можливо, нескінченний цикл?',
        executionTimeMs: runResult.timeMs
      };
    }

    if (runResult.exitCode !== 0) {
      return {
        status: 'runtime_error',
        output: runResult.stdout,
        error: runResult.stderr || `Програма завершилась з кодом ${runResult.exitCode}`,
        executionTimeMs: runResult.timeMs
      };
    }

    return {
      status: 'ok',
      output: runResult.stdout,
      error: runResult.stderr || null,
      executionTimeMs: runResult.timeMs
    };
  } finally {
    sandbox.cleanup(dir);
  }
}

async function runWithTests(code, testCases = []) {
  const dir = sandbox.createTempDirectory('py_test_');
  const srcFile = path.join(dir, 'main.py');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    const command = sandbox.isWindows ? 'python' : 'python3';
    const results = [];
    let hasTimeout = false;
    let hasRuntimeError = false;

    for (const tc of testCases) {
      const runResult = await sandbox.exec(command, [srcFile], {
        timeoutMs: sandbox.EXECUTION_TIMEOUT_MS,
        stdin: tc.input || '',
        env: { PYTHONIOENCODING: 'utf-8' }
      });

      const actual = normalizeOutput(runResult.stdout);
      const expected = normalizeOutput(tc.expectedOutput || '');
      const isOk = runResult.exitCode === 0 && !runResult.timedOut;
      const passed = isOk && actual === expected;

      if (runResult.timedOut) hasTimeout = true;
      if (runResult.exitCode !== 0) hasRuntimeError = true;

      results.push({
        input: tc.input || '',
        expected,
        actual,
        passed,
        error: runResult.stderr || (runResult.timedOut ? 'Перевищено ліміт часу' : null),
        timedOut: runResult.timedOut,
        timeMs: runResult.timeMs,
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = testCases.length;

    let status = 'accepted';
    if (passedCount < totalCount) {
      status = hasTimeout ? 'time_limit' : hasRuntimeError ? 'runtime_error' : 'wrong_answer';
    }

    return {
      status,
      passed: passedCount,
      total: totalCount,
      testResults: results,
    };
  } finally {
    sandbox.cleanup(dir);
  }
}

module.exports = { run, runWithTests };
