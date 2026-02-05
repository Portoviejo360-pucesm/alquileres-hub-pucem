# 🗺️ Rutas Estandarizadas - Backend Unificado

## Prefijo Estándar

Todas las rutas usan el prefijo: **`/api`**

---

## 📋 Endpoints Disponibles

### 🔐 Autenticación (Módulo Registro)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| GET | `/api/auth/perfil` | Obtener perfil del usuario | ✅ |

### 👤 Perfil (Módulo Registro)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/perfil` | Obtener perfil completo | ✅ |
| PUT | `/api/perfil` | Actualizar perfil | ✅ |

### 🏠 Propiedades (Módulo Disponibilidad)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/propiedades` | Listar todas las propiedades | ❌ |
| GET | `/api/propiedades/:id` | Obtener propiedad por ID | ❌ |
| POST | `/api/propiedades` | Crear nueva propiedad | ✅ |
| PUT | `/api/propiedades/:id` | Actualizar propiedad | ✅ |
| DELETE | `/api/propiedades/:id` | Eliminar propiedad | ✅ |

### 📝 Propiedades Registro (Módulo Registro)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/propiedades/registro` | Listar propiedades del módulo registro | ✅ |
| POST | `/api/propiedades/registro` | Crear propiedad (registro) | ✅ |

### 📚 Catálogos (Módulo Registro)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/catalogos/estados` | Obtener estados de propiedades | ❌ |
| GET | `/api/catalogos/publico-objetivo` | Obtener públicos objetivo | ❌ |
| GET | `/api/catalogos/tipos-propiedad` | Obtener tipos de propiedad | ❌ |

### 🔍 Filtros (Módulo Disponibilidad)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/filtros/propiedades` | Filtrar propiedades | ❌ |

### 📅 Reservas (Módulo Inquilinos)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/reservas` | Listar reservas | ✅ |
| POST | `/api/reservas` | Crear reserva | ✅ |
| GET | `/api/reservas/:id` | Obtener reserva por ID | ✅ |
| PUT | `/api/reservas/:id` | Actualizar reserva | ✅ |

### 📄 Contratos (Módulo Inquilinos)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/contratos` | Listar contratos | ✅ |
| POST | `/api/contratos` | Crear contrato | ✅ |
| GET | `/api/contratos/:id` | Obtener contrato por ID | ✅ |
| GET | `/api/contratos/:id/descargar` | Descargar PDF del contrato | ✅ |

### 🔧 Incidencias/Reportes (Módulo Reportes)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/incidencias` | Listar incidencias | ✅ |
| POST | `/api/incidencias` | Crear incidencia (con archivos) | ✅ |
| GET | `/api/incidencias/:id` | Obtener incidencia por ID | ✅ |
| PATCH | `/api/incidencias/:id` | Actualizar incidencia | ✅ |
| PATCH | `/api/incidencias/:id/status` | Actualizar estado de incidencia | ✅ |
| DELETE | `/api/incidencias/:id` | Eliminar incidencia | ✅ |
| GET | `/api/incidencias/:id/bitacora` | Obtener bitácora de incidencia | ✅ |
| POST | `/api/incidencias/:id/comentarios` | Agregar comentario | ✅ |
| GET | `/api/incidencias/:id/comentarios` | Listar comentarios | ✅ |
| POST | `/api/incidencias/:id/adjuntos` | Subir adjunto | ✅ |
| GET | `/api/incidencias/:id/adjuntos` | Listar adjuntos | ✅ |

---

## 🔧 Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor |

**Respuesta:**

```json
{
  "status": "OK",
  "service": "Backend Unificado - Alquileres Hub",
  "timestamp": "2026-02-05T...",
  "uptime": 123.456,
  "modules": {
    "registro": "active",
    "inquilinos": "active",
    "disponibilidad": "active",
    "reportes": "pending"
  }
}
```

---

## 📱 Configuración Frontend

### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_API_PREFIX=/api
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8001
```

### Uso en el código

```typescript
// Propiedades
api<Propiedad[]>('/propiedades')  // → http://localhost:8001/api/propiedades

// Auth
authApi.login(...)  // → http://localhost:8001/api/auth/login

// Contratos
api<Contrato[]>('/contratos')  // → http://localhost:8001/api/contratos
```

---

## ✅ Estándar de Rutas

**Regla:** Todas las rutas de API usan el prefijo `/api` (sin `/v1`)

- ✅ **Correcto:** `/api/auth/login`
- ❌ **Incorrecto:** `/api/v1/auth/login`
- ❌ **Incorrecto:** `/auth/login`

---

## 🚀 Pruebas Rápidas

```bash
# Health check
curl http://localhost:8001/health

# Listar propiedades
curl http://localhost:8001/api/propiedades

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Catálogos
curl http://localhost:8001/api/catalogos/estados
```
