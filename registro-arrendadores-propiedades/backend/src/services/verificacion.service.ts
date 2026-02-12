import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

// ============================================
// SERVICIO DE VERIFICACIÓN (USUARIO)
// ============================================

export class VerificacionService {

    /**
     * Solicitar verificación como arrendador
     */
    static async solicitarVerificacion(usuarioId: string, data: {
        cedulaRuc: string;
        telefonoContacto: string;
        biografiaCorta?: string;
        fotoDocumentoUrl?: string;
    }) {
        // Verificar si ya existe una solicitud
        const solicitudExistente = await prisma.perfilVerificado.findUnique({
            where: { usuarioId }
        });

        if (solicitudExistente) {
            // Si ya está verificado, no puede solicitar de nuevo
            if (solicitudExistente.estaVerificado) {
                throw new AppError('Tu cuenta ya está verificada', 400);
            }

            // Si tiene solicitud pendiente, no puede crear otra
            if (solicitudExistente.estadoVerificacion === 'PENDIENTE') {
                throw new AppError('Ya tienes una solicitud de verificación pendiente', 400);
            }
        }

        // Verificar que la cédula no esté en uso
        const cedulaEnUso = await prisma.perfilVerificado.findUnique({
            where: { cedulaRuc: data.cedulaRuc }
        });

        if (cedulaEnUso && cedulaEnUso.usuarioId !== usuarioId) {
            throw new AppError('Esta cédula/RUC ya está registrada', 409);
        }

        // Crear o actualizar la solicitud
        const perfil = await prisma.perfilVerificado.upsert({
            where: { usuarioId },
            create: {
                usuarioId,
                cedulaRuc: data.cedulaRuc,
                telefonoContacto: data.telefonoContacto,
                biografiaCorta: data.biografiaCorta,
                fotoDocumentoUrl: data.fotoDocumentoUrl,
                estadoVerificacion: 'PENDIENTE',
                fechaSolicitud: new Date()
            },
            update: {
                cedulaRuc: data.cedulaRuc,
                telefonoContacto: data.telefonoContacto,
                biografiaCorta: data.biografiaCorta,
                fotoDocumentoUrl: data.fotoDocumentoUrl,
                estadoVerificacion: 'PENDIENTE',
                fechaSolicitud: new Date(),
                notasVerificacion: null // Limpiar notas anteriores
            },
            include: {
                usuario: {
                    select: {
                        nombresCompletos: true,
                        correo: true
                    }
                }
            }
        });

        return perfil;
    }

    /**
     * Obtener estado de verificación del usuario
     */
    static async obtenerEstadoVerificacion(usuarioId: string) {
        const perfil = await prisma.perfilVerificado.findUnique({
            where: { usuarioId },
            include: {
                usuario: {
                    select: {
                        nombresCompletos: true,
                        correo: true
                    }
                }
            }
        });

        if (!perfil) {
            return {
                estadoVerificacion: 'NO_SOLICITADO',
                mensaje: 'No has solicitado verificación aún'
            };
        }

        return perfil;
    }

    /**
     * Actualizar datos de la solicitud
     */
    static async actualizarSolicitud(usuarioId: string, data: {
        telefonoContacto?: string;
        biografiaCorta?: string;
        fotoDocumentoUrl?: string;
    }) {
        const perfil = await prisma.perfilVerificado.findUnique({
            where: { usuarioId }
        });

        if (!perfil) {
            throw new AppError('No tienes una solicitud de verificación', 404);
        }

        if (perfil.estaVerificado) {
            throw new AppError('Tu cuenta ya está verificada. No puedes modificar los datos.', 400);
        }

        if (perfil.estadoVerificacion === 'PENDIENTE') {
            throw new AppError('Tu solicitud está en revisión. No puedes modificarla en este momento.', 400);
        }

        const perfilActualizado = await prisma.perfilVerificado.update({
            where: { usuarioId },
            data: {
                telefonoContacto: data.telefonoContacto || perfil.telefonoContacto,
                biografiaCorta: data.biografiaCorta !== undefined ? data.biografiaCorta : perfil.biografiaCorta,
                fotoDocumentoUrl: data.fotoDocumentoUrl !== undefined ? data.fotoDocumentoUrl : perfil.fotoDocumentoUrl
            },
            include: {
                usuario: {
                    select: {
                        nombresCompletos: true,
                        correo: true
                    }
                }
            }
        });

        return perfilActualizado;
    }
}
