/**
 * sandbox.service.js — Secure code execution abstraction
 * Handles compilation and execution of C++ binaries with security constraints
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

// Configuration
const COMPILE_TIMEOUT_MS = parseInt(process.env.COMPILE_TIMEOUT_MS || '15000', 10);
const EXECUTION_TIMEOUT_MS = parseInt(process.env.EXECUTION_TIMEOUT_MS || '5000', 10);
const MAX_OUTPUT_LEN = parseInt(process.env.MAX_OUTPUT_LEN || '8192', 10);
const isWindows = process.platform === 'win32';

/**
 * Generate a unique ID for temp files
 */
function uniqueId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Create a temporary directory for code execution
 * @returns {{ dir: string, srcFile: string, binFile: string }}
 */
function createTempFiles() {
  const id = uniqueId();
  const dir = path.join(os.tmpdir(), `cpp_exec_${id}`);
  fs.mkdirSync(dir, { recursive: true });

  const srcFile = path.join(dir, 'main.cpp');
  const binFile = path.join(dir, isWindows ? 'main.exe' : 'main');

  return { dir, srcFile, binFile };
}

/**
 * Clean up temporary directory and all contents
 */
function cleanup(dir) {
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
      fs.rmdirSync(dir);
    }
  } catch (e) {
    logger.warn('Sandbox', `Cleanup failed for ${dir}: ${e.message}`);
  }
}

/**
 * Compile a C++ source file using g++
 * @param {string} srcFile - Path to the .cpp source
 * @param {string} binFile - Path for the output binary
 * @returns {Promise<{ success: boolean, stderr: string }>}
 */
function compile(srcFile, binFile) {
  return new Promise((resolve) => {
 const args = [srcFile, '-o', binFile, '-std=c++17', '-O2', '-Wall', '-Wextra'];

    // On Linux, add security flags
    if (!isWindows) {
      args.push('-static');  // Static linking for portability
    }

    logger.debug('Sandbox', `Compiling: g++ ${args.join(' ').substring(0, 80)}...`);

    const proc = spawn('g++', args, {
      timeout: COMPILE_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (e) { /* ignore */ }
      resolve({ success: false, stderr: 'Перевищено час компіляції (15с). Код занадто складний.' });
    }, COMPILE_TIMEOUT_MS);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ success: code === 0, stderr });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        stderr: `g++ не знайдено. Переконайтесь, що GCC встановлений і додано до PATH.\n${err.message}`,
      });
    });
  });
}

/**
 * Execute a compiled binary with optional stdin input
 * @param {string} binFile - Path to the compiled binary
 * @param {string} stdin   - Input to pass via stdin
 * @returns {Promise<{ stdout: string, stderr: string, timedOut: boolean, exitCode: number|null, timeMs: number }>}
 */
function execute(binFile, stdin = '') {
  return new Promise((resolve) => {
    const start = Date.now();
    
    const spawnOptions = {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: EXECUTION_TIMEOUT_MS,
    };

    // On Linux (Render), apply resource limits
    if (!isWindows) {
      spawnOptions.env = {
        ...process.env,
        // Restrict environment
        HOME: '/tmp',
        PATH: '/usr/bin:/bin',
      };
    }

    logger.debug('Sandbox', `Executing: ${binFile} with stdin (${stdin.length} chars)`);

    const proc = spawn(binFile, [], spawnOptions);
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let killed = false;

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
      // Kill if output exceeds max
      if (stdout.length > MAX_OUTPUT_LEN && !killed) {
        killed = true;
        try { proc.kill('SIGKILL'); } catch (e) { /* ignore */ }
        stderr += '\nВивід перевищив максимальний розмір.';
      }
    });

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    // Write stdin and close
    if (stdin) {
      proc.stdin.write(stdin);
    }
    proc.stdin.end();

    // Timeout handler
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill('SIGTERM');
        // Force kill after 1 second grace period
        setTimeout(() => {
          try { proc.kill('SIGKILL'); } catch (e) { /* ignore */ }
        }, 1000);
      } catch (e) { /* ignore */ }
    }, EXECUTION_TIMEOUT_MS);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.slice(0, MAX_OUTPUT_LEN),
        stderr: stderr.slice(0, 2048),
        timedOut,
        exitCode: code,
        timeMs: Date.now() - start,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout: '',
        stderr: err.message,
        timedOut: false,
        exitCode: null,
        timeMs: Date.now() - start,
      });
    });
  });
}

module.exports = {
  createTempFiles,
  cleanup,
  compile,
  execute,
  EXECUTION_TIMEOUT_MS,
  MAX_OUTPUT_LEN,
};
