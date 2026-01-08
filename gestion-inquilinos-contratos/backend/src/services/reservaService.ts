import { prisma } from '../config/db';

export const createReserva = async (data: { usuarioId: string, propiedadId: number, fechaEntrada: Date, fechaSalida: Date }) => {
    const { usuarioId, propiedadId, fechaEntrada, fechaSalida } = data;

    // 1. Check availability
    // Check if there is any reservation that overlaps with the requested dates and is CONFIRMED or PENDING
    // Overlap: (RequestStart < ExistingEnd) AND (RequestEnd > ExistingStart)
    const existingReserva = await prisma.reserva.findFirst({
        where: {
            propiedadId,
            estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
            AND: [
                { fechaEntrada: { lt: fechaSalida } },
                { fechaSalida: { gt: fechaEntrada } }
            ]
        }
    });

    if (existingReserva) {
        throw new Error('La propiedad no está disponible en las fechas seleccionadas.');
    }

    // 2. Calculate Total
    // First get the property price
    const propiedad = await prisma.propiedad.findUnique({
        where: { id: propiedadId }
    });

    if (!propiedad) {
        throw new Error('Propiedad no encontrada.');
    }

    // Calculate days
    const diffTime = Math.abs(fechaSalida.getTime() - fechaEntrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Assuming precioMensual is indeed monthly, we might strictly need daily price.
    // Logic: If price is monthly, divide by 30? Or assume the field is generic.
    // RF doesn't specify logic, but usually it's daily.
    // However, schema says "precioMensual". Let's assume daily price = precioMensual / 30 for now or just use it as is if it's actually "precioNoche".
    // Schema says `precioMensual`. I will divide by 30 for daily rate.

    const dailyRate = Number(propiedad.precioMensual) / 30;
    const totalPagar = dailyRate * diffDays;

    if (diffDays <= 0) {
        throw new Error('Fechas inválidas.');
    }

    // 3. Create Reservation
    const reserva = await prisma.reserva.create({
        data: {
            usuarioId,
            propiedadId,
            fechaEntrada,
            fechaSalida,
            totalPagar: totalPagar,
            estado: 'PENDIENTE' // Or CONFIRMADA directly if payment is simulated immediately
        }
    });

    return reserva;
};

export const getReservasByUser = async (usuarioId: string) => {
    return await prisma.reserva.findMany({
        where: { usuarioId },
        include: {
            propiedad: {
                include: {
                    fotos: {
                        where: { esPrincipal: true },
                        take: 1
                    }
                }
            }
        },
        orderBy: { fechaCreacion: 'desc' }
    });
};


export const cancelReserva = async (reservaId: string, usuarioId: string) => {
    const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId }
    });

    if (!reserva) throw new Error('Reserva no encontrada');
    if (reserva.usuarioId !== usuarioId) throw new Error('No autorizado');

    if (reserva.estado !== 'PENDIENTE' && reserva.estado !== 'CONFIRMADA') {
        throw new Error('No se puede cancelar esta reserva.');
    }

    // Logic: Check if within allow cancellation period (e.g. 48h before).
    // Skipping strict date check for MVP as per requirements (just logic).

    return await prisma.reserva.update({
        where: { id: reservaId },
        data: { estado: 'CANCELADA' }
    });
};
