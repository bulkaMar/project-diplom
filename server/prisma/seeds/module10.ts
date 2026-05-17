import { Prisma } from '@prisma/client';

export const M10_THEORY = `## Структури (Structs)

Раніше ми дізналися, що масиви зберігають колекцію елементів **одного типу**. 
Але що робити, якщо потрібно зберегти інформацію про Студента, яка містить різні типи даних: його ім'я (\`string\`), вік (\`int\`) та середній бал (\`double\`)?

Для цього використовуються **структури (struct)**. Це спосіб згрупувати декілька пов'язаних змінних під одним дахом.

### Оголошення структури

\`\`\`cpp
struct Student {
    std::string name;
    int age;
    double grade;
};
\`\`\`
*(Не забудьте крапку з комою \`;\` після фігурної дужки!)*

### Створення та використання

Тепер ми можемо створити змінну типу \`Student\` і змінити її поля (атрибути) за допомогою крапки \`.\`:

\`\`\`cpp
#include <iostream>
#include <string>

int main() {
    // Створюємо студента
    Student s1;
    
    // Заповнюємо дані
    s1.name = "Alice";
    s1.age = 20;
    s1.grade = 4.5;
    
    // Виводимо
    std::cout << "Студент: " << s1.name << ", Вік: " << s1.age;
    return 0;
}
\`\`\`

### Масиви структур
Оскільки структура стає вашим новим типом даних, ви можете створити цілий перелік таких структур (клас Студентів):

\`\`\`cpp
Student myClass[30]; // масив з 30 студентів
myClass[0].name = "Bob";
\`\`\`
`;

export const module10: Prisma.ModuleCreateWithoutCourseInput = {
    title: 'Модуль 10: Струкутри даних',
    description: 'Створення власних типів даних та робота зі складними об’єктами.',
    orderIndex: 10,
    lessons: {
        create: [
            {
                title: 'Теорія: Основи структур',
                slug: 'm10-theory',
                orderIndex: 1,
                type: 'THEORY',
                difficulty: 'BASIC',
                content: M10_THEORY
            },
            {
                title: 'Квіз: Структури',
                slug: 'm10-quiz',
                orderIndex: 2,
                type: 'QUIZ',
                difficulty: 'BASIC',
                content: JSON.stringify({
                    questions: [
                        {
                            question: "Чим структура `struct` відрізняється від масиву?",
                            options: ["Структура може містити дані різних типів (наприклад, рядок і число)", "Нічим, це одне й те саме", "Структура завжди має фіксований розмір = 1", "В ній можна зберігати лише числа"],
                            correctAnswer: 0
                        },
                        {
                            question: "За допомогою якого символу ми отримуємо доступ до властивостей (полів) структури?",
                            options: ["Стрілочка (->)", "Кома (,)", "Крапка (.)", "Дві крапки (:)"],
                            correctAnswer: 2
                        },
                        {
                            question: "Що обов'язково треба ставити в кінці оголошення `struct Student { ... }`?",
                            options: ["Пустий рядок", "Крапку з комою (;)", "Кому (,)", "Слово end"],
                            correctAnswer: 1
                        }
                    ]
                })
            },
            {
                title: 'Практика: Робота зі структурою',
                slug: 'm10-practice',
                orderIndex: 3,
                type: 'PRACTICE',
                difficulty: 'BASIC',
                content: 'Створіть свій екземпляр автомобіля. Дано структуру \`Car\` із полями \`brand\` та \`year\`. Встановіть \`brand\` = "Ford" та \`year\` = 2020. Потім виведіть їх значення.',
                initialCode: '#include <iostream>\n#include <string>\n\nstruct Car {\n    std::string brand;\n    int year;\n};\n\nint main() {\n    Car myCar;\n    // Задайте параметри нижче\n    \n    std::cout << myCar.brand << " " << myCar.year;\n    return 0;\n}',
                testCases: [{ input: '', output: 'Ford 2020' }]
            }
        ]
    }
};
