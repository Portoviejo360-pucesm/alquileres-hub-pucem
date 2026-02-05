"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBitacoraSchema = exports.addComentarioSchema = exports.updateIncidenciaSchema = exports.createIncidenciaSchema = void 0;
const zod_1 = require("zod");
exports.createIncidenciaSchema = zod_1.z.object({
    body: zod_1.z.object({
        titulo: zod_1.z.string().min(3).max(200),
        descripcion: zod_1.z.string().min(10),
        prioridad_codigo: zod_1.z.string().min(1),
        categoria_codigo: zod_1.z.string().optional(),
        propiedad_id: zod_1.z.number().int().positive(),
    }),
});
exports.updateIncidenciaSchema = zod_1.z.object({
    body: zod_1.z.object({
        titulo: zod_1.z.string().min(3).max(200).optional(),
        descripcion: zod_1.z.string().min(10).optional(),
        estado_codigo: zod_1.z.string().optional(),
        prioridad_codigo: zod_1.z.string().optional(),
        categoria_codigo: zod_1.z.string().optional(),
        comentario: zod_1.z.string().optional(), // For status change justification
    }),
});
exports.addComentarioSchema = zod_1.z.object({
    body: zod_1.z.object({
        contenido: zod_1.z.string().min(1),
        es_interno: zod_1.z.boolean().optional(),
    }),
});
exports.addBitacoraSchema = zod_1.z.object({
    body: zod_1.z.object({
        descripcion: zod_1.z.string().min(5),
    }),
});
