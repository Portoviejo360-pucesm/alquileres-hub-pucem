import { Response, NextFunction } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../types';

export class CatalogController {
    /**
     * Get all estados (incident states)
     */
    static async getEstados(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const estados = await prisma.estado.findMany({
                where: { activo: true },
                orderBy: { orden: 'asc' },
                select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    descripcion: true,
                    orden: true,
                }
            });

            res.json({
                status: 'success',
                data: estados
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all prioridades (incident priorities)
     */
    static async getPrioridades(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const prioridades = await prisma.prioridad.findMany({
                where: { activo: true },
                orderBy: { nivel: 'asc' },
                select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    descripcion: true,
                    nivel: true,
                    color: true,
                }
            });

            res.json({
                status: 'success',
                data: prioridades
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all categorias (incident categories)
     */
    static async getCategorias(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const categorias = await prisma.categoria.findMany({
                where: { activo: true },
                orderBy: { nombre: 'asc' },
                select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    descripcion: true,
                }
            });

            res.json({
                status: 'success',
                data: categorias
            });
        } catch (error) {
            next(error);
        }
    }
}
