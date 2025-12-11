// src/utils/response.ts
import { Response } from "express";

type DataType = unknown;

export const ok = (res: Response, data: DataType, message = "Operación exitosa") => {
  return res.status(200).json({
    ok: true,
    message,
    data,
  });
};

export const created = (res: Response, data: DataType, message = "Recurso creado correctamente") => {
  return res.status(201).json({
    ok: true,
    message,
    data,
  });
};

export const badRequest = (res: Response, message = "Solicitud inválida") => {
  return res.status(400).json({
    ok: false,
    message,
  });
};

export const notFound = (res: Response, message = "Recurso no encontrado") => {
  return res.status(404).json({
    ok: false,
    message,
  });
};

export const serverError = (res: Response, message = "Error interno del servidor") => {
  return res.status(500).json({
    ok: false,
    message,
  });
};
