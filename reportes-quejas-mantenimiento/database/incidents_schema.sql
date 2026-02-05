-- =============================================================================
-- Schema for Portoviejo360 Incidents Module
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- 1. Catalogs
CREATE TABLE IF NOT EXISTS public.estados (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prioridades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  nivel INTEGER NOT NULL, -- 1=Low, 5=Critical
  color VARCHAR(7), -- Hex code
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categorias (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial data for catalogs
INSERT INTO public.estados (codigo, nombre, orden) VALUES
('pendiente', 'Pendiente', 1),
('asignada', 'Asignada', 2),
('en_proceso', 'En Proceso', 3),
('resuelta', 'Resuelta', 4),
('cerrada', 'Cerrada', 5),
('cancelada', 'Cancelada', 6)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.prioridades (codigo, nombre, nivel, color) VALUES
('baja', 'Baja', 1, '#28a745'),
('media', 'Media', 2, '#ffc107'),
('alta', 'Alta', 3, '#fd7e14'),
('urgente', 'Urgente', 4, '#dc3545')
ON CONFLICT (codigo) DO NOTHING;

-- 2. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidencias (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  
  -- Foreign Keys
  estado_id INTEGER NOT NULL REFERENCES public.estados(id),
  prioridad_id INTEGER NOT NULL REFERENCES public.prioridades(id),
  categoria_id INTEGER REFERENCES public.categorias(id),
  
  -- Links to existing modules (Contract/Property/User)
  propiedad_id INTEGER NOT NULL REFERENCES public.propiedades(id_propiedad),
  usuario_reportante_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  responsable_id UUID REFERENCES public.usuarios(id_usuario),
  
  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_resolucion TIMESTAMPTZ
);

-- 3. Maintenance Log (Bitacora) for RF-003
CREATE TABLE IF NOT EXISTS public.bitacora_mantenimiento (
  id SERIAL PRIMARY KEY,
  incidencia_id INTEGER NOT NULL REFERENCES public.incidencias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  descripcion TEXT NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 4. History (Audit Log) for RF-002/RF-007
CREATE TABLE IF NOT EXISTS public.historial_incidencias (
  id SERIAL PRIMARY KEY,
  incidencia_id INTEGER NOT NULL REFERENCES public.incidencias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  accion VARCHAR(100) NOT NULL, -- e.g., 'created', 'status_change', 'assigned'
  descripcion TEXT,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Comments
CREATE TABLE IF NOT EXISTS public.comentarios (
  id SERIAL PRIMARY KEY,
  incidencia_id INTEGER NOT NULL REFERENCES public.incidencias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  contenido TEXT NOT NULL,
  es_interno BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ
);

-- 6. Attachments
CREATE TABLE IF NOT EXISTS public.adjuntos (
  id SERIAL PRIMARY KEY,
  incidencia_id INTEGER NOT NULL REFERENCES public.incidencias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id_usuario),
  nombre_archivo VARCHAR(255) NOT NULL,
  url_archivo TEXT NOT NULL,
  tipo_mime VARCHAR(100),
  tamanio_bytes BIGINT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidencias_propiedad ON public.incidencias(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_reportante ON public.incidencias(usuario_reportante_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON public.incidencias(estado_id);
