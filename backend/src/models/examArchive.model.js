const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskNumber: { type: Number, required: true },
  title: { type: String, default: '' },
  languages: [{ type: String }],                  // ['cpp', 'python']
  starterCode: { type: mongoose.Schema.Types.Mixed, default: {} }, // { cpp: '...', python: '...' }
}, { _id: false });

const examArchiveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  subjectId: { type: String, required: true },    // references Subject.id
  title: { type: String, required: true },        // 'ООП — Зимова сесія 2024'
  description: { type: String, default: '' },
  session: { type: String, default: '' },         // 'Зима 2024'
  images: [{ type: String }],                     // Archive-level images (exam paper photos, one photo can have multiple tasks)
  tasks: [taskSchema],
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ExamArchive', examArchiveSchema);
