import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

// ============================================
// CLASE DE ERROR PERSONALIZADA
// ============================================

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log del error (en producción usar un logger apropiado)
    console.error('❌ Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Error de validación de Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // Errores de Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return handlePrismaError(err, res);
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación en la base de datos',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error personalizado de la aplicación
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Error genérico
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// ============================================
// MANEJO DE ERRORES ESPECÍFICOS DE PRISMA
// ============================================

const handlePrismaError = (
    err: Prisma.PrismaClientKnownRequestError,
    res: Response
) => {
    switch (err.code) {
        case 'P2002':
            // Violación de constraint único
            const field = (err.meta?.target as string[])?.join(', ') || 'campo';
            return res.status(409).json({
                success: false,
                message: `Ya existe un registro con ese ${field}`,
                field
            });

        case 'P2003':
            // Violación de foreign key
            return res.status(400).json({
                success: false,
                message: 'Referencia inválida a un registro relacionado'
            });

        case 'P2025':
            // Registro no encontrado
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });

        case 'P2014':
            // Violación de relación requerida
            return res.status(400).json({
                success: false,
                message: 'Relación requerida no encontrada'
            });

        default:
            return res.status(500).json({
                success: false,
                message: 'Error en la base de datos',
                code: err.code,
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
    }
};

// ============================================
// WRAPPER PARA ASYNC HANDLERS
// ============================================

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
