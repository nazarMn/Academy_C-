require('dotenv').config();
const mongoose = require('mongoose');

async function wipe() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);
  await mongoose.connection.collection('lessons').deleteMany({});
  await mongoose.connection.collection('quizzes').deleteMany({});
  await mongoose.connection.collection('practices').deleteMany({});
  await mongoose.connection.collection('projects').deleteMany({});
  console.log('Wiped specific collections.');
  process.exit(0);
}

wipe();
