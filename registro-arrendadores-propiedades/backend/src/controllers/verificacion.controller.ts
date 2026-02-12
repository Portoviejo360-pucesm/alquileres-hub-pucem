import { Request, Response, NextFunction } from 'express';
import { VerificacionService } from '../services/verificacion.service';

// ============================================
// CONTROLADOR DE VERIFICACIÓN (USUARIO)
// ============================================

export class VerificacionController {

    /**
     * Solicitar verificación
     */
    static async solicitarVerificacion(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user!.id;
            const data = req.body;

            const perfil = await VerificacionService.solicitarVerificacion(usuarioId, data);

            res.status(201).json({
                success: true,
                message: 'Solicitud de verificación enviada correctamente',
                data: perfil
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener estado de verificación
     */
    static async obtenerMiEstado(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user!.id;

            const estado = await VerificacionService.obtenerEstadoVerificacion(usuarioId);

            res.status(200).json({
                success: true,
                data: estado
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar solicitud
     */
    static async actualizarSolicitud(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user!.id;
            const data = req.body;

            const perfil = await VerificacionService.actualizarSolicitud(usuarioId, data);

            res.status(200).json({
                success: true,
                message: 'Solicitud actualizada correctamente',
                data: perfil
            });
        } catch (error) {
            next(error);
        }
    }
}
