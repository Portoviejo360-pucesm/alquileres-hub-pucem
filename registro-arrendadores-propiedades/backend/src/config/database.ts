import { PrismaClient } from '@prisma/client';

// ============================================
// SINGLETON DE PRISMA CLIENT
// ============================================

// Prevenir múltiples instancias de Prisma Client en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Manejo de desconexión al cerrar la aplicación
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
