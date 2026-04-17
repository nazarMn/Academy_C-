const QUIZZES_DATA = [
  {
    id: 'quiz-basics',
    title: 'Основи C++',
    level: 'beginner',
    xp: 30,
    questions: 5,
    desc: 'Перевірте знання основ: змінні, типи, ввід/вивід',
  },
  {
    id: 'quiz-conditions',
    title: 'Умовні оператори',
    level: 'beginner',
    xp: 30,
    questions: 5,
    desc: 'if-else, switch, тернарний оператор',
  },
  {
    id: 'quiz-loops',
    title: 'Цикли та масиви',
    level: 'beginner',
    xp: 35,
    questions: 6,
    desc: 'for, while, масиви, рядки',
  },
  {
    id: 'quiz-pointers',
    title: 'Покажчики та пам\'ять',
    level: 'intermediate',
    xp: 40,
    questions: 6,
    desc: 'Покажчики, динамічна пам\'ять, new/delete',
  },
  {
    id: 'quiz-oop',
    title: 'ООП Основи',
    level: 'oop',
    xp: 45,
    questions: 7,
    desc: 'Класи, спадкування, поліморфізм',
  },
  {
    id: 'quiz-advanced',
    title: 'Просунутий C++',
    level: 'advanced',
    xp: 50,
    questions: 8,
    desc: 'Шаблони, STL, розумні покажчики',
  },
];

export default QUIZZES_DATA;
