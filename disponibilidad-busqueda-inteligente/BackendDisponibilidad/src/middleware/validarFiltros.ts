import { Request, Response, NextFunction } from "express";

export const validarFiltros = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { precio_min, precio_max, publico_objetivo_id } = req.query;

    if (precio_min && precio_max && Number(precio_min) > Number(precio_max)) {
    return res.status(400).json({
      message: "precio_min no puede ser mayor que precio_max",
    });
  }

  if (precio_min && Number.isNaN(Number(precio_min))) {
    return res.status(400).json({
      message: "precio_min debe ser numérico",
    });
  }

  if (precio_max && Number.isNaN(Number(precio_max))) {
    return res.status(400).json({
      message: "precio_max debe ser numérico",
    });
  }

  if (precio_min && precio_max && Number(precio_min) > Number(precio_max)) {
    return res.status(400).json({
      message: "precio_min no puede ser mayor que precio_max",
    });
  }

  if (publico_objetivo_id && Number.isNaN(Number(publico_objetivo_id))) {
    return res.status(400).json({
      message: "publico_objetivo_id debe ser numérico",
    });
  }

  next(); // ✅ todo ok, sigue al controller
};
