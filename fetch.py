import urllib.request
import urllib.parse
import re
import json
import time

topics = [
  "Вступ до C++ українською",
  "Змінні та типи C++ українською",
  "Ввід і вивід cin cout C++ українською",
  "Умовні оператори if else C++ українською",
  "Цикли for while C++ українською",
  "Функції C++ українською",
  "Масиви C++ українською",
  "Покажчики C++ українською",
  "Динамічна пам'ять C++ українською",
  "Робота з файлами C++ fstream українською",
  "Рекурсія C++ українською",
  "Класи і об'єкти C++ українською",
  "Конструктори та деструктори C++ українською",
  "Інкапсуляція ООП C++ українською",
  "Успадкування ООП C++ українською",
  "Поліморфізм ООП C++ українською",
  "Перевантаження операторів C++ українською",
  "Абстракція ООП C++ українською",
  "STL vector C++ українською"
]

results = {}
for t in topics:
    query = urllib.parse.quote(t)
    url = f"https://www.youtube.com/results?search_query={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        matches = re.findall(r'"videoId":"([^"]{11})","thumbnail":.*?,"title":\{"runs":\[\{"text":"(.*?)"\}\]', html)
        vids = []
        seen = set()
        for v, title in matches:
            if v not in seen and "list=" not in v:
                seen.add(v)
                # Clean title
                title = title.replace('\\u0026', '&').replace('\\"', '"')
                vids.append({"id": v, "title": title[:60] + ("..." if len(title)>60 else "")})
                if len(vids) >= 2: break
        results[t] = vids
        print(f"Got {len(vids)} for {t}")
    except Exception as e:
        print(f"Failed {t}: {e}")
    time.sleep(0.5)

with open('yt_vids.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
