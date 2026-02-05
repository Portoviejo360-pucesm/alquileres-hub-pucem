import { z } from 'zod';

export const createIncidenciaSchema = z.object({
    body: z.object({
        titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
        descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
        prioridad_codigo: z.string().min(1, 'La prioridad es requerida'),
        categoria_codigo: z.string().optional(),
        propiedad_id: z.number().int().positive('El ID de propiedad debe ser un número positivo'),
    }),
});

export const updateIncidenciaSchema = z.object({
    body: z.object({
        titulo: z.string().min(3).max(200).optional(),
        descripcion: z.string().min(10).optional(),
        prioridad_codigo: z.string().optional(),
        categoria_codigo: z.string().optional(),
        responsable_id: z.string().uuid().optional(),
    }),
});

export const updateStatusSchema = z.object({
    body: z.object({
        estado_codigo: z.string().min(1, 'El código de estado es requerido'),
        descripcion: z.string().optional(),
    }),
});

export const addComentarioSchema = z.object({
    body: z.object({
        contenido: z.string().min(1, 'El contenido del comentario es requerido'),
        es_interno: z.boolean().optional(),
    }),
});

export const addBitacoraSchema = z.object({
    body: z.object({
        descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
    }),
});
