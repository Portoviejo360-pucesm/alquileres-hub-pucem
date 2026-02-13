# Gestión de Inquilinos y Contratos

## 📋 Descripción

Este módulo administra el ciclo de vida de los **arriendos**. Maneja la información de los inquilinos, la generación y firma de contratos, y el seguimiento de los mismos.

## 🛠️ Tecnologías

- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (vía Prisma ORM)
- **Generación de Documentos**: `pdfkit` (para generar contratos en PDF).
- **Autenticación**: `jsonwebtoken` (JWT).

## 🚀 Instalación y Ejecución

### Pasos

1. **Instalar dependencias**:

   ```bash
   cd backend
   npm install
   ```

2. **Base de Datos**:
   Asegúrate de tener la conexión a la base de datos configurada en `.env`.
   Genera el cliente de Prisma:

   ```bash
   npm run prisma:generate
   ```

3. **Ejecutar**:

   ```bash
   npm run dev
   ```

## 🔑 Funcionalidades

- **Gestión de Inquilinos**: Registro y actualización de datos de arrendatarios.
- **Creación de Contratos**: Generación dinámica de contratos en PDF.
- **Historial de Arriendos**: Registro histórico de contratos finalizados y vigentes.
- **Validación de Roles**: Asegura que solo usuarios autorizados gestionen contratos.

## 🗄️ Modelo de Datos (Prisma)

El esquema incluye modelos principales como:

- `Tenant` (Inquilino)
- `Contract` (Contrato)
- `Property` (Referencia a Propiedad)
