
# 🏠 Panel de Disponibilidad y Búsqueda Inteligente

### Microservicio – Portoviejo 360

Este módulo forma parte del sistema **Portoviejo 360** y es responsable de la **gestión de propiedades inmobiliarias**, su **búsqueda mediante filtros inteligentes** y la **sincronización de cambios de estado en tiempo real**.

El microservicio se conecta a la **base de datos general del proyecto (Supabase – PostgreSQL)** y **no maneja autenticación**, ya que consume datos compartidos del sistema principal.

---

## 🎯 Objetivo

* Gestionar propiedades inmobiliarias.
* Consultar y filtrar propiedades disponibles.
* Emitir eventos en tiempo real cuando cambia el estado de una propiedad.
* Mantener frontend y backend sincronizados sin recargar la interfaz.

---

## 📌 Responsabilidades

* Registro y consulta de propiedades.
* Filtros dinámicos por:

  * Estado (Disponible / Ocupado / Mantenimiento)
  * Público objetivo (Estudiantes, Trabajadores, Todo público)
  * Combinaciones de filtros.
* Emisión de eventos WebSocket al cambiar el estado de una propiedad.

---

## 🧱 Arquitectura

El microservicio sigue una **arquitectura por capas**, con integración en tiempo real:

```
Frontend (Next.js)
│
│  WebSocket (Socket.IO)
▼
API Gateway
│
│  Eventos de estado
▼
Microservicio de Disponibilidad
│
▼
Base de Datos (Supabase - PostgreSQL)
```

### Principios aplicados

* Separación de responsabilidades
* Bajo acoplamiento
* Comunicación en tiempo real
* Escalabilidad modular

---

## 📁 Estructura del proyecto

```
src/
├── config/              # Configuración de base de datos
├── controllers/         # Endpoints HTTP
├── services/            # Lógica de negocio
├── modules/
│   ├── propiedades/     # Dominio propiedades
│   ├── filtros/         # Dominio filtros inteligentes
│   └── websocket.ts     # Comunicación en tiempo real
├── routers/             # Rutas
├── middleware/          # Validaciones
├── utils/               # Helpers y responses
├── app.ts               # Configuración Express
└── server.ts            # Arranque del servidor
```

---

## 🗄️ Base de Datos (Supabase)

Tablas utilizadas:

* `propiedades`
* `estados_propiedad`
* `tipo_publico`
* `usuarios` (solo referencia por `propietario_id`)

Relaciones clave:

* `propiedades.estado_id → estados_propiedad.id_estado`
* `propiedades.publico_objetivo_id → tipo_publico.id_tipo`
* `propiedades.propietario_id → usuarios.id_usuario`

---

## 🌐 Endpoints Principales

### Obtener propiedades disponibles

```http
GET /propiedades
```

---

### Crear una propiedad

```http
POST /propiedades
```

```json
{
  "propietario_id": "uuid-del-usuario",
  "estado_id": 1,
  "publico_objetivo_id": 1,
  "titulo_anuncio": "Suite Norte",
  "precio_mensual": 400
}
```

---

### Cambiar estado de una propiedad

```http
PUT /propiedades/:id/estado
```

```json
{
  "estado_id": 2
}
```

📌 Este cambio **dispara un evento WebSocket**.

---

## 🔍 Filtros Inteligentes

```http
GET /filtros/propiedades?estado=Disponible
GET /filtros/propiedades?publico_objetivo_id=2
GET /filtros/propiedades?estado=Disponible&publico_objetivo_id=3
```

Si no existen coincidencias, el endpoint devuelve:

```json
[]
```

---

## 🔴 Comunicación en Tiempo Real (WebSocket)

Cuando el estado de una propiedad cambia, el backend emite:

```json
{
  "id_propiedad": 26,
  "estado_id": 2,
  "estado": "OCUPADO",
  "precio_mensual": "400.00",
  "publico_objetivo": "SOLO ESTUDIANTES",
  "timestamp": "2025-12-21T04:28:38.983Z"
}
```

El frontend:

* Escucha el evento.
* Actualiza el estado global.
* Refresca la UI sin recargar la página.

---

## 🧪 Pruebas Realizadas

* Pruebas manuales de endpoints REST con **Postman**.
* Verificación de eventos WebSocket mediante logs del backend.
* Confirmación de recepción de eventos en consola del frontend.
* Validación visual del cambio de estado en la interfaz.

---

## 🚀 Ejecución Local

Variables de entorno:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

Ejecución:

* Backend: `http://localhost:3000`
* Frontend: `http://localhost:3001`

---

## ✅ Estado Actual del Módulo

✔ Backend funcional
✔ Conectado a Supabase
✔ Endpoints REST operativos
✔ WebSocket implementado y validado
✔ Frontend conectado en tiempo real
✔ Arquitectura limpia y desacoplada

---

## 🧭 Próximos Pasos (no implementados aún)

* Consumo de datos reales en frontend (reemplazar mocks).
* Actualización visual completa del mapa en tiempo real.
* Autenticación y roles.
* Persistencia de favoritos por usuario.

---

## 👨‍💻 Autor

Proyecto académico – **Portoviejo 360**
Microservicio: **Panel de Disponibilidad y Búsqueda Inteligente**
