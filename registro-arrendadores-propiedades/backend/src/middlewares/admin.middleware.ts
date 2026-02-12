import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar que el usuario sea administrador
 * Debe usarse después del middleware authenticate
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        // El middleware authenticate ya debe haber agregado el usuario a req
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Verificar que el usuario tenga rol de administrador (rolId === 1)
        if (user.rolId !== 1 && user.rol_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador.'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware requireAdmin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar permisos de administrador'
        });
    }
};
