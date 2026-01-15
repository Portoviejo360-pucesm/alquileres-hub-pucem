import { Request, Response } from 'express';
import * as reservaService from '../services/reservaService';

export const create = async (req: Request, res: Response) => {
    try {
        const { propiedadId, fechaEntrada, fechaSalida } = req.body;
        // @ts-ignore
        const usuarioId = req.user?.id || req.body.usuarioId; // Fallback to body for testing

        if (!usuarioId) {
            return res.status(401).json({ error: 'Usuario no identificado' });
        }

        const reserva = await reservaService.createReserva({
            usuarioId,
            propiedadId: Number(propiedadId),
            fechaEntrada: new Date(fechaEntrada),
            fechaSalida: new Date(fechaSalida)
        });

        res.status(201).json(reserva);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMyReservations = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const usuarioId = req.user?.id || req.query.usuarioId;

        if (!usuarioId) {
            return res.status(401).json({ error: 'Usuario no identificado' });
        }

        const reservas = await reservaService.getReservasByUser(String(usuarioId));
        res.json(reservas);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const cancel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const usuarioId = req.user?.id || req.body.usuarioId;

        if (!usuarioId) {
            return res.status(401).json({ error: 'Usuario no identificado' });
        }

        const reserva = await reservaService.cancelReserva(id, String(usuarioId));
        res.json(reserva);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
