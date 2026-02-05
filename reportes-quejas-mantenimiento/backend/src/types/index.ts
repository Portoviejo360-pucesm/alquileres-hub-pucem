import { Request } from 'express';

// User types based on external auth module
export interface AuthUser {
    id: string;
    role: 'tenant' | 'landlord' | 'admin';
    email: string;
    rol_id?: number;
}

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
    user?: AuthUser;
}

// Service response types
export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}

// Notification types
export interface NotificationPayload {
    to: string;
    subject: string;
    body: string;
    incidentId: number;
    type: 'incident_created' | 'status_changed' | 'comment_added';
}

export interface NotificationResult {
    sent: boolean;
    error?: string;
}
