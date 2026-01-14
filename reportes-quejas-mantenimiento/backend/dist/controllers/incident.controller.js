"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentController = void 0;
const incident_service_1 = require("../services/incident.service");
class IncidentController {
    static async create(req, res, next) {
        try {
            const { user } = req; // From auth middleware
            const data = req.body;
            // TODO: Verify if user has valid contract for property (Business Rule)
            // For now, assuming middleware or service handles basic auth check
            const result = await incident_service_1.IncidentService.create({
                ...data,
                usuario_reportante_id: user.id
            });
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async list(req, res, next) {
        try {
            const { user } = req;
            const { estado, propiedad, limit, offset } = req.query;
            const result = await incident_service_1.IncidentService.getAll({
                usuario_id: user.id,
                rol: user.role, // 'tenant' | 'landlord' | 'admin'
                estado_codigo: estado,
                propiedad_id: propiedad ? Number(propiedad) : undefined,
                limit: limit ? Number(limit) : 10,
                offset: offset ? Number(offset) : 0,
            });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.IncidentController = IncidentController;
