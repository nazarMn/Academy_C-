const fs = require('fs');
const path = require('path');
const Lesson = require('../models/lesson.model');
const Project = require('../models/project.model');
const Course = require('../models/language.model');
const Quiz = require('../models/quiz.model');
const Practice = require('../models/practice.model');
const { logger } = require('./logger');

async function seedDatabase() {
  try {
    const lessonCount = await Lesson.countDocuments();
    if (lessonCount === 0) {
      logger.info('Seeding', 'MongoDB is empty. Migrating local JSON files to MongoDB...');
      // 2. Lessons (Academic)
      const lessonsDir = path.join(__dirname, '../../data/lessons');
      if (fs.existsSync(lessonsDir)) {
        const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json'));
        const academicLessons = [];
        
        const defaultStarters = {
          intro: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Привіт, Світ!" << endl;\n    return 0;\n}`,
          variables: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int age = 20;\n    double height = 1.75;\n    string name = "Студент";\n\n    cout << "Ім'я: " << name << endl;\n    cout << "Вік: " << age << endl;\n    return 0;\n}`,
          input_output: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`
        };

        const genericStarter = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    \n    return 0;\n}`;

        for (const file of files) {
           const raw = fs.readFileSync(path.join(lessonsDir, file), 'utf8');
           const data = JSON.parse(raw);
           academicLessons.push({
             ...data,
             type: 'academic',
             courseId: 'cpp',
             // Map some JSON fields if needed
             content: data.explanation || '', // We might inject here later
             starterCode: data.starterCode || defaultStarters[data.id] || genericStarter
           });
        }
        await Lesson.insertMany(academicLessons);
        logger.info('Seeding', `Migrated ${academicLessons.length} academic lessons.`);
      }

      // 3. Lessons (Interactive)
      const interactiveDir = path.join(__dirname, '../../data/interactive');
      if (fs.existsSync(interactiveDir)) {
        const files = fs.readdirSync(interactiveDir).filter(f => f.endsWith('.json'));
        const interactiveLessons = [];
        for (const file of files) {
           const raw = fs.readFileSync(path.join(interactiveDir, file), 'utf8');
           const data = JSON.parse(raw);
           
           // Convert legacy errorPatterns to new templates schema
           const mappedTemplates = data.errorPatterns ? data.errorPatterns.map(ep => ({
             code: ep.match || '',
             errorType: 'pattern',
             solution: ep.hint || ''
           })) : [];

           interactiveLessons.push({
             ...data,
             type: 'interactive',
             courseId: 'cpp',
             // Explicitly map legacy fields to our unified schema
             explanation: data.scenario || data.explanation || '',
             practiceTask: data.task || data.practiceTask || '',
             hints: data.hints || [],
             brokenCode: data.brokenCode || '',
             solution: data.solution || '',
             templates: mappedTemplates
           });
        }
        await Lesson.insertMany(interactiveLessons);
        logger.info('Seeding', `Migrated ${interactiveLessons.length} interactive lessons.`);
      }

      // 4. Projects
      const projectsDir = path.join(__dirname, '../../data/projects');
      if (fs.existsSync(projectsDir)) {
        const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
        const parsedProjects = [];
        for (const file of files) {
           const raw = fs.readFileSync(path.join(projectsDir, file), 'utf8');
           const data = JSON.parse(raw);
           data.courseId = 'cpp';
           delete data.language;
           parsedProjects.push(data);
        }
        await Project.insertMany(parsedProjects);
        logger.info('Seeding', `Migrated ${parsedProjects.length} projects.`);
      }

      logger.info('Seeding', 'Database Migration Complete! 🎉');
    }

    // 5. Quizzes — seed from JSON files if empty
    const quizCount = await Quiz.countDocuments();
    if (quizCount === 0) {
      const quizzesDir = path.join(__dirname, '../../data/quizzes');
      if (fs.existsSync(quizzesDir)) {
        const files = fs.readdirSync(quizzesDir).filter(f => f.endsWith('.json'));
        const quizzes = [];
        for (const file of files) {
          const raw = fs.readFileSync(path.join(quizzesDir, file), 'utf8');
          const data = JSON.parse(raw);
          quizzes.push({
            id: data.id,
            title: data.title,
            courseId: 'cpp',
            level: data.level || 'beginner',
            xp: data.xp || 30,
            order: data.order || 0,
            // Map legacy fields: question→q, options→opts
            questions: (data.questions || []).map(q => ({
              q: q.question || q.q || '',
              opts: q.options || q.opts || [],
              correct: q.correct ?? 0
            }))
          });
        }
        await Quiz.insertMany(quizzes);
        logger.info('Seeding', `Migrated ${quizzes.length} quizzes from JSON.`);
      }
    }

    // 6. Practice tasks — seed hardcoded data if empty
    const practiceCount = await Practice.countDocuments();
    if (practiceCount === 0) {
      const practiceTasks = [
        { id: 'p1', title: 'Hello World', courseId: 'cpp', difficulty: 'easy', xp: 15, order: 0, desc: 'Виведіть "Hello, World!" на екран', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    return 0;\n}' },
        { id: 'p2', title: 'Сума двох чисел', courseId: 'cpp', difficulty: 'easy', xp: 15, order: 1, desc: 'Зчитайте два числа та виведіть їхню суму', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // Виведіть суму\n    return 0;\n}' },
        { id: 'p3', title: 'Парне чи непарне', courseId: 'cpp', difficulty: 'easy', xp: 20, order: 2, desc: 'Визначте, чи є число парним', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Визначте парність\n    return 0;\n}' },
        { id: 'p4', title: 'Максимум з трьох', courseId: 'cpp', difficulty: 'easy', xp: 20, order: 3, desc: 'Знайдіть найбільше з трьох чисел', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    // Знайдіть максимум\n    return 0;\n}' },
        { id: 'p5', title: 'Факторіал', courseId: 'cpp', difficulty: 'medium', xp: 30, order: 4, desc: 'Обчисліть факторіал числа n', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Обчисліть n!\n    return 0;\n}' },
        { id: 'p6', title: 'Числа Фібоначчі', courseId: 'cpp', difficulty: 'medium', xp: 30, order: 5, desc: 'Виведіть перші n чисел Фібоначчі', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Виведіть числа Фібоначчі\n    return 0;\n}' },
        { id: 'p7', title: 'Реверс рядка', courseId: 'cpp', difficulty: 'medium', xp: 35, order: 6, desc: 'Розверніть введений рядок', starter: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Розверніть рядок\n    return 0;\n}' },
        { id: 'p8', title: 'Сортування масиву', courseId: 'cpp', difficulty: 'medium', xp: 35, order: 7, desc: 'Відсортуйте масив бульбашковим методом', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {5, 3, 8, 1, 9, 2};\n    int n = 6;\n    // Сортуйте масив\n    return 0;\n}' },
        { id: 'p9', title: 'Простий калькулятор', courseId: 'cpp', difficulty: 'hard', xp: 40, order: 8, desc: 'Створіть калькулятор +, -, *, / з обробкою помилок', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    double a, b;\n    char op;\n    cin >> a >> op >> b;\n    // Реалізуйте калькулятор\n    return 0;\n}' },
        { id: 'p10', title: 'Пошук паліндрому', courseId: 'cpp', difficulty: 'hard', xp: 40, order: 9, desc: 'Визначте чи є рядок паліндромом', starter: '#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isPalindrome(const string& s) {\n    // Реалізуйте перевірку\n    return false;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << (isPalindrome(s) ? "Yes" : "No");\n    return 0;\n}' },
        { id: 'p11', title: 'Матричне множення', courseId: 'cpp', difficulty: 'hard', xp: 50, order: 10, desc: 'Помножте дві матриці 3×3', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a[3][3], b[3][3], c[3][3];\n    // Зчитайте та помножте\n    return 0;\n}' },
        { id: 'p12', title: "Зв'язаний список", courseId: 'cpp', difficulty: 'hard', xp: 50, order: 11, desc: "Реалізуйте однозв'язний список з операціями", starter: '#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* next;\n};\n\nint main() {\n    // Реалізуйте операції\n    return 0;\n}' },
      ];
      await Practice.insertMany(practiceTasks);
      logger.info('Seeding', `Seeded ${practiceTasks.length} practice tasks.`);
    }

    // 7. Courses — seed if empty
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany([
        { id: 'cpp', name: 'C++', icon: '⚡', description: 'Системне програмування, ігри, високопродуктивні застосунки', category: 'programming', color: '#6366f1', enabled: true, comingSoon: false, order: 0 },
        { id: 'c', name: 'C', icon: '🔧', description: 'Низькорівневе програмування, ОС, вбудовані системи', category: 'programming', color: '#3b82f6', enabled: true, comingSoon: false, order: 1 },
        { id: 'python', name: 'Python', icon: '🐍', description: 'Аналіз даних, ML, автоматизація, веб', category: 'programming', color: '#eab308', enabled: false, comingSoon: true, order: 2 },
        { id: 'javascript', name: 'JavaScript', icon: '🌐', description: 'Веб-розробка, фронтенд та бекенд', category: 'programming', color: '#f59e0b', enabled: false, comingSoon: true, order: 3 },
        { id: 'marketing', name: 'Маркетинг', icon: '📈', description: 'Основи маркетингу, SMM, аналітика', category: 'business', color: '#ec4899', enabled: false, comingSoon: true, order: 4 },
        { id: 'economics', name: 'Економіка', icon: '💰', description: 'Мікро- та макроекономіка, фінанси', category: 'humanities', color: '#14b8a6', enabled: false, comingSoon: true, order: 5 },
      ]);
      logger.info('Seeding', 'Seeded 6 courses.');
    }
  } catch (error) {
    logger.error('Seeding', `Failed to seed database: ${error.message}`);
  }
}

module.exports = { seedDatabase };

