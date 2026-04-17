const { Router } = require('express');
const { syncUserData, saveCode } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/sync', apiLimiter, protect, syncUserData);
router.post('/save-code', apiLimiter, protect, saveCode);

module.exports = router;
