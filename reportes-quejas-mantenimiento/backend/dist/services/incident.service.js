"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentService = void 0;
const config_1 = require("../config");
class IncidentService {
    static async create(data) {
        // 1. Validate property existence
        const propiedad = await config_1.prisma.propiedad.findUnique({
            where: { id_propiedad: data.propiedad_id },
        });
        if (!propiedad)
            throw new Error('Propiedad no encontrada');
        // 2. Resolve catalogs
        const estado = await config_1.prisma.estado.findUnique({ where: { codigo: 'pendiente' } });
        if (!estado)
            throw new Error('Estado inicial no configurado');
        const prioridad = await config_1.prisma.prioridad.findUnique({ where: { codigo: data.prioridad_codigo } });
        if (!prioridad)
            throw new Error(`Prioridad ${data.prioridad_codigo} no encontrada`);
        let categoria_id = null;
        if (data.categoria_codigo) {
            const categoria = await config_1.prisma.categoria.findUnique({ where: { codigo: data.categoria_codigo } });
            if (categoria)
                categoria_id = categoria.id;
        }
        // 3. Create Incident
        const incidencia = await config_1.prisma.incidencia.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                estado_id: estado.id,
                prioridad_id: prioridad.id,
                categoria_id: categoria_id,
                propiedad_id: data.propiedad_id,
                usuario_reportante_id: data.usuario_reportante_id,
            },
        });
        // 4. Create History Log
        await config_1.prisma.historialIncidencia.create({
            data: {
                incidencia_id: incidencia.id,
                usuario_id: data.usuario_reportante_id,
                accion: 'creada',
                descripcion: 'Incidencia reportada',
            },
        });
        return incidencia;
    }
    static async getAll(filters) {
        const where = {};
        // Access Control Logic
        if (filters.rol === 'tenant') {
            // Tenants see only their own reports
            where.usuario_reportante_id = filters.usuario_id;
        }
        else if (filters.rol === 'landlord') {
            // Landlords see incidents for properties they own
            where.propiedad = {
                propietario_id: filters.usuario_id
            };
        }
        // Admins see all (no filter added)
        // Additional Filters
        if (filters.estado_codigo) {
            where.estado = { codigo: filters.estado_codigo };
        }
        if (filters.propiedad_id) {
            where.propiedad_id = filters.propiedad_id;
        }
        const [incidencias, total] = await Promise.all([
            config_1.prisma.incidencia.findMany({
                where,
                include: {
                    estado: true,
                    prioridad: true,
                    categoria: true,
                    propiedad: {
                        select: { titulo_anuncio: true }
                    },
                    reportante: {
                        select: { nombres_completos: true, correo: true }
                    }
                },
                orderBy: { fecha_creacion: 'desc' },
                take: filters.limit || 10,
                skip: filters.offset || 0,
            }),
            config_1.prisma.incidencia.count({ where }),
        ]);
        return { incidencias, total };
    }
}
exports.IncidentService = IncidentService;
