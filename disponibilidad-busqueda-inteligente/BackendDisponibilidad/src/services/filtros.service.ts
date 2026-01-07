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

  // 5️⃣ QUERY FINAL (arrastra correctamente)
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
