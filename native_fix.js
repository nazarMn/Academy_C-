const fs = require('fs');

let text = fs.readFileSync('js/data/lessons.js', 'utf8');

// The problematic string from my python injection:
// title: 'Динамічна пам'ять',
text = text.replace(/title:\\s*'Динамічна пам'ять'/, 'title: "Динамічна пам\\'ять"');

// And this one:
// title: 'Класи та Об'єкти',
text = text.replace(/title:\\s*'Класи та Об'єкти'/, 'title: "Класи та Об\\'єкти"');

try {
   new Function(text);
   console.log("Syntax is OK after fix.");
   fs.writeFileSync('js/data/lessons.js', text, 'utf8');
   console.log("File saved.");
} catch(e) {
   console.log("Syntax Error still present:", e.message);
}
