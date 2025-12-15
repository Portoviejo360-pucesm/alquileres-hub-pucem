export interface CrearPropiedadDTO {
  propietario_id: string;        // UUID de auth.users (Supabase general)
  estado_id: number;
  publico_objetivo_id: number;
  titulo_anuncio: string;
  descripcion: string;
  precio_mensual: number;
  direccion_texto: string;
  latitud_mapa: number;
  longitud_mapa: number;
  es_amoblado: boolean;
}
