import { Response, NextFunction } from 'express';
import { ComentarioService } from '../services/comentario.service';
import { AuthRequest } from '../types';

export class ComentarioController {
    static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params; // incident ID
            const { contenido, es_interno } = req.body;

            const result = await ComentarioService.addComment(
                Number(id),
                user!.id,
                user!.role,
                contenido,
                es_interno || false
            );

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getComments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { id } = req.params; // incident ID

            const result = await ComentarioService.getComments(
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

    static async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user } = req;
            const { commentId } = req.params;
            const { contenido } = req.body;

            const result = await ComentarioService.updateComment(
                Number(commentId),
                user!.id,
                contenido
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
