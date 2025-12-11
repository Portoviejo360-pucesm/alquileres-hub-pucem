import { Request, Response } from "express";
import { FiltroService } from "./filtros.service";

export const buscarPropiedades = async (req: Request, res: Response) => {
  const filtros = req.body;
  const result = await FiltroService.buscar(filtros);
  res.json(result);
};
