import { z } from 'zod';

// ============================================
// SCHEMA DE VALIDACIÓN PARA CREAR PROPIEDAD
// ============================================

export const crearPropiedadSchema = z.object({
    body: z.object({
        tituloAnuncio: z.string()
            .min(10, 'El título debe tener al menos 10 caracteres')
            .max(200, 'El título no puede exceder 200 caracteres'),

        descripcion: z.string()
            .min(50, 'La descripción debe tener al menos 50 caracteres')
            .max(2000, 'La descripción no puede exceder 2000 caracteres')
            .optional(),

        precioMensual: z.number()
            .positive('El precio debe ser mayor a 0')
            .max(999999, 'El precio es demasiado alto'),

        direccionTexto: z.string()
            .min(10, 'La dirección debe tener al menos 10 caracteres')
            .optional(),

        latitudMapa: z.number()
            .min(-90, 'Latitud inválida')
            .max(90, 'Latitud inválida'),

        longitudMapa: z.number()
            .min(-180, 'Longitud inválida')
            .max(180, 'Longitud inválida'),

        esAmoblado: z.boolean().default(false),

        estadoId: z.number().int().positive(),

        publicoObjetivoId: z.number().int().positive().optional(),

        // Array de IDs de servicios con flag de inclusión en precio
        servicios: z.array(
            z.object({
                servicioId: z.number().int().positive(),
                incluidoEnPrecio: z.boolean().default(true)
            })
        ).min(1, 'Debe seleccionar al menos un servicio'),

        // Array de URLs de fotos (ya subidas a Supabase)
        fotos: z.array(
            z.object({
                urlImagen: z.string().url('URL de imagen inválida'),
                esPrincipal: z.boolean().default(false)
            })
        ).min(1, 'Debe incluir al menos una foto')
            .refine(
                (fotos) => fotos.filter(f => f.esPrincipal).length === 1,
                'Debe haber exactamente una foto principal'
            )
    })
});

// ============================================
// SCHEMA DE VALIDACIÓN PARA ACTUALIZAR PROPIEDAD
// ============================================

export const actualizarPropiedadSchema = z.object({
    params: z.object({
        id: z.string().transform(val => parseInt(val))
    }),
    body: z.object({
        tituloAnuncio: z.string()
            .min(10, 'El título debe tener al menos 10 caracteres')
            .max(200, 'El título no puede exceder 200 caracteres')
            .optional(),

        descripcion: z.string()
            .min(50, 'La descripción debe tener al menos 50 caracteres')
            .max(2000, 'La descripción no puede exceder 2000 caracteres')
            .optional(),

        precioMensual: z.number()
            .positive('El precio debe ser mayor a 0')
            .max(999999, 'El precio es demasiado alto')
            .optional(),

        direccionTexto: z.string()
            .min(10, 'La dirección debe tener al menos 10 caracteres')
            .optional(),

        latitudMapa: z.number()
            .min(-90, 'Latitud inválida')
            .max(90, 'Latitud inválida')
            .optional(),

        longitudMapa: z.number()
            .min(-180, 'Longitud inválida')
            .max(180, 'Longitud inválida')
            .optional(),

        esAmoblado: z.boolean().optional(),

        estadoId: z.number().int().positive().optional(),

        publicoObjetivoId: z.number().int().positive().optional(),

        servicios: z.array(
            z.object({
                servicioId: z.number().int().positive(),
                incluidoEnPrecio: z.boolean().default(true)
            })
        ).optional(),

        fotos: z.array(
            z.object({
                urlImagen: z.string().url('URL de imagen inválida'),
                esPrincipal: z.boolean().default(false)
            })
        ).optional()
    })
});

// ============================================
// TIPOS INFERIDOS
// ============================================

export type CrearPropiedadInput = z.infer<typeof crearPropiedadSchema>['body'];
export type ActualizarPropiedadInput = z.infer<typeof actualizarPropiedadSchema>['body'];
