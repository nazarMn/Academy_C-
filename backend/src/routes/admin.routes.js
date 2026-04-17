/**
 * admin.routes.js — Powerful global secure CMS router
 */
const { Router } = require('express');
const { requireAdmin } = require('../middleware/admin');
const { apiLimiter } = require('../middleware/rateLimiter');
const User = require('../models/user.model');
const Lesson = require('../models/lesson.model');
const Project = require('../models/project.model');
const Course = require('../models/language.model');
const Quiz = require('../models/quiz.model');
const Practice = require('../models/practice.model');
const Subject = require('../models/subject.model');
const ExamArchive = require('../models/examArchive.model');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../services/cloudinary');

// Multer config — memory storage (buffer → Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const router = Router();

// Secure all endpoints under /api/admin/*
router.use(apiLimiter);
router.use(requireAdmin);

// ==========================================================
// 1. DASHBOARD ANALYTICS
// ==========================================================
router.get('/analytics', async (req, res, next) => {
  try {
    const [totalUsers, totalLessons, totalProjects, admins, totalQuizzes, totalPractice, totalCourses] = await Promise.all([
      User.countDocuments(),
      Lesson.countDocuments(),
      Project.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Quiz.countDocuments(),
      Practice.countDocuments(),
      Course.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalLessons,
      totalProjects,
      admins,
      totalQuizzes,
      totalPractice,
      totalCourses,
    });
  } catch (err) { next(err); }
});

// ==========================================================
// 2. USERS MANAGEMENT
// ==========================================================
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { role, banned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent locking yourself out
    if (user._id.toString() === req.user._id.toString() && (role === 'user' || banned)) {
      return res.status(403).json({ message: 'Cannot demote or ban yourself.' });
    }

    if (role) user.role = role;
    if (banned !== undefined) user.banned = banned;

    await user.save();
    res.json(user);
  } catch (err) { next(err); }
});

// ==========================================================
// 3. LESSONS MANAGEMENT (For UI builder)
// ==========================================================
router.get('/lessons', async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const lessons = await Lesson.find(filter).sort({ order: 1 });
    res.json(lessons);
  } catch (err) { next(err); }
});

router.post('/lessons', async (req, res, next) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) { next(err); }
});

router.put('/lessons/:id', async (req, res, next) => {
  try {
    const lesson = await Lesson.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (err) { next(err); }
});

router.delete('/lessons/:id', async (req, res, next) => {
  try {
    await Lesson.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 4. PROJECTS MANAGEMENT
// ==========================================================
router.get('/projects', async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { next(err); }
});

router.post('/projects', async (req, res, next) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) { next(err); }
});

router.put('/projects/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
});

router.delete('/projects/:id', async (req, res, next) => {
  try {
    await Project.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 5. QUIZZES MANAGEMENT
// ==========================================================
router.get('/quizzes', async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const quizzes = await Quiz.find(filter).sort({ order: 1 });
    res.json(quizzes);
  } catch (err) { next(err); }
});

router.post('/quizzes', async (req, res, next) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) { next(err); }
});

router.put('/quizzes/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { next(err); }
});

router.delete('/quizzes/:id', async (req, res, next) => {
  try {
    await Quiz.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 6. PRACTICE TASKS MANAGEMENT
// ==========================================================
router.get('/practice', async (req, res, next) => {
  try {
    const filter = req.query.courseId ? { courseId: req.query.courseId } : {};
    const tasks = await Practice.find(filter).sort({ order: 1 });
    res.json(tasks);
  } catch (err) { next(err); }
});

router.post('/practice', async (req, res, next) => {
  try {
    const task = new Practice(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.put('/practice/:id', async (req, res, next) => {
  try {
    const task = await Practice.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Practice task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

router.delete('/practice/:id', async (req, res, next) => {
  try {
    await Practice.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 7. COURSES MANAGEMENT
// ==========================================================
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ order: 1 });
    res.json(courses);
  } catch (err) { next(err); }
});

router.post('/courses', async (req, res, next) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) { next(err); }
});

router.put('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { next(err); }
});

router.delete('/courses/:id', async (req, res, next) => {
  try {
    await Course.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 8. SUBJECTS MANAGEMENT
// ==========================================================
router.get('/subjects', async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 });
    res.json(subjects);
  } catch (err) { next(err); }
});

router.post('/subjects', async (req, res, next) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (err) { next(err); }
});

router.put('/subjects/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) { next(err); }
});

router.delete('/subjects/:id', async (req, res, next) => {
  try {
    await Subject.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 9. EXAM ARCHIVES MANAGEMENT
// ==========================================================
router.get('/exam-archives', async (req, res, next) => {
  try {
    const filter = req.query.subjectId ? { subjectId: req.query.subjectId } : {};
    const archives = await ExamArchive.find(filter).sort({ order: 1 });
    res.json(archives);
  } catch (err) { next(err); }
});

router.post('/exam-archives', async (req, res, next) => {
  try {
    const archive = new ExamArchive(req.body);
    await archive.save();
    res.status(201).json(archive);
  } catch (err) { next(err); }
});

router.put('/exam-archives/:id', async (req, res, next) => {
  try {
    const archive = await ExamArchive.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!archive) return res.status(404).json({ message: 'Archive not found' });
    res.json(archive);
  } catch (err) { next(err); }
});

router.delete('/exam-archives/:id', async (req, res, next) => {
  try {
    const archive = await ExamArchive.findOne({ id: req.params.id });
    if (!archive) return res.status(404).json({ message: 'Archive not found' });
    
    // Delete archive-level images from Cloudinary
    for (const imgUrl of (archive.images || [])) {
      const parts = imgUrl.split('/');
      const fileName = parts.pop().split('.')[0];
      const folder = parts.pop();
      const publicId = `${folder}/${fileName}`;
      await deleteImage(publicId);
    }
    
    await ExamArchive.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

// ==========================================================
// 10. IMAGE UPLOAD (Cloudinary)
// ==========================================================
router.post('/upload-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const result = await uploadImage(req.file.buffer, 'exam-archives');
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/upload-images', upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }
    const results = await Promise.all(
      req.files.map(f => uploadImage(f.buffer, 'exam-archives'))
    );
    res.json(results);
  } catch (err) { next(err); }
});

router.post('/delete-image', async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId required' });
    await deleteImage(publicId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
