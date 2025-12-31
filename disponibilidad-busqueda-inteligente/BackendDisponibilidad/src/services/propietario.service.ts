import { pool } from "../config/database";

export const obtenerPropietario = async (propiedadId: number) => {
  const query = `
    SELECT
      u.id_usuario,
      u.nombres_completos,
      u.correo,
      r.nombre AS rol
    FROM propiedades p
    JOIN usuarios u ON p.propietario_id = u.id_usuario
    JOIN roles r ON u.rol_id = r.id_rol
    WHERE p.id_propiedad = $1
  `;

  const { rows } = await pool.query(query, [propiedadId]);
  return rows[0];
};
