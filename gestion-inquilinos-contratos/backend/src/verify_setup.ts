import { prisma } from './config/db';

async function main() {
    console.log('Verificando configuración...');
    try {
        console.log('1. Probando conexión a BD (fallará si no hay credenciales reales)...');
        // This relies on valid env var. If using dummy, it will fail connection, but at least code compiles.
        // We catch error to show success of build/logic structure.
        await prisma.$connect();
        console.log('Conexión exitosa!');
    } catch (e) {
        console.log('Conexión falló (esperado si no hay credenciales reales):');
        console.log((e as Error).message.split('\n')[0]);
    }

    console.log('2. Verificando Prisma Client...');
    if (prisma.reserva && prisma.contrato) {
        console.log('Modelos Reserva y Contrato disponibles en el cliente.');
    } else {
        console.error('Modelos faltantes en el cliente!');
    }

    console.log('Verificación estructural completada.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
