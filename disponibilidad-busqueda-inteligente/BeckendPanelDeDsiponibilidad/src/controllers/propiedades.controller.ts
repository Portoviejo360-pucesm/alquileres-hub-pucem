import { Request, Response } from "express";
import {
  obtenerDisponibles,
  crearPropiedad,
  cambiarEstado,
} from "../services/propiedades.service";
import { CrearPropiedadDTO } from "../modules/propiedades/DTO/crear-propiedad.dto";

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
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener propiedades disponibles",
    });
  }
}

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

    // ✅ VALIDACIONES CLAVE (LAS QUE TE ESTABAN FALLANDO)
    if (!propietario_id) {
      return res.status(400).json({ message: "propietario_id es obligatorio" });
    }

    if (!estado_id) {
      return res.status(400).json({ message: "estado_id es obligatorio" });
    }

    if (!publico_objetivo_id) {
      return res
        .status(400)
        .json({ message: "publico_objetivo_id es obligatorio" });
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

    return res.status(201).json(propiedadCreada);
  } catch (error: any) {
    console.error("Error POST propiedad:", error);
    return res.status(500).json({
      message: "Error al crear propiedad",
      error: error.message,
    });
  }
};

/**
 * PUT /propiedades/:id/estado
 * Cambia el estado de una propiedad
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

    const actualizado = await cambiarEstado(id, estado_id);

    if (!actualizado) {
      return res.status(404).json({
        message: "Propiedad no encontrada",
      });
    }

    return res.status(200).json({
      message: "Estado actualizado correctamente",
    });
  } catch (error) {
    console.error("Error PUT estado propiedad:", error);
    return res.status(500).json({
      message: "Error al actualizar estado",
    });
  }
};
