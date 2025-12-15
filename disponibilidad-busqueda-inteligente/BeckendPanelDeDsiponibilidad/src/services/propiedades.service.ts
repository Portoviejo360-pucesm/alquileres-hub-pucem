import { pool } from "../config/database";
import { CrearPropiedadDTO } from "../modules/propiedades/DTO/crear-propiedad.dto";

export const obtenerDisponibles = async () => {
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
      tp.nombre AS tipo_publico
    FROM propiedades p
    JOIN estados_propiedad e ON p.estado_id = e.id_estado
    JOIN tipo_publico tp ON p.publico_objetivo_id = tp.id_tipo
    WHERE p.estado_id = 1
    ORDER BY p.id_propiedad DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

export const crearPropiedad = async (data: CrearPropiedadDTO) => {
  const { rows } = await pool.query(
    `
    INSERT INTO propiedades (
      propietario_id,
      estado_id,
      publico_objetivo_id,
      titulo_anuncio,
      descripcion,
      precio_mensual,
      direccion_texto,
      latitud_mapa,
      longitud_mapa,
      es_amoblado
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
    `,
    [
      data.propietario_id,
      data.estado_id,
      data.publico_objetivo_id,
      data.titulo_anuncio,
      data.descripcion,
      data.precio_mensual,
      data.direccion_texto,
      data.latitud_mapa,
      data.longitud_mapa,
      data.es_amoblado,
    ]
  );

  return rows[0];
};

export const cambiarEstado = async (id: number, estado_id: number) => {
  const result = await pool.query(
    `UPDATE propiedades SET estado_id = $1 WHERE id_propiedad = $2`,
    [estado_id, id]
  );

  return (result.rowCount ?? 0) > 0;
};
