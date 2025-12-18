import { prisma } from '../config/db';
import { generateContractPDF } from '../utils/pdfGenerator';

export const generarContrato = async (reservaId: number, usuarioId: string) => {
    // 1. Get Reservation Details
    const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId },
        include: {
            usuario: true,
            propiedad: {
                include: {
                    propietario: true
                }
            },
            contrato: true
        }
    });

    if (!reserva) throw new Error('Reserva no encontrada');

    // Check if user is the tenant (or maybe landlord? Requirement says tenant downloads it)
    if (reserva.usuarioId !== usuarioId) throw new Error('No autorizado');

    if (reserva.estado !== 'CONFIRMADA' && reserva.estado !== 'FINALIZADA') {
        // Requirement says "after confirming payment".
        // So it must be confirmed.
        // Allow if confirmed.
        if (reserva.estado === 'PENDIENTE') {
            throw new Error('La reserva debe estar confirmada para generar el contrato.');
        }
    }

    // Return existing if already exists
    if (reserva.contrato) {
        return reserva.contrato;
    }

    // 2. Generate PDF
    // Mocking names if some are missing or using DB data
    const pdfPath = await generateContractPDF({
        arrendador: reserva.propiedad.propietario.nombresCompletos,
        arrendatario: reserva.usuario.nombresCompletos,
        propiedad: reserva.propiedad.tituloAnuncio,
        fechaInicio: reserva.fechaEntrada,
        fechaFin: reserva.fechaSalida,
        monto: Number(reserva.totalPagar)
    });

    // 3. Save to DB
    // In a real app, upload pdfPath to S3/Supabase Storage and save URL.
    // Here we save the local path or a relative URL.
    const relativeUrl = `/uploads/${pdfPath.split(/[\\/]/).pop()}`;

    const contrato = await prisma.contrato.create({
        data: {
            reservaId: reserva.id,
            urlArchivo: relativeUrl
        }
    });

    return contrato;
};

export const getContratoByReserva = async (reservaId: number, usuarioId: string) => {
    const contrato = await prisma.contrato.findUnique({
        where: { reservaId },
        include: { reserva: true }
    });

    if (!contrato) throw new Error('Contrato no encontrado');

    // Auth check
    if (contrato.reserva.usuarioId !== usuarioId) throw new Error('No autorizado');

    return contrato;
};
