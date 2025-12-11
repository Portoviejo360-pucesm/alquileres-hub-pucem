import { Router } from "express";
import { buscarPropiedades } from "./filtros.controller";

const filtrosRouter = Router();

filtrosRouter.post("/buscar", buscarPropiedades);

export default filtrosRouter;