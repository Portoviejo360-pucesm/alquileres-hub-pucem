import { Response, NextFunction } from 'express';
import { AdjuntoService } from '../services/adjunto.service';
import { AuthRequest } from '../types';

export class AdjuntoController {
    static async upload(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params; // incident ID
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No se proporcionó ningún archivo'
                });
            }

            const result = await AdjuntoService.uploadFile(
                Number(id),
                user!.id,
                user!.role,
                file
            );

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAttachments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params; // incident ID

            const result = await AdjuntoService.getAttachments(
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

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { adjuntoId } = req.params;

            const result = await AdjuntoService.deleteFile(
                Number(adjuntoId),
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
}
