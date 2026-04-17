const fs = require('fs');
const path = require('path');

// Fake the window object so we can run the frontend files
global.window = {};

try {
  require('./js/data/quizzes.js');
  const quizzes = global.window.QUIZZES_DATA;
  if (quizzes && quizzes.length) {
    const dir = path.join(__dirname, 'backend', 'data', 'quizzes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    quizzes.forEach((q, i) => {
      q.order = (i + 1) * 10;
      fs.writeFileSync(path.join(dir, `${q.id}.json`), JSON.stringify(q, null, 2));
    });
    console.log(`Extracted ${quizzes.length} quizzes to JSON.`);
  }
} catch (e) { console.error('Quizzes extraction error:', e); }

try {
  require('./js/data/projects.js');
  const projects = global.window.PROJECTS_DATA;
  if (projects && projects.length) {
    const dir = path.join(__dirname, 'backend', 'data', 'projects');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    projects.forEach((p, i) => {
      p.order = (i + 1) * 10;
      fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify(p, null, 2));
    });
    console.log(`Extracted ${projects.length} projects to JSON.`);
  }
} catch (e) { console.error('Projects extraction error:', e); }

// Cleanup the source data files if extraction worked
if (fs.existsSync(path.join(__dirname, 'backend', 'data', 'quizzes', 'basics.json'))) {
  fs.unlinkSync(path.join(__dirname, 'js', 'data', 'quizzes.js'));
  console.log('Deleted legacy js/data/quizzes.js');
}
if (fs.existsSync(path.join(__dirname, 'backend', 'data', 'projects', 'calculator.json'))) {
  fs.unlinkSync(path.join(__dirname, 'js', 'data', 'projects.js'));
  console.log('Deleted legacy js/data/projects.js');
}

// And let's delete the unneeded files we wanted to delete
const trash = ['fetch.py', 'fetch_yt.js', 'update_lessons.py', 'check_syntax.js', 'find_lines.py', 'fix_quotes.js', 'fix_quotes.py', 'native_fix.js', 'repair.py', 'test_sanitize.js', 'err.txt', 'out.txt', 'yt_out.log', 'yt_vids.json', 'backend/server.js', 'backend/executor.js'];
trash.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    try { fs.unlinkSync(p); console.log('Deleted ' + f); } catch(ex) { console.error('Failed to delete', f); }
  }
});
