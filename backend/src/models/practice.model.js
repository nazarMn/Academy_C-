const mongoose = require('mongoose');

const practiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  courseId: { type: String, required: true, default: 'cpp' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  xp: { type: Number, default: 15 },
  desc: { type: String },
  starter: { type: String },
  order: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Practice = mongoose.model('Practice', practiceSchema);
module.exports = Practice;
