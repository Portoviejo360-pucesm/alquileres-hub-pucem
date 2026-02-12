import { prisma } from '../config';
import { Incidencia, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { NotificationService } from './notification.service';
import { uploadFileToStorage, generateUniqueFilename } from '../utils/storage';

export class IncidentService {

    /**
     * Create a new incident (RF-001)
     * Business Rules:
     * - RN1: Must include type, description, and optionally photos
     * - RN2: Tenant can only report incidents on properties they currently occupy
     */
    static async create(data: {
        titulo: string;
        descripcion: string;
        prioridad_codigo: string;
        categoria_codigo?: string;
        propiedad_id: number;
        usuario_reportante_id: string;
    }, files?: Express.Multer.File[]) {
        // 1. Validate property existence
        const propiedad = await prisma.propiedad.findUnique({
            where: { id_propiedad: data.propiedad_id },
        });
        if (!propiedad) throw new NotFoundError('Propiedad no encontrada. Verifica que el ID de propiedad sea válido.');

        // 2. Validate tenant has active contract for this property (RF-001 RN2)
        await this.validateTenantAccess(data.usuario_reportante_id, data.propiedad_id);

        // 3. Resolve catalogs
        const estado = await prisma.estado.findUnique({ where: { codigo: 'pendiente' } });
        if (!estado) throw new BadRequestError('Estado inicial no configurado');

        const prioridad = await prisma.prioridad.findUnique({ where: { codigo: data.prioridad_codigo } });
        if (!prioridad) throw new NotFoundError(`Prioridad ${data.prioridad_codigo} no encontrada`);

        let categoria_id: number | null = null;
        if (data.categoria_codigo) {
            const categoria = await prisma.categoria.findUnique({ where: { codigo: data.categoria_codigo } });
            if (categoria) categoria_id = categoria.id;
        }

        // 4. Create Incident
        const incidencia = await prisma.incidencia.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                estado_id: estado.id,
                prioridad_id: prioridad.id,
                categoria_id: categoria_id,
                propiedad_id: data.propiedad_id,
                usuario_reportante_id: data.usuario_reportante_id,
            },
            include: {
                estado: true,
                prioridad: true,
                categoria: true,
                propiedad: {
                    select: { titulo_anuncio: true }
                },
            },
        });

        // 5. Upload files if provided (RF-001 RN1 - optional photos)
        const adjuntos = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const uniqueFilename = generateUniqueFilename(file.originalname);
                    const publicUrl = await uploadFileToStorage(
                        file.buffer,
                        uniqueFilename,
                        file.mimetype
                    );

                    const adjunto = await prisma.adjunto.create({
                        data: {
                            incidencia_id: incidencia.id,
                            usuario_id: data.usuario_reportante_id,
                            nombre_archivo: file.originalname,
                            url_archivo: publicUrl,
                            tipo_mime: file.mimetype,
                            tamanio_bytes: BigInt(file.size),
                        }
                    });
                    adjuntos.push(adjunto);
                } catch (error) {
                    console.error(`Error uploading file ${file.originalname}:`, error);
                    // Continue with other files even if one fails
                }
            }
        }

        // 6. Create History Log (RF-002 RN2)
        const descripcionHistorial = files && files.length > 0
            ? `Incidencia reportada con ${files.length} archivo(s) adjunto(s)`
            : 'Incidencia reportada';

        await prisma.historialIncidencia.create({
            data: {
                incidencia_id: incidencia.id,
                usuario_id: data.usuario_reportante_id,
                accion: 'creada',
                descripcion: descripcionHistorial,
            },
        });

        // 7. Send notification to landlord (RF-004)
        await NotificationService.notifyIncidentCreated(incidencia.id);

        return {
            ...incidencia,
            adjuntos: adjuntos.map(a => ({
                id: a.id,
                nombre_archivo: a.nombre_archivo,
                url_archivo: a.url_archivo,
                tipo_mime: a.tipo_mime
            }))
        };
    }

    /**
     * Get incident by ID with full details (RF-005)
     */
    static async getById(id: number, userId: string, userRole: string) {
        const incidencia = await prisma.incidencia.findUnique({
            where: { id },
            include: {
                estado: true,
                prioridad: true,
                categoria: true,
                propiedad: {
                    select: {
                        id_propiedad: true,
                        titulo_anuncio: true,
                        propietario_id: true,
                    }
                },
                reportante: {
                    select: { id_usuario: true, nombres_completos: true, correo: true }
                },
                responsable: {
                    select: { id_usuario: true, nombres_completos: true, correo: true }
                },
                historial: {
                    orderBy: { fecha_cambio: 'desc' },
                    include: {
                        usuario: {
                            select: { nombres_completos: true }
                        }
                    }
                },
                bitacora: {
                    orderBy: { fecha_creacion: 'desc' },
                    include: {
                        usuario: {
                            select: { nombres_completos: true }
                        }
                    }
                },
                comentarios: {
                    orderBy: { fecha_creacion: 'desc' },
                    include: {
                        usuario: {
                            select: { nombres_completos: true }
                        }
                    }
                },
                adjuntos: {
                    orderBy: { fecha_creacion: 'desc' },
                    include: {
                        usuario: {
                            select: { nombres_completos: true }
                        }
                    }
                },
            },
        });

        if (!incidencia) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Validate ownership (RF-005 RN1, RN2)
        this.validateOwnership(incidencia, userId, userRole);

        return incidencia;
    }

    /**
     * Get all incidents with filters (RF-005)
     */
    static async getAll(filters: {
        usuario_id: string;
        rol: string;
        estado_codigo?: string;
        propiedad_id?: number;
        limit?: number;
        offset?: number;
    }) {
        const where: Prisma.IncidenciaWhereInput = {};

        // Access Control Logic (RF-005 RN1, RN2)
        if (filters.rol === 'tenant') {
            // Tenants see only their own reports
            where.usuario_reportante_id = filters.usuario_id;
        } else if (filters.rol === 'landlord') {
            // Landlords see incidents for properties they own
            where.propiedad = {
                propietario_id: filters.usuario_id
            };
        }
        // Admins see all (no filter added)

        // Additional Filters
        if (filters.estado_codigo) {
            where.estado = { codigo: filters.estado_codigo };
        }
        if (filters.propiedad_id) {
            where.propiedad_id = filters.propiedad_id;
        }

        const [incidencias, total] = await Promise.all([
            prisma.incidencia.findMany({
                where,
                include: {
                    estado: true,
                    prioridad: true,
                    categoria: true,
                    propiedad: {
                        select: { titulo_anuncio: true }
                    },
                    reportante: {
                        select: { nombres_completos: true, correo: true }
                    }
                },
                orderBy: { fecha_creacion: 'desc' },
                take: filters.limit || 10,
                skip: filters.offset || 0,
            }),
            prisma.incidencia.count({ where }),
        ]);

        return { incidencias, total };
    }

    /**
     * Update incident status (RF-002)
     * Business Rules:
     * - RN1: Status "resuelto" requires description
     * - RN2: All changes logged with date and user
     */
    static async updateStatus(
        id: number,
        userId: string,
        userRole: string,
        estadoCodigo: string,
        descripcion?: string
    ) {
        // Get current incident
        const incidencia = await prisma.incidencia.findUnique({
            where: { id },
            include: {
                estado: true,
                propiedad: {
                    select: { propietario_id: true }
                }
            }
        });

        if (!incidencia) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Validate ownership
        this.validateOwnership(incidencia, userId, userRole);

        // Validate new status exists
        const nuevoEstado = await prisma.estado.findUnique({
            where: { codigo: estadoCodigo }
        });

        if (!nuevoEstado) {
            throw new NotFoundError(`Estado ${estadoCodigo} no encontrado`);
        }

        // RF-002 RN1: Require description for "resuelto" status
        if (estadoCodigo === 'resuelto' && !descripcion) {
            throw new BadRequestError('Se requiere una descripción del arreglo realizado para marcar como resuelto');
        }

        const oldStatusName = incidencia.estado.nombre;

        // Update incident
        const updated = await prisma.incidencia.update({
            where: { id },
            data: {
                estado_id: nuevoEstado.id,
                fecha_actualizacion: new Date(),
                fecha_resolucion: estadoCodigo === 'resuelto' ? new Date() : undefined,
            },
            include: {
                estado: true,
                prioridad: true,
                categoria: true,
            }
        });

        // RF-002 RN2: Log status change in history
        await prisma.historialIncidencia.create({
            data: {
                incidencia_id: id,
                usuario_id: userId,
                accion: 'cambio_estado',
                descripcion: descripcion || `Estado cambiado de ${oldStatusName} a ${nuevoEstado.nombre}`,
                valor_anterior: oldStatusName,
                valor_nuevo: nuevoEstado.nombre,
            }
        });

        // Send notification to tenant (RF-004)
        await NotificationService.notifyStatusChanged(
            id,
            oldStatusName,
            nuevoEstado.nombre,
            descripcion || null
        );

        return updated;
    }

    /**
     * Update incident details
     */
    static async update(
        id: number,
        userId: string,
        userRole: string,
        data: {
            titulo?: string;
            descripcion?: string;
            prioridad_codigo?: string;
            categoria_codigo?: string;
            responsable_id?: string;
        }
    ) {
        // Get current incident
        const incidencia = await prisma.incidencia.findUnique({
            where: { id },
            include: {
                propiedad: {
                    select: { propietario_id: true }
                }
            }
        });

        if (!incidencia) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Validate ownership
        this.validateOwnership(incidencia, userId, userRole);

        const updateData: any = {
            fecha_actualizacion: new Date(),
        };

        if (data.titulo) updateData.titulo = data.titulo;
        if (data.descripcion) updateData.descripcion = data.descripcion;

        if (data.prioridad_codigo) {
            const prioridad = await prisma.prioridad.findUnique({
                where: { codigo: data.prioridad_codigo }
            });
            if (!prioridad) throw new NotFoundError('Prioridad no encontrada');
            updateData.prioridad_id = prioridad.id;
        }

        if (data.categoria_codigo) {
            const categoria = await prisma.categoria.findUnique({
                where: { codigo: data.categoria_codigo }
            });
            if (categoria) updateData.categoria_id = categoria.id;
        }

        if (data.responsable_id) {
            updateData.responsable_id = data.responsable_id;
        }

        const updated = await prisma.incidencia.update({
            where: { id },
            data: updateData,
            include: {
                estado: true,
                prioridad: true,
                categoria: true,
            }
        });

        // Log update in history
        await prisma.historialIncidencia.create({
            data: {
                incidencia_id: id,
                usuario_id: userId,
                accion: 'actualizada',
                descripcion: 'Incidencia actualizada',
            }
        });

        return updated;
    }

    /**
     * Delete (soft delete) incident
     */
    static async delete(id: number, userId: string, userRole: string) {
        const incidencia = await prisma.incidencia.findUnique({
            where: { id },
            include: {
                propiedad: {
                    select: { propietario_id: true }
                }
            }
        });

        if (!incidencia) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Only admins or property owners can delete
        if (userRole !== 'admin' && incidencia.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para eliminar esta incidencia');
        }

        // For now, hard delete. Could implement soft delete with a 'deleted_at' field
        await prisma.incidencia.delete({
            where: { id }
        });

        return { message: 'Incidencia eliminada exitosamente' };
    }

    /**
     * Validate tenant has active contract for property (RF-001 RN2)
     */
    private static async validateTenantAccess(userId: string, propiedadId: number) {
        const activeReservation = await prisma.reserva.findFirst({
            where: {
                usuario_id: userId,
                propiedad_id: propiedadId,
                estado: 'CONFIRMADA',
                // fecha_entrada: { lte: new Date() }, // Allow future reservations
                fecha_salida: { gte: new Date() },
            }
        });

        if (!activeReservation) {
            throw new ForbiddenError('Solo puedes reportar incidencias en propiedades que actualmente ocupas');
        }
    }

    /**
     * Validate user can access incident (RF-005 RN1, RN2)
     */
    private static validateOwnership(incidencia: any, userId: string, userRole: string) {
        if (userRole === 'admin') {
            return; // Admins can access all
        }

        if (userRole === 'tenant' && incidencia.usuario_reportante_id !== userId) {
            throw new ForbiddenError('No tienes permiso para acceder a esta incidencia');
        }

        if (userRole === 'landlord' && incidencia.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para acceder a esta incidencia');
        }
    }
}
