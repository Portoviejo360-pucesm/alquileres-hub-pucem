import { Request, Response } from 'express';
import { CatalogoService } from '../services/catalogo.service';
import { asyncHandler } from '../middlewares/error.middleware';

// ============================================
// CONTROLADOR DE CATÁLOGOS
// ============================================

export class CatalogoController {

    /**
     * Obtener todos los servicios
     * GET /api/v1/catalogos/servicios
     */
    static obtenerServicios = asyncHandler(async (_req: Request, res: Response) => {
        const servicios = await CatalogoService.obtenerServicios();

        res.status(200).json({
            success: true,
            count: servicios.length,
            data: servicios
        });
    });

    /**
     * Obtener todos los estados de propiedad
     * GET /api/v1/catalogos/estados
     */
    static obtenerEstados = asyncHandler(async (_req: Request, res: Response) => {
        const estados = await CatalogoService.obtenerEstados();

        res.status(200).json({
            success: true,
            count: estados.length,
            data: estados
        });
    });

    /**
     * Obtener todos los tipos de público objetivo
     * GET /api/v1/catalogos/tipos-publico
     */
    static obtenerTiposPublico = asyncHandler(async (_req: Request, res: Response) => {
        const tipos = await CatalogoService.obtenerTiposPublico();

        res.status(200).json({
            success: true,
            count: tipos.length,
            data: tipos
        });
    });

    /**
     * Obtener todos los roles
     * GET /api/v1/catalogos/roles
     */
    static obtenerRoles = asyncHandler(async (_req: Request, res: Response) => {
        const roles = await CatalogoService.obtenerRoles();

        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    });
}
