import { pool } from "../config/database";

export const obtenerServiciosPorPropiedad = async (id: number) => {
  const { rows } = await pool.query(
    `
    SELECT cs.nombre
    FROM propiedad_servicios ps
    JOIN catalogo_servicios cs ON ps.servicio_id = cs.id_servicio
    WHERE ps.propiedad_id = $1
    `,
    [id]
  );

  return rows.map(r => r.nombre);
};

