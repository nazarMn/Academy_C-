/**
 * templates.routes.js — Code templates API
 */

const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();
const TEMPLATES_FILE = path.join(__dirname, '../../data/templates.json');

// GET /api/templates
router.get('/', apiLimiter, (req, res) => {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const data = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      return res.json(data);
    }
    res.json([]);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
