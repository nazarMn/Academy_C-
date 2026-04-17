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
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Need dotenv if we are going to use process.env from .env check
const { logger, requestLogger } = require('./utils/logger');
const { errorHandler } = require('./utils/errors');
const connectDB = require('./utils/db');
const { seedDatabase } = require('./utils/seed');


// Route modules
const executionRoutes = require('./routes/execution.routes');
const lessonsRoutes = require('./routes/lessons.routes');
const templatesRoutes = require('./routes/templates.routes');
const quizzesRoutes = require('./routes/quizzes.routes');
const projectsRoutes = require('./routes/projects.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const interactiveRoutes = require('./routes/interactive.routes');
const practiceRoutes = require('./routes/practice.routes');
const coursesRoutes = require('./routes/courses.routes');
const adminRoutes = require('./routes/admin.routes');
const examArchiveRoutes = require('./routes/examArchive.routes');
const subjectRoutes = require('./routes/subject.routes');
const { initSocketIO } = require('./services/socket.service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Socket.io
initSocketIO(server);

// ─── CONNECT DB ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    await seedDatabase();
  });
}


// ─── MIDDLEWARE ───────────────────────────────────────────────

// CORS — allow all in dev, restrict in production
app.use(cors({
  origin: NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || '*']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key', 'Authorization'],
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
const frontendDir = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDir, {
  index: 'index.html',
  extensions: ['html'],
}));

// ─── API ROUTES ──────────────────────────────────────────────

app.use('/api', executionRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interactive', interactiveRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exam-archives', examArchiveRoutes);
app.use('/api/subjects', subjectRoutes);

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

server.listen(PORT, () => {
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
  console.log(`     GET  /api/quizzes     — Список тестів`);
  console.log(`     GET  /api/projects    — Список проєктів`);
  console.log(`     GET  /api/health      — Перевірка стану`);
  console.log(`  ${divider}\n`);
});

module.exports = app;
