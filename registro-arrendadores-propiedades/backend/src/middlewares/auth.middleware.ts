import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { prisma } from '../config/database';

// ============================================
// EXTENDER TIPOS DE EXPRESS
// ============================================

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                correo: string;
                rolId: number;
            };
        }
    }
}

// ============================================
// INTERFAZ DE PAYLOAD JWT
// ============================================

interface JwtPayload {
    id: string;
    correo: string;
    rolId: number;
}

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        // 1. Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No se proporcionó token de autenticación', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AppError('Token inválido', 401);
        }

        // 2. Verificar el token
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET no está configurado');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // 3. Verificar que el usuario aún existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                correo: true,
                rolId: true
            }
        });

        if (!usuario) {
            throw new AppError('El usuario ya no existe', 401);
        }

        // 4. Adjuntar el usuario al request
        req.user = {
            id: usuario.id,
            correo: usuario.correo,
            rolId: usuario.rolId
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token inválido', 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expirado', 401));
        }
        next(error);
    }
};

// ============================================
// MIDDLEWARE DE AUTORIZACIÓN POR ROL
// ============================================

export const authorize = (...rolesPermitidos: number[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('No autenticado', 401));
        }

        if (!rolesPermitidos.includes(req.user.rolId)) {
            return next(
                new AppError('No tienes permiso para realizar esta acción', 403)
            );
        }

        next();
    };
};
