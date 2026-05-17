const fs = require('fs');
const path = require('path');

try {
    const seedFile = fs.readFileSync(path.join(__dirname, 'seed.ts'), 'utf-8');

    const afterModules = seedFile.split('modules: {')[1];
    const afterCreate = afterModules.split('create: [')[1];
    const modulesMatch = afterCreate.substring(0, afterCreate.lastIndexOf(']\n            }\n        }\n    });'));

    const moduleParts = modulesMatch.split(/(?=\{\s*title: 'Модуль \d+:)/);

    const theories = [];
    let currentTheoryMatch;
    const theoryRegex = /const M\d+_THEORY = `[\s\S]*?`;/g;
    while ((currentTheoryMatch = theoryRegex.exec(seedFile)) !== null) {
        theories.push(currentTheoryMatch[0]);
    }

    let extractedCount = 0;
    for (let part of moduleParts) {
        part = part.trim();
        if (!part) continue;
        extractedCount++;
        if (extractedCount > 5) break;

        const theoryConst = theories[extractedCount - 1] || '';
        if (part.endsWith(',')) {
            part = part.substring(0, part.length - 1);
        }
        
        const content = `import { Prisma } from '@prisma/client';\n\n${theoryConst}\n\nexport const module${extractedCount}: Prisma.ModuleCreateWithoutCourseInput = ${part};\n`;
        fs.writeFileSync(path.join(__dirname, `server/prisma/seeds/module${extractedCount}.ts`), content);
        console.log(`Created module${extractedCount}.ts`);
    }

} catch (e) {
    console.error(e);
}
