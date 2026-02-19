import { pool } from "../config/database";
import { FiltrarPropiedadesDTO } from "../modules/filtros/DTO/filtrar-propiedades.dto";

export const filtrarPropiedades = async (filtros: FiltrarPropiedadesDTO) => {
  const values: any[] = [];
  let where = "WHERE 1=1";

  // 1️⃣ TRADUCIR estado TEXTO → ID
  if (filtros.estado) {
    const estadoResult = await pool.query(
      "SELECT id_estado FROM estados_propiedad WHERE UPPER(nombre) = UPPER($1)",
      [filtros.estado]
    );

    if (estadoResult.rows.length === 0) {
      return [];
    }

    values.push(estadoResult.rows[0].id_estado);
    where += ` AND p.estado_id = $${values.length}`;
  }

  // 2️⃣ Filtro por público objetivo (ID, correcto)
  if (filtros.publico_objetivo_id) {
    values.push(filtros.publico_objetivo_id);
    where += ` AND p.publico_objetivo_id = $${values.length}`;
  }

  // 3️⃣ Precio mínimo
  if (filtros.precio_min) {
    values.push(filtros.precio_min);
    where += ` AND p.precio_mensual >= $${values.length}`;
  }

  // 4️⃣ Precio máximo
  if (filtros.precio_max) {
    values.push(filtros.precio_max);
    where += ` AND p.precio_mensual <= $${values.length}`;
  }

  // 5️⃣ Filtro por servicios (IDs)
  if (filtros.servicios && filtros.servicios.length > 0) {
    const placeholders = filtros.servicios.map((_, i) => `$${values.length + i + 1}`).join(', ');
    values.push(...filtros.servicios);
    where += ` AND p.id_propiedad IN (
      SELECT ps.propiedad_id FROM propiedad_servicios ps
      WHERE ps.servicio_id IN (${placeholders})
      GROUP BY ps.propiedad_id
      HAVING COUNT(DISTINCT ps.servicio_id) = ${filtros.servicios.length}
    )`;
  }

  // 6️⃣ QUERY FINAL
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
      tp.nombre AS publico_objetivo,
      (
        SELECT json_agg(json_build_object(
          'id', f.id_foto,
          'urlImagen', f.url_imagen,
          'esPrincipal', f.es_principal
        ) ORDER BY f.es_principal DESC NULLS LAST)
        FROM fotos_propiedad f
        WHERE f.propiedad_id = p.id_propiedad
      ) AS fotos,
      (
        SELECT json_agg(json_build_object(
          'id', cs.id_servicio,
          'nombre', cs.nombre,
          'incluidoEnPrecio', ps2.incluido_en_precio
        ))
        FROM propiedad_servicios ps2
        JOIN catalogo_servicios cs ON cs.id_servicio = ps2.servicio_id
        WHERE ps2.propiedad_id = p.id_propiedad
      ) AS servicios
    FROM propiedades p
    JOIN estados_propiedad e ON p.estado_id = e.id_estado
    JOIN tipo_publico tp ON p.publico_objetivo_id = tp.id_tipo
    ${where}
    ORDER BY p.id_propiedad DESC
  `;

  const { rows } = await pool.query(query, values);
  return rows;
};
