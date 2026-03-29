/**
 * migrate-lessons.js — Extract lessons from js/data/lessons.js to individual JSON files
 *
 * Usage: node backend/scripts/migrate-lessons.js
 *
 * Reads the LESSONS_DATA array from the frontend JS file and writes
 * each lesson as a separate JSON file in backend/data/lessons/
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../../js/data/lessons.js');
const TARGET_DIR = path.join(__dirname, '../data/lessons');

console.log('═'.repeat(50));
console.log('📦 Lesson Migration Tool');
console.log('═'.repeat(50));
console.log(`Source: ${SOURCE_FILE}`);
console.log(`Target: ${TARGET_DIR}`);
console.log('');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  console.log('✅ Created target directory');
}

// Read the source file
if (!fs.existsSync(SOURCE_FILE)) {
  console.error('❌ Source file not found:', SOURCE_FILE);
  process.exit(1);
}

const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');

// Extract the LESSONS_DATA array by evaluating in a sandboxed context
// We create a fake `window` object and execute the file
const window = {};
try {
  // The file assigns to window.LESSONS_DATA = [...]
  const fn = new Function('window', sourceContent);
  fn(window);
} catch (err) {
  console.error('❌ Failed to parse lessons file:', err.message);
  console.log('');
  console.log('Trying alternative extraction...');

  // Alternative: regex-based extraction
  try {
    const match = sourceContent.match(/window\.LESSONS_DATA\s*=\s*(\[[\s\S]*\]);?\s*$/m);
    if (match) {
      // This won't work for complex content, but let's try
      console.error('❌ Complex content — manual migration needed. See README.');
      process.exit(1);
    }
  } catch (e2) {
    console.error('❌ All extraction methods failed.');
    process.exit(1);
  }
}

const lessons = window.LESSONS_DATA;

if (!lessons || !Array.isArray(lessons)) {
  console.error('❌ No LESSONS_DATA array found in source file.');
  process.exit(1);
}

console.log(`📚 Found ${lessons.length} lessons\n`);

// Write each lesson as a JSON file
let success = 0;
let skipped = 0;

for (let i = 0; i < lessons.length; i++) {
  const lesson = lessons[i];

  if (!lesson.id) {
    console.warn(`⚠️  Lesson at index ${i} has no ID — skipping`);
    skipped++;
    continue;
  }

  // Add order field for sorting
  lesson.order = i + 1;

  const filename = `${lesson.id}.json`;
  const filepath = path.join(TARGET_DIR, filename);

  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`⏭️  ${filename} already exists — skipping`);
    skipped++;
    continue;
  }

  try {
    fs.writeFileSync(filepath, JSON.stringify(lesson, null, 2), 'utf8');
    console.log(`✅ ${filename} — "${lesson.title}"`);
    success++;
  } catch (err) {
    console.error(`❌ Failed to write ${filename}: ${err.message}`);
  }
}

console.log('');
console.log('═'.repeat(50));
console.log(`✅ Migrated: ${success}`);
console.log(`⏭️  Skipped:  ${skipped}`);
console.log(`📁 Total files in target: ${fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json')).length}`);
console.log('═'.repeat(50));
