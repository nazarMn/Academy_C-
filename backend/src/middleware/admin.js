/**
 * admin.middleware.js — Verifies admin permissions
 */
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Токен відсутній. Потрібна авторизація.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_123');

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('Користувача не знайдено.');
    }
    if (user.banned) {
      throw new ForbiddenError('Акаунт заблоковано.');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenError('Доступ заборонено (потрібні права адміністратора).');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Недійсний токен або термін його дії минув.'));
    } else {
      next(error);
    }
  }
};

module.exports = { requireAdmin };
