# Alquileres Hub PUCEM — Backend

Sistema de gestion de arriendos para Portoviejo. Monorepo con 4 modulos backend orquestados por un servidor unificado.

[![Docker](https://img.shields.io/badge/Docker-sketox%2Fportoviejo360--backend-blue?logo=docker)](https://hub.docker.com/r/sketox/portoviejo360-backend)

---

## Arquitectura

```
alquileres-hub-pucem/
├── backend-unificado/                      # Servidor principal (port 8001)
│   └── src/app.ts                          # Orquesta los 4 modulos
├── registro-arrendadores-propiedades/
│   └── backend/                            # Auth, propiedades, verificacion (Prisma)
├── gestion-inquilinos-contratos/
│   └── backend/                            # Reservas, contratos PDF (Prisma)
├── disponibilidad-busqueda-inteligente/
│   └── BackendDisponibilidad/              # Listado publico, filtros, Socket.io (pg raw)
└── reportes-quejas-mantenimiento/
    └── backend/                            # Incidencias, bitacora (Prisma)
```

En desarrollo, **solo se ejecuta el `backend-unificado`** que importa las rutas de los 4 modulos directamente como TypeScript.

---

## Modulos

| # | Modulo | Rutas montadas | ORM |
|---|--------|---------------|-----|
| 1 | Registro de Arrendadores | `/api/v1/auth`, `/api/v1/propiedades/registro`, `/api/v1/verificacion` | Prisma |
| 2 | Gestion de Inquilinos | `/api/v1/reservas`, `/api/v1/contratos` | Prisma |
| 3 | Disponibilidad y Busqueda | `/api/v1/propiedades`, `/api/v1/filtros` | pg Pool (SQL raw) |
| 4 | Reportes y Mantenimiento | `/api/v1/incidents`, `/api/v1/catalogos-mantenimiento` | Prisma |

---

## Inicio Rapido — Desarrollo Local

### Requisitos
- Node.js >= 18
- npm
- Cuenta en Supabase (base de datos compartida)

### Pasos

```bash
# 1. Instalar dependencias del backend unificado
cd backend-unificado
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase y JWT_SECRET

# 3. Instalar dependencias de cada modulo
cd ../registro-arrendadores-propiedades/backend && npm install
cd ../../gestion-inquilinos-contratos/backend && npm install
cd ../../disponibilidad-busqueda-inteligente/BackendDisponibilidad && npm install
cd ../../reportes-quejas-mantenimiento/backend && npm install

# 4. Arrancar el servidor unificado
cd ../../backend-unificado
npm run dev
```

El servidor estara disponible en `http://localhost:8001`.

---

## Variables de Entorno

Ver `backend-unificado/.env.example`:

```env
PORT=8001
DATABASE_URL=postgresql://postgres.[ref]:[pass]@...supabase.com:6543/postgres
JWT_SECRET=tu-secreto-muy-largo-aqui
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## API Reference

Base URL: `http://localhost:8001/api/v1`

| Endpoint | Descripcion |
|----------|-------------|
| `GET /health` | Health check del servidor |
| `POST /auth/login` | Login de usuario |
| `POST /auth/register` | Registro de usuario |
| `GET /propiedades` | Listado publico de propiedades |
| `GET /filtros/propiedades` | Filtrado de propiedades |
| `GET /reservas` | Mis reservas |
| `GET /incidents` | Incidencias |

---

## Docker

### Correr con Docker Compose (proyecto completo)

```bash
# Desde la raiz del proyecto (portoviejo360/)
cp .env.docker.example .env
# Edita .env con tus credenciales reales
docker compose up --build
```

### Imagen en DockerHub

```bash
# Descargar imagen del backend
docker pull sketox/portoviejo360-backend:latest
```

Ver [`DOCKER_README.md`](../DOCKER_README.md) para instrucciones completas.

---

## Tecnologias

- **Express 5** + TypeScript
- **Supabase PostgreSQL** (pgbouncer port 6543)
- **Prisma** (modulos 1, 2, 4) + **pg Pool raw SQL** (modulo 3)
- **JWT** (auth compartida entre modulos)
- **Socket.io** (tiempo real en modulo de disponibilidad)
- **Supabase Storage** (fotos, documentos, adjuntos)
