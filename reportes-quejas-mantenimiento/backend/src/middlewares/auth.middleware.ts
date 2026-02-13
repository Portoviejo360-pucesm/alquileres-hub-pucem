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

    console.log('🔐 Debug Auth Middleware:');
    console.log('Token recibido:', token.substring(0, 20) + '...');
    console.log('Secret usado para verificar:', config.jwtSecret ? config.jwtSecret.substring(0, 15) + '...' : 'UNDEFINED');

    try {
        // Validate JWT token (issued by external auth module)
        const decoded = jwt.verify(token, config.jwtSecret) as any;

        // Extract user information from token payload
        // Map rol_id to internal role strings for Access Control
        let derivedRole: 'tenant' | 'landlord' | 'admin' = 'tenant';
        if (decoded.rol_id === 1) derivedRole = 'admin';
        if (decoded.rol_id === 2) derivedRole = 'landlord';

        req.user = {
            id: decoded.id || decoded.sub || decoded.userId,
            role: derivedRole,
            email: decoded.email,
            rol_id: decoded.rol_id,
        };

        next();
    } catch (error: any) {
        console.error('❌ JWT Verification Error:', error.message);

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
