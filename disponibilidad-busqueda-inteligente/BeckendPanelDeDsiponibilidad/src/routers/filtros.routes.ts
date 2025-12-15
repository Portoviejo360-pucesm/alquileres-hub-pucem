import { Router } from "express";
import { getFiltrarPropiedades } from "../controllers/filtros.controller";

export const filtrosRouter = Router();

filtrosRouter.get("/propiedades", getFiltrarPropiedades);
