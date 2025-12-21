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
