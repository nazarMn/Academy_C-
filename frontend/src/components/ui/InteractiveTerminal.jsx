import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon, XCircle } from 'lucide-react';

const InteractiveTerminal = forwardRef(({
  code,
  language = 'cpp',
  autoRun = false,
  onRunStatusChange, // (isRunning: boolean) => void
}, ref) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const codeRef = useRef(code);
  const langRef = useRef(language);
  const onRunStatusChangeRef = useRef(onRunStatusChange);

  const setupSocketListeners = useCallback((socket, terminal) => {
    socket.off('output');
    socket.off('execution_complete');
    socket.off('disconnect');

    socket.on('output', (data) => {
      terminal.write(data);
    });

    socket.on('execution_complete', ({ exitCode }) => {
      terminal.writeln(`\r\n\x1b[38;5;240m[Процес завершено з кодом ${exitCode}]\x1b[0m`);
      setIsRunning(false);
      if (onRunStatusChangeRef.current) onRunStatusChangeRef.current(false);
    });

    socket.on('disconnect', () => {
      setIsRunning(false);
      if (onRunStatusChangeRef.current) onRunStatusChangeRef.current(false);
    });
  }, []);

  useEffect(() => {
    // Initialize Xterm.js
    const terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#09090b', // surface-950
        foreground: '#e4e4e7', // surface-200
        cursor: '#facc15', // accent
        black: '#18181b',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#d946ef',
        cyan: '#06b6d4',
        white: '#ffffff',
      },
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 13,
      convertEol: true,
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = { terminal, fitAddon };

    // Persistent socket setup
    const backendUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
    const socket = io(backendUrl, { autoConnect: true });
    socketRef.current = socket;
    setupSocketListeners(socket, terminal);

    const disposable = terminal.onData((data) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('input', data);
        if (data === '\r') {
          terminal.write('\r\n');
        } else if (data === '\x7F') {
          terminal.write('\b \b');
        } else {
          terminal.write(data);
        }
      }
    });

    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      disposable.dispose();
      terminal.dispose();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [setupSocketListeners]);

  const clearTerminal = useCallback(() => {
    if (xtermRef.current?.terminal) {
      xtermRef.current.terminal.clear();
      setIsRunning(false);
      if (onRunStatusChangeRef.current) onRunStatusChangeRef.current(false);
    }
  }, []);

  const startExecution = useCallback(() => {
    if (isRunning) return;

    if (!xtermRef.current?.terminal) return;
    const { terminal, fitAddon } = xtermRef.current;
    terminal.clear();
    fitAddon?.fit();
    setIsRunning(true);
    if (onRunStatusChangeRef.current) onRunStatusChangeRef.current(true);

    const sendPayload = (sock) => {
      sock.emit('execute_interactive', {
        code: codeRef.current,
        language: langRef.current || 'cpp'
      });
    };

    if (socketRef.current && socketRef.current.connected) {
      sendPayload(socketRef.current);
    } else {
      const backendUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const socket = io(backendUrl);
      socketRef.current = socket;
      setupSocketListeners(socket, terminal);

      socket.once('connect', () => {
        sendPayload(socket);
      });

      socket.once('connect_error', () => {
        terminal.writeln('\r\n\x1b[31m[Помилка: Не вдалося підключитися до сервера виконання]\x1b[0m');
        setIsRunning(false);
        if (onRunStatusChangeRef.current) onRunStatusChangeRef.current(false);
      });
    }
  }, [isRunning, setupSocketListeners]);

  const killExecution = useCallback(() => {
    if (socketRef.current && isRunning) {
      socketRef.current.emit('kill');
      xtermRef.current?.terminal?.writeln('\r\n\x1b[31m[Виконання перервано]\x1b[0m');
      setIsRunning(false);
      if (onRunStatusChangeRef.current) onRunStatusChangeRef.current(false);
    }
  }, [isRunning]);

  // Expose run, kill and clear methods to parent
  useImperativeHandle(ref, () => ({
    run: () => {
      startExecution();
    },
    kill: () => {
      killExecution();
    },
    clear: () => {
      clearTerminal();
    }
  }), [startExecution, killExecution, clearTerminal]);

  useEffect(() => {
    if (autoRun && code) {
      startExecution();
    }
  }, [autoRun, startExecution, code]);

  return (
    <div className="flex flex-col h-full bg-surface-950">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-900 border-b border-surface-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon size={12} className="text-surface-500" />
          <span className="text-xs text-surface-400 font-mono">Інтерактивний Термінал</span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              onClick={killExecution}
              className="text-danger flex items-center gap-1 text-[10px] uppercase font-bold hover:text-red-400 px-2 py-0.5 rounded cursor-pointer"
            >
              <XCircle size={12} />
              Зупинити
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 w-full h-full p-2 overflow-hidden" ref={terminalRef} />
    </div>
  );
});

InteractiveTerminal.displayName = 'InteractiveTerminal';

export default InteractiveTerminal;
