const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  q: { type: String, required: true },
  opts: [{ type: String }],
  correct: { type: Number, required: true },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  courseId: { type: String, required: true, default: 'cpp' },
  level: { type: String, default: 'beginner' },
  xp: { type: Number, default: 30 },
  order: { type: Number, default: 0 },
  questions: [questionSchema],
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
