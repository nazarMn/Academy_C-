const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_here', {
    expiresIn: '30d',
  });
};

/**
 * Register User
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, guestData } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }

    // Merge guest data if provided
    const userData = { name, email, password };
    
    if (guestData) {
      if (guestData.onboardingProfile) {
        userData.goal = guestData.onboardingProfile.goal;
        userData.time = guestData.onboardingProfile.time;
        userData.level = guestData.onboardingProfile.level;
        userData.languagesKnown = guestData.onboardingProfile.languagesKnown || [];
        userData.plan = guestData.onboardingProfile.plan;
      }
      
      userData.stats = {
        xp: guestData.xp || 0,
        streak: guestData.streak || 0,
        lessonsCompleted: guestData.completedLessons?.length || 0,
        totalTime: 0
      };

      userData.progress = (guestData.completedLessons || []).map(id => ({
        lessonId: id,
        completed: true
      }));

      if (guestData.codeStorage) {
        userData.codeStorage = Object.entries(guestData.codeStorage).map(([lessonId, code]) => ({
          lessonId,
          code
        }));
      }
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        userData: user
      });
    } else {
      res.status(400).json({ message: 'Невірні дані користувача' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        userData: user
      });
    } else {
      res.status(401).json({ message: 'Невірний email або пароль' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Me
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Користувача не знайдено' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
