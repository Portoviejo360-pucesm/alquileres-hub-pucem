# Alquileres Hub - Backend System

## 🌟 Visión General

Este directorio contiene toda la lógica del lado del servidor para el ecosistema **PortoViejo360**. El sistema está diseñado con una arquitectura orientada a servicios (o modular), donde cada funcionalidad principal reside en su propio directorio/módulo.

## 🏗️ Arquitectura Modular

El backend se divide en los siguientes componentes clave:

### 1. [Backend Unificado (API Gateway)](./backend-unificado/README.md)

Es el punto de entrada principal. Orquesta las peticiones, maneja la autenticación y enruta el tráfico a los servicios correspondientes.

### 2. [Disponibilidad y Búsqueda](./disponibilidad-busqueda-inteligente/README.md)

Motor de búsqueda de propiedades y gestión de fechas disponibles.

### 3. [Gestión de Inquilinos y Contratos](./gestion-inquilinos-contratos/README.md)

Administración de arrendatarios, generación de contratos PDF y ciclo de vida del alquiler.

### 4. [Registro de Arrendadores y Propiedades](./registro-arrendadores-propiedades/README.md)

Onboarding de propietarios y alta de inventario (casas, deptos, locales).

### 5. [Reportes y Mantenimiento](./reportes-quejas-mantenimiento/README.md)

Sistema de tickets para soporte, quejas y solicitudes de reparación.

## 🚀 Cómo Empezar

Cada módulo es independiente en cuanto a dependencias. Sin embargo, el flujo general de desarrollo suele ser:

1. **Configurar Bases de Datos**: Asegúrate de tener PostgreSQL/Supabase listos.
2. **Backend Unificado**: Levanta este servicio primero (`backend-unificado`) para tener el gateway activo.
3. **Microservicios**: Levanta los servicios individuales según la funcionalidad que estés desarrollando.

Consulta el `README.md` de cada subdirectorio para instrucciones específicas de instalación.

## 🛠️ Tecnologías Comunes

- **Lenguaje**: TypeScript
- **Runtime**: Node.js
- **BD**: PostgreSQL / Supabase
- **ORM**: Prisma Estándar
