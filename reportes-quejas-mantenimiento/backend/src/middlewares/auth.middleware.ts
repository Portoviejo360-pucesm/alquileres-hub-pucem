import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

// Define custom property on Request
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Validate JWT token (issued by external auth module)
        const decoded = jwt.verify(token, config.jwtSecret) as any;

        // Extract user information from token payload
        // Adjust these fields based on your auth module's token structure
        req.user = {
            id: decoded.id || decoded.sub || decoded.userId,
            role: decoded.role || decoded.user_role || 'tenant',
            email: decoded.email,
            rol_id: decoded.rol_id,
        };

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: Token expired'
            });
        }

        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Invalid token'
        });
    }
};
