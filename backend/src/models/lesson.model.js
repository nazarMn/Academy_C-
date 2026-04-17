const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true }, // slug identifier e.g., 'cpp-variables'
  title: { type: String, required: true },
  courseId: { type: String, required: true, default: 'cpp' }, // Course grouping
  type: { type: String, enum: ['academic', 'interactive'], required: true },
  executionEngines: [{ type: String }], // e.g., ['cpp'], ['cpp', 'python'], or [] for theory mapping execution logic
  level: { type: String, default: 'beginner' },
  order: { type: Number, default: 0 },
  xp: { type: Number, default: 10 },
  icon: { type: String, default: '📝' },
  
  // Dynamic content
  content: { type: String }, // General content block that supports injection
  
  // Academic specific
  explanation: { type: String }, // theory
  practiceTask: { type: String }, // task
  starterCode: { type: String },
  expectedOutput: { type: String },
  solution: { type: String },
  hints: [{ type: String }],
  
  // Interactive specific
  brokenCode: { type: String },
  templates: [{
    code: { type: String },
    errorType: { type: String },
    solution: { type: String }
  }],
  
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  tags: [{ type: String }],

}, {
  timestamps: true
});

// Avoid duplicate slugs
lessonSchema.index({ id: 1 }, { unique: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
