import { prisma } from '../config/db';
import { generateContractPDF } from '../utils/pdfGenerator';

export const generarContrato = async (reservaId: string, usuarioId: string) => {
    // 1. Get Reservation Details
    const reserva = await prisma.reserva.findUnique({
        where: { id: reservaId },
        include: {
            usuario: {
                include: { perfilVerificado: true }
            },
            propiedad: {
                include: {
                    propietario: {
                        include: { perfilVerificado: true }
                    }
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

    // 2. Generate PDF (ALWAYS regenerate to ensure latest template)
    // if (reserva.contrato) {
    //    return reserva.contrato;
    // }

    // 2. Generate PDF
    const pdfPath = await generateContractPDF({
        arrendador: {
            nombre: reserva.propiedad.propietario.nombresCompletos,
            cedula: reserva.propiedad.propietario.perfilVerificado?.cedulaRuc || 'N/A'
        },
        arrendatario: {
            nombre: reserva.usuario.nombresCompletos,
            cedula: reserva.usuario.perfilVerificado?.cedulaRuc || 'N/A'
        },
        propiedad: {
            direccion: reserva.propiedad.direccionTexto || 'Dirección no registrada',
            descripcion: reserva.propiedad.descripcion || 'Sin descripción',
            precioMensual: Number(reserva.propiedad.precioMensual), // Correct Monthly Price
            precioTotal: Number(reserva.totalPagar) // Correct Total Reservation Price
        },
        fechaInicio: reserva.fechaEntrada,
        fechaFin: reserva.fechaSalida
    });

    // 3. Save to DB
    // In a real app, upload pdfPath to S3/Supabase Storage and save URL.
    // Here we save the local path or a relative URL.
    // 3. Save or Update DB
    const relativeUrl = `/uploads/${pdfPath.split(/[\\/]/).pop()}`;

    let contrato;
    if (reserva.contrato) {
        // Update existing record
        contrato = await prisma.contrato.update({
            where: { id: reserva.contrato.id },
            data: { urlArchivo: relativeUrl }
        });
    } else {
        // Create new
        contrato = await prisma.contrato.create({
            data: {
                reservaId: reserva.id,
                urlArchivo: relativeUrl
            }
        });
    }

    return contrato;
};

export const getContratoByReserva = async (reservaId: string, usuarioId: string) => {
    const contrato = await prisma.contrato.findUnique({
        where: { reservaId },
        include: { reserva: true }
    });

    if (!contrato) throw new Error('Contrato no encontrado');

    // Auth check
    if (contrato.reserva.usuarioId !== usuarioId) throw new Error('No autorizado');

    return contrato;
};
