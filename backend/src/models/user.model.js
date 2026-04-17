const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Admin logic
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  banned: { type: Boolean, default: false },

  // Onboarding prefs
  goal: { type: String, default: 'fun' },
  time: { type: Number, default: 30 },
  level: { type: String, default: 'zero' },
  languagesKnown: { type: [String], default: [] },
  
  // Generated plan
  plan: {
    type: { type: String, default: 'practical' },
    pace: { type: String, default: 'medium' },
    difficulty: { type: String, default: 'normal' }
  },

  // Stats
  stats: {
    streak: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null }
  },

  // Progress tracking
  progress: [{
    lessonId: { type: String },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  }],
  startedProjects: [{ type: String }],
  completedQuizzes: [{ type: String }],
  perfectQuizzes: [{ type: String }],
  practiceCompleted: [{ type: String }],
  unlockedAchievements: [{ type: String }],
  
  quizScores: {
    type: Map,
    of: Number,
    default: {}
  },

  activityLog: [{
    date: { type: String, required: true },
    actions: { type: Number, default: 1 }
  }],

  // Saved code
  codeStorage: [{
    lessonId: { type: String },
    code: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
