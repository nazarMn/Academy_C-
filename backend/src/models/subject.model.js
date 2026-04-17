const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },        // 'ООП', 'АСД', 'Дискретна математика'
  icon: { type: String, default: 'BookOpen' },    // lucide icon name
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subject', subjectSchema);
