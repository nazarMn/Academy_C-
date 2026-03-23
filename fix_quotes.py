import codecs

with open('js/data/lessons.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("title: 'Динамічна пам'ять'", 'title: "Динамічна пам\\'ять"')
text = text.replace("title: 'Класи та Об'єкти'", 'title: "Класи та Об\\'єкти"')

with open('js/data/lessons.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed quotes in lessons.js")
