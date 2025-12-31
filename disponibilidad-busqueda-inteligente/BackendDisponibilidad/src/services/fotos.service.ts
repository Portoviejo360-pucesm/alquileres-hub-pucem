import { pool } from "../config/database";

export const obtenerFotosPropiedad = async (propiedadId: number) => {
  const query = `
    SELECT
      url_imagen,
      es_principal
    FROM fotos_propiedad
    WHERE propiedad_id = $1
  `;

  const { rows } = await pool.query(query, [propiedadId]);
  return rows;
};
