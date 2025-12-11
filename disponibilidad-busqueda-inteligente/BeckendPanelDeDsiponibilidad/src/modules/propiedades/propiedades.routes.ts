import { Router } from "express";
import { obtenerDisponibles, cambiarEstado } from "./propiedades.controller";

export const propiedadesRouter = Router();

// GET para obtener propiedades disponibles
propiedadesRouter.get("/", obtenerDisponibles);

// PATCH o PUT para cambiar el estado
propiedadesRouter.patch("/:id/estado", cambiarEstado);
