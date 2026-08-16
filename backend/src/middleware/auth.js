const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_here';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Користувача не знайдено' });
      }

      if (user.banned) {
        return res.status(403).json({ message: 'Акаунт заблоковано' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Не авторизовано, токен недійсний або термін дії минув' });
    }
  }

  return res.status(401).json({ message: 'Не авторизовано, токен відсутній' });
};

module.exports = { protect };
