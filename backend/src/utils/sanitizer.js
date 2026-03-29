/**
 * sanitizer.js — C++ code sanitization for safe server-side execution
 *
 * ⚠️ CRITICAL: Do NOT strip angle brackets blindly — that destroys <iostream>, <vector>, etc.
 * Only remove known HTML tags.
 */

const { ValidationError } = require('./errors');

const MAX_CODE_SIZE = parseInt(process.env.MAX_CODE_SIZE || '50000', 10);
const MIN_CODE_SIZE = 10;

// Known HTML tags to strip (NOT C++ headers like <iostream>)
const HTML_TAGS = 'span|div|br|p|pre|code|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|font|script|style|link|meta|html|head|body';
const TAG_REGEX = new RegExp(`<\\/?(?:${HTML_TAGS})(?:\\s[^>]*)?\\/?>`, 'gi');

/**
 * Sanitize C++ code received from the frontend
 */
function sanitizeCode(code) {
  if (!code || typeof code !== 'string') {
    throw new ValidationError('Код не надано або має невірний формат.');
  }

  // Step 1: Strip only known HTML tags
  let clean = code.replace(TAG_REGEX, '');

  // Strip orphaned HTML attributes
  clean = clean.replace(/(?:class|id|style|data-[a-z0-9-]+)\s*=\s*(?:"[^"]*"|'[^']*')\s*>?/gi, '');

  // Step 2: Decode HTML entities
  clean = clean
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Step 3: Normalize line endings
  clean = clean
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  return clean;
}

/**
 * Validate code size constraints
 */
function validateCode(code) {
  if (!code || typeof code !== 'string') {
    throw new ValidationError('Код не надано або має невірний формат.');
  }

  if (code.length < MIN_CODE_SIZE) {
    throw new ValidationError('Код занадто короткий.');
  }

  if (code.length > MAX_CODE_SIZE) {
    throw new ValidationError(`Код занадто великий (максимум ${Math.floor(MAX_CODE_SIZE / 1000)}КБ).`);
  }

  return true;
}

/**
 * Sanitize user-provided stdin input
 */
function sanitizeInput(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Normalize output for comparison (trim whitespace, collapse spaces, etc.)
 */
function normalizeOutput(str) {
  return (str || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .map(l => l.replace(/\s+/g, ' '))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim();
}

module.exports = {
  sanitizeCode,
  validateCode,
  sanitizeInput,
  normalizeOutput,
};
