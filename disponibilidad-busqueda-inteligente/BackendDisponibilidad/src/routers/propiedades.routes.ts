import { Router } from "express";
import {
  getPropiedadesDisponibles,
  getPropiedadPorId,
  postPropiedad,
  putEstadoPropiedad,
  putPropiedad,
} from "../controllers/propiedades.controller";

import { getPropietario } from "../controllers/propietario.controller";
import { getPerfilVerificado } from "../controllers/perfilVerificado.controller";
import { getFotosPropiedad } from "../controllers/fotos.controller";
import { getServiciosPropiedad } from "../controllers/servicios.controller";

const router = Router();

/**
 * ===========================
 * PROPIEDADES
 * ===========================
 */

// LISTAR TODAS
router.get("/", getPropiedadesDisponibles);

// 🔍 OBTENER UNA POR ID  (LO QUE FALTABA)
router.get("/:id", getPropiedadPorId);

// CREAR
router.post("/", postPropiedad);

// CAMBIAR SOLO ESTADO
router.put("/:id/estado", putEstadoPropiedad);

// EDITAR PROPIEDAD COMPLETA
router.put("/:id", putPropiedad);

/**
 * ===========================
 * RELACIONES
 * ===========================
 */

router.get("/:id/propietario", getPropietario);
router.get("/:id/perfil-verificado", getPerfilVerificado);
router.get("/:id/fotos", getFotosPropiedad);
router.get("/:id/servicios", getServiciosPropiedad);

export { router as propiedadesRouter };
