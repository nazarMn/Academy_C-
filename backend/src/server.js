/**
 * server.js — C++ Academy Backend Entry Point
 *
 * Production-ready Express server with:
 * - Clean MVC architecture
 * - Real C++ code execution with full cin support
 * - Lesson CMS (JSON files)
 * - Rate limiting & security
 * - Render deployment ready
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { logger, requestLogger } = require('./utils/logger');
const { errorHandler } = require('./utils/errors');

// Route modules
const executionRoutes = require('./routes/execution.routes');
const lessonsRoutes = require('./routes/lessons.routes');
const templatesRoutes = require('./routes/templates.routes');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── MIDDLEWARE ───────────────────────────────────────────────

// CORS — allow all in dev, restrict in production
app.use(cors({
  origin: NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || '*']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key'],
}));

// Parse JSON bodies (up to 1MB)
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Security headers
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-XSS-Protection', '1; mode=block');
  next();
});

// ─── STATIC FILES (serves the frontend) ──────────────────────

// Serve frontend files from project root
const frontendDir = path.join(__dirname, '../../');
app.use(express.static(frontendDir, {
  index: 'index.html',
  extensions: ['html'],
}));

// ─── API ROUTES ──────────────────────────────────────────────

app.use('/api', executionRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/templates', templatesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'C++ Академія Backend працює! 🚀',
    version: '2.0.0',
    environment: NODE_ENV,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ─── FALLBACK: serve index.html for SPA routing ─────────────
app.get('*', (req, res, next) => {
  // Don't intercept API calls
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// ─── ERROR HANDLING ──────────────────────────────────────────

app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────────

app.listen(PORT, () => {
  const divider = '═'.repeat(50);
  console.log(`\n  ${divider}`);
  console.log(`  ⚡ C++ Академія Backend v2.0`);
  console.log(`  ${divider}`);
  console.log(`  📡 Сервер:      http://localhost:${PORT}`);
  console.log(`  🌍 Середовище:  ${NODE_ENV}`);
  console.log(`  📁 Фронтенд:    ${frontendDir}`);
  console.log(`  ${divider}`);
  console.log(`  🔧 API Ендпоінти:`);
  console.log(`     POST /api/run         — Виконання C++ коду`);
  console.log(`     POST /api/execute     — Виконання з тест-кейсами`);
  console.log(`     GET  /api/lessons     — Список уроків`);
  console.log(`     GET  /api/lessons/:id — Деталі уроку`);
  console.log(`     POST /api/lessons     — Створити урок (admin)`);
  console.log(`     PUT  /api/lessons/:id — Оновити урок (admin)`);
  console.log(`     DEL  /api/lessons/:id — Видалити урок (admin)`);
  console.log(`     GET  /api/templates   — Шаблони коду`);
  console.log(`     GET  /api/health      — Перевірка стану`);
  console.log(`  ${divider}\n`);
});

module.exports = app;
