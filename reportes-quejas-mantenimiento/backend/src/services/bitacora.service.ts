import { prisma } from '../config';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class BitacoraService {
    /**
     * Add maintenance log entry (RF-003)
     * Business Rule: Entries cannot be deleted (RF-003 RN2)
     */
    static async addEntry(
        incidentId: number,
        userId: string,
        userRole: string,
        descripcion: string
    ) {
        // Verify incident exists
        const incident = await prisma.incidencia.findUnique({
            where: { id: incidentId },
            include: {
                estado: true,
                propiedad: {
                    select: { propietario_id: true }
                }
            }
        });

        if (!incident) {
            throw new NotFoundError('Incidencia no encontrada');
        }

        // Only landlords/admins can add maintenance entries
        if (userRole !== 'admin' && userRole !== 'landlord') {
            throw new ForbiddenError('Solo arrendadores pueden agregar entradas de bitácora');
        }

        if (userRole === 'landlord' && incident.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para agregar entradas a esta incidencia');
        }

        // Create bitacora entry
        const entry = await prisma.bitacoraMantenimiento.create({
            data: {
                incidencia_id: incidentId,
                usuario_id: userId,
                descripcion,
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
                accion: 'bitacora_agregada',
                descripcion: 'Nueva entrada en bitácora de mantenimiento',
            }
        });

        return entry;
    }

    /**
     * Get maintenance history for incident (RF-003)
     * Ordered from most recent to oldest (RF-003 CA3)
     */
    static async getHistory(
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
            throw new ForbiddenError('No tienes permiso para ver esta bitácora');
        }

        if (userRole === 'landlord' && incident.propiedad.propietario_id !== userId) {
            throw new ForbiddenError('No tienes permiso para ver esta bitácora');
        }

        // Get bitacora entries
        const entries = await prisma.bitacoraMantenimiento.findMany({
            where: { incidencia_id: incidentId },
            include: {
                usuario: {
                    select: { nombres_completos: true, correo: true }
                }
            },
            orderBy: { fecha_creacion: 'desc' }
        });

        return entries;
    }
}
