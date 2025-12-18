import { Request, Response } from "express";
import { obtenerFotosPropiedad } from "../services/fotos.service";

export const getFotosPropiedad = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const fotos = await obtenerFotosPropiedad(id);

    return res.status(200).json(fotos);
  } catch (error) {
    console.error("Error fotos:", error);
    return res.status(500).json({
      message: "Error al obtener fotos",
    });
  }
};
