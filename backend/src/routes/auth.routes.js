const { Router } = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/register', apiLimiter, registerUser);
router.post('/login', apiLimiter, loginUser);
router.get('/me', apiLimiter, protect, getMe);

module.exports = router;
