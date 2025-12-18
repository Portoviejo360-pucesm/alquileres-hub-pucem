import { pool } from "../config/database";

export const obtenerPerfilVerificado = async (propiedadId: number) => {
  const query = `
    SELECT
      pv.esta_verificado,
      pv.fecha_solicitud
    FROM propiedades p
    JOIN perfil_verificado pv
      ON pv.usuario_id = p.propietario_id
    WHERE p.id_propiedad = $1
  `;

  const { rows } = await pool.query(query, [propiedadId]);
  return rows[0];
};
