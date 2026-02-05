import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Seed Estados (Status)
    console.log('📊 Seeding Estados...');
    const estados = [
        { codigo: 'pendiente', nombre: 'Pendiente', descripcion: 'Incidencia reportada, pendiente de revisión', orden: 1 },
        { codigo: 'en_proceso', nombre: 'En Proceso', descripcion: 'Incidencia en proceso de resolución', orden: 2 },
        { codigo: 'resuelto', nombre: 'Resuelto', descripcion: 'Incidencia resuelta satisfactoriamente', orden: 3 },
        { codigo: 'cerrado', nombre: 'Cerrado', descripcion: 'Incidencia cerrada', orden: 4 },
    ];

    for (const estado of estados) {
        await prisma.estado.upsert({
            where: { codigo: estado.codigo },
            update: {},
            create: estado,
        });
    }
    console.log(`✅ Created ${estados.length} estados`);

    // Seed Prioridades (Priorities)
    console.log('📊 Seeding Prioridades...');
    const prioridades = [
        { codigo: 'baja', nombre: 'Baja', descripcion: 'Prioridad baja, no urgente', nivel: 1, color: '#28a745' },
        { codigo: 'media', nombre: 'Media', descripcion: 'Prioridad media, atención normal', nivel: 2, color: '#ffc107' },
        { codigo: 'alta', nombre: 'Alta', descripcion: 'Prioridad alta, requiere atención pronta', nivel: 3, color: '#fd7e14' },
        { codigo: 'urgente', nombre: 'Urgente', descripcion: 'Prioridad urgente, requiere atención inmediata', nivel: 4, color: '#dc3545' },
    ];

    for (const prioridad of prioridades) {
        await prisma.prioridad.upsert({
            where: { codigo: prioridad.codigo },
            update: {},
            create: prioridad,
        });
    }
    console.log(`✅ Created ${prioridades.length} prioridades`);

    // Seed Categorías (Categories)
    console.log('📊 Seeding Categorías...');
    const categorias = [
        { codigo: 'plomeria', nombre: 'Plomería', descripcion: 'Problemas relacionados con tuberías, grifos, desagües' },
        { codigo: 'electricidad', nombre: 'Electricidad', descripcion: 'Problemas eléctricos, iluminación, enchufes' },
        { codigo: 'limpieza', nombre: 'Limpieza', descripcion: 'Problemas de limpieza y mantenimiento general' },
        { codigo: 'seguridad', nombre: 'Seguridad', descripcion: 'Problemas de seguridad, cerraduras, accesos' },
        { codigo: 'climatizacion', nombre: 'Climatización', descripcion: 'Problemas de aire acondicionado, calefacción, ventilación' },
        { codigo: 'mobiliario', nombre: 'Mobiliario', descripcion: 'Problemas con muebles y equipamiento' },
        { codigo: 'estructura', nombre: 'Estructura', descripcion: 'Problemas estructurales, paredes, techos, pisos' },
        { codigo: 'otros', nombre: 'Otros', descripcion: 'Otros problemas no categorizados' },
    ];

    for (const categoria of categorias) {
        await prisma.categoria.upsert({
            where: { codigo: categoria.codigo },
            update: {},
            create: categoria,
        });
    }
    console.log(`✅ Created ${categorias.length} categorías`);

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
