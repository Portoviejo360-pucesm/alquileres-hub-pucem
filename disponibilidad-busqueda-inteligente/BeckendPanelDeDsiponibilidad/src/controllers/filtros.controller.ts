import { Request, Response } from "express";
import { filtrarPropiedades } from "../services/filtros.service";

export const getFiltrarPropiedades = async (req: Request, res: Response) => {
  try {
    const filtros = {
      estado: req.query.estado as string,
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
    if (data.length === 0) {
      return res.json({
        message: "No existen propiedades con los filtros aplicados",
        data: []
      });
    }
    res.json(data);
  } catch (error) {
    console.error("Error en filtro:", error);
    res.status(500).json({
      message: "Error al filtrar propiedades",
    });
  }
};

