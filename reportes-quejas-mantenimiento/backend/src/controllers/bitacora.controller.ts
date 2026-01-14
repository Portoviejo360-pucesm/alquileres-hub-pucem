import { Response, NextFunction } from 'express';
import { BitacoraService } from '../services/bitacora.service';
import { AuthRequest } from '../types';

export class BitacoraController {
    static async addEntry(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params; // incident ID
            const { descripcion } = req.body;

            const result = await BitacoraService.addEntry(
                Number(id),
                user!.id,
                user!.role,
                descripcion
            );

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params; // incident ID

            const result = await BitacoraService.getHistory(
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
}
