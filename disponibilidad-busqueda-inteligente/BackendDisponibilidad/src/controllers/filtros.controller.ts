import { Request, Response } from "express";
import { filtrarPropiedades } from "../services/filtros.service";
import { success, error } from "../utils/response";

export const getFiltrarPropiedades = async (req: Request, res: Response) => {
  try {
    const filtros = {
      estado: req.query.estado
        ? String(req.query.estado).toUpperCase()
        : undefined,

      publico_objetivo_id: req.query.publico_objetivo_id
        ? Number(req.query.publico_objetivo_id)
        : undefined,

      precio_min: req.query.precio_min
        ? Number(req.query.precio_min)
        : undefined,

      precio_max: req.query.precio_max
        ? Number(req.query.precio_max)
        : undefined,
    };

    const data = await filtrarPropiedades(filtros);

    return success(
      res,
      data,
      data.length
        ? "Propiedades encontradas"
        : "No existen propiedades con los filtros aplicados"
    );

  } catch (err) {
    console.error("Error en filtro:", err);
    return error(res, "Error al filtrar propiedades");
  }
};
