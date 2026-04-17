const { Server } = require('socket.io');
const { logger } = require('../utils/logger');
const sandbox = require('./sandbox.service');
const fs = require('fs');
const path = require('path');

let io;

function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // For dev, allow all
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket', `Client connected: ${socket.id}`);

    // Interactive execution handler
    socket.on('execute_interactive', async (data) => {
      const { code, language } = data;
      logger.info('Socket', `Interactive execution requested for ${language}`);

      try {
        if (language === 'cpp' || language === 'c') { // Support C and C++
          await handleCppInteractive(socket, code, language);
        } else if (language === 'python') {
          await handlePythonInteractive(socket, code);
        } else if (language === 'javascript') {
          await handleJSInteractive(socket, code);
        } else {
          socket.emit('output', `\r\nLanguage ${language} is not supported for interactive execution yet.\r\n`);
          socket.emit('execution_complete', { exitCode: 1 });
        }
      } catch (err) {
        logger.error('Socket', `Error in interactive exec: ${err.message}`);
        socket.emit('output', `\r\nError: ${err.message}\r\n`);
        socket.emit('execution_complete', { exitCode: 1 });
      }
    });

    socket.on('disconnect', () => {
      logger.info('Socket', `Client disconnected: ${socket.id}`);
    });
  });
}

// Sandbox Interactive Logic ----------------

async function handleCppInteractive(socket, code, language) {
  const dir = sandbox.createTempDirectory(`int_${language}_`);
  const isC = language === 'c';
  const srcFile = path.join(dir, isC ? 'main.c' : 'main.cpp');
  const binFile = path.join(dir, sandbox.isWindows ? 'main.exe' : 'main');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    const compiler = isC ? 'gcc' : 'g++';
    const stdEnv = isC ? '-std=c11' : '-std=c++17';
    // Use -O0 for faster compilation during interactive testing
    const compileArgs = [srcFile, '-o', binFile, stdEnv, '-O0', '-Wall'];
    if (!sandbox.isWindows) {
      compileArgs.push('-static');
    }

    const compileResult = await sandbox.exec(compiler, compileArgs, { timeoutMs: sandbox.COMPILE_TIMEOUT_MS });

    if (compileResult.exitCode !== 0 || compileResult.timedOut) {
      socket.emit('output', `\r\nПомилка компіляції:\r\n${compileResult.stderr}\r\n`);
      socket.emit('execution_complete', { exitCode: 1 });
      return;
    }

    await sandbox.execInteractive(binFile, [], socket, { timeoutMs: 60000 }); // 60s max interactive time
  } finally {
    sandbox.cleanup(dir);
  }
}

async function handlePythonInteractive(socket, code) {
  const dir = sandbox.createTempDirectory('int_py_');
  const srcFile = path.join(dir, 'main.py');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    const command = sandbox.isWindows ? 'python' : 'python3';
    // add -u to unbuffer stdout and stderr, vital for interactive Python
    await sandbox.execInteractive(command, ['-u', srcFile], socket, {
      timeoutMs: 60000,
      env: { PYTHONIOENCODING: 'utf-8' }
    });
  } finally {
    sandbox.cleanup(dir);
  }
}

async function handleJSInteractive(socket, code) {
  const dir = sandbox.createTempDirectory('int_js_');
  const srcFile = path.join(dir, 'main.js');

  try {
    fs.writeFileSync(srcFile, code, 'utf8');

    await sandbox.execInteractive('node', [srcFile], socket, { timeoutMs: 60000 });
  } finally {
    sandbox.cleanup(dir);
  }
}

module.exports = { initSocketIO };
