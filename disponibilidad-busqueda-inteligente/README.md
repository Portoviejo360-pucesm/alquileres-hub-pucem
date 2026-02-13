# Disponibilidad y Búsqueda Inteligente

## 📋 Descripción

Este módulo se encarga de gestionar la **disponibilidad de las propiedades** y permitir búsquedas avanzadas para los usuarios. Es crucial para que los inquilinos encuentren inmuebles que se ajusten a sus necesidades (ubicación, precio, características).

## 📂 Estructura

- **BackendDisponibilidad/**: Servicio backend principal.
- **Frontend/**: Componentes de interfaz específicos de este módulo (si aplica).

## 🛠️ Tecnologías (Backend)

- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL / Supabase
- **Validación**: `jet-validators`
- **Logging**: `jet-logger`
- **ORM/Query Builder**: `pg` (Cliente nativo) o Supabase JS

## 🚀 Instalación y Ejecución

### Configuración del Backend

1. Navega a `BackendDisponibilidad`:

   ```bash
   cd BackendDisponibilidad
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Configura el `.env`.
4. Ejecuta el servidor:

   ```bash
   npm run dev
   ```

## 🔑 Funcionalidades Clave

- **Búsqueda Avanzada**: Filtrado por rango de precios, ubicación, amenities.
- **Calendario de Disponibilidad**: Verificación de fechas libres/ocupadas.
- **Gestión de Reservas**: Bloqueo temporal de propiedades en proceso de arriendo.

## 📡 Endpoints Principales

- `GET /api/search`: Buscar propiedades con filtros.
- `GET /api/availability/:id`: Obtener disponibilidad de una propiedad específica.
