import { pool } from "../../config/database";
import { io } from "../../server";

export const PropiedadService = {
  async obtenerDisponibles() {
    const query = `
      SELECT p.*, e.nombre AS estado
      FROM propiedades p
      JOIN estados_propiedad e ON p.estado_id = e.id_estado
      WHERE e.nombre = 'disponible';
    `;
    const res = await pool.query(query);
    return res.rows;
  },

  async cambiarEstado(id: number, nuevoEstado: string) {
    const query = `
      UPDATE propiedades
      SET estado_id = (SELECT id_estado FROM estados_propiedad WHERE nombre = $1)
      WHERE id_propiedad = $2
    `;
    await pool.query(query, [nuevoEstado, id]);

    io.emit("actualizarDisponibilidad", {
      id_propiedad: id,
      estado: nuevoEstado,
    });

    return { id_propiedad: id, estado: nuevoEstado };
  }
};
