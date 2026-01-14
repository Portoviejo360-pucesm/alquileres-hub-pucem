"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // TODO: Validate token with Supabase or JWT Secret
        // For now, we'll assume a mock user for development until auth is fully integrated
        // const decoded = jwt.verify(token, config.jwtSecret);
        // req.user = decoded;
        // MOCK USER for testing logic before full auth integration
        // This allows me to test the business logic independently
        req.user = {
            id: "mock-user-id",
            role: "tenant", // or "landlord", "admin"
            email: "test@example.com"
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
exports.authenticate = authenticate;
