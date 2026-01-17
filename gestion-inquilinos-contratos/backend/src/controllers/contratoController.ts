import { Request, Response } from 'express';
import * as contratoService from '../services/contratoService';
import path from 'path';

export const generar = async (req: Request, res: Response) => {
    try {
        console.log('[Controller] Generar Contrato Request Body:', req.body);
        const { reservaId } = req.body;
        // @ts-ignore
        const usuarioId = req.user?.id || req.body.usuarioId;
        console.log('[Controller] Usuario ID resolved:', usuarioId);

        const contrato = await contratoService.generarContrato(reservaId, String(usuarioId));
        res.status(201).json(contrato);
    } catch (error: any) {
        console.error('[Controller] Error generating contract:', error);
        res.status(400).json({ error: error.message });
    }
};

export const descargar = async (req: Request, res: Response) => {
    try {
        const { reservaId } = req.params;
        // @ts-ignore
        const usuarioId = req.user?.id || req.query.usuarioId;

        const contrato = await contratoService.getContratoByReserva(reservaId, String(usuarioId));

        // Serve file
        // Note: In real app, redirect to signed URL or stream from storage.
        // Here we serve local file.
        const fileName = path.basename(contrato.urlArchivo);
        const filePath = path.join(__dirname, '../../uploads', fileName);

        res.download(filePath, fileName);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};
