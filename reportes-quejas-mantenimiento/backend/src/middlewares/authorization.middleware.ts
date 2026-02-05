import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ForbiddenError } from '../utils/errors';

/**
 * Middleware to require specific role(s)
 * @param allowedRoles - Array of allowed roles
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: User not authenticated'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden: Insufficient permissions'
            });
        }

        next();
    };
};

/**
 * Middleware to check if user is landlord or admin
 */
export const requireLandlordOrAdmin = requireRole(['landlord', 'admin']);

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin']);
