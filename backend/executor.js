/**
 * executor.js — Компіляція та виконання C++ коду
 * Використовує g++ та child_process Node.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TIMEOUT_MS = 5000;      // 5 секунд максимум на виконання
const MAX_OUTPUT_LEN = 8192;  // Максимальний розмір виводу (символи)

/**
 * Компілює C++ код і виконує його для кожного тест-кейсу
 * @param {string} code     - Вихідний C++ код
 * @param {Array}  testCases - [{ input: string, expectedOutput: string }]
 * @param {boolean} onlyRun - якщо true — просто виконує без перевірки виводу
 * @returns {Promise<Object>} результат виконання
 */
async function executeCode(code, testCases = [], onlyRun = false) {
  const id = uuidv4();
  const tmpDir = os.tmpdir();
  const srcFile = path.join(tmpDir, `cpp_${id}.cpp`);
  const binFile = path.join(tmpDir, `cpp_${id}${process.platform === 'win32' ? '.exe' : ''}`);

  // 1. Записуємо код у тимчасовий файл
  fs.writeFileSync(srcFile, code, 'utf8');

  let compileResult;
  try {
    // 2. Компіляція
    compileResult = await compile(srcFile, binFile);
  } finally {
    safeDelete(srcFile);
  }

  // Помилка компіляції
  if (compileResult.error) {
    safeDelete(binFile);
    return {
      status: 'compile_error',
      compileError: formatCompileError(compileResult.stderr),
      testResults: [],
    };
  }

  // 3. Виконуємо для кожного тест-кейсу
  let results = [];
  try {
    if (testCases.length === 0) {
      // Режим "просто запустити" без вводу
      const run = await runBinary(binFile, '');
      results = [{ input: '', output: run.stdout, error: run.stderr, timedOut: run.timedOut, timeMs: run.timeMs }];
    } else {
      for (const tc of testCases) {
        const run = await runBinary(binFile, tc.input || '');
        const normalize = (str) => {
          return (str || '')
            .replace(/\r\n/g, '\n')      // CRLF → LF
            .replace(/\r/g, '\n')          // CR → LF
            .split('\n')
            .map(l => l.trim())            // trim кожен рядок
            .map(l => l.replace(/\s+/g, ' ')) // collapse multiple spaces
            .join('\n')
            .replace(/^\n+/, '')           // видалити пусті рядки на початку
            .replace(/\n+$/, '')           // видалити пусті рядки в кінці
            .trim();
        };
        const actual = normalize(run.stdout);
        const expected = normalize(tc.expectedOutput);
        results.push({
          input: tc.input,
          expected: expected,
          actual: actual,
          passed: !onlyRun && actual === expected,
          error: run.stderr,
          timedOut: run.timedOut,
          timeMs: run.timeMs,
        });
      }
    }
  } finally {
    safeDelete(binFile);
  }

  if (onlyRun) {
    return {
      status: 'ok',
      output: results[0]?.output || '',
      error: results[0]?.error || '',
      timedOut: results[0]?.timedOut || false,
      timeMs: results[0]?.timeMs || 0,
    };
  }

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const hasTimeout = results.some(r => r.timedOut);
  const hasRuntimeError = results.some(r => r.error && r.error.trim());

  return {
    status: passed === total ? 'accepted' : hasTimeout ? 'time_limit' : hasRuntimeError ? 'runtime_error' : 'wrong_answer',
    passed,
    total,
    testResults: results,
  };
}

/** Компілює .cpp файл за допомогою g++ */
function compile(srcFile, binFile) {
  return new Promise((resolve) => {
    const args = [srcFile, '-o', binFile, '-std=c++17', '-O2', '-Wall'];
    const proc = spawn('g++', args);
    let stderr = '';

    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      resolve({ error: code !== 0, stderr });
    });

    proc.on('error', (err) => {
      resolve({ error: true, stderr: `g++ не знайдено. Переконайтесь, що GCC встановлений і додано до PATH.\n${err.message}` });
    });

    // Таймаут компіляції 10с
    setTimeout(() => {
      try { proc.kill(); } catch(e) {}
      resolve({ error: true, stderr: 'Перевищено час компіляції (10с).' });
    }, 10000);
  });
}

/** Запускає скомпільований бінарний файл з заданим вводом */
function runBinary(binFile, input) {
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = spawn(binFile, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;

    proc.stdout.on('data', d => {
      stdout += d.toString();
      if (stdout.length > MAX_OUTPUT_LEN) { try { proc.kill(); } catch(e) {} }
    });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    if (input) {
      proc.stdin.write(input);
      proc.stdin.end();
    } else {
      proc.stdin.end();
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try { proc.kill(); } catch(e) {}
    }, TIMEOUT_MS);

    proc.on('close', () => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.slice(0, MAX_OUTPUT_LEN),
        stderr: stderr.slice(0, 2048),
        timedOut,
        timeMs: Date.now() - start,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: err.message, timedOut: false, timeMs: 0 });
    });
  });
}

/** Форматує помилки компілятора для кращого відображення */
function formatCompileError(raw) {
  return raw
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^.*\.cpp:/g, 'Рядок '))
    .join('\n');
}

function safeDelete(file) {
  try { fs.unlinkSync(file); } catch(e) {}
}

module.exports = { executeCode };
