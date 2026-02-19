# Documentacion Tecnica - Modulo Disponibilidad y Busqueda Inteligente

## Indice

1. [Vision General](#vision-general)
2. [Arquitectura](#arquitectura)
3. [Backend](#backend)
   - [Estructura de Archivos](#estructura-de-archivos-backend)
   - [Endpoints REST](#endpoints-rest)
   - [Base de Datos](#base-de-datos)
   - [Socket.io](#socketio)
   - [Flujo de Datos](#flujo-de-datos-backend)
4. [Frontend](#frontend)
   - [Estructura de Archivos](#estructura-de-archivos-frontend)
   - [Paginas](#paginas)
   - [Componentes](#componentes)
   - [Hooks](#hooks)
   - [Estado Global](#estado-global)
   - [Flujo de Datos](#flujo-de-datos-frontend)
5. [Integracion Backend-Frontend](#integracion)
6. [Variables de Entorno](#variables-de-entorno)
7. [Guia de Ejecucion](#guia-de-ejecucion)

---

## Vision General

El modulo de **Disponibilidad y Busqueda Inteligente** es el panel publico del sistema Portoviejo360. Permite:

- Ver todas las propiedades disponibles en un **mapa interactivo** (Leaflet) centrado en Portoviejo, Ecuador
- **Filtrar** propiedades por texto, precio, amenidades y estado
- Ver actualizaciones de estado de propiedades en **tiempo real** via Socket.io
- Acceder al detalle de cada propiedad con fotos, servicios y datos del propietario

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16, port 3000)             │
│                                                                 │
│  /mapa                          PropiedadesContext              │
│  ├─ PropertyFilters (sidebar)   ├─ propiedades[]                │
│  ├─ PropertyCard[] (grid)       └─ setPropiedades()             │
│  └─ MapWrapper (Leaflet)                                        │
│       │                                                         │
│       │  usePropiedades()                usePropiedadesSocket() │
│       │  GET /api/v1/propiedades         WS propiedad:estado-cambiado
│       │                                                         │
└───────┼─────────────────────────────────────────────────────────┘
        │ HTTP REST                       WebSocket
        │                                        │
┌───────▼────────────────────────────────────────▼───────────────┐
│              BACKEND UNIFICADO (Express+TS, port 8001)          │
│                                                                 │
│  /api/v1/propiedades  ──►  propiedadesDisponibilidadRouter      │
│  /api/v1/filtros      ──►  filtrosRouter                        │
│                                                                 │
│  (importa rutas desde disponibilidad-busqueda-inteligente/)     │
└─────────────────────────────────────────────────────────────────┘
        │
        │ pg Pool (SSL)
        │
┌───────▼────────────────────────────┐
│   Supabase PostgreSQL (port 6543)  │
│   propiedades, estados, fotos,     │
│   servicios, usuarios...           │
└────────────────────────────────────┘
```

---

## Backend

### Estructura de Archivos Backend

```
disponibilidad-busqueda-inteligente/BackendDisponibilidad/
├── src/
│   ├── server.ts                    # Servidor standalone (port 8004)
│   ├── app.ts                       # Express app exportable
│   ├── config/
│   │   └── database.ts              # pg Pool + SSL hacia Supabase
│   ├── routers/
│   │   ├── propiedades.routes.ts    # CRUD propiedades + relaciones
│   │   └── filtros.routes.ts        # GET /filtros/propiedades
│   ├── controllers/
│   │   ├── propiedades.controller.ts
│   │   ├── filtros.controller.ts
│   │   ├── propietario.controller.ts
│   │   ├── perfilVerificado.controller.ts
│   │   ├── fotos.controller.ts
│   │   └── servicios.controller.ts
│   ├── services/
│   │   ├── propiedades.service.ts   # SQL raw, queries principales
│   │   ├── filtros.service.ts       # Filtrado dinamico con pg
│   │   ├── propietario.service.ts
│   │   ├── perfilVerificado.service.ts
│   │   ├── fotos.service.ts
│   │   └── servicios.service.ts
│   ├── modules/
│   │   ├── propiedades/
│   │   │   ├── propiedades.model.ts
│   │   │   └── DTO/crear-propiedad.dto.ts
│   │   ├── filtros/
│   │   │   ├── filtros.model.ts
│   │   │   └── DTO/filtrar-propiedades.dto.ts
│   │   └── tiempo-real/
│   │       └── panel.gateway.ts     # Socket.io: initSocket, emitirCambioEstado
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validarFiltros.ts
│   └── utils/
│       └── response.ts
└── package.json
```

---

### Endpoints REST

#### Propiedades — `GET /api/v1/propiedades`

Lista todas las propiedades con fotos y servicios embebidos.

**Response:**
```json
[
  {
    "id_propiedad": 1,
    "titulo_anuncio": "Apartamento en el centro",
    "descripcion": "...",
    "precio_mensual": 350.00,
    "direccion_texto": "Av. Universitaria y 10 de Agosto",
    "latitud_mapa": "-0.9536",
    "longitud_mapa": "-80.7371",
    "es_amoblado": true,
    "fecha_creacion": "2024-01-15T00:00:00.000Z",
    "estado": "disponible",
    "tipo_publico": "estudiantes",
    "fotos": [
      { "id": 1, "urlImagen": "https://...", "esPrincipal": true }
    ],
    "servicios": [
      { "id": 1, "nombre": "Agua", "incluidoEnPrecio": true }
    ]
  }
]
```

---

#### Propiedad por ID — `GET /api/v1/propiedades/:id`

Igual que el listado pero incluye ademas el objeto `propietario`:
```json
{
  "propietario": {
    "id": 5,
    "nombresCompletos": "Juan Perez",
    "correo": "juan@example.com",
    "telefonoContacto": "0991234567"
  }
}
```

---

#### Crear Propiedad — `POST /api/v1/propiedades`

**Body:**
```json
{
  "propietario_id": 5,
  "estado_id": 1,
  "publico_objetivo_id": 2,
  "titulo_anuncio": "Casa en alquiler",
  "descripcion": "...",
  "precio_mensual": 500,
  "direccion_texto": "Av. Principal",
  "latitud_mapa": -0.9536,
  "longitud_mapa": -80.7371,
  "es_amoblado": false
}
```

---

#### Cambiar Estado — `PUT /api/v1/propiedades/:id/estado`

**Body:**
```json
{ "estado_id": 2 }
```

**Efecto secundario:** Emite evento Socket.io `propiedad:estado-cambiado` a todos los clientes conectados.

---

#### Editar Propiedad — `PUT /api/v1/propiedades/:id`

Edicion parcial (solo los campos enviados se actualizan). Campos permitidos:
- `titulo_anuncio`, `descripcion`, `precio_mensual`
- `direccion_texto`, `latitud_mapa`, `longitud_mapa`
- `es_amoblado`, `estado_id`, `publico_objetivo_id`

---

#### Filtrar Propiedades — `GET /api/v1/filtros/propiedades`

**Query params:**

| Parametro          | Tipo     | Descripcion                            | Ejemplo         |
|--------------------|----------|----------------------------------------|-----------------|
| `estado`           | string   | Nombre del estado (case-insensitive)   | `disponible`    |
| `publico_objetivo_id` | number | ID del tipo de publico              | `1`             |
| `precio_min`       | number   | Precio minimo mensual                  | `200`           |
| `precio_max`       | number   | Precio maximo mensual                  | `800`           |
| `servicios`        | number[] | IDs de servicios (AND: todos deben cumplirse) | `1,3`  |

**Ejemplo:**
```
GET /api/v1/filtros/propiedades?estado=disponible&precio_min=200&precio_max=600
```

**Validaciones (middleware `validarFiltros`):**
- `precio_min` y `precio_max` deben ser numericos
- `precio_min` no puede ser mayor que `precio_max`
- `publico_objetivo_id` debe ser numerico

---

### Base de Datos

**Conexion:** pg Pool con SSL (`rejectUnauthorized: false`) hacia Supabase Postgres en puerto 6543.

**Tablas principales:**

```sql
-- Tabla central
propiedades (
  id_propiedad       SERIAL PRIMARY KEY,
  propietario_id     INT REFERENCES usuarios(id_usuario),
  estado_id          INT REFERENCES estados_propiedad(id_estado),
  publico_objetivo_id INT REFERENCES tipo_publico(id_tipo),
  titulo_anuncio     VARCHAR,
  descripcion        TEXT,
  precio_mensual     DECIMAL,
  direccion_texto    VARCHAR,
  latitud_mapa       DECIMAL,
  longitud_mapa      DECIMAL,
  es_amoblado        BOOLEAN,
  fecha_creacion     TIMESTAMP DEFAULT NOW()
)

-- Catalogos
estados_propiedad (id_estado, nombre)    -- disponible, ocupada, mantenimiento
tipo_publico (id_tipo, nombre)           -- estudiantes, familias, profesionales

-- Fotos
fotos_propiedad (
  id_foto       SERIAL PRIMARY KEY,
  propiedad_id  INT REFERENCES propiedades,
  url_imagen    VARCHAR,
  es_principal  BOOLEAN
)

-- Servicios
catalogo_servicios (id_servicio, nombre)  -- agua, luz, internet, etc.
propiedad_servicios (
  propiedad_id       INT,
  servicio_id        INT,
  incluido_en_precio BOOLEAN
)

-- Usuarios / Propietarios
usuarios (id_usuario, nombres_completos, correo)
perfil_verificado (usuario_id, telefono_contacto)
```

---

### Socket.io

**Gateway:** `src/modules/tiempo-real/panel.gateway.ts`

```typescript
// Inicializacion (solo en modo standalone)
initSocket(httpServer);

// Eventos emitidos al CAMBIAR ESTADO de propiedad:
io.emit('propiedad:estado-cambiado', {
  id_propiedad: number,
  estado_id: number,
  estado: string,           // nombre del estado
  precio_mensual: number,
  publico_objetivo: string,
  timestamp: Date
});

// Eventos emitidos al ACTUALIZAR SERVICIOS:
io.emit('propiedad:servicios', {
  id_propiedad: number,
  servicios: any[],
  timestamp: string
});
```

**Nota:** En el backend-unificado el Socket.io NO esta inicializado para este modulo (solo se importan las rutas HTTP). El gateway existe para el modo standalone del BackendDisponibilidad.

---

### Flujo de Datos Backend

```
Cliente HTTP
    │
    ▼
validarFiltros (middleware)
    │ valida query params numericos
    ▼
filtros.controller.ts
    │ parsea query params → FiltrarPropiedadesDTO
    ▼
filtros.service.ts
    │ construye WHERE dinamico con placeholders $1, $2...
    │ consulta estados_propiedad para traducir nombre→id
    ▼
Supabase PostgreSQL
    │ retorna rows con JOIN de estados, tipo_publico,
    │ fotos (json_agg), servicios (json_agg)
    ▼
Response JSON[]
```

---

## Frontend

### Estructura de Archivos Frontend

Los archivos del frontend relacionados con este modulo estan en `front-alquileres-hub-pucem/src/`:

```
src/
├── app/
│   └── (protected)/
│       ├── mapa/
│       │   └── page.tsx             # Panel principal: mapa + cards + filtros
│       └── propiedades/
│           ├── page.tsx             # Mis propiedades (arrendador, con filtros locales)
│           ├── [id]/
│           │   ├── page.tsx         # Detalle propiedad
│           │   └── detalles/        # Vista publica de detalle
│           └── new/page.tsx         # Crear propiedad
├── components/
│   ├── Map.js                       # Leaflet: markers con precio, popup con imagen
│   ├── MapWrapper.js                # Wrapper dinamico (SSR-safe)
│   ├── MapDetail.js                 # Mapa de detalle individual
│   ├── MapDetailComponent.js        # Componente de detalle con mapa
│   ├── PropertyFilters.tsx          # Sidebar filtros: texto + precio slider + amenidades
│   └── propiedades/
│       ├── PropertyCard.tsx         # Card de propiedad (foto, titulo, precio, estado)
│       ├── PropiedadForm.tsx        # Formulario crear/editar propiedad
│       ├── EstadoBadge.tsx          # Badge de color segun estado
│       ├── ImageGallery.tsx         # Galeria de fotos
│       └── MapPreview.tsx           # Preview de ubicacion en formulario
├── context/
│   └── PropiedadesContext.tsx       # Context global: propiedades[], setPropiedades
├── hooks/
│   ├── usePropiedades.ts            # Carga propiedades + expone estado global
│   ├── usePropiedadesSocket.ts      # Escucha WS y actualiza estado
│   └── useMapBounds.ts             # Bounds del mapa para filtro geografico
├── lib/
│   └── api/
│       ├── client.ts                # api<T>() - cliente HTTP principal
│       └── propiedades.api.ts       # propiedadesApi.listarPublico(), .obtenerPorId()
├── services/
│   ├── api.ts                       # Legacy: getPropiedades() usado por usePropiedades
│   └── socket.ts                    # socket.io-client (actualmente apunta a port 3000!)
└── types/
    └── propiedad.ts                 # Interface Propiedad
```

---

### Paginas

#### `/mapa` — Panel Principal

**Archivo:** `src/app/(protected)/mapa/page.tsx`

Vista principal del modulo. Combina:
1. Sidebar izquierdo con filtros (`PropertyFilters`)
2. Grid de cards de propiedades (`PropertyCard`)
3. Mapa Leaflet interactivo (`MapWrapper`)
4. Actualizacion en tiempo real via Socket.io

**Flujo:**
```
MapaPage
  │
  ├─ usePropiedades()          → carga propiedades del backend
  ├─ usePropiedadesSocket()    → suscribe a WS para actualizaciones de estado
  │
  ├─ Estado local:
  │   search, priceRange, amenities, mapBounds, favorites, showMapMobile
  │
  ├─ propiedadesFiltradas = useMemo([propiedades, search, priceRange, amenities, mapBounds])
  │   ├─ Filtra por texto (titulo + ubicacion)
  │   ├─ Filtra por rango de precio
  │   ├─ Filtra por amenidades seleccionadas (AND logico)
  │   └─ Filtra por bounds del mapa (lat/lng dentro del area visible)
  │
  ├─ PropertyFilters          → sidebar con inputs
  ├─ PropertyCard[]           → grid de resultados
  └─ MapWrapper               → mapa con markers en precio
```

**Nota:** Los filtros en `/mapa` son **client-side** (sobre los datos ya cargados). Los filtros del backend (`/api/v1/filtros/propiedades`) son para uso directo de la API.

---

#### `/propiedades` — Mis Propiedades (Arrendador)

**Archivo:** `src/app/(protected)/propiedades/page.tsx`

Vista protegida (requiere autenticacion y verificacion). Muestra solo las propiedades del usuario autenticado con filtros locales por: texto, estado, precio min/max, amoblado.

---

### Componentes

#### `Map.js`

Componente Leaflet principal:
- Centro por defecto: Portoviejo `[-0.9536, -80.7371]`, zoom 13
- Detecta ubicacion del usuario (geolocation API)
- Markers con precio customizados (DivIcon con badge de precio)
- Popup HTML con imagen, titulo, direccion, precio y link a detalles
- `MapBoundsHandler` interno para emitir bounds en `moveend` y `zoomend`

#### `PropertyFilters.tsx`

Sidebar de filtros estilo Airbnb:
- Input de texto para buscar por titulo/ubicacion
- Slider de precio (`PriceSlider`) con rango 0 - 5000
- Checkboxes de amenidades (wifi, agua, luz, amoblado, parqueadero, etc.)
- Boton "Limpiar filtros"

#### `PropertyCard.tsx`

Card de propiedad:
- Foto principal con fallback a imagen Unsplash
- Badge de estado (disponible: verde, otros: amarillo/rojo)
- Titulo, ubicacion, precio mensual
- Boton favorito (corazon toggle)
- Boton "Ver detalles" → navega a `/propiedades/:id/detalles`

---

### Hooks

#### `usePropiedades()`

**Archivo:** `src/hooks/usePropiedades.ts`

```typescript
const { propiedades, setPropiedades, loading, error } = usePropiedades();
```

- Lee del `PropiedadesContext`
- En el primer mount llama a `getPropiedades()` (de `services/api.ts`)
- Normaliza la respuesta del backend al formato frontend:
  ```typescript
  {
    id, lat, lng, price,        // para el mapa
    precioMensual, title,       // para las cards
    image, location, estado,
    fotos[], servicios[]
  }
  ```
- Solo carga si `propiedades.length === 0` (evita recargas)

#### `usePropiedadesSocket()`

**Archivo:** `src/hooks/usePropiedadesSocket.ts`

```typescript
usePropiedadesSocket(); // sin argumentos, se autogestiona
```

- Crea conexion Socket.io a `http://localhost:3000` (ver nota abajo)
- Escucha `propiedad:estado-cambiado`
- Actualiza en `PropiedadesContext` solo la propiedad que cambio de estado
- Desconecta en cleanup del `useEffect`

**IMPORTANTE:** La URL del socket esta hardcodeada en `http://localhost:3000` tanto en `usePropiedadesSocket.ts` como en `services/socket.ts`. En produccion debe apuntar al backend real (port 8001 o la URL del servidor).

---

### Estado Global

#### `PropiedadesContext`

**Archivo:** `src/context/PropiedadesContext.tsx`

Context simple con `useState`:
```typescript
{
  propiedades: Propiedad[],
  setPropiedades: Dispatch<SetStateAction<Propiedad[]>>
}
```

El `PropiedadesProvider` debe envolver el layout protegido para que `usePropiedades` y `usePropiedadesSocket` funcionen.

---

### Flujo de Datos Frontend

```
Navegacion a /mapa
    │
    ▼
MapaPage monta
    │
    ├──► usePropiedades()
    │        │
    │        ├─ PropiedadesContext.propiedades.length === 0?
    │        │   SI → getPropiedades() → GET http://localhost:8001/api/v1/propiedades
    │        │         ↓ normaliza respuesta
    │        │         setPropiedades(normalizadas)
    │        │   NO → usa cache del context
    │        │
    │        └─ retorna { propiedades, loading, error }
    │
    ├──► usePropiedadesSocket()
    │        │
    │        └─ io('http://localhost:3000')  ← WS
    │             on('propiedad:estado-cambiado')
    │               → setPropiedades(prev => prev.map(actualizar estado))
    │
    ▼
propiedadesFiltradas = useMemo(filtros client-side)
    │
    ▼
Render: PropertyFilters + PropertyCard[] + MapWrapper
```

---

## Integracion

### Como el Frontend llama al Backend

El cliente HTTP base (`src/lib/api/client.ts`):
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1";

api<T>(path, { method, body, auth })
// → fetch(`${API_URL}${API_PREFIX}${path}`, ...)
```

El modulo de disponibilidad usa `services/api.ts` (legacy) para `getPropiedades()`:
```typescript
// services/api.ts → GET http://localhost:8001/api/v1/propiedades
```

Las llamadas publicas (sin auth) van a `/propiedades` que resuelve al modulo 3.
Las llamadas de arrendador (con auth) van a `/propiedades/registro` que resuelve al modulo 1.

### Rutas en el Backend Unificado

```typescript
// Modulo 1 (con auth): CRUD privado del arrendador
app.use('/api/v1/propiedades/registro', propiedadRegistroRoutes);

// Modulo 3 (publico): listado y filtros
app.use('/api/v1/propiedades', propiedadesDisponibilidadRouter);
app.use('/api/v1/filtros', filtrosRouter);
```

**ATENCION:** Hay conflicto potencial entre `/propiedades/registro` y `/propiedades/:id`. Express lo resuelve correctamente porque `/propiedades/registro` esta montado antes, pero conviene revisarlo si se agregan nuevas rutas.

---

## Variables de Entorno

### Backend (`disponibilidad-busqueda-inteligente/BackendDisponibilidad/.env`)
```env
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
PORT=8004
```

### Backend Unificado (`alquileres-hub-pucem/backend-unificado/.env`)
```env
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
PORT=8001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`front-alquileres-hub-pucem/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_API_PREFIX=/api/v1
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8001
```

---

## Guia de Ejecucion

### Desarrollo Local

```bash
# Terminal 1: Backend Unificado (PRINCIPAL)
cd alquileres-hub-pucem/backend-unificado
npm run dev
# → http://localhost:8001/api/v1/propiedades

# Terminal 2: Frontend
cd front-alquileres-hub-pucem
npm run dev
# → http://localhost:3000/mapa

# Opcional - Backend Disponibilidad Standalone (para desarrollo aislado)
cd alquileres-hub-pucem/disponibilidad-busqueda-inteligente/BackendDisponibilidad
npm run dev
# → http://localhost:8004/propiedades
```

### Verificar que Funciona

```bash
# Listar propiedades
curl http://localhost:8001/api/v1/propiedades

# Filtrar por precio
curl "http://localhost:8001/api/v1/filtros/propiedades?precio_min=200&precio_max=500"

# Health check
curl http://localhost:8001/health
```

---

## Problemas Conocidos

1. **Socket URL hardcodeada:** `usePropiedadesSocket.ts` y `services/socket.ts` apuntan a `http://localhost:3000` en lugar del backend. En produccion el socket deberia apuntar al backend real.

2. **Filtros frontend vs backend:** Los filtros en `/mapa` son completamente client-side. El endpoint `/api/v1/filtros/propiedades` existe pero no es utilizado por el frontend actualmente.

3. **Socket.io no inicializado en backend-unificado:** El gateway `panel.gateway.ts` solo funciona en el modo standalone del BackendDisponibilidad. En el backend-unificado los eventos de socket no se emiten.

4. **Puerto backend disponibilidad:** En modo standalone usa port 8004, pero en el monorepo las rutas estan montadas en el backend-unificado en el port 8001.
