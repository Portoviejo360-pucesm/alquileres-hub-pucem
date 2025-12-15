import { Router } from "express";
import {
  getPropiedadesDisponibles,
  postPropiedad,
  putEstadoPropiedad,
} from "../controllers/propiedades.controller";

const router = Router();

router.get("/", getPropiedadesDisponibles);
router.post("/", postPropiedad);
router.put("/:id/estado", putEstadoPropiedad);

export { router as propiedadesRouter };
