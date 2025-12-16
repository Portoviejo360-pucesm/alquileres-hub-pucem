import { Request, Response } from 'express';
import { PerfilService } from '../services/perfil.service';
import { asyncHandler } from '../middlewares/error.middleware';

// ============================================
// CONTROLADOR DE PERFIL DE ARRENDADOR
// ============================================

export class PerfilController {

    /**
     * Solicitar verificación de perfil
     * POST /api/v1/perfil/solicitar-verificacion
     */
    static solicitarVerificacion = asyncHandler(async (req: Request, res: Response) => {
        const usuarioId = req.user!.id;
        const data = req.body;

        const resultado = await PerfilService.solicitarVerificacion(usuarioId, data);

        res.status(201).json({
            success: true,
            ...resultado
        });
    });

    /**
     * Obtener estado de verificación
     * GET /api/v1/perfil/estado-verificacion
     */
    static obtenerEstadoVerificacion = asyncHandler(async (req: Request, res: Response) => {
        const usuarioId = req.user!.id;

        const resultado = await PerfilService.obtenerEstadoVerificacion(usuarioId);

        res.status(200).json({
            success: true,
            data: resultado
        });
    });

    /**
     * Actualizar perfil
     * PUT /api/v1/perfil
     */
    static actualizarPerfil = asyncHandler(async (req: Request, res: Response) => {
        const usuarioId = req.user!.id;
        const data = req.body;

        const resultado = await PerfilService.actualizarPerfil(usuarioId, data);

        res.status(200).json({
            success: true,
            ...resultado
        });
    });
}
