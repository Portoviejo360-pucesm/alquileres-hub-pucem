import jwt from 'jsonwebtoken';

// ============================================
// CONFIGURACIÓN DE JWT
// ============================================

interface JwtPayload {
    id: string;
    correo: string;
    rolId: number;
}

/**
 * Generar token JWT
 */
export const generateToken = (payload: JwtPayload): string => {
    const secret = process.env.JWT_SECRET;
    console.log('🖊️ Debug JWT Signing:');
    console.log('Secret usado para firmar:', secret ? secret.substring(0, 15) + '...' : 'UNDEFINED');
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!secret) {
        throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verificar token JWT
 */
export const verifyToken = (token: string): JwtPayload => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    return jwt.verify(token, secret) as JwtPayload;
};
