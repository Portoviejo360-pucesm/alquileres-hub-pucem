# Backend Unificado - Alquileres Hub

## 📋 Descripción

Este módulo actúa como el **API Gateway y Orquestador** principal del sistema. Su función es unificar la entrada de peticiones, manejar la autenticación centralizada y redirigir el tráfico a los microservicios correspondientes.

## 🛠️ Tecnologías

- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (para gestión de sesiones/logs si aplica)
- **Herramientas**:
  - `morgan`: Logging de peticiones HTTP.
  - `helmet`: Seguridad en cabeceras HTTP.
  - `cors`: Manejo de Cross-Origin Resource Sharing.
  - `dotenv`: Gestión de variables de entorno.

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (v18+)
- PostgreSQL

### Pasos

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Crea un archivo `.env` basado en `.env.template`.

   ```bash
   cp .env.template .env
   ```

   Asegúrate de definir el puerto y las URLs de los otros microservicios.

3. **Compilar el proyecto**:

   ```bash
   npm run build
   ```

4. **Ejecutar en desarrollo**:

   ```bash
   npm run dev
   ```

5. **Ejecutar en producción**:

   ```bash
   npm start
   ```

## 🔗 Rutas Principales

El backend unificado expone rutas que actúan como proxy hacia los otros servicios:

| Ruta Base | Servicio Destino | Descripción |
|-----------|------------------|-------------|
| `/api/auth` | Auth Service | Autenticación de usuarios |
| `/api/users` | User Service | Gestión de perfiles |
| `/api/properties` | Property Service | Gestión de propiedades |
| `/api/contracts` | Contract Service | Contratos y arriendos |

## 🏗️ Arquitectura

Este servicio implementa el patrón de **API Gateway**. No contiene lógica de negocio compleja de dominios específicos (como crear un contrato), sino que valida la petición (ej. tokens JWT) y la enruta al servicio adecuado.
