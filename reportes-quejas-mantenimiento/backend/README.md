# Backend - Módulo de Reportes, Quejas y Mantenimiento

Backend para el módulo de gestión de incidencias del proyecto Portoviejo360.

## 🚀 Tecnologías

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Zod** - Validación de esquemas
- **JWT** - Autenticación (integrado con módulo externo)
- **Supabase Storage** - Almacenamiento de archivos
- **Nodemailer** - Envío de notificaciones por email

## 📋 Requisitos Previos

- Node.js >= 18
- PostgreSQL (o Supabase)
- Cuenta de Supabase (para almacenamiento de archivos)
- Servidor SMTP (para notificaciones por email)

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# JWT (del módulo de autenticación)
JWT_SECRET="tu-secret-key"

# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
SUPABASE_STORAGE_BUCKET="incident-attachments"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
EMAIL_FROM="noreply@portoviejo360.com"
```

### 3. Generar cliente de Prisma

```bash
npm run prisma:generate
```

### 4. Ejecutar migraciones (si es necesario)

```bash
npx prisma db push
```

### 5. Poblar base de datos con datos iniciales

```bash
npm run prisma:seed
```

Esto creará los registros iniciales de:
- **Estados**: pendiente, en_proceso, resuelto, cerrado
- **Prioridades**: baja, media, alta, urgente
- **Categorías**: plomería, electricidad, limpieza, seguridad, etc.

### 6. Configurar bucket de Supabase Storage

En tu proyecto de Supabase:
1. Ve a Storage
2. Crea un bucket llamado `incident-attachments`
3. Configura las políticas de acceso según tus necesidades

## 🏃 Ejecutar el Proyecto

### Modo desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Modo producción

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Health Check
```
GET /health
```

### Incidencias

```
POST   /api/incidents              # Crear incidencia
GET    /api/incidents              # Listar incidencias
GET    /api/incidents/:id          # Obtener incidencia por ID
PATCH  /api/incidents/:id          # Actualizar incidencia
PATCH  /api/incidents/:id/status   # Actualizar estado
DELETE /api/incidents/:id          # Eliminar incidencia
```

### Bitácora de Mantenimiento

```
POST   /api/incidents/:id/bitacora    # Agregar entrada
GET    /api/incidents/:id/bitacora    # Obtener historial
```

### Comentarios

```
POST   /api/incidents/:id/comentarios           # Agregar comentario
GET    /api/incidents/:id/comentarios           # Listar comentarios
PATCH  /api/incidents/:id/comentarios/:commentId # Actualizar comentario
```

### Adjuntos

```
POST   /api/incidents/:id/adjuntos           # Subir archivo
GET    /api/incidents/:id/adjuntos           # Listar adjuntos
DELETE /api/incidents/:id/adjuntos/:adjuntoId # Eliminar archivo
```

## 🔐 Autenticación

Todas las rutas (excepto `/health`) requieren autenticación mediante JWT.

Incluye el token en el header:
```
Authorization: Bearer <tu-token-jwt>
```

El token debe contener:
- `id` o `sub` o `userId`: ID del usuario
- `role` o `user_role`: Rol del usuario (tenant, landlord, admin)
- `email`: Email del usuario

## 👥 Roles y Permisos

### Tenant (Inquilino)
- Crear incidencias en propiedades que ocupa
- Ver sus propias incidencias
- Agregar comentarios y adjuntos
- Ver bitácora de mantenimiento

### Landlord (Arrendador)
- Ver incidencias de sus propiedades
- Actualizar estado de incidencias
- Agregar entradas a bitácora
- Agregar comentarios (públicos e internos)
- Asignar responsables

### Admin (Administrador)
- Acceso completo a todas las funcionalidades
- Ver todas las incidencias
- Eliminar incidencias

## 📝 Reglas de Negocio Implementadas

### RF-001: Registro de Incidentes
- ✅ Inquilinos solo pueden reportar en propiedades que ocupan
- ✅ Incluye título, descripción, prioridad, categoría
- ✅ Soporte para adjuntar fotografías
- ✅ Notificación automática al arrendador

### RF-002: Actualización de Estado
- ✅ Estados permitidos: pendiente, en_proceso, resuelto, cerrado
- ✅ Estado "resuelto" requiere descripción
- ✅ Todos los cambios quedan registrados en historial

### RF-003: Bitácora de Mantenimiento
- ✅ Solo arrendadores/admins pueden agregar entradas
- ✅ Las entradas no pueden ser eliminadas
- ✅ Ordenadas de más reciente a más antiguo

### RF-004: Notificaciones
- ✅ Notificación al arrendador cuando se crea incidencia
- ✅ Notificación al inquilino cuando cambia el estado
- ✅ Incluye ID, tipo y fecha del incidente
- ✅ Prevención de notificaciones duplicadas

### RF-005: Visualización
- ✅ Inquilinos solo ven sus propias incidencias
- ✅ Arrendadores solo ven incidencias de sus propiedades
- ✅ Admins ven todas las incidencias
- ✅ Historial completo disponible

## 🛠️ Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── seed.ts             # Datos iniciales
├── src/
│   ├── config/             # Configuración
│   ├── controllers/        # Controladores
│   ├── middlewares/        # Middlewares
│   ├── routes/             # Rutas
│   ├── services/           # Lógica de negocio
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Utilidades
│   ├── validators/         # Esquemas de validación
│   ├── app.ts              # Configuración de Express
│   └── server.ts           # Punto de entrada
├── .env.example            # Ejemplo de variables de entorno
├── package.json
└── tsconfig.json
```

## 🧪 Testing

Para ejecutar las pruebas (cuando estén implementadas):

```bash
npm test
```

## 📄 Licencia

ISC
