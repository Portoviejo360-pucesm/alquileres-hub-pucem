import { z } from 'zod';

// ============================================
// ESQUEMA: Solicitar Verificación
// ============================================

export const solicitudVerificacionSchema = z.object({
    body: z.object({
        cedulaRuc: z.string()
            .min(10, 'La cédula/RUC debe tener al menos 10 caracteres')
            .max(13, 'La cédula/RUC no puede tener más de 13 caracteres'),
        telefonoContacto: z.string()
            .regex(/^0[0-9]{9}$/, 'El teléfono debe tener formato ecuatoriano (10 dígitos, comenzando con 0)'),
        biografiaCorta: z.string()
            .min(20, 'La biografía debe tener al menos 20 caracteres')
            .max(500, 'La biografía no puede exceder 500 caracteres')
            .optional(),
        fotoDocumentoUrl: z.string()
            .url('La URL del documento debe ser válida')
            .optional()
    })
});

// ============================================
// ESQUEMA: Actualizar Solicitud
// ============================================

export const actualizarVerificacionSchema = z.object({
    body: z.object({
        telefonoContacto: z.string()
            .regex(/^0[0-9]{9}$/, 'El teléfono debe tener formato ecuatoriano')
            .optional(),
        biografiaCorta: z.string()
            .min(20, 'La biografía debe tener al menos 20 caracteres')
            .max(500, 'La biografía no puede exceder 500 caracteres')
            .optional(),
        fotoDocumentoUrl: z.string()
            .url('La URL del documento debe ser válida')
            .optional()
    })
});

// ============================================
// ESQUEMA: Aprobar Verificación (Admin)
// ============================================

export const aprobarVerificacionSchema = z.object({
    body: z.object({
        notas: z.string()
            .max(500, 'Las notas no pueden exceder 500 caracteres')
            .optional()
    })
});

// ============================================
// ESQUEMA: Rechazar Verificación (Admin)
// ============================================

export const rechazarVerificacionSchema = z.object({
    body: z.object({
        motivo: z.string()
            .min(10, 'El motivo de rechazo debe tener al menos 10 caracteres')
            .max(500, 'El motivo no puede exceder 500 caracteres')
    })
});
