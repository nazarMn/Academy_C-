const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  icon: { type: String, default: '🔧' },
  courseId: { type: String, required: true, default: 'cpp' },
  level: { type: String, default: 'beginner' },
  description: { type: String },
  starterCode: { type: String },
  xp: { type: Number, default: 100 },
  requirements: [{ type: String }],
  tags: [{ type: String }],
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
