import { Request, Response } from "express";
import { obtenerPropietario } from "../services/propietario.service";

export const getPropietario = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const data = await obtenerPropietario(id);

    if (!data) {
      return res.status(404).json({
        message: "Propietario no encontrado",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error propietario:", error);
    return res.status(500).json({
      message: "Error al obtener propietario",
    });
  }
};
