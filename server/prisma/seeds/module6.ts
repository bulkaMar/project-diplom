import { Prisma } from '@prisma/client';

export const M6_THEORY = `## Одновимірні масиви

Уявіть, що вам потрібно зберегти оцінки 30 студентів. Створювати 30 окремих змінних (\`grade1\`, \`grade2\`...) дуже незручно. Для цього в C++ існують **масиви**.

Масив — це набір елементів **одного типу**, які розташовані в пам'яті комп'ютера один за одним.

### Оголошення масиву

\`\`\`cpp
int numbers[5]; // Масив з 5 цілих чисел
\`\`\`

Ви також можете відразу задати значення (ініціалізувати масив):
\`\`\`cpp
int scores[3] = {85, 90, 100};
\`\`\`

### Індекси (Доступ до елементів)

Важливе правило: **нумерація (індекси) масивів у C++ починається з 0!**
Перший елемент має індекс \`0\`, другий — \`1\`, і так далі. В масиві з 3 елементів останній індекс буде \`2\`.

\`\`\`cpp
#include <iostream>

int main() {
    int scores[3] = {85, 90, 100};
    
    std::cout << "Перша оцінка: " << scores[0] << std::endl;
    std::cout << "Остання оцінка: " << scores[2] << std::endl;
    
    // Зміна значення
    scores[1] = 95;
    
    return 0;
}
\`\`\`

> **Важливо!**
> C++ не перевіряє, чи вийшли ви за межі масиву (наприклад, чи звернулись ви до \`scores[10]\`). Це може призвести до "падіння" програми або дивної поведінки. Будьте уважні з індексами!
`;

export const module6: Prisma.ModuleCreateWithoutCourseInput = {
    title: 'Модуль 6: Одновимірні масиви',
    description: 'Основи роботи зі списками даних одного типу.',
    orderIndex: 6,
    lessons: {
        create: [
            {
                title: 'Теорія: Що таке масиви',
                slug: 'm6-theory',
                orderIndex: 1,
                type: 'THEORY',
                difficulty: 'BASIC',
                content: M6_THEORY
            },
            {
                title: 'Квіз: Одновимірні масиви',
                slug: 'm6-quiz',
                orderIndex: 2,
                type: 'QUIZ',
                difficulty: 'BASIC',
                content: JSON.stringify({
                    questions: [
                        {
                            question: "З якого числа починається нумерація (індексування) елементів масиву в C++?",
                            options: ["З 1", "З 0", "Може починатись з будь-якого", "З -1"],
                            correctAnswer: 1
                        },
                        {
                            question: "Як правильно оголосити масив з 5 цілих чисел?",
                            code: "int myArr[5];\nint[5] myArr;\narray myArr = new int[5];\nmyArr int[5];",
                            options: ["int myArr[5];", "int[5] myArr;", "array myArr = new int[5];", "myArr int[5];"],
                            correctAnswer: 0
                        },
                        {
                            question: "Який індекс має останній елемент масиву розміром 10?",
                            options: ["10", "1", "9", "0"],
                            correctAnswer: 2
                        }
                    ]
                })
            },
            {
                title: 'Практика: Перший масив',
                slug: 'm6-practice',
                orderIndex: 3,
                type: 'PRACTICE',
                difficulty: 'BASIC',
                content: 'Створіть масив з трьох цілих чисел: 10, 20 і 30. Виведіть їх суму на екран.',
                initialCode: '#include <iostream>\n\nint main() {\n    // Ваш код тут\n    return 0;\n}',
                testCases: [{ input: '', output: '60' }]
            }
        ]
    }
};
