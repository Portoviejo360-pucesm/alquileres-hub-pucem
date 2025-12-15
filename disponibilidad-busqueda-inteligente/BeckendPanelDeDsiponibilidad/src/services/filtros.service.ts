import { pool } from "../config/database";
import { FiltrarPropiedadesDTO } from "../modules/filtros/DTO/filtrar-propiedades.dto";

export const filtrarPropiedades = async (filtros: FiltrarPropiedadesDTO) => {
  const values: any[] = [];
  let where = "WHERE 1=1";

  if (filtros.estado) {
    values.push(filtros.estado);
    where += ` AND e.nombre = $${values.length}`;
  }

  if (filtros.publico_objetivo_id) {
    values.push(filtros.publico_objetivo_id);
    where += ` AND p.publico_objetivo_id = $${values.length}`;
  }

  if (filtros.precio_min) {
    values.push(filtros.precio_min);
    where += ` AND p.precio_mensual >= $${values.length}`;
  }

  if (filtros.precio_max) {
    values.push(filtros.precio_max);
    where += ` AND p.precio_mensual <= $${values.length}`;
  }

  const query = `
    SELECT 
      p.id_propiedad,
      p.titulo_anuncio,
      p.descripcion,
      p.precio_mensual,
      p.direccion_texto,
      p.latitud_mapa,
      p.longitud_mapa,
      p.es_amoblado,
      p.fecha_creacion,
      e.nombre AS estado,
      tp.nombre AS publico_objetivo
    FROM propiedades p
    JOIN estados_propiedad e ON p.estado_id = e.id_estado
    JOIN tipo_publico tp ON p.publico_objetivo_id = tp.id_tipo
    ${where}
    ORDER BY p.id_propiedad DESC
  `;

  const { rows } = await pool.query(query, values);
  return rows;
};
