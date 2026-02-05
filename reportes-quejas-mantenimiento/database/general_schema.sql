-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.catalogo_servicios (
  id_servicio integer NOT NULL DEFAULT nextval('catalogo_servicios_id_servicio_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT catalogo_servicios_pkey PRIMARY KEY (id_servicio)
);
CREATE TABLE public.contrato (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reserva_id uuid NOT NULL UNIQUE,
  url_archivo text NOT NULL,
  fecha_generacion timestamp with time zone DEFAULT now(),
  CONSTRAINT contrato_pkey PRIMARY KEY (id)
);
CREATE TABLE public.estados_propiedad (
  id_estado integer NOT NULL DEFAULT nextval('estados_propiedad_id_estado_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT estados_propiedad_pkey PRIMARY KEY (id_estado)
);
CREATE TABLE public.fotos_propiedad (
  id_foto integer NOT NULL DEFAULT nextval('fotos_propiedad_id_foto_seq'::regclass),
  propiedad_id integer NOT NULL,
  url_imagen text NOT NULL,
  es_principal boolean DEFAULT false,
  CONSTRAINT fotos_propiedad_pkey PRIMARY KEY (id_foto),
  CONSTRAINT fotos_propiedad_propiedad_id_fkey FOREIGN KEY (propiedad_id) REFERENCES public.propiedades(id_propiedad)
);
CREATE TABLE public.perfil_verificado (
  id_verificacion integer NOT NULL DEFAULT nextval('perfil_verificado_id_verificacion_seq'::regclass),
  usuario_id uuid NOT NULL UNIQUE,
  cedula_ruc character varying NOT NULL UNIQUE,
  foto_documento_url text,
  telefono_contacto character varying NOT NULL,
  biografia_corta text,
  esta_verificado boolean DEFAULT false,
  fecha_solicitud timestamp without time zone DEFAULT now(),
  CONSTRAINT perfil_verificado_pkey PRIMARY KEY (id_verificacion),
  CONSTRAINT perfil_verificado_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.propiedad_servicios (
  propiedad_id integer NOT NULL,
  servicio_id integer NOT NULL,
  incluido_en_precio boolean DEFAULT true,
  CONSTRAINT propiedad_servicios_pkey PRIMARY KEY (propiedad_id, servicio_id),
  CONSTRAINT propiedad_servicios_propiedad_id_fkey FOREIGN KEY (propiedad_id) REFERENCES public.propiedades(id_propiedad),
  CONSTRAINT propiedad_servicios_servicio_id_fkey FOREIGN KEY (servicio_id) REFERENCES public.catalogo_servicios(id_servicio)
);
CREATE TABLE public.propiedades (
  id_propiedad integer NOT NULL DEFAULT nextval('propiedades_id_propiedad_seq'::regclass),
  propietario_id uuid NOT NULL,
  estado_id integer NOT NULL,
  publico_objetivo_id integer,
  titulo_anuncio character varying NOT NULL,
  descripcion text,
  precio_mensual numeric NOT NULL CHECK (precio_mensual > 0::numeric),
  direccion_texto character varying,
  latitud_mapa numeric NOT NULL,
  longitud_mapa numeric NOT NULL,
  es_amoblado boolean DEFAULT false,
  fecha_creacion timestamp without time zone DEFAULT now(),
  CONSTRAINT propiedades_pkey PRIMARY KEY (id_propiedad),
  CONSTRAINT propiedades_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT propiedades_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES public.estados_propiedad(id_estado),
  CONSTRAINT propiedades_publico_objetivo_id_fkey FOREIGN KEY (publico_objetivo_id) REFERENCES public.tipo_publico(id_tipo)
);
CREATE TABLE public.reserva (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  propiedad_id integer NOT NULL,
  fecha_entrada date NOT NULL,
  fecha_salida date NOT NULL,
  total_pagar numeric NOT NULL,
  estado USER-DEFINED DEFAULT 'PENDIENTE'::estado_reserva_enum,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT reserva_pkey PRIMARY KEY (id),
  CONSTRAINT reserva_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT reserva_propiedad_id_fkey FOREIGN KEY (propiedad_id) REFERENCES public.propiedades(id_propiedad)
);
CREATE TABLE public.roles (
  id_rol integer NOT NULL DEFAULT nextval('roles_id_rol_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id_rol)
);
CREATE TABLE public.tipo_publico (
  id_tipo integer NOT NULL DEFAULT nextval('tipo_publico_id_tipo_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT tipo_publico_pkey PRIMARY KEY (id_tipo)
);
CREATE TABLE public.usuarios (
  id_usuario uuid NOT NULL DEFAULT gen_random_uuid(),
  rol_id integer NOT NULL DEFAULT 2,
  nombres_completos character varying NOT NULL,
  correo character varying NOT NULL UNIQUE,
  password_hash text,
  fecha_registro timestamp without time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id_rol)
);