import { Request, Response, NextFunction } from "express";

export const validarFiltros = (req: Request, res: Response, next: NextFunction) => {
  const { precioMin, precioMax, tipo_publico } = req.body;

  if (precioMin && isNaN(precioMin)) {
    return res.status(400).json({ error: "precioMin debe ser numérico" });
  }

  if (precioMax && isNaN(precioMax)) {
    return res.status(400).json({ error: "precioMax debe ser numérico" });
  }

  if (precioMin && precioMax && precioMin > precioMax) {
    return res.status(400).json({ error: "precioMin no puede ser mayor que precioMax" });
  }

  // Si todo está bien → continúa con el controlador
  next();
};
