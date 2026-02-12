import { z } from 'zod';

// ============================================
// SCHEMA DE VALIDACIÓN PARA SOLICITAR VERIFICACIÓN
// ============================================

export const solicitarVerificacionSchema = z.object({
    body: z.object({
        cedulaRuc: z.string()
            .min(10, 'La cédula/RUC debe tener al menos 10 caracteres')
            .max(13, 'La cédula/RUC no puede exceder 13 caracteres')
            .regex(/^[0-9]+$/, 'La cédula/RUC solo puede contener números'),

        telefonoContacto: z.string()
            .min(7, 'El teléfono debe tener al menos 7 caracteres')
            .max(20, 'El teléfono no puede exceder 20 caracteres'),

        biografiaCorta: z.string()
            .min(10, 'La biografía debe tener al menos 10 caracteres')
            .max(500, 'La biografía no puede exceder 500 caracteres')
            .optional(),

        fotoDocumentoUrl: z.string()
            .optional() // Hacemos opcional y quitamos validación estricta de URL por si viene vacía
    })
});

// ============================================
// TIPOS INFERIDOS
// ============================================

export type SolicitarVerificacionInput = z.infer<typeof solicitarVerificacionSchema>['body'];
