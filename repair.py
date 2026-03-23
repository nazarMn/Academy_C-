import codecs

data = [
    ("intro", "Вступ до C++", "Початківець", 10),
    ("variables", "Змінні та типи даних", "Початківець", 10),
    ("input_output", "Ввід та вивід", "Початківець", 10),
    ("conditions", "Умовні оператори", "Початківець", 15),
    ("loops", "Цикли (for, while)", "Початківець", 15),
    ("functions", "Функції", "Початківець", 15),
    ("arrays", "Масиви та рядки", "Початківець", 20),
    ("pointers", "Покажчики (Pointers)", "Середній", 25),
    ("dynamic_memory", "Динамічна пам'ять", "Середній", 25),
    ("file_io", "Робота з файлами", "Середній", 30),
    ("recursion", "Рекурсія", "Середній", 30),
    ("classes", "Класи та Об'єкти", "Просунутий", 40),
    ("constructors", "Конструктори та Деструктори", "Просунутий", 40),
    ("encapsulation", "Інкапсуляція", "Просунутий", 40),
    ("inheritance", "Успадкування", "Просунутий", 50),
    ("polymorphism", "Поліморфізм", "Просунутий", 50),
    ("operator_overloading", "Перевантаження операторів", "Просунутий", 50),
    ("abstraction", "Абстракція", "Просунутий", 50),
    ("stl_vectors", "STL: vector та map", "Просунутий", 60)
]

with open('js/data/lessons.js', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split(r'\1videos:')

if len(parts) == 20:
    new_text = parts[0]
    for i in range(19):
        id_str, title, level, xp = data[i]
        inject = f"id: '{id_str}',\n    title: '{title}',\n    level: '{level}',\n    xp: {xp},\n    videos:"
        new_text += inject + parts[i+1]

    with open('js/data/lessons.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Fixed successfully!")
else:
    print(f"Error: Found {len(parts)-1} instances")
