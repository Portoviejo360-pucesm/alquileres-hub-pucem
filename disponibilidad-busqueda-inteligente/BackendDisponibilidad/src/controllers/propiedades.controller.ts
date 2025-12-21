import { Request, Response } from "express";
import {
  obtenerDisponibles,
  crearPropiedad,
  cambiarEstado,
} from "../services/propiedades.service";
import { CrearPropiedadDTO } from "../modules/propiedades/DTO/crear-propiedad.dto";
import { emitirCambioEstado } from "../modules/tiempo-real/panel.gateway";
import { success, error } from "../utils/response";

/**
 * GET /propiedades
 * Devuelve propiedades DISPONIBLES
 */
export const getPropiedadesDisponibles = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await obtenerDisponibles();
    return success(res, data, "Propiedades disponibles");
  } catch (err) {
    console.error("Error GET propiedades:", err);
    return error(res, "Error al obtener propiedades disponibles");
  }
};

/**
 * POST /propiedades
 * Crea una nueva propiedad
 */
export const postPropiedad = async (req: Request, res: Response) => {
  try {
    const body = req.body as CrearPropiedadDTO;

    const {
      propietario_id,
      estado_id,
      publico_objetivo_id,
      titulo_anuncio,
      descripcion,
      precio_mensual,
      direccion_texto,
      latitud_mapa,
      longitud_mapa,
      es_amoblado,
    } = body;

    if (!propietario_id) {
      return error(res, "propietario_id es obligatorio", 400);
    }

    if (!estado_id) {
      return error(res, "estado_id es obligatorio", 400);
    }

    if (!publico_objetivo_id) {
      return error(res, "publico_objetivo_id es obligatorio", 400);
    }

    const propiedadCreada = await crearPropiedad({
      propietario_id,
      estado_id,
      publico_objetivo_id,
      titulo_anuncio,
      descripcion,
      precio_mensual,
      direccion_texto,
      latitud_mapa,
      longitud_mapa,
      es_amoblado,
    });

    return success(res, propiedadCreada, "Propiedad creada correctamente", 201);
  } catch (err: any) {
    console.error("Error POST propiedad:", err);
    return error(res, "Error al crear propiedad");
  }
};

/**
 * PUT /propiedades/:id/estado
 * Cambia el estado de una propiedad + emite WebSocket
 */
export const putEstadoPropiedad = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado_id } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!estado_id) {
      return res.status(400).json({
        message: "estado_id es obligatorio",
      });
    }
    const data = await cambiarEstado(id, estado_id);

if (!data) {
  return res.status(404).json({ message: "Propiedad no encontrada" });
}

// 🔥 Emitir WS completo
emitirCambioEstado({
  id_propiedad: data.id_propiedad,
  estado_id: data.estado_id,
  estado: data.estado,
  precio_mensual: data.precio_mensual,
  publico_objetivo: data.publico_objetivo,
  timestamp: new Date(),
});

return res.status(200).json({
  success: true,
  message: "Estado actualizado",
  data,
});



  } catch (error) {
    console.error("Error PUT estado propiedad:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar estado",
    });
  }
};
