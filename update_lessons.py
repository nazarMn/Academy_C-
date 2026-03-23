import codecs
import json
import re

with open('yt_vids.json', 'r', encoding='utf-8') as f:
    vids = json.load(f)

mapping = {
    'intro': "Вступ до C++ українською",
    'variables': "Змінні та типи C++ українською",
    'input_output': "Ввід і вивід cin cout C++ українською",
    'conditions': "Умовні оператори if else C++ українською",
    'loops': "Цикли for while C++ українською",
    'functions': "Функції C++ українською",
    'arrays': "Масиви C++ українською",
    'pointers': "Покажчики C++ українською",
    'dynamic_memory': "Динамічна пам'ять C++ українською",
    'file_io': "Робота з файлами C++ fstream українською",
    'recursion': "Рекурсія C++ українською",
    'classes': "Класи і об'єкти C++ українською",
    'constructors': "Конструктори та деструктори C++ українською",
    'encapsulation': "Інкапсуляція ООП C++ українською",
    'inheritance': "Успадкування ООП C++ українською",
    'polymorphism': "Поліморфізм ООП C++ українською",
    'operator_overloading': "Перевантаження операторів C++ українською",
    'abstraction': "Абстракція ООП C++ українською",
    'stl_vectors': "STL vector C++ українською"
}

with open('js/data/lessons.js', 'r', encoding='utf-8') as f:
    lessons_js = f.read()

for less_id, top in mapping.items():
    if top in vids:
        # filter out Russian/English titles
        bad_words = ["Библиотека", "Learn", "Простых", "Объектно", "Примерах"]
        good_vids = []
        for v in vids[top]:
            if not any(bw in v["title"] for bw in bad_words):
                good_vids.append(v)
                
        if not good_vids:
             good_vids = [{"id": "Lo1UKhw52ig", "title": "Основи C++ Українською"}]
             
        vids_str = "videos: [" + ", ".join([f"{{ id: '{v['id']}', title: '{v['title'].replace(chr(39), chr(92)+chr(39))}' }}" for v in good_vids]) + "],"
        
        pattern = r"(id:\s*'" + less_id + r"'.*?)videoId:\s*'[A-Za-z0-9_-]+',"
        lessons_js = re.sub(pattern, r"\\1" + vids_str, lessons_js, flags=re.DOTALL)

with open('js/data/lessons.js', 'w', encoding='utf-8') as f:
    f.write(lessons_js)

print("Updated lessons.js successfully")
