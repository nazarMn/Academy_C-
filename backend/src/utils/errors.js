/**
 * errors.js — Custom error classes and global error handler
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class CompileError extends AppError {
  constructor(message, details = '') {
    super(message, 200, 'COMPILE_ERROR');
    this.details = details;
  }
}

class RuntimeError extends AppError {
  constructor(message, details = '') {
    super(message, 200, 'RUNTIME_ERROR');
    this.details = details;
  }
}

class TimeoutError extends AppError {
  constructor(message = 'Перевищено час виконання') {
    super(message, 200, 'TIMEOUT_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ресурс не знайдено') {
    super(message, 404, 'NOT_FOUND');
  }
}

class AuthError extends AppError {
  constructor(message = 'Недостатньо прав доступу') {
    super(message, 403, 'AUTH_ERROR');
  }
}

/**
 * Format compiler error messages for user-friendly display
 */
function formatCompileError(raw) {
  if (!raw) return '';
  return raw
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^.*\.cpp:/g, 'Рядок '))
    .join('\n');
}

/**
 * Global Express error handler middleware
 */
function errorHandler(err, req, res, _next) {
  const { logger } = require('./logger');

  if (err.isOperational) {
    logger.warn('ErrorHandler', `${err.code}: ${err.message}`);
  } else {
    logger.error('ErrorHandler', `Unexpected: ${err.message}`, err.stack);
  }

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Внутрішня помилка сервера',
    code: err.code || 'INTERNAL_ERROR',
  };

  if (err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  ValidationError,
  CompileError,
  RuntimeError,
  TimeoutError,
  NotFoundError,
  AuthError,
  formatCompileError,
  errorHandler,
};
