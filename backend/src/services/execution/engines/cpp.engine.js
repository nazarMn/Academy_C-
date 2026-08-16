const fs = require('fs');
const path = require('path');
const sandbox = require('../../sandbox.service');
const { normalizeOutput } = require('../../../utils/sanitizer');

async function run(code, input = '') {
  const dir = sandbox.createTempDirectory('cpp_');
  const srcFile = path.join(dir, 'main.cpp');
  const binFile = path.join(dir, sandbox.isWindows ? 'main.exe' : 'main');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    // 1. Compile
    const compileArgs = [srcFile, '-o', binFile, '-std=c++17', '-O2', '-Wall', '-Wextra'];
    if (!sandbox.isWindows) {
      compileArgs.push('-static');
    }

    const compileResult = await sandbox.exec('g++', compileArgs, { timeoutMs: sandbox.COMPILE_TIMEOUT_MS });
    
    if (compileResult.exitCode !== 0 || compileResult.timedOut) {
      return {
        status: compileResult.timedOut ? 'time_limit' : 'compile_error',
        output: compileResult.stdout || '',
        error: compileResult.stderr || 'Compile error',
        executionTimeMs: compileResult.timeMs
      };
    }

    // 2. Execute
    const runResult = await sandbox.exec(binFile, [], { timeoutMs: sandbox.EXECUTION_TIMEOUT_MS, stdin: input });

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
  const dir = sandbox.createTempDirectory('cpp_test_');
  const srcFile = path.join(dir, 'main.cpp');
  const binFile = path.join(dir, sandbox.isWindows ? 'main.exe' : 'main');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    // 1. Compile ONCE for all test cases
    const compileArgs = [srcFile, '-o', binFile, '-std=c++17', '-O2', '-Wall', '-Wextra'];
    if (!sandbox.isWindows) {
      compileArgs.push('-static');
    }

    const compileResult = await sandbox.exec('g++', compileArgs, { timeoutMs: sandbox.COMPILE_TIMEOUT_MS });

    if (compileResult.exitCode !== 0 || compileResult.timedOut) {
      return {
        status: compileResult.timedOut ? 'time_limit' : 'compile_error',
        compileError: compileResult.stderr || 'Помилка компіляції',
        testResults: [],
        passed: 0,
        total: testCases.length,
      };
    }

    // 2. Fast execution of the pre-compiled binary for each test case
    const results = [];
    let hasTimeout = false;
    let hasRuntimeError = false;

    for (const tc of testCases) {
      const runResult = await sandbox.exec(binFile, [], {
        timeoutMs: sandbox.EXECUTION_TIMEOUT_MS,
        stdin: tc.input || ''
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
