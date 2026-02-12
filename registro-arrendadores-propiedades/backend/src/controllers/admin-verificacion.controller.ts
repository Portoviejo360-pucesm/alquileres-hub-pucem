import { Request, Response, NextFunction } from 'express';
import { AdminVerificacionService } from '../services/admin-verificacion.service';

// ============================================
// CONTROLADOR DE VERIFICACIÓN (ADMINISTRADOR)
// ============================================

export class AdminVerificacionController {

    /**
     * Listar solicitudes pendientes
     */
    static async listarPendientes(req: Request, res: Response, next: NextFunction) {
        try {
            const solicitudes = await AdminVerificacionService.listarSolicitudesPendientes();

            res.status(200).json({
                success: true,
                data: solicitudes,
                total: solicitudes.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Listar todas las verificaciones
     */
    static async listarTodas(req: Request, res: Response, next: NextFunction) {
        try {
            const { estado, busqueda } = req.query;

            const verificaciones = await AdminVerificacionService.listarTodasVerificaciones({
                estado: estado as any,
                busqueda: busqueda as string
            });

            // Obtener estadísticas
            const estadisticas = await AdminVerificacionService.obtenerEstadisticas();

            res.status(200).json({
                success: true,
                data: verificaciones,
                total: verificaciones.length,
                estadisticas
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener detalle de verificación
     */
    static async obtenerDetalle(req: Request, res: Response, next: NextFunction) {
        try {
            const perfilId = parseInt(req.params.id);

            if (isNaN(perfilId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de perfil inválido'
                });
            }

            const perfil = await AdminVerificacionService.obtenerDetalleVerificacion(perfilId);

            res.status(200).json({
                success: true,
                data: perfil
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Aprobar verificación
     */
    static async aprobarVerificacion(req: Request, res: Response, next: NextFunction) {
        try {
            const perfilId = parseInt(req.params.id);
            const adminId = req.user!.id;
            const { notas } = req.body;

            if (isNaN(perfilId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de perfil inválido'
                });
            }

            const perfil = await AdminVerificacionService.aprobarVerificacion(perfilId, adminId, notas);

            res.status(200).json({
                success: true,
                message: `Verificación aprobada para ${perfil.usuario.nombresCompletos}`,
                data: perfil
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Rechazar verificación
     */
    static async rechazarVerificacion(req: Request, res: Response, next: NextFunction) {
        try {
            const perfilId = parseInt(req.params.id);
            const adminId = req.user!.id;
            const { motivo } = req.body;

            if (isNaN(perfilId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de perfil inválido'
                });
            }

            const perfil = await AdminVerificacionService.rechazarVerificacion(perfilId, adminId, motivo);

            res.status(200).json({
                success: true,
                message: `Verificación rechazada para ${perfil.usuario.nombresCompletos}`,
                data: perfil
            });
        } catch (error) {
            next(error);
        }
    }
}
