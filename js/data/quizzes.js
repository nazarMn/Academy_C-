/* js/data/quizzes.js — Тести та вікторини */

window.QUIZZES_DATA = [
  {
    id: 'quiz_basics',
    title: 'Основи C++',
    level: 'beginner',
    icon: '🎯',
    xp: 100,
    questions: [
      {
        question: 'Яка функція є точкою входу у програму C++?',
        options: ['start()', 'main()', 'begin()', 'run()'],
        correct: 1,
        explanation: 'Виконання програми на C++ завжди починається з функції main().',
      },
      {
        question: 'Який тип даних використовується для цілих чисел?',
        options: ['float', 'char', 'int', 'string'],
        correct: 2,
        explanation: 'int (integer) — тип для цілих чисел без дробової частини.',
      },
      {
        question: 'Що виводить: cout << 5 + 3 << endl;',
        options: ['5 + 3', '53', '8', 'Помилка'],
        correct: 2,
        explanation: 'cout виводить результат виразу 5+3, тобто 8.',
      },
      {
        question: 'Який оператор використовується для введення даних з клавіатури?',
        options: ['cout <<', 'cin >>', 'scanf()', 'read()'],
        correct: 1,
        explanation: 'cin >> зчитує дані з потоку введення (клавіатури).',
      },
      {
        question: 'Що означає endl?',
        options: ['Кінець програми', 'Перехід на новий рядок та очищення буфера', 'Кінець рядка', 'Пробіл'],
        correct: 1,
        explanation: 'endl виводить символ нового рядка і очищає буфер виводу.',
      },
      {
        question: 'Як оголосити константу в C++?',
        options: ['var x = 5', 'const int x = 5', 'final int x = 5', 'int const = 5'],
        correct: 1,
        explanation: 'Ключове слово const перед типом робить змінну незмінною.',
      },
    ],
  },

  {
    id: 'quiz_conditions_loops',
    title: 'Умови та цикли',
    level: 'beginner',
    icon: '🔄',
    xp: 120,
    questions: [
      {
        question: 'Яка умова перевіряє рівність двох значень?',
        options: ['=', '==', '===', '!='],
        correct: 1,
        explanation: '== перевіряє рівність. Один = є оператором присвоєння!',
      },
      {
        question: 'Скільки разів виконається: for(int i=0; i<5; i++) ?',
        options: ['4', '5', '6', '0'],
        correct: 1,
        explanation: 'i = 0,1,2,3,4 — це 5 ітерацій (від 0 до 4 включно).',
      },
      {
        question: 'Що таке нескінченний цикл?',
        options: [
          'Цикл, що виконується 1000 разів',
          'Цикл, умова якого ніколи не стає false',
          'Цикл з оператором break',
          'Цикл без тіла',
        ],
        correct: 1,
        explanation: 'Нескінченний цикл — умова завжди true, виконується до примусового зупинки.',
      },
      {
        question: 'Який оператор виходить з циклу достроково?',
        options: ['exit', 'stop', 'break', 'continue'],
        correct: 2,
        explanation: 'break повністю виходить з циклу. continue — пропускає поточну ітерацію.',
      },
      {
        question: 'Відповідь: int x = 7; cout << x % 3;',
        options: ['2', '1', '3', '0'],
        correct: 1,
        explanation: '7 % 3 = 1 (остача від ділення 7 на 3).',
      },
    ],
  },

  {
    id: 'quiz_oop_basics',
    title: 'ООП: Основи',
    level: 'oop',
    icon: '🏛️',
    xp: 150,
    questions: [
      {
        question: 'Що таке клас у C++?',
        options: [
          'Функція що виконується',
          'Шаблон для створення обʼєктів з полями та методами',
          'Тип даних int',
          'Масив обʼєктів',
        ],
        correct: 1,
        explanation: 'Клас — це шаблон (опис), обʼєкт — конкретний екземпляр цього шаблону.',
      },
      {
        question: 'Який модифікатор доступу приховує дані від зовнішнього коду?',
        options: ['public', 'external', 'private', 'hidden'],
        correct: 2,
        explanation: 'private — члени класу доступні лише всередині класу. Це основа інкапсуляції.',
      },
      {
        question: 'Що таке конструктор?',
        options: [
          'Метод що видаляє обʼєкт',
          'Метод що автоматично викликається при створенні обʼєкта',
          'Функція main()',
          'Метод що копіює обʼєкт',
        ],
        correct: 1,
        explanation: 'Конструктор ініціалізує обʼєкт при його створенні. Має ту ж назву, що й клас.',
      },
      {
        question: 'Синтаксис успадкування в C++?',
        options: [
          'class B extends A {}',
          'class B inherits A {}',
          'class B : public A {}',
          'class B(A) {}',
        ],
        correct: 2,
        explanation: 'У C++ успадкування: class Підклас : public Базовий {}',
      },
      {
        question: 'Для чого призначений virtual?',
        options: [
          'Для захисту змінної',
          'Для визначення поліморфних методів',
          'Для створення обʼєкта',
          'Для статичних методів',
        ],
        correct: 1,
        explanation: 'virtual дозволяє перевизначати метод у підкласах і використовувати поліморфізм.',
      },
      {
        question: 'Що таке абстрактний клас?',
        options: [
          'Клас без полів',
          'Клас з хоча б одним чисто віртуальним методом (= 0)',
          'Клас з приватними полями',
          'Клас що не можна успадковувати',
        ],
        correct: 1,
        explanation: 'Абстрактний клас має метод virtual void foo() = 0; Не можна створити обʼєкт такого класу.',
      },
    ],
  },

  {
    id: 'quiz_pointers',
    title: 'Покажчики та памʼять',
    level: 'intermediate',
    icon: '👆',
    xp: 130,
    questions: [
      {
        question: 'Що зберігає покажчик?',
        options: ['Значення змінної', 'Адресу в памʼяті', 'Тип даних', 'Розмір обʼєкта'],
        correct: 1,
        explanation: 'Покажчик зберігає адресу памʼяті, де знаходиться значення.',
      },
      {
        question: 'Що робить оператор &?',
        options: ['Логічне "та"', 'Бінарне "та"', 'Отримує адресу змінної', 'Розіменовує покажчик'],
        correct: 2,
        explanation: '& є оператором адреси: int* ptr = &x; — ptr отримує адресу x.',
      },
      {
        question: 'Як звільнити пам\'ять виділену для масиву через new?',
        options: ['delete ptr', 'free(ptr)', 'delete[] ptr', 'remove ptr'],
        correct: 2,
        explanation: 'Для масивів (new[]) обов\'язково використовуйте delete[] а не просто delete!',
      },
      {
        question: 'Що таке nullptr?',
        options: [
          'Завжди 0',
          'Безпечний нульовий покажчик в C++11+',
          'Пустий рядок',
          'Помилка компілятора',
        ],
        correct: 1,
        explanation: 'nullptr — безпечніший аналог NULL в C++, чітко означає "нікуди не вказує".',
      },
    ],
  },

  {
    id: 'quiz_stl',
    title: 'STL та Алгоритми',
    level: 'advanced',
    icon: '⚡',
    xp: 180,
    questions: [
      {
        question: 'Який контейнер STL є динамічним масивом?',
        options: ['list', 'map', 'vector', 'set'],
        correct: 2,
        explanation: 'vector<T> — динамічний масив з прямим доступом за індексом. Найпоширеніший контейнер.',
      },
      {
        question: 'Що зберігає std::map?',
        options: ['Лише ключі', 'Лише значення', 'Пари ключ-значення', 'Набір унікальних чисел'],
        correct: 2,
        explanation: 'map<K,V> зберігає пари ключ→значення, відсортовані за ключем.',
      },
      {
        question: 'Яка функція STL сортує контейнер?',
        options: ['order()', 'arrange()', 'sort()', 'organize()'],
        correct: 2,
        explanation: 'std::sort(begin, end) сортує елементи у діапазоні [begin, end).',
      },
      {
        question: 'Що робить push_back?',
        options: ['Видаляє перший елемент', 'Додає елемент в кінець', 'Сортує вектор', 'Повертає останній елемент'],
        correct: 1,
        explanation: 'push_back() додає новий елемент в кінець вектора, збільшуючи його розмір.',
      },
    ],
  },
];
