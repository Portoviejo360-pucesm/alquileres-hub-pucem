import { z } from 'zod';

// ============================================
// SCHEMA DE VALIDACIÓN PARA REGISTRO
// ============================================

export const registroSchema = z.object({
    body: z.object({
        nombresCompletos: z.string()
            .min(3, 'El nombre debe tener al menos 3 caracteres')
            .max(100, 'El nombre no puede exceder 100 caracteres')
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

        correo: z.string()
            .email('Correo electrónico inválido')
            .max(100, 'El correo no puede exceder 100 caracteres')
            .toLowerCase(),

        password: z.string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .max(100, 'La contraseña no puede exceder 100 caracteres')
            .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
            .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
            .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),

        rolId: z.number()
            .int()
            .positive()
            .default(2) // 2 = Usuario común por defecto
            .optional()
    })
});

// ============================================
// SCHEMA DE VALIDACIÓN PARA LOGIN
// ============================================

export const loginSchema = z.object({
    body: z.object({
        correo: z.string()
            .email('Correo electrónico inválido')
            .toLowerCase(),

        password: z.string()
            .min(1, 'La contraseña es requerida')
    })
});

// ============================================
// TIPOS INFERIDOS
// ============================================

export type RegistroInput = z.infer<typeof registroSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
