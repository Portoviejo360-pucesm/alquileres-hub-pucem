import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Por favor proporciona un email como argumento');
        process.exit(1);
    }

    console.log(`Buscando usuario con email: ${email}...`);

    const usuario = await prisma.usuario.findUnique({
        where: { correo: email }
    });

    if (!usuario) {
        console.error('Usuario no encontrado');
        process.exit(1);
    }

    console.log(`Usuario encontrado: ${usuario.nombresCompletos} (Rol: ${usuario.rolId})`);

    // Crear o actualizar perfil verificado
    console.log('Creando perfil verificado...');

    await prisma.perfilVerificado.upsert({
        where: { usuarioId: usuario.id },
        update: {
            estaVerificado: true
        },
        create: {
            usuarioId: usuario.id,
            cedulaRuc: '1234567890', // Dummy
            telefonoContacto: '0999999999', // Dummy
            biografiaCorta: 'Usuario verificado automáticamente',
            estaVerificado: true,
            fechaSolicitud: new Date()
        }
    });

    console.log('✅ Usuario verificado exitosamente');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
