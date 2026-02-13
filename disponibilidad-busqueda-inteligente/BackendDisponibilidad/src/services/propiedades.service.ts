import { pool } from "../config/database";
import { CrearPropiedadDTO } from "../modules/propiedades/DTO/crear-propiedad.dto";

/**
 * GET /propiedades
 * Lista propiedades con estado y público
 */
export const obtenerDisponibles = async () => {
  const { rows } = await pool.query(`
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
      tp.nombre AS tipo_publico,
      (
        SELECT json_agg(json_build_object(
          'id', f.id_foto,
          'urlImagen', f.url_imagen,
          'esPrincipal', f.es_principal
        ) ORDER BY f.es_principal DESC NULLS LAST)
        FROM fotos_propiedad f
        WHERE f.propiedad_id = p.id_propiedad
      ) AS fotos
    FROM propiedades p
    JOIN estados_propiedad e ON p.estado_id = e.id_estado
    JOIN tipo_publico tp ON p.publico_objetivo_id = tp.id_tipo
    ORDER BY p.id_propiedad DESC
  `);

  return rows;
};

/**
 * GET /propiedades/:id
 * Obtener UNA propiedad por ID
 */
export const obtenerPropiedadPorId = async (id: number) => {
  const { rows } = await pool.query(
    `
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
      tp.nombre AS tipo_publico,
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
          'incluidoEnPrecio', ps.incluido_en_precio
        ))
        FROM propiedad_servicios ps
        JOIN catalogo_servicios cs ON cs.id_servicio = ps.servicio_id
        WHERE ps.propiedad_id = p.id_propiedad
      ) AS servicios,
      (
        SELECT json_build_object(
          'id', u.id_usuario,
          'nombresCompletos', u.nombres_completos,
          'correo', u.correo,
          'telefonoContacto', pv.telefono_contacto
        )
        FROM usuarios u
        LEFT JOIN perfil_verificado pv ON pv.usuario_id = u.id_usuario
        WHERE u.id_usuario = p.propietario_id
      ) AS propietario
    FROM propiedades p
    JOIN estados_propiedad e ON p.estado_id = e.id_estado
    JOIN tipo_publico tp ON p.publico_objetivo_id = tp.id_tipo
    WHERE p.id_propiedad = $1
    `,
    [id]
  );

  return rows[0]; // undefined si no existe
};

/**
 * POST /propiedades
 */
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

/**
 * PUT /propiedades/:id/estado
 * 🔥 SOLO CAMBIA ESTADO
 */
export const cambiarEstado = async (id: number, estado_id: number) => {
  const { rows } = await pool.query(
    `
    UPDATE propiedades p
    SET estado_id = $1
    FROM estados_propiedad e, tipo_publico tp
    WHERE p.id_propiedad = $2
      AND e.id_estado = $1
      AND tp.id_tipo = p.publico_objetivo_id
    RETURNING
      p.id_propiedad,
      p.estado_id,
      e.nombre AS estado,
      p.precio_mensual,
      tp.nombre AS publico_objetivo
    `,
    [estado_id, id]
  );

  return rows[0];
};

/**
 * PUT /propiedades/:id
 * ✏️ Edición completa tipo Amazon
 */
export const updatePropiedad = async (id: number, data: any) => {
  const allowedFields = [
    "titulo_anuncio",
    "descripcion",
    "precio_mensual",
    "direccion_texto",
    "latitud_mapa",
    "longitud_mapa",
    "es_amoblado",
    "estado_id",
    "publico_objetivo_id",
  ];

  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  if (fields.length === 0) return null;

  const query = `
    UPDATE propiedades
    SET ${fields.join(", ")}
    WHERE id_propiedad = $${index}
    RETURNING *
  `;

  const { rows } = await pool.query(query, [...values, id]);
  return rows[0];
};
