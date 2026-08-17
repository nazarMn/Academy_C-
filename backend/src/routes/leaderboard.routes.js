const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboard.controller');

// GET /api/leaderboard
router.get('/', getLeaderboard);

module.exports = router;
