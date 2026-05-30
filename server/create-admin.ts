import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('Admin@1234', 10);
    const user = await prisma.user.upsert({
        where: { email: 'bulahmarina@knu.ua' },
        update: { role: 'ADMIN' },
        create: {
            email: 'bulahmarina@knu.ua',
            name: 'Marina Bulah',
            passwordHash: hash,
            role: 'ADMIN',
        },
    });
    console.log(`✅ Done: ${user.email} → ${user.role}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
