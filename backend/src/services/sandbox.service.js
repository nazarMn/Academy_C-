/**
 * sandbox.service.js — Secure code execution abstraction
 * Handles execution of processes with security constraints and timeouts.
 * Completely language-agnostic.
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
 * @param {string} prefix - Prefix for the temporary directory
 * @returns {string} Path to the created directory
 */
function createTempDirectory(prefix = 'exec_') {
  const id = uniqueId();
  const dir = path.join(os.tmpdir(), `${prefix}${id}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Clean up temporary directory and all contents
 * @param {string} dir - Path to the directory to clean up
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
 * Execute a command with security constraints (timeout, max output)
 * @param {string} command - Command to execute
 * @param {Array<string>} args - Arguments for the command
 * @param {Object} options - execution options (timeoutMs, stdin)
 * @returns {Promise<{ stdout: string, stderr: string, timedOut: boolean, exitCode: number|null, timeMs: number }>}
 */
function exec(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const timeoutMs = options.timeoutMs || EXECUTION_TIMEOUT_MS;
    const stdin = options.stdin || '';
    
    let spawnOptions = {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
      env: { ...process.env, ...(options.env || {}) },
    };

    // On Linux (Render), apply resource limits
    if (!isWindows) {
      spawnOptions.env = {
        ...spawnOptions.env,
        // Restrict environment
        HOME: '/tmp',
        PATH: '/usr/bin:/bin',
      };
    }

    logger.debug('Sandbox', `Executing: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, spawnOptions);
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
    }, timeoutMs);

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

/**
 * Execute a command interactively and pipe I/O to a socket
 */
function execInteractive(command, args = [], socket, options = {}) {
  return new Promise((resolve) => {
    const timeoutMs = options.timeoutMs || EXECUTION_TIMEOUT_MS * 4; // Allow more time for interactive

    let spawnOptions = {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...(options.env || {}) },
    };

    if (!isWindows) {
      spawnOptions.env = {
        ...spawnOptions.env,
        HOME: '/tmp',
        PATH: '/usr/bin:/bin',
      };
    }

    const proc = spawn(command, args, spawnOptions);

    let stdoutBytes = 0;
    let killed = false;

    // Handle stdout
    proc.stdout.on('data', (d) => {
      const chunk = d.toString();
      stdoutBytes += chunk.length;
      if (stdoutBytes > MAX_OUTPUT_LEN && !killed) {
        killed = true;
        socket.emit('output', `\r\n[Система]: Вивід перевищив максимальний розмір.\r\n`);
        try { proc.kill('SIGKILL'); } catch (e) { /* ignore */ }
      } else if (!killed) {
        socket.emit('output', chunk);
      }
    });

    // Handle stderr
    proc.stderr.on('data', (d) => {
      if (!killed) {
        let chunk = d.toString();
        // optionally style stderr
        socket.emit('output', chunk);
      }
    });

    // Listen to socket input to write to stdin
    const inputHandler = (data) => {
      if (!killed && proc.stdin.writable) {
        proc.stdin.write(data);
      }
    };
    socket.on('input', inputHandler);

    // Provide a way to kill from client
    const killHandler = () => {
      killed = true;
      try { proc.kill('SIGKILL'); } catch (e) { /* ignore */ }
    };
    socket.on('kill', killHandler);

    const timer = setTimeout(() => {
      killed = true;
      socket.emit('output', `\r\n[Система]: Перевищено час виконання (${timeoutMs / 1000} сек).\r\n`);
      try { proc.kill('SIGTERM'); } catch (e) {}
      setTimeout(() => { try { proc.kill('SIGKILL'); } catch (e) {} }, 1000);
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      socket.off('input', inputHandler);
      socket.off('kill', killHandler);
      socket.emit('output', `\r\n[Програма завершилась з кодом ${code}]\r\n`);
      socket.emit('execution_complete', { exitCode: code });
      resolve();
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      socket.off('input', inputHandler);
      socket.off('kill', killHandler);
      socket.emit('output', `\r\n[Системна Помилка]: ${err.message}\r\n`);
      socket.emit('execution_complete', { exitCode: 1 });
      resolve();
    });
  });
}

module.exports = {
  createTempDirectory,
  cleanup,
  exec,
  execInteractive,
  COMPILE_TIMEOUT_MS,
  EXECUTION_TIMEOUT_MS,
  MAX_OUTPUT_LEN,
  isWindows,
};

