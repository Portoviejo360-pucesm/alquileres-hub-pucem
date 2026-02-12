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
        where: { correo: email },
        include: { perfilVerificado: true }
    });

    if (!usuario) {
        console.error('Usuario no encontrado');
        process.exit(1);
    }

    console.log(`Usuario encontrado: ${usuario.nombresCompletos} (Rol: ${usuario.rolId})`);

    if (usuario.perfilVerificado) {
        console.log(`Actualizando perfil existente (Estado actual: ${usuario.perfilVerificado.estaVerificado})...`);
        await prisma.perfilVerificado.update({
            where: { usuarioId: usuario.id },
            data: { estaVerificado: true }
        });
    } else {
        console.log('Creando perfil verificado...');
        await prisma.perfilVerificado.create({
            data: {
                usuarioId: usuario.id,
                cedulaRuc: '9999999999', // Dummy data
                telefonoContacto: '0999999999', // Dummy data
                biografiaCorta: 'Verificado automáticamente por script',
                estaVerificado: true,
                fechaSolicitud: new Date()
            }
        });
    }

    console.log('✅ Usuario verificado exitosamente');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
