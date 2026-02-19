# ============================================================
# Dockerfile - Backend Unificado Alquileres Hub
# Contexto de build: directorio alquileres-hub-pucem/
# ============================================================

FROM node:20-alpine AS base

# Dependencias del sistema para Prisma y builds nativos
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

# ============================================================
# STAGE: deps
# Instala node_modules de cada modulo por separado
# IMPORTANTE: copia prisma/ ANTES de prisma generate
# ============================================================
FROM base AS deps

# --- Modulo 1: Registro de Arrendadores y Propiedades ---
COPY registro-arrendadores-propiedades/backend/package*.json \
     ./registro-arrendadores-propiedades/backend/
COPY registro-arrendadores-propiedades/backend/prisma \
     ./registro-arrendadores-propiedades/backend/prisma/
RUN cd registro-arrendadores-propiedades/backend && \
    npm ci && \
    npx prisma generate

# --- Modulo 2: Gestion de Inquilinos y Contratos ---
COPY gestion-inquilinos-contratos/backend/package*.json \
     ./gestion-inquilinos-contratos/backend/
COPY gestion-inquilinos-contratos/backend/prisma \
     ./gestion-inquilinos-contratos/backend/prisma/
RUN cd gestion-inquilinos-contratos/backend && \
    npm ci && \
    npx prisma generate

# --- Modulo 3: Disponibilidad y Busqueda (sin Prisma, pg raw) ---
COPY disponibilidad-busqueda-inteligente/BackendDisponibilidad/package*.json \
     ./disponibilidad-busqueda-inteligente/BackendDisponibilidad/
RUN cd disponibilidad-busqueda-inteligente/BackendDisponibilidad && \
    npm ci

# --- Modulo 4: Reportes, Quejas y Mantenimiento ---
COPY reportes-quejas-mantenimiento/backend/package*.json \
     ./reportes-quejas-mantenimiento/backend/
COPY reportes-quejas-mantenimiento/backend/prisma \
     ./reportes-quejas-mantenimiento/backend/prisma/
RUN cd reportes-quejas-mantenimiento/backend && \
    npm ci && \
    npx prisma generate

# --- Backend Unificado (incluye tsx como devDep, necesario para ejecutar) ---
COPY backend-unificado/package*.json ./backend-unificado/
RUN cd backend-unificado && npm ci

# ============================================================
# STAGE: final
# Imagen de produccion
# ============================================================
FROM base AS final

WORKDIR /app

# Copiar node_modules instalados (con @prisma/client generado)
COPY --from=deps /app/registro-arrendadores-propiedades/backend/node_modules \
     ./registro-arrendadores-propiedades/backend/node_modules

COPY --from=deps /app/gestion-inquilinos-contratos/backend/node_modules \
     ./gestion-inquilinos-contratos/backend/node_modules

COPY --from=deps /app/disponibilidad-busqueda-inteligente/BackendDisponibilidad/node_modules \
     ./disponibilidad-busqueda-inteligente/BackendDisponibilidad/node_modules

COPY --from=deps /app/reportes-quejas-mantenimiento/backend/node_modules \
     ./reportes-quejas-mantenimiento/backend/node_modules

COPY --from=deps /app/backend-unificado/node_modules \
     ./backend-unificado/node_modules

# Copiar todo el codigo fuente
COPY . .

# Directorio de trabajo: backend unificado
WORKDIR /app/backend-unificado

# Crear directorio de uploads
RUN mkdir -p public/uploads

EXPOSE 8001

ENV NODE_ENV=production
ENV PORT=8001

# Usar tsx para ejecutar TypeScript directamente
CMD ["node_modules/.bin/tsx", "src/app.ts"]
