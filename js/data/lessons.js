/* js/data/lessons.js — Контент уроків (розширений) */
/* Відео: українські YouTube-канали (Школа програмування, Викладач, SimpleCode UA) */

window.LESSONS_DATA = [

  // ====================== ПОЧАТКІВЕЦЬ ======================
  {
    id: 'intro',
    title: 'Вступ до C++',
    level: 'beginner',
    xp: 10,
    levelLabel: 'Початківець',
    icon: '🚀',
    videos: [{ id: 'Lo1UKhw52ig', title: 'Уроки C++ для початківців / #1 – Введення в мову C++ з нуля ...' }, { id: '1ekpbC1E6TY', title: 'Вступ до мови програмування C++' }],
    explanation: `<h3>Що таке C++?</h3>
<p>C++ — це потужна мова програмування загального призначення, створена Б'єрном Страуструпом у 1979 році як розширення мови C.</p>
<h3>Де використовується C++?</h3>
<ul>
  <li>🎮 Ігрова індустрія (Unreal Engine)</li>
  <li>🖥️ Системне програмування (ОС, драйвери)</li>
  <li>🤖 Вбудовані системи та IoT</li>
  <li>💰 Фінансові системи</li>
  <li>🔬 Наукові обчислення</li>
</ul>
<h3>Ваша перша програма</h3>
<p>Традиційно перша програма виводить "Hello, World!".</p>`,
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Привіт, Світ!" << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>#include &lt;iostream&gt;</code> — підключає бібліотеку вводу/виводу.',
      '<code>using namespace std;</code> — дозволяє не писати <code>std::</code>.',
      '<code>int main()</code> — головна функція програми.',
      '<code>cout &lt;&lt;</code> — виводить текст на екран.',
      '<code>return 0;</code> — програма завершилась успішно.',
    ],
    practiceTask: 'Напишіть програму, яка виводить ваше ім\'я та місто.',
    expectedOutput: 'Іван\\nКиїв',
    hint: 'Використайте два оператори cout з endl між ними.',
  },

  {
    id: 'variables',
    title: 'Змінні та типи даних',
    level: 'beginner',
    xp: 10,
    levelLabel: 'Початківець',
    icon: '📦',
    videos: [{ id: '5MgT9H-y1ZU', title: 'Уроки C++ для початківців / #3 – Змінні та типи даних' }, { id: 'mnJN8Rtt5A4', title: '#3 Примітивні типи даних' }],
    explanation: `<h3>Що таке змінна?</h3>
<p>Змінна — це іменована область пам'яті для зберігання даних. У C++ кожна змінна має тип.</p>
<h3>Основні типи</h3>
<ul>
  <li><code>int</code> — ціле число</li>
  <li><code>double</code> — дробове число</li>
  <li><code>char</code> — один символ</li>
  <li><code>bool</code> — true/false</li>
  <li><code>string</code> — рядок тексту</li>
</ul>`,
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int age = 20;
    double height = 1.75;
    char grade = 'A';
    bool isStudent = true;
    string name = "Олександр";

    cout << "Ім'я: " << name << endl;
    cout << "Вік: " << age << endl;
    cout << "Зріст: " << height << " м" << endl;
    return 0;
}`,
    codeExplanation: [
      'Кожна змінна оголошується як: <code>тип назва = значення;</code>',
      '<code>int</code> зберігає цілі числа.',
      '<code>double</code> зберігає числа з плаваючою крапкою.',
      '<code>string</code> зберігає текст у подвійних лапках.',
    ],
    practiceTask: 'Створіть змінні: ім\'я (string), вік (int), бал (double). Виведіть їх.',
    expectedOutput: 'Марія\\n19\\n4.75',
    hint: 'Не забудьте #include <string>',
  },

  {
    id: 'input_output',
    title: 'Ввід та вивід',
    level: 'beginner',
    xp: 10,
    levelLabel: 'Початківець',
    icon: '⌨️',
    videos: [{ id: 'ZY1yzZWYaC4', title: 'Програмування на C++ (2.5). cin/cout - ввід та вивід' }, { id: 'hbbhtChFM2Y', title: 'Ввод и вывод в C++. Cin, Cout. Одинокий программист. #2 выпу...' }],
    explanation: `<h3>Ввід з клавіатури</h3>
<p>Оператор <code>cin >></code> дозволяє зчитувати дані від користувача. Для рядків з пробілами використовуйте <code>getline()</code>.</p>
<h3>Форматований вивід</h3>
<p>Для красивого виводу використовуйте маніпулятори: <code>endl</code>, <code>setw()</code>, <code>fixed</code>, <code>setprecision()</code>.</p>`,
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;

    cout << "Як вас звати? ";
    getline(cin, name);

    cout << "Скільки вам років? ";
    cin >> age;

    cout << "Привіт, " << name << "!" << endl;
    cout << "Через 10 років вам буде " << age + 10 << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>cin >> змінна</code> зчитує дані до пробілу.',
      '<code>getline(cin, str)</code> зчитує весь рядок.',
      'Можна комбінувати текст і змінні через <code>&lt;&lt;</code>.',
    ],
    practiceTask: 'Напишіть програму що запитує два числа і виводить їх суму.',
    expectedOutput: '15',
    hint: 'cin >> a >> b; cout << a + b;',
  },

  {
    id: 'conditions',
    title: 'Умовні оператори',
    level: 'beginner',
    xp: 15,
    levelLabel: 'Початківець',
    icon: '🔀',
    videos: [{ id: 'TSj_CSb24fw', title: 'Уроки C++ для початківців / #4 - Умовні конструкції. Операто...' }, { id: 'RSwPodWzoI4', title: 'Реалізація розгалужень в мові С++. Оператор if ... else. Тер...' }],
    explanation: `<h3>Умовні оператори (if / else)</h3>
<p>Дозволяють програмі приймати рішення залежно від умов.</p>
<h3>Оператори порівняння</h3>
<ul>
  <li><code>==</code> рівно, <code>!=</code> не рівно</li>
  <li><code>&gt;</code> більше, <code>&lt;</code> менше</li>
  <li><code>&gt;=</code> більше або рівно, <code>&lt;=</code> менше або рівно</li>
</ul>`,
    code: `#include <iostream>
using namespace std;

int main() {
    int score;
    cout << "Введіть оцінку (1-100): ";
    cin >> score;

    if (score >= 90) {
        cout << "Відмінно!" << endl;
    } else if (score >= 75) {
        cout << "Добре!" << endl;
    } else if (score >= 60) {
        cout << "Задовільно" << endl;
    } else {
        cout << "Потрібно більше практики" << endl;
    }
    return 0;
}`,
    codeExplanation: [
      '<code>if (умова)</code> виконує блок, якщо умова true.',
      '<code>else if</code> перевіряє наступну умову.',
      '<code>else</code> виконується, якщо жодна умова не спрацювала.',
    ],
    practiceTask: 'Напишіть програму, яка виводить: "Парне" або "Непарне" для числа.',
    expectedOutput: 'Парне',
    hint: 'Якщо число % 2 == 0 — парне.',
  },

  {
    id: 'loops',
    title: 'Цикли (for, while)',
    level: 'beginner',
    xp: 15,
    levelLabel: 'Початківець',
    icon: '🔄',
    videos: [{ id: 'LYIPTmN37SU', title: 'Уроки C++ для початківців / #6 - Цикли та оператори в них (F...' }, { id: 'q8sVk4QYuOo', title: 'Цикли For, Foreach, While, Do While | Для початківців | Укра...' }],
    explanation: `<h3>Навіщо потрібні цикли?</h3>
<p>Цикли дозволяють виконувати блок коду багаторазово.</p>
<h3>Типи циклів</h3>
<ul>
  <li><code>for</code> — коли кількість повторень відома</li>
  <li><code>while</code> — поки виконується умова</li>
  <li><code>do-while</code> — хоча б один раз</li>
</ul>`,
    code: `#include <iostream>
using namespace std;

int main() {
    // Цикл FOR
    for (int i = 1; i <= 5; i++) {
        cout << i << " ";
    }
    cout << endl;

    // Цикл WHILE
    int n = 5;
    while (n > 0) {
        cout << n << "... ";
        n--;
    }
    cout << "Пуск!" << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>for (ініц.; умова; крок)</code> — три частини.',
      '<code>i++</code> збільшує i на 1.',
      '<code>while (умова)</code> продовжується поки умова true.',
    ],
    practiceTask: 'Виведіть суму чисел від 1 до 100.',
    expectedOutput: '5050',
    hint: 'sum = 0; у циклі: sum += i;',
  },

  {
    id: 'functions',
    title: 'Функції',
    level: 'beginner',
    xp: 15,
    levelLabel: 'Початківець',
    icon: '⚙️',
    videos: [{ id: 'VKQ242d-Rag', title: 'Уроки C++ для початківців / #10 – Створення функцій у мові C...' }, { id: 'q3GPKxRsgsM', title: 'Уроки C++ для початківців / #17 – Вбудовані функції C++' }],
    explanation: `<h3>Що таке функція?</h3>
<p>Функція — це іменований блок коду для виконання певної задачі. Переваги: повторне використання, чистота коду, легше знаходити помилки.</p>`,
    code: `#include <iostream>
using namespace std;

int sum(int a, int b) {
    return a + b;
}

double circleArea(double radius) {
    return 3.14159 * radius * radius;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << sum(5, 3) << endl;
    cout << circleArea(5.0) << endl;
    cout << factorial(5) << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>return</code> повертає значення і завершує функцію.',
      'Параметри вказуються у дужках через кому.',
      'Рекурсія — функція викликає сама себе.',
    ],
    practiceTask: 'Напишіть функцію max(a, b), яка повертає більше число.',
    expectedOutput: '10',
    hint: 'Використайте if-else або тернарний оператор.',
  },

  // ====================== СЕРЕДНІЙ ======================
  {
    id: 'arrays',
    title: 'Масиви та рядки',
    level: 'beginner',
    xp: 20,
    levelLabel: 'Початківець',
    icon: '📊',
    videos: [{ id: 'LXsUHdsDWW4', title: 'Уроки C++ для початківців / #7 – Масиви даних (одновимірні т...' }, { id: 'T9B4aq2Id4g', title: 'C++ ⦁ Вирішуємо практичні завдання Масиви' }],
    explanation: `<h3>Масиви</h3>
<p>Масив — це колекція елементів одного типу. Індексація з 0.</p>
<h3>Рядки</h3>
<p><code>string</code> підтримує методи: <code>length()</code>, <code>substr()</code>, <code>find()</code>.</p>`,
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int scores[5] = {90, 85, 78, 92, 88};

    int maxScore = scores[0];
    for (int i = 1; i < 5; i++) {
        if (scores[i] > maxScore) maxScore = scores[i];
    }
    cout << "Max: " << maxScore << endl;

    string word = "Programming";
    cout << "Length: " << word.length() << endl;
    return 0;
}`,
    codeExplanation: [
      'Масив: <code>тип назва[розмір]</code>.',
      'Індекси: від 0 до розмір-1.',
      '<code>length()</code> повертає кількість символів.',
    ],
    practiceTask: 'Створіть масив з 5 чисел. Знайдіть суму та середнє.',
    expectedOutput: '35\\n7',
    hint: 'Сума в циклі, середнє = сума / 5.',
  },

  {
    id: 'pointers',
    title: 'Покажчики (Pointers)',
    level: 'intermediate',
    xp: 25,
    levelLabel: 'Середній',
    icon: '👉',
    videos: [{ id: '6GEzlpDxaos', title: 'C++ ⦁ Урок 10 ⦁ Покажчики' }, { id: 'KOIP1JaZZKY', title: 'Покажчики у мові С++ | C++ pointer | CCode 6' }],
    explanation: `<h3>Покажчик</h3>
<p>Покажчик зберігає <strong>адресу в пам'яті</strong> іншої змінної.</p>
<ul>
  <li><code>&</code> — оператор адреси</li>
  <li><code>*</code> — оператор розіменування</li>
</ul>`,
    code: `#include <iostream>
using namespace std;

int main() {
    int x = 42;
    int* ptr = &x;

    cout << "Value: " << x << endl;
    cout << "Address: " << &x << endl;
    cout << "*ptr: " << *ptr << endl;

    *ptr = 100;
    cout << "x now: " << x << endl;

    int* safe = nullptr;
    if (safe == nullptr) {
        cout << "Null pointer" << endl;
    }
    return 0;
}`,
    codeExplanation: [
      '<code>int* ptr</code> — оголошення покажчика.',
      '<code>&x</code> — адреса змінної.',
      '<code>*ptr</code> — значення за адресою.',
      '<code>nullptr</code> — безпечний нульовий покажчик.',
    ],
    practiceTask: 'Напишіть функцію swap через покажчики.',
    expectedOutput: 'a=20, b=10',
    hint: 'void swap(int* a, int* b) з temp змінною.',
  },

  {
    id: 'dynamic_memory',
    title: "Динамічна пам'ять",
    level: 'intermediate',
    xp: 25,
    levelLabel: 'Середній',
    icon: '🧠',
    videos: [{ id: 'd0jHHhSZ6Yc', title: '#24 Динамічна пам\'ять. Оператори new та delete' }, { id: 'KHK5bMp6vbo', title: 'C++ ⦁ Урок 11 ⦁ Поняття стека і динамічної пам\'яті' }],
    explanation: `<h3>Heap vs Stack</h3>
<p><strong>Stack</strong> — автоматична пам'ять. <strong>Heap</strong> — динамічна, яку ми керуємо самі.</p>
<ul>
  <li><code>new</code> — виділяє пам'ять</li>
  <li><code>delete</code> — звільняє пам'ять</li>
</ul>
<p>⚠️ Не звільняти = витік пам'яті!</p>`,
    code: `#include <iostream>
using namespace std;

int main() {
    int* ptr = new int(25);
    cout << *ptr << endl;
    delete ptr;
    ptr = nullptr;

    int size = 5;
    int* arr = new int[size];
    for (int i = 0; i < size; i++) arr[i] = (i+1) * 10;
    for (int i = 0; i < size; i++) cout << arr[i] << " ";
    cout << endl;

    delete[] arr;
    arr = nullptr;
    return 0;
}`,
    codeExplanation: [
      '<code>new int(25)</code> — виділяє і присвоює 25.',
      '<code>delete ptr</code> — звільняє один об\'єкт.',
      '<code>delete[] arr</code> — для масивів обов\'язково [].',
    ],
    practiceTask: 'Виділіть масив з 3 чисел, знайдіть суму.',
    expectedOutput: '60',
    hint: 'new int[3], заповніть 10,20,30, підсумуйте.',
  },

  {
    id: 'file_io',
    title: 'Робота з файлами',
    level: 'intermediate',
    xp: 30,
    levelLabel: 'Середній',
    icon: '📁',
    videos: [{ id: 'eBBjRdCE4KA', title: 'C++ ⦁ Урок 15 ⦁ Використання файлової системи - ifstream' }, { id: 'o7XT7cTChXE', title: 'Уроки C++ для початківців / #13 – Робота з файлами за допомо...' }],
    explanation: `<h3>Файловий ввід/вивід</h3>
<p>C++ використовує потоки <code>ifstream</code> (читання) та <code>ofstream</code> (запис) з бібліотеки <code>&lt;fstream&gt;</code>.</p>`,
    code: `#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    // Запис у файл
    ofstream out("test.txt");
    out << "Hello from C++!" << endl;
    out << "Line 2" << endl;
    out.close();

    // Читання з файлу
    ifstream in("test.txt");
    string line;
    while (getline(in, line)) {
        cout << line << endl;
    }
    in.close();
    return 0;
}`,
    codeExplanation: [
      '<code>ofstream</code> — потік для запису у файл.',
      '<code>ifstream</code> — потік для читання.',
      '<code>getline()</code> зчитує рядок цілком.',
      'Завжди закривайте файл: <code>.close()</code>.',
    ],
    practiceTask: 'Запишіть 3 рядки у файл і прочитайте їх назад.',
    expectedOutput: 'Рядок 1\\nРядок 2\\nРядок 3',
    hint: 'ofstream для запису, ifstream + getline для читання.',
  },

  {
    id: 'recursion',
    title: 'Рекурсія',
    level: 'intermediate',
    xp: 30,
    levelLabel: 'Середній',
    icon: '🪆',
    videos: [{ id: 'Doue2y4K6wY', title: '#22 Рекурсія' }, { id: 'xqVYIkYwqUc', title: 'C++ рекурсія' }],
    explanation: `<h3>Що таке рекурсія?</h3>
<p>Рекурсія — це коли функція викликає сама себе. Кожна рекурсивна функція має <strong>базовий випадок</strong> (коли зупинитись) і <strong>рекурсивний крок</strong>.</p>`,
    code: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n-1) + fibonacci(n-2);
}

void countdown(int n) {
    if (n <= 0) { cout << "Go!" << endl; return; }
    cout << n << "... ";
    countdown(n - 1);
}

int main() {
    for (int i = 0; i < 8; i++)
        cout << fibonacci(i) << " ";
    cout << endl;
    countdown(5);
    return 0;
}`,
    codeExplanation: [
      'Базовий випадок зупиняє рекурсію.',
      'Fibonacci: F(n) = F(n-1) + F(n-2).',
      'Без базового випадку — нескінченна рекурсія!',
    ],
    practiceTask: 'Напишіть рекурсивну функцію степеня: power(base, exp).',
    expectedOutput: '8',
    hint: 'power(2,3) = 2 * power(2,2). Base: exp==0 → return 1.',
  },

  // ====================== ООП ======================
  {
    id: 'classes',
    title: "Класи та Об'єкти",
    level: 'oop',
    xp: 40,
    levelLabel: 'ООП',
    icon: '🏛️',
    videos: [{ id: '25IUjI8Bf5k', title: 'Уроки C++ для початківців / #19 – Створення класів та об\'єкт...' }, { id: 'VaaMEQSQx8I', title: '1. С++ Українською  Класи та об\'єкти' }],
    explanation: `<h3>ООП</h3>
<p>ООП організує код навколо <strong>об'єктів</strong>. Клас — шаблон, об'єкт — екземпляр класу.</p>
<ul>
  <li>📊 <strong>Поля</strong> — дані об'єкта</li>
  <li>⚙️ <strong>Методи</strong> — поведінка об'єкта</li>
</ul>`,
    code: `#include <iostream>
#include <string>
using namespace std;

class Student {
public:
    string name;
    int age;
    double gpa;

    void showInfo() {
        cout << "Student: " << name << endl;
        cout << "Age: " << age << ", GPA: " << gpa << endl;
    }

    bool isExcellent() { return gpa >= 4.5; }
};

int main() {
    Student s1;
    s1.name = "Maria";
    s1.age = 20;
    s1.gpa = 4.8;
    s1.showInfo();
    if (s1.isExcellent()) cout << "Excellent!" << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>class</code> — ключове слово для класу.',
      '<code>public:</code> — доступ ззовні.',
      'Об\'єкт створюється: <code>Student s1;</code>',
      'Доступ через крапку: <code>s1.name</code>',
    ],
    practiceTask: 'Створіть клас "Автомобіль" з марка, рік, швидкість.',
    expectedOutput: 'Toyota\\n2022\\n150',
    hint: 'class Car { public: string brand; int year; int speed; };',
  },

  {
    id: 'constructors',
    title: 'Конструктори та Деструктори',
    level: 'oop',
    xp: 40,
    levelLabel: 'ООП',
    icon: '🏗️',
    videos: [{ id: 'lC2iJy1qIYw', title: 'Уроки C++ для початківців / #20 – Конструктори, деструктори ...' }, { id: 'm7g_bPM8ee8', title: 'C++ ⦁ Урок 17 ⦁  Конструктор Деструктор, спискова ініціаліза...' }],
    explanation: `<h3>Конструктор</h3>
<p>Автоматично викликається при створенні об'єкта. Ініціалізує поля.</p>
<h3>Деструктор</h3>
<p>Автоматично викликається при знищенні. Звільняє ресурси. Синтаксис: <code>~ClassName()</code>.</p>`,
    code: `#include <iostream>
#include <string>
using namespace std;

class Book {
public:
    string title, author;
    int year;

    Book() : title("Unknown"), author("N/A"), year(2024) {
        cout << "Book created!" << endl;
    }

    Book(string t, string a, int y) : title(t), author(a), year(y) {
        cout << "Book '" << title << "' added!" << endl;
    }

    ~Book() { cout << "Book '" << title << "' destroyed" << endl; }

    void show() { cout << title << " | " << author << " | " << year << endl; }
};

int main() {
    Book b1;
    b1.show();
    Book b2("Kobzar", "T. Shevchenko", 1840);
    b2.show();
    return 0;
}`,
    codeExplanation: [
      'Конструктор має ту ж назву що й клас.',
      'Список ініціалізації через двокрапку.',
      'Можна мати кілька конструкторів (перевантаження).',
    ],
    practiceTask: 'Створіть клас BankAccount з конструктором(owner, balance).',
    expectedOutput: 'Ivan: 1000',
    hint: 'class BankAccount { public: BankAccount(string o, double b) {...} };',
  },

  {
    id: 'encapsulation',
    title: 'Інкапсуляція',
    level: 'oop',
    xp: 40,
    levelLabel: 'ООП',
    icon: '🛡️',
    videos: [{ id: '25IUjI8Bf5k', title: 'Уроки C++ для початківців / #19 – Створення класів та об\'єкт...' }, { id: 'uReH0dDW568', title: 'C++ інкапсуляція' }],
    explanation: `<h3>Інкапсуляція</h3>
<p>Приховання деталей реалізації. Доступ лише через публічний інтерфейс.</p>
<ul>
  <li><code>public</code> — доступно звідусіль</li>
  <li><code>private</code> — тільки всередині класу</li>
  <li><code>protected</code> — в класі та підкласах</li>
</ul>`,
    code: `#include <iostream>
#include <string>
using namespace std;

class BankAccount {
private:
    string owner;
    double balance;

public:
    BankAccount(string o, double b) : owner(o), balance(b) {}

    double getBalance() { return balance; }
    string getOwner() { return owner; }

    void deposit(double amount) {
        if (amount <= 0) { cout << "Invalid amount" << endl; return; }
        balance += amount;
        cout << "Deposited " << amount << endl;
    }

    bool withdraw(double amount) {
        if (amount > balance) { cout << "Insufficient funds" << endl; return false; }
        balance -= amount;
        return true;
    }
};

int main() {
    BankAccount acc("Olena", 5000);
    acc.deposit(1000);
    acc.withdraw(500);
    cout << "Balance: " << acc.getBalance() << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>private</code> поля недоступні ззовні.',
      'Геттери дозволяють читати дані.',
      'Сеттери дозволяють змінювати з валідацією.',
    ],
    practiceTask: 'Додайте метод changePassword з перевіркою старого.',
    expectedOutput: 'Password changed',
    hint: 'Перевірте старий пароль, потім присвойте новий.',
  },

  {
    id: 'inheritance',
    title: 'Успадкування',
    level: 'oop',
    xp: 50,
    levelLabel: 'ООП',
    icon: '🧬',
    videos: [{ id: '5fIuUPUG4jI', title: 'ООП (частина 4). Успадкування' }, { id: 'ijGbhqleWFU', title: 'ООП 2023.10.20. Успадкування та поліморфізм в C++.' }],
    explanation: `<h3>Успадкування</h3>
<p>Створення нового класу на основі існуючого. Підклас отримує всі властивості батьківського.</p>
<p>Синтаксис: <code>class Child : public Parent { };</code></p>`,
    code: `#include <iostream>
#include <string>
using namespace std;

class Animal {
protected:
    string name;
    int age;
public:
    Animal(string n, int a) : name(n), age(a) {}
    void breathe() { cout << name << " breathes" << endl; }
    virtual void speak() { cout << "..." << endl; }
};

class Dog : public Animal {
    string breed;
public:
    Dog(string n, int a, string b) : Animal(n, a), breed(b) {}
    void speak() override { cout << name << ": Woof!" << endl; }
};

class Cat : public Animal {
public:
    Cat(string n, int a) : Animal(n, a) {}
    void speak() override { cout << name << ": Meow!" << endl; }
};

int main() {
    Dog d("Rex", 3, "Shepherd");
    Cat c("Murka", 2);
    d.breathe();
    d.speak();
    c.speak();
    return 0;
}`,
    codeExplanation: [
      '<code>: public Animal</code> — успадковує від Animal.',
      '<code>protected</code> доступно у підкласах.',
      '<code>override</code> — перевизначення методу.',
      '<code>virtual</code> — дозволяє поліморфізм.',
    ],
    practiceTask: 'Створіть Transport, Car, Motorcycle з методом move().',
    expectedOutput: 'Car moves\\nMotorcycle moves',
    hint: 'class Car : public Transport { void move() override {...} };',
  },

  {
    id: 'polymorphism',
    title: 'Поліморфізм',
    level: 'oop',
    xp: 50,
    levelLabel: 'ООП',
    icon: '🎭',
    videos: [{ id: '3m_-pT6uBWs', title: '#55 Поліморфізм та Віртуальні функції' }, { id: 'UEXn_7e6Q90', title: 'Поліморфізм, віртуальні методи та абстрактний клас | C++ ООП...' }],
    explanation: `<h3>Поліморфізм</h3>
<p>Здатність об'єктів різних класів мати однакові методи з різною реалізацією.</p>
<ul>
  <li>🔄 Компільований — перевантаження функцій</li>
  <li>🏃 Виконуваний — через virtual та покажчики</li>
</ul>`,
    code: `#include <iostream>
#include <vector>
using namespace std;

class Shape {
public:
    virtual double area() = 0;
    virtual string name() = 0;
    virtual void print() {
        cout << name() << ": area = " << area() << endl;
    }
    virtual ~Shape() {}
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() override { return 3.14159 * r * r; }
    string name() override { return "Circle"; }
};

class Rect : public Shape {
    double w, h;
public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() override { return w * h; }
    string name() override { return "Rectangle"; }
};

int main() {
    vector<Shape*> shapes;
    shapes.push_back(new Circle(5));
    shapes.push_back(new Rect(4, 6));

    for (Shape* s : shapes) s->print();
    for (Shape* s : shapes) delete s;
    return 0;
}`,
    codeExplanation: [
      '<code>virtual ... = 0</code> — чисто віртуальний (абстрактний).',
      'Покажчик <code>Shape*</code> може вказувати на підклас.',
      'При виклику виконується потрібна версія методу.',
    ],
    practiceTask: 'Додайте клас Square до ієрархії з area().',
    expectedOutput: 'Square: area = 25',
    hint: 'class Square : public Shape { double side; ... };',
  },

  {
    id: 'operator_overloading',
    title: 'Перевантаження операторів',
    level: 'oop',
    xp: 50,
    levelLabel: 'ООП',
    icon: '➕',
    videos: [{ id: '3yYFear-5HA', title: 'C++ ⦁ Урок 19 ⦁ Перевантаження операторів' }, { id: 'SkxOfIdkKrg', title: '#44 Перевантаження операторів' }],
    explanation: `<h3>Перевантаження операторів</h3>
<p>Визначає як стандартні оператори (<code>+</code>, <code>-</code>, <code>==</code>, <code>&lt;&lt;</code>) працюють з вашими класами.</p>`,
    code: `#include <iostream>
using namespace std;

class Vector2D {
public:
    double x, y;
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}

    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(x + other.x, y + other.y);
    }

    bool operator==(const Vector2D& other) const {
        return x == other.x && y == other.y;
    }

    friend ostream& operator<<(ostream& os, const Vector2D& v) {
        os << "(" << v.x << ", " << v.y << ")";
        return os;
    }
};

int main() {
    Vector2D v1(3, 4), v2(1, 2);
    Vector2D sum = v1 + v2;
    cout << "Sum: " << sum << endl;
    cout << "Equal: " << (v1 == v2 ? "yes" : "no") << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>operator+</code> — перевантаження додавання.',
      '<code>const</code> в кінці — метод не змінює об\'єкт.',
      '<code>friend</code> дає доступ до приватних полів.',
    ],
    practiceTask: 'Перевантажте оператор -= для Vector2D.',
    expectedOutput: '(2, 2)',
    hint: 'Vector2D& operator-=(const Vector2D& o) { x -= o.x; y -= o.y; return *this; }',
  },

  {
    id: 'abstraction',
    title: 'Абстракція',
    level: 'oop',
    xp: 50,
    levelLabel: 'ООП',
    icon: '☁️',
    videos: [{ id: 'RzQKuz-k2PI', title: 'С++ Повний курс ООП | C++ Для Початківців ООП' }],
    explanation: `<h3>Абстракція</h3>
<p>Абстракція — приховання складності, показуючи лише необхідний інтерфейс. Абстрактний клас має хоча б один чисто віртуальний метод (<code>= 0</code>).</p>`,
    code: `#include <iostream>
using namespace std;

class Printable {
public:
    virtual void print() const = 0;
    virtual ~Printable() {}
};

class Report : public Printable {
    string title;
    int pages;
public:
    Report(string t, int p) : title(t), pages(p) {}
    void print() const override {
        cout << "Report: " << title << " (" << pages << " pages)" << endl;
    }
};

class Invoice : public Printable {
    double amount;
public:
    Invoice(double a) : amount(a) {}
    void print() const override {
        cout << "Invoice: $" << amount << endl;
    }
};

int main() {
    Report r("Annual", 50);
    Invoice inv(1500.00);
    r.print();
    inv.print();
    return 0;
}`,
    codeExplanation: [
      'Абстрактний клас не можна створити напряму.',
      'Підкласи ЗОБОВ\'ЯЗАНІ реалізувати чисто віртуальні методи.',
      'Це забезпечує єдиний інтерфейс.',
    ],
    practiceTask: 'Створіть абстрактний клас Drawable з методом draw().',
    expectedOutput: 'Drawing circle\\nDrawing square',
    hint: 'class Drawable { virtual void draw() = 0; };',
  },

  // ====================== ПРОСУНУТИЙ ======================
  {
    id: 'stl_vectors',
    title: 'STL: vector та map',
    level: 'advanced',
    xp: 60,
    levelLabel: 'Просунутий',
    icon: '📦',
    videos: [{ id: 'Lo1UKhw52ig', title: 'Основи C++ Українською' }],
    explanation: `<h3>STL — Стандартна бібліотека шаблонів</h3>
<ul>
  <li><code>vector</code> — динамічний масив</li>
  <li><code>map</code> — словник ключ→значення</li>
  <li><code>set</code> — унікальні елементи</li>
</ul>`,
    code: `#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
using namespace std;

int main() {
    vector<int> nums = {5, 3, 8, 1, 9, 2};
    nums.push_back(7);
    sort(nums.begin(), nums.end());
    for (int n : nums) cout << n << " ";
    cout << endl;

    map<string, int> scores;
    scores["Maria"] = 95;
    scores["Ivan"] = 82;
    for (auto& [name, score] : scores) {
        cout << name << ": " << score << endl;
    }
    return 0;
}`,
    codeExplanation: [
      '<code>vector&lt;int&gt;</code> — вектор цілих.',
      '<code>push_back()</code> додає в кінець.',
      '<code>sort()</code> сортує контейнер.',
      '<code>auto& [key, val]</code> — C++17 structured binding.',
    ],
    practiceTask: 'Створіть vector з 5 імен, відсортуйте та виведіть.',
    expectedOutput: 'Anna\\nIvan\\nMaria\\nOleg\\nSofia',
    hint: 'vector<string> names = {...}; sort(...);',
  },

  {
    id: 'stl_set_queue', title: 'STL: set, queue, stack', level: 'advanced', levelLabel: 'Просунутий',
    icon: '🗂️', xp: 180, videoId: '8GYHAr2C-cM',
    explanation: `<h3>Інші контейнери STL</h3>
<ul>
  <li><code>set</code> — зберігає унікальні відсортовані елементи</li>
  <li><code>queue</code> — черга FIFO (перший зайшов — перший вийшов)</li>
  <li><code>stack</code> — стек LIFO (останній зайшов — перший вийшов)</li>
</ul>`,
    code: `#include <iostream>
#include <set>
#include <queue>
#include <stack>
using namespace std;

int main() {
    set<int> s = {3, 1, 4, 1, 5, 9, 2, 6, 5};
    cout << "Set: ";
    for (int x : s) cout << x << " ";
    cout << endl;

    queue<string> q;
    q.push("First"); q.push("Second"); q.push("Third");
    while (!q.empty()) {
        cout << q.front() << " ";
        q.pop();
    }
    cout << endl;

    stack<int> st;
    st.push(10); st.push(20); st.push(30);
    while (!st.empty()) {
        cout << st.top() << " ";
        st.pop();
    }
    cout << endl;
    return 0;
}`,
    codeExplanation: [
      '<code>set</code> автоматично видаляє дублікати.',
      '<code>queue</code>: push/front/pop.',
      '<code>stack</code>: push/top/pop.',
    ],
    practiceTask: 'Використайте set для видалення дублікатів з масиву.',
    expectedOutput: '1 2 3 4 5',
    hint: 'set<int> s(arr, arr+n); for(int x : s) cout << x;',
  },

  {
    id: 'templates', title: 'Шаблони (Templates)', level: 'advanced', levelLabel: 'Просунутий',
    icon: '📐', xp: 200, videoId: 'sVA0AAnvyMQ',
    explanation: `<h3>Шаблони</h3>
<p>Шаблони дозволяють писати узагальнений код, який працює з будь-яким типом даних. Це основа generic programming.</p>`,
    code: `#include <iostream>
#include <string>
using namespace std;

template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

template <typename T>
void printArray(T arr[], int size) {
    for (int i = 0; i < size; i++)
        cout << arr[i] << " ";
    cout << endl;
}

int main() {
    cout << maxOf(10, 20) << endl;
    cout << maxOf(3.14, 2.71) << endl;
    cout << maxOf(string("abc"), string("xyz")) << endl;

    int nums[] = {1, 2, 3, 4, 5};
    printArray(nums, 5);
    return 0;
}`,
    codeExplanation: [
      '<code>template &lt;typename T&gt;</code> — оголошення шаблону.',
      'T замінюється потрібним типом при виклику.',
      'Працює з int, double, string тощо.',
    ],
    practiceTask: 'Напишіть шаблонну функцію swap<T>(a, b).',
    expectedOutput: '20 10',
    hint: 'template<typename T> void mySwap(T& a, T& b) { T temp = a; ... }',
  },

  {
    id: 'algorithms', title: 'Базові алгоритми', level: 'advanced', levelLabel: 'Просунутий',
    icon: '🧮', xp: 220, videoId: 'sVA0AAnvyMQ',
    explanation: `<h3>Алгоритми сортування та пошуку</h3>
<p>Розуміння алгоритмів — ключова навичка. Основні: лінійний пошук, бінарний пошук, сортування бульбашкою.</p>`,
    code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Бінарний пошук
int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> data = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int pos = binarySearch(data, 23);
    if (pos != -1)
        cout << "Found at index " << pos << endl;
    else
        cout << "Not found" << endl;
    return 0;
}`,
    codeExplanation: [
      'Бінарний пошук працює тільки на відсортованих даних.',
      'Складність: O(log n) vs O(n) для лінійного.',
      'Ділимо масив навпіл кожну ітерацію.',
    ],
    practiceTask: 'Реалізуйте сортування бульбашкою для масиву.',
    expectedOutput: '1 2 3 4 5',
    hint: 'Два вкладені цикли, порівнюємо сусідні елементи.',
  },

  {
    id: 'time_complexity', title: 'Часова складність', level: 'advanced', levelLabel: 'Просунутий',
    icon: '⏱️', xp: 200, videoId: 'j9UVp67JfGk',
    explanation: `<h3>Big-O нотація</h3>
<p>Показує як зростає час виконання зі збільшенням вхідних даних.</p>
<ul>
  <li><code>O(1)</code> — константний час</li>
  <li><code>O(log n)</code> — логарифмічний</li>
  <li><code>O(n)</code> — лінійний</li>
  <li><code>O(n log n)</code> — ефективне сортування</li>
  <li><code>O(n²)</code> — квадратичний (вкладені цикли)</li>
</ul>`,
    code: `#include <iostream>
#include <vector>
#include <chrono>
using namespace std;

// O(1) - константний
int getFirst(vector<int>& v) { return v[0]; }

// O(n) - лінійний
int linearSearch(vector<int>& v, int target) {
    for (int i = 0; i < v.size(); i++)
        if (v[i] == target) return i;
    return -1;
}

// O(n^2) - квадратичний
void bubbleSort(vector<int>& v) {
    for (int i = 0; i < v.size(); i++)
        for (int j = 0; j < v.size()-i-1; j++)
            if (v[j] > v[j+1]) swap(v[j], v[j+1]);
}

int main() {
    vector<int> data = {5, 2, 8, 1, 9};
    bubbleSort(data);
    for (int x : data) cout << x << " ";
    cout << endl;
    return 0;
}`,
    codeExplanation: [
      'O(1) — масив[0], незалежно від розміру.',
      'O(n) — один цикл по всіх елементах.',
      'O(n²) — два вкладені цикли.',
      'std::sort() має складність O(n log n).',
    ],
    practiceTask: 'Порівняйте час лінійного та бінарного пошуку.',
    expectedOutput: 'Linear: found\\nBinary: found',
    hint: 'Використайте chrono для вимірювання часу.',
  },

  {
    id: 'smart_pointers', title: 'Розумні покажчики', level: 'advanced', levelLabel: 'Просунутий',
    icon: '🎯', xp: 220, videoId: 'G0yUhiIlnT4',
    explanation: `<h3>Smart Pointers (C++11)</h3>
<p>Автоматично звільняють пам'ять. Забудьте про витоки!</p>
<ul>
  <li><code>unique_ptr</code> — єдиний власник</li>
  <li><code>shared_ptr</code> — спільне володіння</li>
  <li><code>weak_ptr</code> — слабке посилання</li>
</ul>`,
    code: `#include <iostream>
#include <memory>
using namespace std;

class Resource {
    string name;
public:
    Resource(string n) : name(n) { cout << name << " created" << endl; }
    ~Resource() { cout << name << " destroyed" << endl; }
    void use() { cout << "Using " << name << endl; }
};

int main() {
    // unique_ptr - єдиний власник
    auto ptr1 = make_unique<Resource>("UniqueRes");
    ptr1->use();

    // shared_ptr - спільне володіння
    auto ptr2 = make_shared<Resource>("SharedRes");
    auto ptr3 = ptr2;  // Обидва вказують на одне
    cout << "Count: " << ptr2.use_count() << endl;

    return 0;
    // Пам'ять звільняється автоматично!
}`,
    codeExplanation: [
      '<code>make_unique</code> створює unique_ptr.',
      '<code>make_shared</code> створює shared_ptr.',
      'Пам\'ять звільняється при виході зі scope.',
      '<code>use_count()</code> — кількість shared власників.',
    ],
    practiceTask: 'Створіть unique_ptr на масив та виведіть елементи.',
    expectedOutput: '10 20 30',
    hint: 'auto arr = make_unique<int[]>(3); arr[0] = 10; ...',
  },
];
