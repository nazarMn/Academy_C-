const mongoose = require('mongoose');

const userSolutionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  archiveId: { type: String, required: true },     // references ExamArchive.id
  taskIndex: { type: Number, required: true },     // which task in the archive
  language: { type: String, required: true },      // 'cpp', 'python'
  code: { type: String, default: '' },
}, {
  timestamps: true,
});

// Compound index: one solution per user per task per language
userSolutionSchema.index({ userId: 1, archiveId: 1, taskIndex: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('UserSolution', userSolutionSchema);
