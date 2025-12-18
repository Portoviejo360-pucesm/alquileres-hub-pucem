export interface PropiedadEstadoEvent {
  id_propiedad: number;
  estado_id: number;
  estado: string;
  precio_mensual: number;
  publico_objetivo: string;
  timestamp: string;
}

export interface PropiedadServiciosEvent {
  id_propiedad: number;
  servicios: string[];
  timestamp: string;
}
export interface PropiedadEstadoPayload {
  id_propiedad: number;
  titulo_anuncio: string;
  descripcion: string;
  precio_mensual: number;
  direccion_texto: string;
  latitud_mapa: number;
  longitud_mapa: number;
  es_amoblado: boolean;
  fecha_creacion: string;
  id_estado: number;
  estado: string;
  publico_objetivo: string;
  timestamp: string;
}

export interface WSBaseEvent {
  timestamp: string | Date;
}

export interface EstadoPropiedadEvent extends WSBaseEvent {
  id_propiedad: number;
  estado_id: number;
  estado: string;
  precio_mensual: number;
  publico_objetivo: string;
}

export interface ServiciosPropiedadEvent extends WSBaseEvent {
  id_propiedad: number;
  servicios: any[];
}
export interface Propiedad {
  id_propiedad: number;
  latitud_mapa: number;
  longitud_mapa: number;
  precio_mensual: number;
  titulo_anuncio: string;
  direccion_texto: string;
  estado: string;
  beds?: number;
  baths?: number;
  area?: number;
  rating?: number;
  image?: string;
}
