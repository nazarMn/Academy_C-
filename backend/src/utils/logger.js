/**
 * logger.js — Structured logging with colors and timestamps
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const LEVELS = {
  error: { label: 'ERROR', color: COLORS.red },
  warn:  { label: 'WARN ', color: COLORS.yellow },
  info:  { label: 'INFO ', color: COLORS.green },
  debug: { label: 'DEBUG', color: COLORS.gray },
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function log(level, context, message, data) {
  const lvl = LEVELS[level] || LEVELS.info;
  const ts = `${COLORS.gray}${timestamp()}${COLORS.reset}`;
  const tag = `${lvl.color}${lvl.label}${COLORS.reset}`;
  const ctx = context ? `${COLORS.cyan}[${context}]${COLORS.reset} ` : '';
  const msg = `${ts} ${tag} ${ctx}${message}`;

  if (data !== undefined) {
    console[level === 'error' ? 'error' : 'log'](msg, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } else {
    console[level === 'error' ? 'error' : 'log'](msg);
  }
}

const logger = {
  info:  (ctx, msg, data) => log('info', ctx, msg, data),
  warn:  (ctx, msg, data) => log('warn', ctx, msg, data),
  error: (ctx, msg, data) => log('error', ctx, msg, data),
  debug: (ctx, msg, data) => log('debug', ctx, msg, data),
};

/**
 * Express request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? COLORS.red : status >= 400 ? COLORS.yellow : COLORS.green;
    logger.info('HTTP', `${method} ${url} ${color}${status}${COLORS.reset} ${COLORS.gray}${duration}ms${COLORS.reset}`);
  });

  next();
}

module.exports = { logger, requestLogger };
