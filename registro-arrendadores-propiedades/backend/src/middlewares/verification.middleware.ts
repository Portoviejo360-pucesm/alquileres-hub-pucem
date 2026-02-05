import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { prisma } from '../config/database';

// ============================================
// MIDDLEWARE DE VERIFICACIÓN
// ============================================

/**
 * Middleware que verifica si el usuario tiene perfil verificado
 * Debe usarse DESPUÉS del middleware authenticate
 */
export const requireVerification = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError('No autenticado', 401);
        }

        // Obtener el perfil verificado del usuario
        const perfilVerificado = await prisma.perfilVerificado.findUnique({
            where: { usuarioId: req.user.id },
            select: {
                estaVerificado: true
            }
        });

        // Si no tiene perfil verificado o no está verificado
        if (!perfilVerificado || !perfilVerificado.estaVerificado) {
            throw new AppError(
                'Debes verificar tu cuenta para acceder a esta funcionalidad. Ve a tu perfil para solicitar verificación.',
                403
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware que verifica si el usuario es propietario de un recurso
 * Útil para validar que solo el dueño pueda editar/eliminar sus propiedades
 */
export const isOwner = (resourceIdParam: string = 'id') => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new AppError('No autenticado', 401);
            }

            const resourceId = req.params[resourceIdParam];

            if (!resourceId) {
                throw new AppError('ID de recurso no proporcionado', 400);
            }

            // Verificar que la propiedad pertenece al usuario
            const propiedad = await prisma.propiedad.findUnique({
                where: { id: parseInt(resourceId) },
                select: {
                    propietarioId: true
                }
            });

            if (!propiedad) {
                throw new AppError('Recurso no encontrado', 404);
            }

            if (propiedad.propietarioId !== req.user.id) {
                throw new AppError('No tienes permiso para modificar este recurso', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
