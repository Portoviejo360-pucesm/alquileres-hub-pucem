# Backend Unificado - Alquileres Hub

Backend orquestador que unifica todos los microservicios del sistema de gestión de alquileres en un solo servidor.

## 🏗️ Arquitectura Monorepo Modular

Este backend **NO reemplaza** los backends existentes, sino que los **orquesta** importando sus rutas:

```
backend-unificado/
├── src/
│   └── app.ts          # Orquestador principal
├── package.json
└── .env

↓ Importa rutas de:

├── registro-arrendadores-propiedades/backend/
├── gestion-inquilinos-contratos/backend/
└── disponibilidad-busqueda-inteligente/BackendDisponibilidad/
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
PORT=8001
DATABASE_URL=tu-url-de-supabase
JWT_SECRET=tu-secret-key
FRONTEND_URL=http://localhost:3000
```

### 3. Iniciar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:8001`

## 📡 Endpoints Disponibles

### Health Check

- `GET /health` - Estado del servidor y módulos

### Módulo 1: Registro de Propiedades

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/perfil` - Perfil de usuario
- `GET /api/propiedades/registro` - Listar propiedades
- `POST /api/propiedades/registro` - Crear propiedad
- `GET /api/catalogos` - Catálogos

### Módulo 2: Inquilinos y Contratos

- `GET /api/reservas` - Listar reservas
- `POST /api/reservas` - Crear reserva
- `GET /api/contratos` - Listar contratos
- `POST /api/contratos` - Crear contrato

### Módulo 3: Disponibilidad

- `GET /api/propiedades/disponibilidad` - Propiedades disponibles
- `GET /api/filtros` - Filtros de búsqueda

### Módulo 4: Reportes (Pendiente)

- ⏳ Por implementar

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run type-check` - Verifica tipos de TypeScript

## 📝 Notas Importantes

1. **No elimines los backends originales** - Este orquestador los necesita para funcionar
2. **Instala dependencias en cada backend** - Los módulos originales deben tener sus `node_modules`
3. **Mismo JWT_SECRET** - Todos los backends deben usar el mismo secret
4. **Mismo DATABASE_URL** - Todos comparten la misma base de datos Supabase

## 🆘 Solución de Problemas

### Error: Cannot find module '../../registro-arrendadores-propiedades/...'

Asegúrate de que los backends originales existen y tienen sus dependencias instaladas:

```bash
cd ../registro-arrendadores-propiedades/backend && npm install
cd ../gestion-inquilinos-contratos/backend && npm install
cd ../disponibilidad-busqueda-inteligente/BackendDisponibilidad && npm install
```

### Error: Port 8001 already in use

Detén el backend de registro que corre en 8001:

```bash
lsof -i :8001
kill <PID>
```

O cambia el puerto en `.env`:

```env
PORT=8005
```
