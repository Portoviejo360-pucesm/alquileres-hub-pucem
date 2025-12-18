import { Request, Response, NextFunction } from 'express';

// This middleware is a placeholder. In a real scenario with Supabase, 
// you would verify the JWT from the Authorization header using the Supabase secret.
// For now, we will expect a 'x-user-id' header or just proceed.
// If your frontend sends the Supabase JWT, you should decode it here.

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // START placeholder logic
    // For development, we'll try to read a custom header 'x-user-id'
    // or just allow request (but endpoints needing userId will fail if not present).
    const userId = req.headers['x-user-id'];

    if (userId) {
        // @ts-ignore
        req.user = { id: userId };
    }

    // In production:
    // const token = req.headers.authorization?.split(' ')[1];
    // verify(token) ...
    // END placeholder logic

    next();
};
