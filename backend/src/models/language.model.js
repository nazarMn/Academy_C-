const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // slug: 'cpp', 'python', 'marketing'
  name: { type: String, required: true },              // 'C++', 'Python', 'Маркетинг'
  icon: { type: String, default: '📘' },               // emoji or URL
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['programming', 'humanities', 'business', 'other'],
    default: 'programming'
  },
  color: { type: String, default: '#6366f1' },         // hex color for UI cards
  enabled: { type: Boolean, default: false },
  comingSoon: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
