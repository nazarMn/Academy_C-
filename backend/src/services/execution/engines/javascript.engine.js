const fs = require('fs');
const path = require('path');
const sandbox = require('../../sandbox.service');

async function run(code, input = '') {
  const dir = sandbox.createTempDirectory('js_');
  const srcFile = path.join(dir, 'main.js');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    const runResult = await sandbox.exec('node', [srcFile], { timeoutMs: sandbox.EXECUTION_TIMEOUT_MS, stdin: input });

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

module.exports = { run };
