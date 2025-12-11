import { Request, Response } from "express";

export const obtenerDisponibles = async (req: Request, res: Response) => {
  res.json({
    mensaje: "BECKEND LEVANTANDO",
  });
};
