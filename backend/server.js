/**
 * server.js — Express API для C++ Академії
 * Забезпечує компіляцію та виконання C++ коду
 * Запуск: cd backend && npm install && node server.js
 */

const express = require('express');
const cors = require('cors');
const { executeCode } = require('./executor');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

/**
 * Санітизація C++ коду на сервері.
 *
 * ⚠️ КРИТИЧНО: НЕ використовувати /<[^>]*>/g — це видалить <iostream>!
 * Замість цього видаляємо ТІЛЬКИ відомі HTML теги.
 */
function sanitizeCode(code) {
  if (!code) return '';

  // Крок 1: Видаляємо тільки ВІДОМІ HTML теги (span, div, br, etc.)
  // НЕ чіпаємо <iostream>, <vector>, <string>, <map> тощо
  const htmlTags = 'span|div|br|p|pre|code|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|font|script|style|link|meta|html|head|body';
  const tagRegex = new RegExp(`<\\/?(?:${htmlTags})(?:\\s[^>]*)?\\/?>`, 'gi');
  let clean = code.replace(tagRegex, '');
  
  // Видаляємо "осиротілі" HTML атрибути
  clean = clean.replace(/(?:class|id|style|data-[a-z0-9-]+)\s*=\s*(?:"[^"]*"|'[^']*')\s*>?/gi, '');

  // Крок 2: Декодуємо HTML entities
  clean = clean
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Крок 3: Нормалізація
  clean = clean
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  console.log('[sanitizeCode] Input  (first 80):', code.substring(0, 80));
  console.log('[sanitizeCode] Output (first 80):', clean.substring(0, 80));

  return clean;
}

/**
 * POST /api/execute
 * Body: { code: string, testCases?: [{input, expectedOutput}], onlyRun?: boolean }
 * Повертає результат компіляції та виконання
 */
app.post('/api/execute', async (req, res) => {
  try {
    let { code, testCases, onlyRun } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Код не надано або має невірний формат.' });
    }

    // Санітизація коду
    code = sanitizeCode(code);

    if (code.length < 10) {
      return res.status(400).json({ error: 'Код занадто короткий.' });
    }

    if (code.length > 50000) {
      return res.status(400).json({ error: 'Код занадто великий (максимум 50КБ).' });
    }

    // Виконуємо
    const result = await executeCode(code, testCases || [], onlyRun || false);
    res.json(result);
  } catch (err) {
    console.error('[/api/execute] Помилка:', err);
    res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  }
});

/**
 * GET /api/health
 * Перевірка стану сервера
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'C++ Академія Backend працює! 🚀' });
});

// Запуск
app.listen(PORT, () => {
  console.log(`\n  ⚡ C++ Академія Backend`);
  console.log(`  📡 Працює на http://localhost:${PORT}`);
  console.log(`  🔧 Ендпоінти:`);
  console.log(`     POST /api/execute  — компіляція та виконання C++`);
  console.log(`     GET  /api/health   — перевірка стану\n`);
});
