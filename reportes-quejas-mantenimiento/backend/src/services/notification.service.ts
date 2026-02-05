import { prisma } from '../config';
import { sendEmailNotification, generateIncidentCreatedEmail, generateStatusChangedEmail } from '../utils/email';
import { NotificationPayload } from '../types';

export class NotificationService {
    /**
     * Send notification when a new incident is created (RF-004)
     * Notifies the landlord/property owner
     */
    static async notifyIncidentCreated(incidentId: number): Promise<void> {
        try {
            // Get incident with all related data
            const incident = await prisma.incidencia.findUnique({
                where: { id: incidentId },
                include: {
                    propiedad: {
                        include: {
                            propietario: true,
                        },
                    },
                    prioridad: true,
                    categoria: true,
                    reportante: true,
                },
            });

            if (!incident) {
                console.error(`Incident ${incidentId} not found for notification`);
                return;
            }

            const landlordEmail = incident.propiedad.propietario.correo;

            const emailBody = generateIncidentCreatedEmail(
                incident.id,
                incident.titulo,
                incident.descripcion,
                incident.prioridad.nombre,
                incident.categoria?.nombre || null,
                incident.propiedad.titulo_anuncio
            );

            const payload: NotificationPayload = {
                to: landlordEmail,
                subject: `🔔 Nueva Incidencia Reportada - ${incident.titulo}`,
                body: emailBody,
                incidentId: incident.id,
                type: 'incident_created',
            };

            // Send email notification
            const result = await sendEmailNotification(payload);

            // Log notification attempt
            if (result.sent) {
                console.log(`✅ Notification sent to ${landlordEmail} for incident #${incidentId}`);
            } else {
                console.warn(`⚠️  Failed to send notification: ${result.error}`);
            }
        } catch (error) {
            console.error('Error sending incident created notification:', error);
            // Don't throw error - notification failure shouldn't break the main flow
        }
    }

    /**
     * Send notification when incident status changes (RF-004)
     * Notifies the tenant who reported the incident
     */
    static async notifyStatusChanged(
        incidentId: number,
        oldStatusName: string,
        newStatusName: string,
        descripcion: string | null
    ): Promise<void> {
        try {
            // Get incident with reporter data
            const incident = await prisma.incidencia.findUnique({
                where: { id: incidentId },
                include: {
                    reportante: true,
                },
            });

            if (!incident) {
                console.error(`Incident ${incidentId} not found for notification`);
                return;
            }

            const tenantEmail = incident.reportante.correo;

            const emailBody = generateStatusChangedEmail(
                incident.id,
                incident.titulo,
                oldStatusName,
                newStatusName,
                descripcion
            );

            const payload: NotificationPayload = {
                to: tenantEmail,
                subject: `📝 Actualización de Incidencia #${incident.id} - ${incident.titulo}`,
                body: emailBody,
                incidentId: incident.id,
                type: 'status_changed',
            };

            // Send email notification
            const result = await sendEmailNotification(payload);

            // Log notification attempt
            if (result.sent) {
                console.log(`✅ Status change notification sent to ${tenantEmail} for incident #${incidentId}`);
            } else {
                console.warn(`⚠️  Failed to send notification: ${result.error}`);
            }
        } catch (error) {
            console.error('Error sending status changed notification:', error);
            // Don't throw error - notification failure shouldn't break the main flow
        }
    }
}
