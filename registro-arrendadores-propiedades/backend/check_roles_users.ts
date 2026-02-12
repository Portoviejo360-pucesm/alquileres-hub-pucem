import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Roles ---');
    const roles = await prisma.rol.findMany();
    console.log(roles);

    console.log('\n--- Usuarios ---');
    const users = await prisma.usuario.findMany({
        include: {
            perfilVerificado: true,
            rol: true
        }
    });

    users.forEach(u => {
        console.log(`Email: ${u.correo}, Rol: ${u.rol?.nombre} (${u.rolId}), Verificado: ${u.perfilVerificado?.estaVerificado ?? 'N/A'}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
