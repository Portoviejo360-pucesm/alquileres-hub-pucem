import { prisma } from '../config';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { uploadFileToStorage, deleteFileFromStorage, generateUniqueFilename } from '../utils/storage';

export class AdjuntoService {
    /**
     * Upload file attachment (RF-001 RN1)
     */
    static async uploadFile(
        incidentId: number,
        userId: string,
        userRole: string,
        file: Express.Multer.File
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
            throw new ForbiddenError('No tienes permiso para subir archivos a esta incidencia');
        }

        if (userRole === 'landlord' && incident.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para subir archivos a esta incidencia');
        }

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.originalname);

        // Upload to Supabase Storage
        const publicUrl = await uploadFileToStorage(
            file.buffer,
            uniqueFilename,
            file.mimetype
        );

        // Create database record
        const adjunto = await prisma.adjunto.create({
            data: {
                incidencia_id: incidentId,
                usuario_id: userId,
                nombre_archivo: file.originalname,
                url_archivo: publicUrl,
                tipo_mime: file.mimetype,
                tamanio_bytes: BigInt(file.size),
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
                accion: 'adjunto_agregado',
                descripcion: `Archivo adjunto: ${file.originalname}`,
            }
        });

        return adjunto;
    }

    /**
     * Get attachments for incident
     */
    static async getAttachments(
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
            throw new ForbiddenError('No tienes permiso para ver estos adjuntos');
        }

        if (userRole === 'landlord' && incident.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para ver estos adjuntos');
        }

        // Get attachments
        const attachments = await prisma.adjunto.findMany({
            where: { incidencia_id: incidentId },
            include: {
                usuario: {
                    select: { nombres_completos: true }
                }
            },
            orderBy: { fecha_creacion: 'desc' }
        });

        return attachments;
    }

    /**
     * Delete attachment
     */
    static async deleteFile(
        adjuntoId: number,
        userId: string,
        userRole: string
    ) {
        // Get attachment
        const adjunto = await prisma.adjunto.findUnique({
            where: { id: adjuntoId },
            include: {
                incidencia: {
                    include: {
                        propiedad: {
                            select: { propietario_id: true }
                        }
                    }
                }
            }
        });

        if (!adjunto) {
            throw new NotFoundError('Adjunto no encontrado');
        }

        // Only author, property owner, or admin can delete
        const canDelete =
            userRole === 'admin' ||
            adjunto.usuario_id === userId ||
            adjunto.incidencia.propiedad.propietario_id === userId;

        if (!canDelete) {
            throw new ForbiddenError('No tienes permiso para eliminar este adjunto');
        }

        // Extract filename from URL
        const urlParts = adjunto.url_archivo.split('/');
        const filename = urlParts[urlParts.length - 1];

        // Delete from Supabase Storage
        try {
            await deleteFileFromStorage(filename);
        } catch (error) {
            console.error('Error deleting file from storage:', error);
            // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        await prisma.adjunto.delete({
            where: { id: adjuntoId }
        });

        // Log in history
        await prisma.historialIncidencia.create({
            data: {
                incidencia_id: adjunto.incidencia_id,
                usuario_id: userId,
                accion: 'adjunto_eliminado',
                descripcion: `Archivo eliminado: ${adjunto.nombre_archivo}`,
            }
        });

        return { message: 'Adjunto eliminado exitosamente' };
    }
}
