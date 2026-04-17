const mongoose = require('mongoose');
const { seedDatabase } = require('./src/utils/seed');
const Lesson = require('./src/models/lesson.model');
const Project = require('./src/models/project.model');
const User = require('./src/models/user.model');
const Language = require('./src/models/language.model');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB. Cleaning old schema data...');
  
  await Lesson.deleteMany({});
  await Project.deleteMany({});
  await Language.deleteMany({});
  
  console.log('Cleared DB. Seeding from local files...');
  await seedDatabase();
  
  console.log('Elevating all existing users to ADMIN...');
  const users = await User.updateMany({}, { role: 'admin' });
  console.log(`Updated ${users.modifiedCount} users to admin role.`);
  
  console.log('Done!');
  process.exit(0);
});
