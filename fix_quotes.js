const fs = require('fs');
let text = fs.readFileSync('js/data/lessons.js', 'utf8');

text = text.replace("title: 'Динамічна пам'ять'", 'title: "Динамічна пам\\'ять"');
text = text.replace("title: 'Класи і об'єкти C++ українською'", 'title: "Класи і об\\'єкти C++ українською"');
text = text.replace("title: 'Класи і об'єкти'", 'title: "Класи і об\\'єкти"');
text = text.replace("title: 'Класи та Об'єкти'", 'title: "Класи та Об\\'єкти"');

fs.writeFileSync('js/data/lessons.js', text, 'utf8');
console.log("Quotes fixed!");
