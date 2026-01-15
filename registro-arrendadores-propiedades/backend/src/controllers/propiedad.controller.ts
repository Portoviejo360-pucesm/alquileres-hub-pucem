import { Request, Response } from 'express';
import { PropiedadService } from '../services/propiedad.service';
import { asyncHandler } from '../middlewares/error.middleware';

// ============================================
// CONTROLADOR DE PROPIEDADES
// ============================================

export class PropiedadController {

    /**
     * Crear una nueva propiedad
     * POST /api/v1/propiedades
     */
    static crearPropiedad = asyncHandler(async (req: Request, res: Response) => {
        // El propietarioId viene del middleware de autenticación
        const propietarioId = req.user!.id;
        const data = req.body;

        const propiedad = await PropiedadService.crearPropiedad(propietarioId, data);

        res.status(201).json({
            success: true,
            message: 'Propiedad creada exitosamente',
            data: propiedad
        });
    });

    /**
     * Obtener todas las propiedades con filtros opcionales
     * GET /api/v1/propiedades
     */
    static obtenerPropiedades = asyncHandler(async (req: Request, res: Response) => {
        const filtros = {
            estadoId: req.query.estadoId ? parseInt(req.query.estadoId as string) : undefined,
            publicoObjetivoId: req.query.publicoObjetivoId ? parseInt(req.query.publicoObjetivoId as string) : undefined,
            precioMin: req.query.precioMin ? parseFloat(req.query.precioMin as string) : undefined,
            precioMax: req.query.precioMax ? parseFloat(req.query.precioMax as string) : undefined,
            esAmoblado: req.query.esAmoblado === 'true' ? true : req.query.esAmoblado === 'false' ? false : undefined
        };

        const propiedades = await PropiedadService.obtenerPropiedades(filtros);

        res.status(200).json({
            success: true,
            count: propiedades.length,
            data: propiedades
        });
    });

    /**
     * Obtener una propiedad por ID
     * GET /api/v1/propiedades/:id
     */
    static obtenerPropiedadPorId = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        const propiedad = await PropiedadService.obtenerPropiedadPorId(id);

        res.status(200).json({
            success: true,
            data: propiedad
        });
    });

    /**
     * Actualizar una propiedad
     * PUT /api/v1/propiedades/:id
     */
    static actualizarPropiedad = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const propietarioId = req.user!.id;
        const data = req.body;

        const propiedad = await PropiedadService.actualizarPropiedad(id, propietarioId, data);

        res.status(200).json({
            success: true,
            message: 'Propiedad actualizada exitosamente',
            data: propiedad
        });
    });

    /**
     * Eliminar una propiedad
     * DELETE /api/v1/propiedades/:id
     */
    static eliminarPropiedad = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const propietarioId = req.user!.id;

        const result = await PropiedadService.eliminarPropiedad(id, propietarioId);

        res.status(200).json({
            success: true,
            ...result
        });
    });

    /**
     * Obtener propiedades del usuario autenticado
     * GET /api/v1/propiedades/mis-propiedades
     */
    static obtenerMisPropiedades = asyncHandler(async (req: Request, res: Response) => {
        const propietarioId = req.user!.id;

        const propiedades = await PropiedadService.obtenerPropiedadesPorUsuario(propietarioId);

        res.status(200).json({
            success: true,
            count: propiedades.length,
            data: propiedades
        });
    });
}
