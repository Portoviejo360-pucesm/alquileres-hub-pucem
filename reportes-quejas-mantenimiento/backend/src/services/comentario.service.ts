import { prisma } from '../config';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class ComentarioService {
    /**
     * Add comment to incident
     */
    static async addComment(
        incidentId: number,
        userId: string,
        userRole: string,
        contenido: string,
        esInterno: boolean = false
    ) {
        // Verify incident exists
        const incident = await prisma.incidencia.findUnique({
            where: { id: incidentId },
            include: {
                propiedad: {
                    select: { propietario_id: true }
                }
            }
        });

        if (!incident) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Validate access
        if (userRole === 'tenant' && incident.usuario_reportante_id !== userId) {
            throw new ForbiddenError('No tienes permiso para comentar en esta incidencia');
        }

        if (userRole === 'landlord' && incident.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para comentar en esta incidencia');
        }

        // Only landlords/admins can create internal comments
        if (esInterno && userRole === 'tenant') {
            throw new ForbiddenError('No tienes permiso para crear comentarios internos');
        }

        // Create comment
        const comment = await prisma.comentario.create({
            data: {
                incidencia_id: incidentId,
                usuario_id: userId,
                contenido,
                es_interno: esInterno,
            },
            include: {
                usuario: {
                    select: { nombres_completos: true }
                }
            }
        });

        // Log in history
        await prisma.historialIncidencia.create({
            data: {
                incidencia_id: incidentId,
                usuario_id: userId,
                accion: 'comentario_agregado',
                descripcion: esInterno ? 'Comentario interno agregado' : 'Comentario agregado',
            }
        });

        return comment;
    }

    /**
     * Get comments for incident
     * Tenants only see public comments, landlords/admins see all
     */
    static async getComments(
        incidentId: number,
        userId: string,
        userRole: string
    ) {
        // Verify incident exists and user has access
        const incident = await prisma.incidencia.findUnique({
            where: { id: incidentId },
            include: {
                propiedad: {
                    select: { propietario_id: true }
                }
            }
        });

        if (!incident) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Validate access
        if (userRole === 'tenant' && incident.usuario_reportante_id !== userId) {
            throw new ForbiddenError('No tienes permiso para ver estos comentarios');
        }

        if (userRole === 'landlord' && incident.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para ver estos comentarios');
        }

        // Build where clause - tenants only see public comments
        const where: any = { incidencia_id: incidentId };
        if (userRole === 'tenant') {
            where.es_interno = false;
        }

        // Get comments
        const comments = await prisma.comentario.findMany({
            where,
            include: {
                usuario: {
                    select: { nombres_completos: true, correo: true }
                }
            },
            orderBy: { fecha_creacion: 'desc' }
        });

        return comments;
    }

    /**
     * Update comment (only by author)
     */
    static async updateComment(
        commentId: number,
        userId: string,
        contenido: string
    ) {
        // Get comment
        const comment = await prisma.comentario.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new NotFoundError('Comentario no encontrado');
        }

        // Only author can update
        if (comment.usuario_id !== userId) {
            throw new ForbiddenError('Solo el autor puede editar este comentario');
        }

        // Update comment
        const updated = await prisma.comentario.update({
            where: { id: commentId },
            data: {
                contenido,
                fecha_actualizacion: new Date(),
            },
            include: {
                usuario: {
                    select: { nombres_completos: true }
                }
            }
        });

        return updated;
    }
}
