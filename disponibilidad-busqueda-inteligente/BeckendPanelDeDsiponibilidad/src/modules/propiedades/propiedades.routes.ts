import { Router } from "express";
import { obtenerDisponibles } from "./propiedades.controller";

export const propiedadesRouter = Router();

propiedadesRouter.get("/", obtenerDisponibles);
