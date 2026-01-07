import { Router } from "express";
import {
  getPropiedadesDisponibles,
  postPropiedad,
  putEstadoPropiedad,
} from "../controllers/propiedades.controller";

import { getPropietario } from "../controllers/propietario.controller";
import { getPerfilVerificado } from "../controllers/perfilVerificado.controller";
import { getFotosPropiedad } from "../controllers/fotos.controller";
import { getServiciosPropiedad } from "../controllers/servicios.controller";

const router = Router();

router.get("/", getPropiedadesDisponibles);
router.post("/", postPropiedad);
router.put("/:id/estado", putEstadoPropiedad);

// 🔥 NUEVOS ENDPOINTS
router.get("/:id/propietario", getPropietario);
router.get("/:id/perfil-verificado", getPerfilVerificado);
router.get("/:id/fotos", getFotosPropiedad);
router.get("/:id/servicios", getServiciosPropiedad);

export { router as propiedadesRouter };
