# Backend — Disponibilidad y Busqueda Inteligente

Modulo 3 del sistema **Portoviejo360**. Provee la API REST publica y actualizaciones en tiempo real via Socket.io para el panel de busqueda de propiedades.

> Este modulo corre integrado dentro del **backend-unificado** (port 8001). Solo levantalo de forma standalone para desarrollo aislado (port 8004).

---

## Stack

| Tecnologia | Version |
|-----------|---------|
| Node.js | >= 16 |
| Express | ^5.2.1 |
| TypeScript | ^5.x |
| **pg (node-postgres)** | ^8.16 — SQL raw, sin Prisma |
| Socket.io | ^4.8.1 |
| ts-node-dev | ^2.x |

---

## Endpoints REST

### `/propiedades`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/propiedades` | Lista todas con fotos y servicios embebidos |
| GET | `/propiedades/:id` | Detalle + datos del propietario |
| POST | `/propiedades` | Crear propiedad |
| PUT | `/propiedades/:id` | Editar campos (parcial) |
| PUT | `/propiedades/:id/estado` | Cambiar estado → dispara evento WS |
| GET | `/propiedades/:id/propietario` | Datos del propietario |
| GET | `/propiedades/:id/fotos` | Fotos |
| GET | `/propiedades/:id/servicios` | Servicios → dispara evento WS |

### `/filtros`

| Metodo | Ruta | Query params |
|--------|------|-------------|
| GET | `/filtros/propiedades` | `estado`, `publico_objetivo_id`, `precio_min`, `precio_max`, `servicios` |

**Ejemplo:**
```
GET /filtros/propiedades?estado=disponible&precio_min=200&precio_max=600
GET /filtros/propiedades?servicios=1,3,5
```

---

## Eventos Socket.io

| Evento emitido | Cuando |
|----------------|--------|
| `propiedad:estado-cambiado` | `PUT /propiedades/:id/estado` |
| `propiedad:servicios` | `GET /propiedades/:id/servicios` |

---

## Estructura

```
src/
├── server.ts                   # Entry point standalone (port 8004)
├── app.ts                      # Express app (importada por backend-unificado)
├── config/database.ts          # pg.Pool → Supabase con SSL
├── routers/
│   ├── propiedades.routes.ts
│   └── filtros.routes.ts
├── controllers/                # Handlers HTTP
├── services/
│   ├── propiedades.service.ts  # SQL raw con JSON_AGG
│   └── filtros.service.ts      # WHERE dinamico con $placeholders
└── modules/tiempo-real/
    └── panel.gateway.ts        # Socket.io emitters
```

---

## Variables de Entorno

Crea `.env` en esta carpeta (ver `.env.template`):

```env
DATABASE_URL=postgresql://postgres.[ref]:[pass]@...supabase.com:6543/postgres
PORT=8004
```

---

## Ejecucion Local (Standalone)

```bash
npm install
npm run dev    # ts-node-dev, port 8004
```

---

## Ejecucion con Docker (Proyecto Completo)

```bash
# Desde la raiz del proyecto portoviejo360/
docker compose up --build
```

Las imagenes estan publicadas en DockerHub:
- `sketox/portoviejo360-backend:latest`
- `sketox/portoviejo360-frontend:latest`
