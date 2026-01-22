import { Request, Response } from "express";
import {
  obtenerDisponibles,
  obtenerPropiedadPorId,
  crearPropiedad,
  cambiarEstado,
  updatePropiedad,
} from "../services/propiedades.service";
import { CrearPropiedadDTO } from "../modules/propiedades/DTO/crear-propiedad.dto";
import { emitirCambioEstado } from "../modules/tiempo-real/panel.gateway";
import { success, error } from "../utils/response";

/**
 * GET /propiedades
 * Lista propiedades
 */
export const getPropiedadesDisponibles = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await obtenerDisponibles();
    return success(res, data, "Propiedades encontradas");
  } catch (err) {
    console.error(err);
    return error(res, "Error al obtener propiedades");
  }
};

/**
 * GET /propiedades/:id
 * Obtener UNA propiedad por ID
 */
export const getPropiedadPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return error(res, "ID inválido", 400);
    }

    const propiedad = await obtenerPropiedadPorId(id);

    if (!propiedad) {
      return error(res, "Propiedad no encontrada", 404);
    }

    return success(res, propiedad, "Propiedad encontrada");
  } catch (err) {
    console.error(err);
    return error(res, "Error al obtener propiedad");
  }
};

/**
 * POST /propiedades
 * Crear propiedad
 */
export const postPropiedad = async (req: Request, res: Response) => {
  try {
    const body = req.body as CrearPropiedadDTO;

    if (!body.propietario_id || !body.estado_id || !body.publico_objetivo_id) {
      return error(res, "Campos obligatorios faltantes", 400);
    }

    const propiedad = await crearPropiedad(body);
    return success(res, propiedad, "Propiedad creada", 201);
  } catch (err) {
    console.error(err);
    return error(res, "Error al crear propiedad");
  }
};

/**
 * PUT /propiedades/:id/estado
 * 📡 Cambia estado + emite WebSocket
 */
export const putEstadoPropiedad = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado_id } = req.body;

    if (Number.isNaN(id) || !estado_id) {
      return error(res, "ID o estado inválido", 400);
    }

    const propiedad = await cambiarEstado(id, estado_id);

    if (!propiedad) {
      return error(res, "Propiedad no encontrada", 404);
    }

    emitirCambioEstado({
      id_propiedad: propiedad.id_propiedad,
      estado_id: propiedad.estado_id,
      estado: propiedad.estado,
      precio_mensual: propiedad.precio_mensual,
      publico_objetivo: propiedad.publico_objetivo,
      timestamp: new Date(),
    });

    return success(res, propiedad, "Estado actualizado");
  } catch (err) {
    console.error(err);
    return error(res, "Error al actualizar estado");
  }
};

/**
 * PUT /propiedades/:id
 * ✏️ Edición completa (sin WebSocket)
 */
export const putPropiedad = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return error(res, "ID inválido", 400);
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return error(res, "No se enviaron campos para actualizar", 400);
    }

    const propiedad = await updatePropiedad(id, req.body);

    if (!propiedad) {
      return error(res, "Propiedad no encontrada", 404);
    }

    return success(res, propiedad, "Propiedad actualizada");
  } catch (err) {
    console.error(err);
    return error(res, "Error al actualizar propiedad");
  }
};
