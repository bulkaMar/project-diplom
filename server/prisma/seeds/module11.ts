import { Prisma } from '@prisma/client';

export const M11_THEORY = `## Робота з файлами

Програми повинні вміти зберігати дані, навіть коли комп'ютер вимикається. Для цього ми записуємо інформацію у файли.
У C++ для роботи з текстовими файлами використовують бібліотеку \`<fstream>\` (від слів "file stream").

### Запис у файл (\`ofstream\`)
Щоб створити файл і записати в нього текст, ми використовуємо \`std::ofstream\` ("output file stream").

\`\`\`cpp
#include <iostream>
#include <fstream> // Обов'язково для роботи з файлами

int main() {
    // Відкриваємо файл для запису
    std::ofstream file("data.txt");
    
    // Записуємо текст як звичайний cout
    file << "Привіт, світе!" << std::endl;
    file << "Запис у файл працює.";
    
    // Завжди закриваємо файл!
    file.close();
    
    return 0;
}
\`\`\`

### Читання з файлу (\`ifstream\`)
Щоб прочитати дані, ми використовуємо \`std::ifstream\` ("input file stream").

\`\`\`cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream file("data.txt");
    std::string line;
    
    // Читаємо рядок за рядком поки файл не закінчиться
    while (std::getline(file, line)) {
        std::cout << line << std::endl;
    }
    
    file.close();
    return 0;
}
\`\`\`
`;

export const module11: Prisma.ModuleCreateWithoutCourseInput = {
    title: 'Модуль 11: Робота з файлами',
    description: 'Основи збереження даних у текстові файли та їх читання.',
    orderIndex: 11,
    lessons: {
        create: [
            {
                title: 'Теорія: Текстові файли (fstream)',
                slug: 'm11-theory',
                orderIndex: 1,
                type: 'THEORY',
                difficulty: 'BASIC',
                content: M11_THEORY
            },
            {
                title: 'Квіз: Файлові потоки',
                slug: 'm11-quiz',
                orderIndex: 2,
                type: 'QUIZ',
                difficulty: 'BASIC',
                content: JSON.stringify({
                    questions: [
                        {
                            question: "Яку бібліотеку потрібно підключити для роботи з файлами?",
                            options: ["<iostream>", "<fstream>", "<files>", "<string>"],
                            correctAnswer: 1
                        },
                        {
                            question: "Який клас використовується для ЗАПИСУ (output) даних у файл?",
                            options: ["std::ofstream", "std::ifstream", "std::cin", "std::out"],
                            correctAnswer: 0
                        },
                        {
                            question: "Що потрібно ОБОВ'ЯЗКОВО зробити після завершення роботи з файлом?",
                            options: ["Видалити його", "Перезавантажити комп'ютер", "Закрити його (file.close())", "Надрукувати його"],
                            correctAnswer: 2
                        }
                    ]
                })
            },
            {
                title: 'Практика: Записуємо вік',
                slug: 'm11-practice',
                orderIndex: 3,
                type: 'PRACTICE',
                difficulty: 'BASIC',
                content: 'Створіть об\'єкт \`std::ofstream\` з ім\'ям \`file\` і запишіть в нього число 100. Не забудьте закрити файл.',
                initialCode: '#include <fstream>\n\nint main() {\n    // Ваш код тут\n    return 0;\n}',
                testCases: [{ input: '', output: '' }] // Mocked because we can't easily verify file I/O in simple stdout testers
            }
        ]
    }
};
