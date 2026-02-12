import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

// ============================================
// SERVICIO DE VERIFICACIÓN (ADMINISTRADOR)
// ============================================

export class AdminVerificacionService {

    /**
     * Listar solicitudes pendientes
     */
    static async listarSolicitudesPendientes() {
        const solicitudes = await prisma.perfilVerificado.findMany({
            where: {
                estadoVerificacion: 'PENDIENTE'
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        correo: true,
                        fechaRegistro: true,
                        rol: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fechaSolicitud: 'desc'
            }
        });

        return solicitudes;
    }

    /**
     * Listar todas las verificaciones con filtros
     */
    static async listarTodasVerificaciones(filtros?: {
        estado?: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO' | 'NO_SOLICITADO';
        busqueda?: string;
    }) {
        const where: any = {};

        if (filtros?.estado) {
            where.estadoVerificacion = filtros.estado;
        }

        if (filtros?.busqueda) {
            where.OR = [
                { usuario: { nombresCompletos: { contains: filtros.busqueda, mode: 'insensitive' } } },
                { usuario: { correo: { contains: filtros.busqueda, mode: 'insensitive' } } },
                { cedulaRuc: { contains: filtros.busqueda } }
            ];
        }

        const verificaciones = await prisma.perfilVerificado.findMany({
            where,
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        correo: true,
                        fechaRegistro: true,
                        rol: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fechaSolicitud: 'desc'
            }
        });

        return verificaciones;
    }

    /**
     * Obtener detalle de una solicitud
     */
    static async obtenerDetalleVerificacion(perfilId: number) {
        const perfil = await prisma.perfilVerificado.findUnique({
            where: { id: perfilId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        correo: true,
                        fechaRegistro: true,
                        rol: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            }
        });

        if (!perfil) {
            throw new AppError('Solicitud de verificación no encontrada', 404);
        }

        return perfil;
    }

    /**
     * Aprobar verificación
     */
    static async aprobarVerificacion(perfilId: number, adminId: string, notas?: string) {
        const perfil = await prisma.perfilVerificado.findUnique({
            where: { id: perfilId }
        });

        if (!perfil) {
            throw new AppError('Solicitud de verificación no encontrada', 404);
        }

        if (perfil.estaVerificado) {
            throw new AppError('Esta solicitud ya fue aprobada', 400);
        }

        if (perfil.estadoVerificacion !== 'PENDIENTE') {
            throw new AppError('Solo se pueden aprobar solicitudes pendientes', 400);
        }

        const perfilActualizado = await prisma.perfilVerificado.update({
            where: { id: perfilId },
            data: {
                estaVerificado: true,
                estadoVerificacion: 'VERIFICADO',
                fechaVerificacion: new Date(),
                notasVerificacion: notas
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        correo: true
                    }
                }
            }
        });

        return perfilActualizado;
    }

    /**
     * Rechazar verificación
     */
    static async rechazarVerificacion(perfilId: number, adminId: string, motivo: string) {
        const perfil = await prisma.perfilVerificado.findUnique({
            where: { id: perfilId }
        });

        if (!perfil) {
            throw new AppError('Solicitud de verificación no encontrada', 404);
        }

        if (perfil.estadoVerificacion !== 'PENDIENTE') {
            throw new AppError('Solo se pueden rechazar solicitudes pendientes', 400);
        }

        const perfilActualizado = await prisma.perfilVerificado.update({
            where: { id: perfilId },
            data: {
                estaVerificado: false,
                estadoVerificacion: 'RECHAZADO',
                fechaVerificacion: new Date(),
                notasVerificacion: motivo
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        correo: true
                    }
                }
            }
        });

        return perfilActualizado;
    }

    /**
     * Obtener estadísticas de verificación
     */
    static async obtenerEstadisticas() {
        const [total, pendientes, verificados, rechazados] = await Promise.all([
            prisma.perfilVerificado.count(),
            prisma.perfilVerificado.count({ where: { estadoVerificacion: 'PENDIENTE' } }),
            prisma.perfilVerificado.count({ where: { estadoVerificacion: 'VERIFICADO' } }),
            prisma.perfilVerificado.count({ where: { estadoVerificacion: 'RECHAZADO' } })
        ]);

        return {
            total,
            pendientes,
            verificados,
            rechazados,
            noSolicitado: await prisma.usuario.count() - total
        };
    }
}
