import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '/Users/marinabulah/Desktop/diploma/server/.env' });

import { module6 } from './server/prisma/seeds/module6';
import { module7 } from './server/prisma/seeds/module7';
import { module8 } from './server/prisma/seeds/module8';
import { module9 } from './server/prisma/seeds/module9';
import { module10 } from './server/prisma/seeds/module10';
import { module11 } from './server/prisma/seeds/module11';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────── THEORY CONTENT ───────────

const M1_THEORY = `## Змінні та Типи Даних

У мові C++ ми використовуємо різні типи для зберігання даних. Тип визначає, які операції можна виконувати з даними та скільки місця вони займають у пам'яті.

[CARDS]
int|Цілі числа (наприклад, 5, -10, 0)
double|Дробові числа (3.14, -0.01, 2.0)
char|Одиночні символи ('A', '!', '5')
long long|Великі цілі числа (до ±9 × 10¹⁸)
bool|Логічні значення (true або false)
float|Дробові числа з меншою точністю
[/CARDS]

## Оголошення та ініціалізація

Змінну необхідно оголосити перед використанням. Завжди ініціалізуйте її значенням — інакше вона може містити "сміття" з пам'яті.

\`\`\`cpp
int age = 20;
double price = 99.99;
char grade = 'A';
bool isOnline = true;
long long bigNumber = 9000000000LL;
\`\`\`

## Введення та виведення даних

Для зчитування даних з клавіатури та виводу результатів у С++ використовуються потоки з бібліотеки \`<iostream>\`.

\`\`\`cpp
#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;          // Зчитуємо два числа
    double result = a + b;
    std::cout << result << std::endl;
    return 0;
}
\`\`\`

> **Pro Tip: Форматування виводу**
> Для виводу чисел з певною кількістю знаків після коми використовуйте \`std::fixed\` та \`std::setprecision\`. Не забудьте підключити бібліотеку \`<iomanip>\`.

## Приклад обчислення виразу

\`\`\`cpp
#include <iostream>
#include <iomanip>

int main() {
    double a = 5.5;
    double b = 2.0;

    double sum = a + b;   // Результат буде 7.5

    std::cout << std::fixed << std::setprecision(2) << sum;
    return 0;
}
\`\`\`

## Арифметичні операції та пріоритет

C++ підтримує стандартні математичні операції. Множення і ділення виконуються до додавання і віднімання.

\`\`\`cpp
int a = 10, b = 3;

int quotient = a / b;     // 3  (ціле ділення!)
int remainder = a % b;    // 1  (остача)

// Щоб отримати дробовий результат — перетворіть в double:
double exact = (double)a / b;   // 3.333...
\`\`\`

> **Важливо!**
> Ніколи не діліть цілі числа, якщо очікуєте дробовий результат. Перетворіть хоча б один операнд у \`double\` за допомогою \`(double)a\`.

## Константи

Якщо значення не повинне змінюватися, використовуйте \`const\`. Це захищає від випадкових помилок.

\`\`\`cpp
const double PI = 3.14159265;
const int MAX_SIZE = 100;

// PI = 3.0;  // ПОМИЛКА компіляції!
\`\`\``;


// ─────────────────────────────────────

const M2_THEORY = `## Оператор if / else

Умовний оператор дозволяє виконувати різний код залежно від умови. Умова — це будь-який вираз, що повертає \`true\` або \`false\`.

\`\`\`cpp
int age = 18;

if (age >= 18) {
    std::cout << "Доступ дозволено";
} else {
    std::cout << "Доступ заборонено";
}
\`\`\`

## Ланцюжок else if

Для перевірки кількох взаємовиключних умов використовується \`else if\`. Виконується перша гілка, умова якої є істиною.

\`\`\`cpp
int score = 75;

if (score >= 90) {
    std::cout << "Відмінно";
} else if (score >= 75) {
    std::cout << "Добре";
} else if (score >= 60) {
    std::cout << "Задовільно";
} else {
    std::cout << "Незадовільно";
}
\`\`\`

## Логічні оператори

Умови можна комбінувати за допомогою логічних операторів:

[CARDS]
&&|І (AND) — обидві умови мають бути true
|||АБО (OR) — хоча б одна умова true
!|НЕ (NOT) — інвертує значення умови
[/CARDS]

\`\`\`cpp
int a = 5, b = -3;

if (a > 0 && b > 0) {
    std::cout << "Обидва позитивні";
} else if (a > 0 || b > 0) {
    std::cout << "Хоча б одне позитивне";
} else {
    std::cout << "Обидва від'ємні або нулі";
}
\`\`\`

> Оператор \`&&\` перевіряє другу умову лише якщо перша є \`true\`. Оператор \`||\` перевіряє другу лише якщо перша є \`false\`. Це називається **коротке замикання (short-circuit evaluation)**.

## Оператор switch

Якщо потрібно порівняти одну змінну з кількома конкретними значеннями, \`switch\` читається набагато зрозуміліше, ніж \`if/else if\`.

\`\`\`cpp
int day = 3;

switch (day) {
    case 1: std::cout << "Понеділок"; break;
    case 2: std::cout << "Вівторок"; break;
    case 3: std::cout << "Середа"; break;
    case 4: std::cout << "Четвер"; break;
    case 5: std::cout << "П'ятниця"; break;
    default: std::cout << "Вихідний";
}
\`\`\`

> Не забувайте про \`break\`! Без нього виконання "провалюється" у наступний \`case\`. Це може бути корисно, але частіше це помилка.

## Тернарний оператор

Компактний запис простого \`if/else\` — тернарний оператор \`? :\`:

\`\`\`cpp
int a = 10, b = 20;
int max = (a > b) ? a : b;   // max = 20

std::cout << "Більше: " << max;
\`\`\`

## Порівняння операторів

\`\`\`cpp
int x = 5;

x == 5   // true  — дорівнює
x != 5   // false — не дорівнює
x > 3    // true  — більше
x < 3    // false — менше
x >= 5   // true  — більше або дорівнює
x <= 4   // false — менше або дорівнює
\`\`\`

> Найпоширеніша помилка початківців — написати \`if (x = 5)\` замість \`if (x == 5)\`. Перший вираз є **присвоєнням** і завжди буде \`true\` (якщо 5 != 0).

## Повний приклад: класифікація числа

\`\`\`cpp
#include <iostream>

int main() {
    int n;
    std::cin >> n;

    if (n > 0) {
        if (n % 2 == 0) {
            std::cout << "Додатне парне";
        } else {
            std::cout << "Додатне непарне";
        }
    } else if (n < 0) {
        std::cout << "Від'ємне";
    } else {
        std::cout << "Нуль";
    }
    return 0;
}
\`\`\``;

// ─────────────────────────────────────

const M3_THEORY = `## Навіщо потрібні цикли?

Уявіть, що вам треба вивести числа від 1 до 1000. Писати 1000 рядків \`cout\` — нераціонально. Цикли дозволяють **повторювати** блок коду потрібну кількість разів.

C++ містить три види циклів:

[CARDS]
for|Коли кількість ітерацій відома заздалегідь (for i = 0; i < n)
while|Коли умова перевіряється до входу в цикл
do-while|Тіло виконується хоча б один раз (умова перевіряється після)
[/CARDS]

## Цикл for

Цикл \`for\` використовується, коли кількість ітерацій відома заздалегідь. Він складається з трьох частин: ініціалізація, умова продовження, крок.

\`\`\`cpp
// Вивести числа від 1 до 10
for (int i = 1; i <= 10; i++) {
    std::cout << i << " ";
}
// Виведе: 1 2 3 4 5 6 7 8 9 10
\`\`\`

> Змінна \`i\` оголошена всередині \`for\` — вона існує лише всередині циклу. Намагайтеся завжди оголошувати лічильник безпосередньо у циклі.

## Цикл while

Цикл \`while\` виконується, доки умова є \`true\`. Він зручний, коли кількість ітерацій заздалегідь невідома.

\`\`\`cpp
int n = 1;
while (n <= 5) {
    std::cout << n * n << " ";  // Квадрати чисел
    n++;
}
// Виведе: 1 4 9 16 25
\`\`\`

## Цикл do-while

На відміну від \`while\`, тіло циклу \`do-while\` виконується **хоча б один раз**, навіть якщо умова одразу хибна.

\`\`\`cpp
int n;
do {
    std::cout << "Введіть число > 0: ";
    std::cin >> n;
} while (n <= 0);

std::cout << "Ви ввели: " << n;
\`\`\`

## Оператори break та continue

- **\`break\`** — негайно виходить із циклу
- **\`continue\`** — переходить до наступної ітерації, пропускаючи залишок тіла

\`\`\`cpp
// Знайти перше число більше 50, кратне 7
for (int i = 1; i <= 100; i++) {
    if (i <= 50) continue;   // Пропускаємо числа до 50
    if (i % 7 == 0) {
        std::cout << i;      // 56
        break;               // Зупиняємо пошук
    }
}
\`\`\`

> Надмірне використання \`break\` і \`continue\` ускладнює читання коду. Намагайтеся будувати умову циклу так, щоб обходитися без них.

## Вкладені цикли

Цикли можна вкладати один в одного. Вкладений цикл виконується повністю для **кожної** ітерації зовнішнього.

\`\`\`cpp
// Таблиця множення 3 на 3
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        std::cout << i * j << "\t";
    }
    std::cout << std::endl;
}
// 1  2  3
// 2  4  6
// 3  6  9
\`\`\`

## Накопичення суми

Один з найпоширеніших патернів: **акумулятор**. Ми ініціалізуємо змінну нулем і додаємо до неї в кожній ітерації.

\`\`\`cpp
#include <iostream>

int main() {
    int n;
    std::cin >> n;

    long long sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;   // sum = sum + i
    }

    std::cout << sum;
    return 0;
}
\`\`\`

## Підрахунок максимуму/мінімуму

\`\`\`cpp
#include <iostream>
#include <climits>

int main() {
    int n;
    std::cin >> n;

    int maxVal = INT_MIN;   // Найменше можливе int
    for (int i = 0; i < n; i++) {
        int x;
        std::cin >> x;
        if (x > maxVal) maxVal = x;
    }

    std::cout << "Максимум: " << maxVal;
    return 0;
}
\`\`\`

> \`INT_MIN\` та \`INT_MAX\` з бібліотеки \`<climits>\` — зручні константи для ініціалізації змінних пошуку максимуму/мінімуму. Не використовуйте магічні числа на кшталт \`-999999\`.`;

// ─────────────────────────────────────

const M4_THEORY = `## Рекурентні формули

**Рекурентне співвідношення** — це формула, де кожен наступний член послідовності обчислюється через попередні. Класичний приклад — числа Фібоначчі:

\`F(n) = F(n-1) + F(n-2)\`, де \`F(1) = F(2) = 1\`

\`\`\`cpp
// Перші N чисел Фібоначчі
int a = 1, b = 1;
for (int i = 3; i <= n; i++) {
    int c = a + b;
    a = b;
    b = c;
}
\`\`\`

## Степеневі ряди

Багато математичних функцій можна обчислити через нескінченну суму — **степеневий ряд**. Наприклад, число \`e^x\`:

Степеневі ряди використовуються для обчислення:

[CARDS]
e^x|Сума 1 + x + x²/2! + x³/3! + ... (число Евлера)
sin(x)|x - x³/3! + x⁵/5! - ... (синус)
cos(x)|1 - x²/2! + x⁴/4! - ... (косинус)
ln(1+x)|x - x²/2 + x³/3 - ... (натуральний логарифм)
[/CARDS]

\`e^x = 1 + x + x²/2! + x³/3! + x⁴/4! + ...\`

На практиці ми підсумовуємо не нескінченно, а до досягнення **заданої точності** ε:

\`\`\`cpp
#include <iostream>
#include <iomanip>
#include <cmath>

int main() {
    double x;
    int n;
    std::cin >> x >> n;

    double sum  = 1.0;   // Перший член = 1
    double term = 1.0;   // Поточний член

    for (int i = 1; i <= n; i++) {
        term *= x / i;   // Рекурентна формула: term_i = term_{i-1} * x/i
        sum  += term;
    }

    std::cout << std::fixed << std::setprecision(6) << sum;
    return 0;
}
\`\`\`

> Замість обчислення \`x^i / i!\` наново щоразу, ми використовуємо рекурентну формулу \`term_i = term_{i-1} * x / i\`. Це набагато ефективніше!

## Зупинка за точністю (epsilon)

Якщо потрібна точність, а не фіксована кількість членів, зупиняємось коли черговий член стає меншим за ε:

\`\`\`cpp
const double EPS = 1e-7;
double sum  = 1.0, term = 1.0;
int    i    = 1;

while (std::abs(term) > EPS) {
    term *= x / i;
    sum  += term;
    i++;
}
\`\`\`

## Обчислення факторіалу

Факторіал \`n! = 1 × 2 × 3 × ... × n\` — найпростіший приклад накопиченого добутку.

| n | n! |
|---|----|
| 0 | 1 |
| 1 | 1 |
| 5 | 120 |
| 10 | 3 628 800 |

\`\`\`cpp
long long factorial(int n) {
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
\`\`\`

> Для \`n > 20\` значення не поміщається навіть у \`long long\`. У таких задачах використовується бібліотека для великих чисел або \`double\` (втрачаючи точність).

## Ланцюгові дроби

**Ланцюговий дріб** — вираз виду:
\`a₀ + 1 / (a₁ + 1 / (a₂ + 1 / (...)))\`

Обчислення ведеться **знизу вгору** — від останнього рівня до першого:

\`\`\`cpp
#include <iostream>

int main() {
    int n;
    std::cin >> n;

    double result = 0.0;
    // Обчислюємо знизу вгору
    for (int i = n; i >= 1; i--) {
        result = 1.0 / (i + result);
    }

    std::cout << result;
    return 0;
}
\`\`\`

> Ключовий момент: цикл іде **у зворотньому напрямку** — від n до 1. Це єдиний спосіб коректно розгорнути вкладений дріб.`;

// ─────────────────────────────────────

const M5_THEORY = `## Що таке рекурсія?

**Рекурсія** — це техніка програмування, при якій функція викликає **саму себе**. Кожен виклик вирішує меншу підзадачу. 

Кожна рекурсивна функція обов'язково має:
1. **Базовий випадок** — умова зупинки (без неї — нескінченна рекурсія та переповнення стеку!)
2. **Рекурсивний крок** — виклик себе зі спрощеним аргументом

Найчастіше рекурсію застосовують для:

[CARDS]
Факторіал|вичислення n! = n × (n-1)!
Фібоначчі|вичислення F(n) = F(n-1) + F(n-2)
Степінь|вичислення a^n = a × a^(n-1)
Графи/дерева|обхід вузлів та ребер структур
[/CARDS]

##Класичний приклад: факторіал

\`n! = n × (n-1)!\`, де \`0! = 1\` (базовий випадок)

\`\`\`cpp
long long factorial(int n) {
    // Базовий випадок
    if (n <= 1) return 1;

    // Рекурсивний крок
    return n * factorial(n - 1);
}

int main() {
    std::cout << factorial(5);  // 120
    return 0;
}
\`\`\`

При виклику \`factorial(5)\` відбувається:
- \`factorial(5)\` → \`5 × factorial(4)\`
- \`factorial(4)\` → \`4 × factorial(3)\`
- \`factorial(3)\` → \`3 × factorial(2)\`
- \`factorial(2)\` → \`2 × factorial(1)\`
- \`factorial(1)\` → **1** (базовий випадок!)

## Стек викликів

Кожен виклик функції займає місце на **стеку** — спеціальній ділянці пам'яті. Якщо рекурсія занадто глибока, стек переповнюється: **Stack Overflow**.

\`\`\`cpp
// НЕБЕЗПЕЧНО: нескінченна рекурсія
int infinite(int n) {
    return infinite(n - 1);  // Базового випадку немає!
}
\`\`\`

> Перш ніж писати рекурсивну функцію, запитайте себе: на якому значенні аргументу вона має зупинитися? Це і є базовий випадок.

## Числа Фібоначчі рекурсивно

\`\`\`cpp
int fib(int n) {
    if (n <= 1) return n;   // fib(0) = 0, fib(1) = 1
    return fib(n - 1) + fib(n - 2);
}
\`\`\`

> Наївна рекурсія Фібоначчі дуже повільна — вона рахує одні й ті ж значення багато разів. Для великих \`n\` використовуйте ітеративний підхід або **мемоізацію**.

## Рекурсивний степінь

\`a^n = a × a^(n-1)\`, де \`a^0 = 1\`

\`\`\`cpp
long long power(int a, int n) {
    if (n == 0) return 1;          // Базовий випадок
    return a * power(a, n - 1);    // Рекурсивний крок
}
\`\`\`

Оптимізована версія — **швидке піднесення до степеня**: \`a^n = (a^(n/2))²\`

\`\`\`cpp
long long fastPower(long long a, int n) {
    if (n == 0) return 1;
    if (n % 2 == 0) {
        long long half = fastPower(a, n / 2);
        return half * half;
    }
    return a * fastPower(a, n - 1);
}
\`\`\`

> Швидке піднесення до степеня виконується за \`O(log n)\` кроків замість \`O(n)\`. Для великих степенів різниця колосальна.

## Ханойська вежа

Класична задача рекурсії. Маємо 3 стержні та \`n\` дисків. Задача — перемістити всі диски з першого стержня на третій, не кладучи більший диск на менший.

\`\`\`cpp
void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);  // Перемістити n-1 дисків
    std::cout << from << " -> " << to << std::endl;
    hanoi(n - 1, aux, to, from);  // Перемістити n-1 дисків назад
}

int main() {
    hanoi(3, 'A', 'C', 'B');
    return 0;
}
\`\`\`

Для \`n\` дисків потрібно рівно \`2^n - 1\` переміщень.

## Рекурсія vs ітерація

| Критерій | Рекурсія | Ітерація |
|----------|----------|----------|
| Читабельність | Часто краща | Буває складніша |
| Швидкість | Повільніша (накладні виклики) | Швидша |
| Пам'ять | Стек обмежений | Не обмежена |
| Застосування | Дерева, граф, розбиття | Прості підрахунки |

> Рекурсія — потужний інструмент. Але якщо задачу легко вирішити циклом — краще обрати цикл. Завжди думайте про переповнення стеку для великих \`n\`.`;

// ─────────────────────────────────────

async function main() {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

    // Clear existing data
    try {
        await prisma.progress.deleteMany();
        await prisma.submission.deleteMany();
        await prisma.lesson.deleteMany();
        await prisma.module.deleteMany();
        await prisma.course.deleteMany();
    } catch (err: any) {
        console.log('Error during clearing (might be empty):', err.message);
    }

    // Course: Laboratory Practice
    await prisma.course.create({
        data: {
            title: 'Лабораторний практикум з С++',
            slug: 'cpp-lab-practice',
            description: 'Покрокове керівництво з виконання лабораторних робіт та освоєння мови C++.',
            published: true,
            modules: {
                create: [
                    // ─────── MODULE 1 ───────
                    {
                        title: '1. Типи даних та I/O. Обчислення виразів',
                        orderIndex: 1,
                        description: 'Основи роботи зі змінними, введенням-виведенням та пріоритетом операцій.',
                        lessons: {
                            create: [
                                {
                                    title: 'Теорія: Змінні та Типи',
                                    slug: 'm1-theory',
                                    orderIndex: 1,
                                    type: 'THEORY',
                                    difficulty: 'BASIC',
                                    content: M1_THEORY,
                                },
                                {
                                    title: 'Квіз: Типи та операції',
                                    slug: 'm1-quiz',
                                    orderIndex: 2,
                                    type: 'QUIZ',
                                    difficulty: 'BASIC',
                                    content: JSON.stringify({
                                        questions: [
                                            {
                                                question: "Який тип даних використовується для цілих чисел у C++?",
                                                options: ["double", "int", "char", "bool"],
                                                correctAnswer: 1,
                                                hint: "Цей тип названий на честь слова 'integer' (ціле число)."
                                            },
                                            {
                                                question: "Яка бібліотека потрібна для std::fixed та std::setprecision?",
                                                options: ["iostream", "cmath", "iomanip", "string"],
                                                correctAnswer: 2,
                                                hint: "Ця бібліотека відповідає за маніпулятори введення та виведення (input/output manipulation)."
                                            },
                                            {
                                                question: "Що виведе даний фрагмент коду C++ на екран?",
                                                options: ["2.5", "2", "1", "5"],
                                                correctAnswer: 2,
                                                hint: "Оператор % в мові C++ називається 'modulo' (залишок від ділення). Він повертає цілочисельний залишок після ділення першого числа на друге.",
                                                code: '#include <iostream>\n\nint main() {\n    int x = 5;\n    int y = 2;\n    std::cout << x % y << std::endl;\n    return 0;\n}'
                                            },
                                            {
                                                question: "Яка операція повертає остачу від ділення?",
                                                options: ["/", "%", "//", "mod"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Скільки байт займає тип double?",
                                                options: ["4", "2", "8", "1"],
                                                correctAnswer: 2
                                            }
                                        ]
                                    })
                                },
                                {
                                    title: 'Базовий: Обчислення формули',
                                    slug: 'm1-p-basic',
                                    orderIndex: 3,
                                    type: 'PRACTICE',
                                    difficulty: 'BASIC',
                                    content: 'Зчитайте два дробових числа x та y. Обчисліть `z = x + y - 2`. Виведіть результат з 2 знаками після коми.',
                                    initialCode: '#include <iostream>\n#include <iomanip>\n\nint main() {\n    double x, y;\n    std::cin >> x >> y;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '5.5 2.5', output: '6.00' }, { input: '10.0 5.0', output: '13.00' }]
                                },
                                {
                                    title: 'Стандартний: Площа трикутника',
                                    slug: 'm1-p-standard',
                                    orderIndex: 4,
                                    type: 'PRACTICE',
                                    difficulty: 'STANDARD',
                                    content: 'Зчитайте основу `b` і висоту `h` трикутника. Виведіть площу `S = b * h / 2` з 2 знаками після коми.',
                                    initialCode: '#include <iostream>\n#include <iomanip>\n\nint main() {\n    double b, h;\n    std::cin >> b >> h;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '6.0 4.0', output: '12.00' }, { input: '3.0 8.0', output: '12.00' }]
                                },
                                {
                                    title: 'Просунутий: Конвертер температур',
                                    slug: 'm1-p-advanced',
                                    orderIndex: 5,
                                    type: 'PRACTICE',
                                    difficulty: 'ADVANCED',
                                    content: 'Зчитайте температуру в Цельсіях. Виведіть її в Фаренгейтах (`F = C*9/5 + 32`) та Кельвінах (`K = C + 273.15`) — кожне значення на новому рядку з 2 знаками після коми.',
                                    initialCode: '#include <iostream>\n#include <iomanip>\n\nint main() {\n    double c;\n    std::cin >> c;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '100', output: '212.00\n373.15' }, { input: '0', output: '32.00\n273.15' }]
                                }
                            ]
                        }
                    },
                    // ─────── MODULE 2 ───────
                    {
                        title: '2. Розгалужені обчислювальні процеси',
                        orderIndex: 2,
                        description: 'Умовні оператори та складна логіка прийняття рішень.',
                        lessons: {
                            create: [
                                {
                                    title: 'Теорія: Умовні оператори',
                                    slug: 'm2-theory',
                                    orderIndex: 1,
                                    type: 'THEORY',
                                    difficulty: 'BASIC',
                                    content: M2_THEORY,
                                },
                                {
                                    title: 'Квіз: Логіка if/else',
                                    slug: 'm2-quiz',
                                    orderIndex: 2,
                                    type: 'QUIZ',
                                    difficulty: 'BASIC',
                                    content: JSON.stringify({
                                        questions: [
                                            {
                                                question: "Який оператор означає 'дорівнює' в С++?",
                                                options: ["=", "==", "===", "equals"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Що виведе даний фрагмент коду C++ на екран?",
                                                code: "int main() {\n    int x = 5;\n    std::cout << (x > 3 ? \"yes\" : \"no\");\n    return 0;\n}",
                                                options: ["yes", "no", "1", "Помилка"],
                                                correctAnswer: 0
                                            },
                                            {
                                                question: "Що станеться без break у case блоці switch?",
                                                options: ["Помилка компіляції", "Виконання перейде до наступного case", "Програма завершиться", "Нічого особливого"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Яка умова перевіряє, чи x невід'ємне І менше 100?",
                                                options: ["x > 0 || x < 100", "x >= 0 && x < 100", "x > 0 && x <= 100", "x >= 0 || x < 100"],
                                                correctAnswer: 1
                                            }
                                        ]
                                    })
                                },
                                {
                                    title: 'Базовий: Максимум з двох',
                                    slug: 'm2-p-basic',
                                    orderIndex: 3,
                                    type: 'PRACTICE',
                                    difficulty: 'BASIC',
                                    content: 'Зчитайте два цілих числа. Виведіть більше з них.',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int a, b;\n    std::cin >> a >> b;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '10 20', output: '20' }, { input: '-5 -3', output: '-3' }]
                                },
                                {
                                    title: 'Стандартний: Знак числа',
                                    slug: 'm2-p-standard',
                                    orderIndex: 4,
                                    type: 'PRACTICE',
                                    difficulty: 'STANDARD',
                                    content: 'Зчитайте ціле число. Виведіть `positive`, `negative` або `zero` залежно від його знаку.',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int n;\n    std::cin >> n;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '-5', output: 'negative' }, { input: '0', output: 'zero' }, { input: '42', output: 'positive' }]
                                },
                                {
                                    title: 'Просунутий: Класифікація трикутника',
                                    slug: 'm2-p-advanced',
                                    orderIndex: 5,
                                    type: 'PRACTICE',
                                    difficulty: 'ADVANCED',
                                    content: 'Зчитайте довжини трьох сторін трикутника a, b, c. Виведіть: `equilateral` (рівносторонній), `isosceles` (рівнобедрений), `scalene` (різносторонній) або `invalid` (такий трикутник не існує). Трикутник існує якщо сума будь-яких двох сторін більша за третю.',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int a, b, c;\n    std::cin >> a >> b >> c;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '3 3 3', output: 'equilateral' }, { input: '3 3 4', output: 'isosceles' }, { input: '3 4 5', output: 'scalene' }, { input: '1 2 10', output: 'invalid' }]
                                }
                            ]
                        }
                    },
                    // ─────── MODULE 3 ───────
                    {
                        title: '3. Циклічні обчислювальні процеси',
                        orderIndex: 3,
                        description: 'Організація повторюваних дій за допомогою циклів.',
                        lessons: {
                            create: [
                                {
                                    title: 'Теорія: Цикли For/While',
                                    slug: 'm3-theory',
                                    orderIndex: 1,
                                    type: 'THEORY',
                                    difficulty: 'BASIC',
                                    content: M3_THEORY,
                                },
                                {
                                    title: 'Квіз: Ітерації',
                                    slug: 'm3-quiz',
                                    orderIndex: 2,
                                    type: 'QUIZ',
                                    difficulty: 'BASIC',
                                    content: JSON.stringify({
                                        questions: [
                                            {
                                                question: "Скільки разів виконається: for(int i=0; i<5; ++i)?",
                                                options: ["4", "5", "6", "Нескінченно"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Який оператор виходить з циклу негайно?",
                                                options: ["continue", "return", "break", "exit"],
                                                correctAnswer: 2
                                            },
                                            {
                                                question: "Яке мінімальне число виконань тіла do-while?",
                                                options: ["0", "1", "2", "Залежить від умови"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Яка змінна відповідає за крок у for(int i=0; i<10; i+=2)?",
                                                options: ["i<10", "i=0", "i+=2", "int"],
                                                correctAnswer: 2
                                            },
                                            {
                                                question: "Яка сума чисел від 1 до 4: 1+2+3+4?",
                                                options: ["8", "10", "12", "6"],
                                                correctAnswer: 1
                                            }
                                        ]
                                    })
                                },
                                {
                                    title: 'Базовий: Парні числа',
                                    slug: 'm3-p-basic',
                                    orderIndex: 3,
                                    type: 'PRACTICE',
                                    difficulty: 'BASIC',
                                    content: 'Зчитайте N. Виведіть всі парні числа від 2 до N через пробіл.',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int n;\n    std::cin >> n;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '6', output: '2 4 6 ' }, { input: '10', output: '2 4 6 8 10 ' }]
                                },
                                {
                                    title: 'Стандартний: Сума від 1 до N',
                                    slug: 'm3-p-standard',
                                    orderIndex: 4,
                                    type: 'PRACTICE',
                                    difficulty: 'STANDARD',
                                    content: 'Зчитайте N. Знайдіть суму чисел від 1 до N.',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int n;\n    std::cin >> n;\n    long long sum = 0;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '5', output: '15' }, { input: '100', output: '5050' }]
                                },
                                {
                                    title: 'Просунутий: Числа Фібоначчі',
                                    slug: 'm3-p-advanced',
                                    orderIndex: 5,
                                    type: 'PRACTICE',
                                    difficulty: 'ADVANCED',
                                    content: 'Зчитайте N. Виведіть перші N чисел Фібоначчі через пробіл. (1 1 2 3 5 8...)',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int n;\n    std::cin >> n;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '5', output: '1 1 2 3 5 ' }, { input: '8', output: '1 1 2 3 5 8 13 21 ' }]
                                }
                            ]
                        }
                    },
                    // ─────── MODULE 4 ───────
                    {
                        title: '4. Робота з циклами та накопичення значень',
                        orderIndex: 4,
                        description: 'Обчислення сум та середніх значень у циклах.',
                        lessons: {
                            create: [
                                {
                                    title: 'Теорія: Накопичення у циклах',
                                    slug: 'm4-theory',
                                    orderIndex: 1,
                                    type: 'THEORY',
                                    difficulty: 'BASIC',
                                    content: M4_THEORY,
                                },
                                {
                                    title: 'Квіз: Цикли та суми',
                                    slug: 'm4-quiz',
                                    orderIndex: 2,
                                    type: 'QUIZ',
                                    difficulty: 'BASIC',
                                    content: JSON.stringify({
                                        questions: [
                                            {
                                                question: "Як називається змінна, у якій ми накопичуємо суму в циклі?",
                                                options: ["Ітератор", "Акумулятор", "Константа", "Прапорець"],
                                                correctAnswer: 1,
                                                hint: "Цей термін походить від слова 'накопичувати' (accumulate)."
                                            },
                                            {
                                                question: "Якому числу дорівнює 4! (чотири факторіал)?",
                                                options: ["10", "16", "24", "12"],
                                                correctAnswer: 2,
                                                hint: "4! = 1 * 2 * 3 * 4"
                                            },
                                            {
                                                question: "Яке початкове значення зазвичай має сума (акумулятор) перед циклом?",
                                                options: ["1", "0", "-1", "Будь-яке"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Чому дорівнює i++ у циклі, якщо i було 5?",
                                                options: ["5", "6", "4", "10"],
                                                correctAnswer: 1
                                            }
                                        ]
                                    })
                                },
                                {
                                    title: 'Базовий: Факторіал',
                                    slug: 'm4-p-basic',
                                    orderIndex: 3,
                                    type: 'PRACTICE',
                                    difficulty: 'BASIC',
                                    content: 'Зчитайте N (0 ≤ N ≤ 20). Обчисліть та виведіть N! (N факторіал).',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int n;\n    std::cin >> n;\n    long long result = 1;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '5', output: '120' }, { input: '10', output: '3628800' }]
                                },
                                {
                                    title: 'Стандартний: Сума квадратів',
                                    slug: 'm4-p-standard',
                                    orderIndex: 4,
                                    type: 'PRACTICE',
                                    difficulty: 'STANDARD',
                                    content: 'Зчитайте ціле число N. Обчисліть суму квадратів чисел від 1 до N: `1² + 2² + ... + N²`.',
                                    initialCode: '#include <iostream>\n\nint main() {\n    int n;\n    std::cin >> n;\n    long long sum = 0;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '3', output: '14' }, { input: '5', output: '55' }]
                                },
                                {
                                    title: 'Просунутий: Середнє арифметичне',
                                    slug: 'm4-p-advanced',
                                    orderIndex: 5,
                                    type: 'PRACTICE',
                                    difficulty: 'ADVANCED',
                                    content: 'Зчитайте ціле число N, а потім N дробових чисел. Виведіть їх середнє арифметичне з 2 знаками після коми.',
                                    initialCode: '#include <iostream>\n#include <iomanip>\n\nint main() {\n    int n;\n    std::cin >> n;\n    // Твій код тут\n    return 0;\n}',
                                    testCases: [{ input: '3 10.0 20.0 30.0', output: '20.00' }, { input: '2 5.5 4.5', output: '5.00' }]
                                }
                            ]
                        }
                    },
                    // ─────── MODULE 5 ───────
                    {
                        title: '5. Рекурсивні функції',
                        orderIndex: 5,
                        description: 'Проектування та використання рекурсивних алгоритмів.',
                        lessons: {
                            create: [
                                {
                                    title: 'Теорія: Основи Рекурсії',
                                    slug: 'm5-theory',
                                    orderIndex: 1,
                                    type: 'THEORY',
                                    difficulty: 'BASIC',
                                    content: M5_THEORY,
                                },
                                {
                                    title: 'Квіз: Основи рекурсії',
                                    slug: 'm5-quiz',
                                    orderIndex: 2,
                                    type: 'QUIZ',
                                    difficulty: 'BASIC',
                                    content: JSON.stringify({
                                        questions: [
                                            {
                                                question: "Що обов'язково повинна мати рекурсивна функція?",
                                                options: ["Цикл while", "Умову виходу (базовий випадок)", "Глобальну змінну", "Більше 2 аргументів"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Що відбудеться, якщо рекурсивна функція не має базового випадку?",
                                                options: ["Компілятор попередить", "Stack Overflow (переповнення стеку)", "Функція поверне 0", "Програма працюватиме швидше"],
                                                correctAnswer: 1
                                            },
                                            {
                                                question: "Скільки викликів функції робить factorial(3)?",
                                                options: ["2", "3", "4", "1"],
                                                correctAnswer: 2,
                                                hint: "factorial(3) calls factorial(2), which calls factorial(1), which calls factorial(0)."
                                            },
                                            {
                                                question: "Який випадок у рекурсії називається базовим?",
                                                options: ["Той, що викликає функцію знову", "Той, що зупиняє рекурсію", "Той, що містить помилку", "Перший рядок коду"],
                                                correctAnswer: 1
                                            }
                                        ]
                                    })
                                },
                                {
                                    title: 'Базовий: Сума цифр',
                                    slug: 'm5-p-basic',
                                    orderIndex: 3,
                                    type: 'PRACTICE',
                                    difficulty: 'BASIC',
                                    content: 'Знайдіть суму цифр числа за допомогою рекурсивної функції. Зчитайте натуральне число N.',
                                    initialCode: '#include <iostream>\n\nint sumOfDigits(int n) {\n    // Базовий випадок: якщо n == 0\n    // Рекурсивний крок: n%10 + sumOfDigits(n/10)\n    return 0; // замінити\n}\n\nint main() {\n    int n;\n    std::cin >> n;\n    std::cout << sumOfDigits(n);\n    return 0;\n}',
                                    testCases: [{ input: '123', output: '6' }, { input: '9999', output: '36' }]
                                },
                                {
                                    title: 'Стандартний: Рекурсивний степінь',
                                    slug: 'm5-p-standard',
                                    orderIndex: 4,
                                    type: 'PRACTICE',
                                    difficulty: 'STANDARD',
                                    content: 'Обчисліть `a^n` за допомогою рекурсивної функції. Зчитайте `a` та `n`.',
                                    initialCode: '#include <iostream>\n\nlong long power(int a, int n) {\n    // Твій код тут\n    return 0;\n}\n\nint main() {\n    int a, n;\n    std::cin >> a >> n;\n    std::cout << power(a, n);\n    return 0;\n}',
                                    testCases: [{ input: '2 3', output: '8' }, { input: '3 4', output: '81' }]
                                },
                                {
                                    title: 'Просунутий: Рекурсивний Фібоначчі',
                                    slug: 'm5-p-advanced',
                                    orderIndex: 5,
                                    type: 'PRACTICE',
                                    difficulty: 'ADVANCED',
                                    content: 'Напишіть рекурсивну функцію для знаходження n-го числа Фібоначчі за формулою: `fib(n) = fib(n-1) + fib(n-2)`. Зчитайте ціле число N.',
                                    initialCode: '#include <iostream>\n\nint fib(int n) {\n    // Базові випадки: fib(0)=0, fib(1)=1\n    // Твій код тут\n    return 0;\n}\n\nint main() {\n    int n;\n    std::cin >> n;\n    std::cout << fib(n);\n    return 0;\n}',
                                    testCases: [{ input: '5', output: '5' }, { input: '8', output: '21' }]
                                }
                            ]
                        }
                    },
                    module6,
                    module7,
                    module8,
                    module9,
                    module10,
                    module11
                ]
            }
        }
    });

    console.log('Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
