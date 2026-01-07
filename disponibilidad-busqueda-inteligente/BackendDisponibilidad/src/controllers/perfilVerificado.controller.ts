import { Request, Response } from "express";
import { obtenerPerfilVerificado } from "../services/perfilVerificado.service";

export const getPerfilVerificado = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const data = await obtenerPerfilVerificado(id);

    return res.status(200).json(data || {
      esta_verificado: false,
    });
  } catch (error) {
    console.error("Error perfil verificado:", error);
    return res.status(500).json({
      message: "Error al obtener perfil verificado",
    });
  }
};
