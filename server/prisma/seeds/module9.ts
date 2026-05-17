import { Prisma } from '@prisma/client';

export const M9_THEORY = `## Обробка рядків (Strings)

У C++ для текстових даних (слів, речень тощо) використовують рядки (strings).

### Підключення
Для роботи з рядками обов'язково треба підключити бібліотеку \`<string>\`:

\`\`\`cpp
#include <iostream>
#include <string>

int main() {
    std::string name = "John";
    std::cout << "Привіт, " << name << "!";
    return 0;
}
\`\`\`

### Як дізнатися довжину?
Щоб швидко дізнатися кількість символів у рядку, використовуйте \`length()\` або \`size()\`:

\`\`\`cpp
std::string country = "Ukraine";
std::cout << country.length(); // Виведе 7
\`\`\`

### Як об'єднати рядки?
Рядки дуже легко з'єднувати між собою (це називається конкатенацією) за допомогою оператора \`+\`:

\`\`\`cpp
std::string firstName = "Jane";
std::string lastName = "Doe";
std::string fullName = firstName + " " + lastName; // "Jane Doe"
\`\`\`

### Доступ до окремих символів
Рядок у C++ працює **як масив символів**. Ви можете отримати першу літеру (або змінити її) за допомогою індексів (нумерація з нуля!):

\`\`\`cpp
std::string word = "Cat";
word[0] = 'H';
std::cout << word; // Виведе "Hat"
\`\`\`
`;

export const module9: Prisma.ModuleCreateWithoutCourseInput = {
    title: 'Модуль 9: Обробка рядків',
    description: 'Основи роботи з текстом, рядками та символами в C++.',
    orderIndex: 9,
    lessons: {
        create: [
            {
                title: 'Теорія: Загальні уявлення про рядки',
                slug: 'm9-theory',
                orderIndex: 1,
                type: 'THEORY',
                difficulty: 'BASIC',
                content: M9_THEORY
            },
            {
                title: 'Квіз: Рядки',
                slug: 'm9-quiz',
                orderIndex: 2,
                type: 'QUIZ',
                difficulty: 'BASIC',
                content: JSON.stringify({
                    questions: [
                        {
                            question: "Яку бібліотеку потрібно підключити для роботи зі std::string?",
                            options: ["<iostream>", "<string>", "<math.h>", "<text>"],
                            correctAnswer: 1
                        },
                        {
                            question: "Який метод дозволяє дізнатись кількість символів у рядку?",
                            options: ["count()", "sizeOf()", "length()", "strlen()"],
                            correctAnswer: 2
                        },
                        {
                            question: "Як правильно з'єднати два рядка a та b?",
                            options: ["a.concat(b)", "a & b", "a + b", "a, b"],
                            correctAnswer: 2
                        }
                    ]
                })
            },
            {
                title: 'Практика: Перша літера',
                slug: 'm9-practice',
                orderIndex: 3,
                type: 'PRACTICE',
                difficulty: 'BASIC',
                content: 'Вам дано пустий рядок \`animal = "Dog"\`. Змініть першу літеру на \`L\` (щоб утворилося "Log") та виведіть результат.',
                initialCode: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string animal = "Dog";\n    // Ваш код (доступ по індексу починається з нуля)\n    std::cout << animal;\n    return 0;\n}',
                testCases: [{ input: '', output: 'Log' }]
            }
        ]
    }
};
