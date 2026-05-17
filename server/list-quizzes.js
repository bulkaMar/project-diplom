const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const quizzes = await prisma.lesson.findMany({
        where: {
            type: 'QUIZ'
        }
    });

    console.log('Found', quizzes.length, 'quizzes.');
    quizzes.forEach(q => {
        console.log(`ID: ${q.id}, Title: ${q.title}, Content Preview: ${q.content.substring(0, 50)}...`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
