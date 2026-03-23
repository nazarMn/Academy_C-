const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function searchYouTube(query) {
  const url = \`https://www.youtube.com/results?search_query=\${encodeURIComponent(query)}\`;
  const text = await fetchUrl(url);
  
  const regex = /"videoId":"([^"]+)","thumbnail":.*?,"title":\\{"runs":\\[\\{"text":"([^"]+)"\\}\\]/g;
  let matches;
  const results = [];
  while ((matches = regex.exec(text)) !== null) {
      if (!matches[1].includes('list=') && matches[1].length === 11) {
          results.push({ id: matches[1], title: matches[2] });
          if (results.length >= 3) break; 
      }
  }
  return results;
}

const topics = [
  "Вступ до C++ українською",
  "Змінні та типи C++ українською",
  "Ввід вивід C++ українською",
  "Умовні оператори C++ українською",
  "Цикли for while C++ українською",
  "Функції C++ українською",
  "Масиви C++ українською",
  "Покажчики C++ українською",
  "Динамічна пам'ять C++ українською",
  "Робота з файлами C++ українською",
  "Рекурсія C++ українською",
  "Класи C++ українською",
  "Конструктори C++ українською",
  "Інкапсуляція ООП C++ українською",
  "Успадкування ООП C++ українською",
  "Поліморфізм ООП C++ українською",
  "Перевантаження операторів C++ українською",
  "Абстракція ООП C++ українською",
  "STL vector C++ українською"
];

async function main() {
  const db = {};
  for (const topic of topics) {
      console.log(\`Searching: \${topic}\`);
      const vids = await searchYouTube(topic);
      db[topic] = vids;
      await new Promise(r => setTimeout(r, 500));
  }
  fs.writeFileSync('yt_results.json', JSON.stringify(db, null, 2));
  console.log('Saved to yt_results.json');
}

main().catch(console.error);
