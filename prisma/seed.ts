import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Starten1', salt);

    const user = await prisma.user.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            email: 'no-mail@vit-bund.de',
            password: hashedPassword
        }
    });

    console.log(`Created default user: ${user.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
