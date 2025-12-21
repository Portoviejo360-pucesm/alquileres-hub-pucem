import { Request, Response } from "express";
import { obtenerServiciosPorPropiedad } from "../services/servicios.service";
import { emitirServiciosActualizados } from "../modules/tiempo-real/panel.gateway";
import { success, error } from "../utils/response";

export const getServiciosPropiedad = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const servicios = await obtenerServiciosPorPropiedad(id);

  emitirServiciosActualizados({
    id_propiedad: id,
    servicios,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    data: servicios,
  });
};

