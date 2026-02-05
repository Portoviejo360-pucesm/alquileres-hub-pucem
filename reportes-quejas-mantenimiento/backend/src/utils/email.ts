import nodemailer from 'nodemailer';
import { config } from '../config';
import { NotificationPayload, NotificationResult } from '../types';

// Create email transporter
const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false, // true for 465, false for other ports
    auth: config.smtp.user && config.smtp.pass ? {
        user: config.smtp.user,
        pass: config.smtp.pass,
    } : undefined,
});

/**
 * Send email notification
 * @param payload - Notification payload
 * @returns Result of email send operation
 */
export async function sendEmailNotification(
    payload: NotificationPayload
): Promise<NotificationResult> {
    try {
        // Skip sending if SMTP is not configured
        if (!config.smtp.user || !config.smtp.pass) {
            console.warn('⚠️  SMTP not configured, skipping email notification');
            return { sent: false, error: 'SMTP not configured' };
        }

        const info = await transporter.sendMail({
            from: config.emailFrom,
            to: payload.to,
            subject: payload.subject,
            html: payload.body,
        });

        console.log('✅ Email sent:', info.messageId);
        return { sent: true };
    } catch (error: any) {
        console.error('❌ Failed to send email:', error);
        return { sent: false, error: error.message };
    }
}

/**
 * Generate email template for incident created notification
 */
export function generateIncidentCreatedEmail(
    incidentId: number,
    titulo: string,
    descripcion: string,
    prioridad: string,
    categoria: string | null,
    propiedad: string
): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #495057; }
                .value { color: #212529; }
                .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🔔 Nueva Incidencia Reportada</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">ID de Incidencia:</span>
                        <span class="value">#${incidentId}</span>
                    </div>
                    <div class="field">
                        <span class="label">Propiedad:</span>
                        <span class="value">${propiedad}</span>
                    </div>
                    <div class="field">
                        <span class="label">Título:</span>
                        <span class="value">${titulo}</span>
                    </div>
                    <div class="field">
                        <span class="label">Descripción:</span>
                        <span class="value">${descripcion}</span>
                    </div>
                    <div class="field">
                        <span class="label">Prioridad:</span>
                        <span class="value">${prioridad}</span>
                    </div>
                    ${categoria ? `
                    <div class="field">
                        <span class="label">Categoría:</span>
                        <span class="value">${categoria}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático del sistema Portoviejo360. Por favor no responda a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Generate email template for status change notification
 */
export function generateStatusChangedEmail(
    incidentId: number,
    titulo: string,
    oldStatus: string,
    newStatus: string,
    descripcion: string | null
): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #495057; }
                .value { color: #212529; }
                .status-change { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
                .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>📝 Actualización de Incidencia</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">ID de Incidencia:</span>
                        <span class="value">#${incidentId}</span>
                    </div>
                    <div class="field">
                        <span class="label">Título:</span>
                        <span class="value">${titulo}</span>
                    </div>
                    <div class="status-change">
                        <div class="field">
                            <span class="label">Estado Anterior:</span>
                            <span class="value">${oldStatus}</span>
                        </div>
                        <div class="field">
                            <span class="label">Nuevo Estado:</span>
                            <span class="value">${newStatus}</span>
                        </div>
                        ${descripcion ? `
                        <div class="field">
                            <span class="label">Descripción:</span>
                            <span class="value">${descripcion}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático del sistema Portoviejo360. Por favor no responda a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
