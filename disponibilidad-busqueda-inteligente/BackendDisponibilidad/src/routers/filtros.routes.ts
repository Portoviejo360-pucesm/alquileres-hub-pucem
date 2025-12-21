import { Router } from "express";
import { getFiltrarPropiedades } from "../controllers/filtros.controller";
import { validarFiltros } from "../middleware/validarFiltros";

export const filtrosRouter = Router();

filtrosRouter.get("/propiedades", validarFiltros, getFiltrarPropiedades);
