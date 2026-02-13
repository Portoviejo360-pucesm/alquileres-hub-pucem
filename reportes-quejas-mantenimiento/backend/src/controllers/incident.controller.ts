import { Response, NextFunction } from 'express';
import { IncidentService } from '../services/incident.service';
import { AuthRequest } from '../types';
import { BadRequestError } from '../utils/errors';
import { prisma } from '../config';

export class IncidentController {
    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;

            // Parse body data (comes as form-data when files are included)
            const data = {
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                prioridad_codigo: req.body.prioridad_codigo,
                categoria_codigo: req.body.categoria_codigo,
                propiedad_id: parseInt(req.body.propiedad_id)
            };

            // Validate required fields
            if (!data.titulo || data.titulo.length < 3) {
                throw new BadRequestError('El título debe tener al menos 3 caracteres');
            }
            if (!data.descripcion || data.descripcion.length < 10) {
                throw new BadRequestError('La descripción debe tener al menos 10 caracteres');
            }
            if (!data.prioridad_codigo) {
                throw new BadRequestError('La prioridad es requerida');
            }
            if (!data.propiedad_id || isNaN(data.propiedad_id) || data.propiedad_id < 1) {
                throw new BadRequestError('El ID de propiedad debe ser un número positivo');
            }

            // Get files if uploaded
            const files = req.files as Express.Multer.File[] | undefined;

            const result = await IncidentService.create({
                ...data,
                usuario_reportante_id: user!.id
            }, files);

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { estado, propiedad, limit, offset } = req.query;

            const result = await IncidentService.getAll({
                usuario_id: user!.id,
                rol: user!.role,
                estado_codigo: estado as string,
                propiedad_id: propiedad ? Number(propiedad) : undefined,
                limit: limit ? Number(limit) : 10,
                offset: offset ? Number(offset) : 0,
            });

            res.json({
                status: 'success',
                data: result.incidencias,
                total: result.total,
                limit: limit ? Number(limit) : 10,
                offset: offset ? Number(offset) : 0,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params;

            const result = await IncidentService.getById(
                Number(id),
                user!.id,
                user!.role
            );

            res.json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params;
            const data = req.body;

            const result = await IncidentService.update(
                Number(id),
                user!.id,
                user!.role,
                data
            );

            res.json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params;
            const { estado_codigo, descripcion } = req.body;

            const result = await IncidentService.updateStatus(
                Number(id),
                user!.id,
                user!.role,
                estado_codigo,
                descripcion
            );

            res.json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params;

            const result = await IncidentService.delete(
                Number(id),
                user!.id,
                user!.role
            );

            res.json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get properties where user has active contracts (for incident creation)
     */
    static async getUserProperties(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            let propiedades = [];

            if (user?.role === 'landlord') {
                // If landlord, get owned properties
                propiedades = await prisma.propiedad.findMany({
                    where: {
                        propietario_id: user.id
                    },
                    select: {
                        id_propiedad: true,
                        titulo_anuncio: true,
                        direccion_texto: true,
                        precio_mensual: true,
                    }
                });
            } else {
                // If tenant (or other), get properties with active reservations
                const reservas = await prisma.reserva.findMany({
                    where: {
                        usuario_id: user!.id,
                        estado: 'CONFIRMADA',
                        fecha_salida: { gte: new Date() },
                    },
                    include: {
                        propiedad: {
                            select: {
                                id_propiedad: true,
                                titulo_anuncio: true,
                                direccion_texto: true,
                                precio_mensual: true,
                            }
                        }
                    }
                });
                propiedades = reservas.map((r: any) => r.propiedad);
            }

            res.json({
                status: 'success',
                data: propiedades
            });
        } catch (error) {
            next(error);
        }
    }
}
