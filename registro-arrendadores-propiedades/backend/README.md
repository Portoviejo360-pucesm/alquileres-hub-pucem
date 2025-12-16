# Portoviejo360 - Backend API

Backend del módulo de Registro de Arrendadores y Propiedades para la plataforma Portoviejo360.

## Stack Tecnológico

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL** (Supabase) - Base de datos
- **JWT** - Autenticación
- **Zod** - Validación de datos
- **Bcrypt** - Encriptación de contraseñas

## Estructura del Proyecto

```
backend/
├── prisma/
│   └── schema.prisma          # Schema de Prisma
├── src/
│   ├── config/                # Configuraciones
│   ├── controllers/           # Controladores (manejo de req/res)
│   ├── services/              # Lógica de negocio
│   ├── routes/                # Definición de rutas
│   ├── middlewares/           # Middlewares personalizados
│   ├── validators/            # Schemas de validación (Zod)
│   ├── types/                 # Tipos TypeScript
│   ├── utils/                 # Utilidades
│   └── app.ts                 # Configuración de Express
├── .env.example               # Ejemplo de variables de entorno
├── package.json
└── tsconfig.json
```

## Configuración Inicial

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Database (obtén esto de Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# JWT (genera una clave segura)
JWT_SECRET="tu-clave-secreta-muy-segura"
JWT_EXPIRES_IN="7d"

# Supabase (para subir imágenes)
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_KEY="tu-service-key"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 3. Conectar Prisma a tu Base de Datos Existente

Como ya tienes la base de datos creada en Supabase, usa `prisma db pull` para generar el schema automáticamente:

```bash
npm run prisma:pull
```

Esto generará el archivo `prisma/schema.prisma` basándose en tu base de datos existente.

**IMPORTANTE:** El schema generado automáticamente puede necesitar ajustes manuales:
- Verifica que los nombres de los modelos sigan las convenciones de Prisma (PascalCase)
- Asegúrate de que las relaciones estén correctamente definidas
- Revisa que los tipos de datos sean los correctos

### 4. Generar el Cliente de Prisma

Después de ajustar el schema (si es necesario), genera el cliente de Prisma:

```bash
npm run prisma:generate
```

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión

### Perfil
- `POST /api/v1/perfil/solicitar-verificacion` - Solicitar verificación de arrendador

### Propiedades
- `GET /api/v1/propiedades` - Listar propiedades (con filtros)
- `GET /api/v1/propiedades/:id` - Obtener propiedad por ID
- `POST /api/v1/propiedades` - Crear propiedad (requiere autenticación)
- `PUT /api/v1/propiedades/:id` - Actualizar propiedad (requiere autenticación)
- `DELETE /api/v1/propiedades/:id` - Eliminar propiedad (requiere autenticación)
- `GET /api/v1/propiedades/mis-propiedades` - Obtener propiedades del usuario autenticado

### Catálogos
- `GET /api/v1/catalogos/servicios` - Listar servicios disponibles
- `GET /api/v1/catalogos/estados` - Listar estados de propiedad
- `GET /api/v1/catalogos/tipos-publico` - Listar tipos de público objetivo
- `GET /api/v1/catalogos/roles` - Listar roles de usuario

## Autenticación

El sistema usa JWT (JSON Web Tokens) para la autenticación. Los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor en modo desarrollo

# Prisma
npm run prisma:pull            # Sincronizar schema desde la BD
npm run prisma:generate        # Generar cliente de Prisma
npm run prisma:studio          # Abrir Prisma Studio (GUI)

# Build
npm run build                  # Compilar TypeScript
npm start                      # Iniciar servidor en producción

# Linting
npm run lint                   # Ejecutar ESLint
npm run format                 # Formatear código con Prettier
```

## Ejemplo de Uso: Crear Propiedad

### Request

```http
POST /api/v1/propiedades
Authorization: Bearer <token>
Content-Type: application/json

{
  "tituloAnuncio": "Hermoso departamento cerca de la PUCE",
  "descripcion": "Departamento amoblado de 2 habitaciones...",
  "precioMensual": 350.00,
  "direccionTexto": "Av. Principal 123, Portoviejo",
  "latitudMapa": -1.0546,
  "longitudMapa": -80.4545,
  "esAmoblado": true,
  "estadoId": 1,
  "publicoObjetivoId": 1,
  "servicios": [
    { "servicioId": 1, "incluidoEnPrecio": true },
    { "servicioId": 2, "incluidoEnPrecio": true }
  ],
  "fotos": [
    { "urlImagen": "https://...", "esPrincipal": true },
    { "urlImagen": "https://...", "esPrincipal": false }
  ]
}
```

### Response

```json
{
  "success": true,
  "message": "Propiedad creada exitosamente",
  "data": {
    "id": 1,
    "tituloAnuncio": "Hermoso departamento cerca de la PUCE",
    "precioMensual": 350.00,
    // ... más datos
  }
}
```

## Arquitectura

El proyecto sigue el patrón de **Clean Architecture** con separación de responsabilidades:

- **Routes**: Define los endpoints y aplica middlewares
- **Controllers**: Maneja req/res, delega a los servicios
- **Services**: Contiene la lógica de negocio
- **Validators**: Valida datos de entrada con Zod
- **Middlewares**: Autenticación, validación, manejo de errores

## Recursos

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [Zod](https://zod.dev/)
- [JWT](https://jwt.io/)
