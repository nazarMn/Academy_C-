const fs = require('fs');
const path = require('path');

global.window = {};

try {
  const qStr = fs.readFileSync(path.join(__dirname, 'js', 'data', 'quizzes.js'), 'utf8');
  eval(qStr);
  const quizzes = global.window.QUIZZES_DATA;
  if (quizzes) {
    const dir = path.join(__dirname, 'backend', 'data', 'quizzes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    quizzes.forEach((q, i) => {
      q.order = (i + 1) * 10;
      fs.writeFileSync(path.join(dir, `${q.id}.json`), JSON.stringify(q, null, 2));
    });
    console.log(`Extracted ${quizzes.length} quizzes.`);
  }
} catch(e) { console.error('quizzes error', e) }

try {
  const pStr = fs.readFileSync(path.join(__dirname, 'js', 'data', 'projects.js'), 'utf8');
  eval(pStr);
  const projects = global.window.PROJECTS_DATA;
  if (projects) {
    const dir = path.join(__dirname, 'backend', 'data', 'projects');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    projects.forEach((p, i) => {
      p.order = (i + 1) * 10;
      fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify(p, null, 2));
    });
    console.log(`Extracted ${projects.length} projects.`);
  }
} catch(e) { console.error('projects error', e) }

console.log('Extraction complete!');
