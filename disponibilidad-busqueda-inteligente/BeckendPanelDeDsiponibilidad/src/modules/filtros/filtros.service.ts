import { pool } from "../../config/database";

export const FiltroService = {
  async buscar(filtros: any) {
    const { precioMin, precioMax, tipo_publico } = filtros;

    let query = `
      SELECT p.*, e.nombre AS estado
      FROM propiedades p
      JOIN estados_propiedad e ON p.estado_id = e.id_estado
      WHERE 1=1
    `;

    const params: any[] = [];

    if (precioMin) {
      params.push(precioMin);
      query += ` AND p.precio_mensual >= $${params.length}`;
    }

    if (precioMax) {
      params.push(precioMax);
      query += ` AND p.precio_mensual <= $${params.length}`;
    }

    if (tipo_publico) {
      params.push(tipo_publico);
      query += ` AND p.publico_objetivo_id = $${params.length}`;
    }

    const res = await pool.query(query, params);
    return res.rows;
  }
};
