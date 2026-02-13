
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.util';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting admin user creation...');

    const adminEmail = 'admin@portoviejo360.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin2026!';

    // Check if admin exists
    const existingAdmin = await prisma.usuario.findUnique({
        where: { correo: adminEmail }
    });

    if (existingAdmin) {
        console.log('⚠️ Admin user already exists:', existingAdmin.correo);
        return;
    }

    // Ensure Admin Role exists (ID 1)
    const adminRole = await prisma.rol.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            nombre: 'admin'
        }
    });
    console.log('✅ Admin role verified:', adminRole);

    // Create Admin User
    const passwordHash = await hashPassword(adminPassword);

    const newAdmin = await prisma.usuario.create({
        data: {
            nombresCompletos: 'Administrador Sistema',
            correo: adminEmail,
            passwordHash: passwordHash,
            rolId: 1, // Admin role
            fechaRegistro: new Date()
        }
    });

    console.log('✅ Admin user created successfully:');
    console.log('   Email:', newAdmin.correo);
    console.log('   ID:', newAdmin.id);
}

main()
    .catch((e) => {
        console.error('❌ Error creating admin user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
