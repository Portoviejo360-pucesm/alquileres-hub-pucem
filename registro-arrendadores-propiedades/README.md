# Registro de Arrendadores y Propiedades

## 📋 Descripción

Módulo encargado del **onboarding** de propietarios y el alta de nuevas propiedades en el sistema. Es el punto de entrada para la oferta de inmuebles.

## 🛠️ Tecnologías

- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL / Supabase
- **ORM**: Prisma
- **Validación**: `zod`
- **Manejo de Archivos**: `multer` (para subir fotos de propiedades).
- **Seguridad**: `helmet`, `cors`, `bcryptjs`.

## 🚀 Instalación y Ejecución

### Pasos

1. **Instalar dependencias**:

   ```bash
   cd backend
   npm install
   ```

2. **Configuración**:
   Crea el archivo `.env` con las credenciales de Supabase/Postgres.
   Sincroniza el esquema de Prisma:

   ```bash
   npm run prisma:generate
   ```

3. **Ejecutar**:

   ```bash
   npm run dev
   # O para producción
   npm start
   ```

## 🔑 Funcionalidades

- **Registro de Arrendadores**: Perfilado de propietarios.
- **Alta de Propiedades**: Formulario detallado con características, ubicación y precio.
- **Subida de Imágenes**: Gestión de galería multimedia para cada propiedad.
- **Verificación**: Flujos para validar la identidad del propietario o la propiedad (si aplica).

## 📡 Endpoints Destacados

- `POST /api/landlords/register`: Registrar nuevo arrendador.
- `POST /api/properties`: Crear nueva propiedad (requiere autenticación y rol de arrendador).
- `GET /api/properties/my-properties`: Listar propiedades del usuario actual.
