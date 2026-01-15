// ============================================
// TIPOS COMPARTIDOS
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    count: number;
    page?: number;
    totalPages?: number;
}

export interface JwtPayload {
    id: string;
    correo: string;
    rolId: number;
}

// Extender tipos de Express para incluir usuario autenticado
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
