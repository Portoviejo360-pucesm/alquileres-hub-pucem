import { Request, Response } from "express";
import { PropiedadService } from "./propiedades.service";
import { ok } from "../../utils/response";

export const obtenerDisponibles = async (req: Request, res: Response) => {
  const result = await PropiedadService.obtenerDisponibles();
  return ok(res, result, "Propiedades disponibles obtenidas");
};

export const cambiarEstado = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estado } = req.body;

  const result = await PropiedadService.cambiarEstado(Number(id), estado);
  return ok(res, result, "Estado actualizado correctamente");
};
