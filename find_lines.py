lines = open('js/data/lessons.js', encoding='utf-8').read().splitlines()
for i, line in enumerate(lines):
    if "Динамічна" in line or "Класи" in line:
        if "title" in line:
            print(f"Line {i+1}: {line}")
