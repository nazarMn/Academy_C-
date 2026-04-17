require('dotenv').config();
const mongoose = require('mongoose');

async function wipe() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.collection('lessons').deleteMany({});
  await mongoose.connection.collection('quizzes').deleteMany({});
  await mongoose.connection.collection('practices').deleteMany({});
  await mongoose.connection.collection('projects').deleteMany({});
  console.log('Wiped specific collections.');
  process.exit(0);
}

wipe();
