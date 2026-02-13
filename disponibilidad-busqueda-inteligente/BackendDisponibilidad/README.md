
---

# 🏠 Panel de Disponibilidad y Búsqueda Inteligente

### Microservicio — **Portoviejo 360**

Este microservicio forma parte del ecosistema **Portoviejo 360** y es responsable de la **gestión, consulta y filtrado de propiedades inmobiliarias**, así como de la **sincronización en tiempo real del estado de las propiedades** mediante **WebSockets**.

Se conecta directamente a la **base de datos central del proyecto (Supabase – PostgreSQL)** y **no implementa autenticación**, ya que consume información compartida del sistema principal.

---

## 🎯 Objetivo del Microservicio

* Gestionar propiedades inmobiliarias.
* Proveer consultas eficientes y filtros inteligentes.
* Mantener sincronizado el estado de las propiedades en tiempo real.
* Reducir recargas del frontend mediante eventos WebSocket.

---

## 📌 Responsabilidades Principales

* CRUD parcial de propiedades.
* Consulta de propiedades disponibles.
* Filtrado dinámico por:

  * Estado de la propiedad.
  * Público objetivo.
  * Rango de precios.
* Emisión de eventos WebSocket cuando cambia el estado de una propiedad.

---

## 🧱 Arquitectura General

Arquitectura por capas con comunicación en tiempo real:

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
* Comunicación reactiva
* Escalabilidad modular

---

## 📁 Estructura del Proyecto

```
src/
├── config/                # Conexión a base de datos
├── controllers/           # Controladores HTTP
├── services/              # Lógica de negocio
├── routers/               # Definición de rutas
├── modules/
│   ├── propiedades/       # Dominio propiedades
│   ├── filtros/           # Filtros inteligentes
│   └── tiempo-real/       # WebSockets
├── middleware/            # Validaciones
├── utils/                 # Helpers y respuestas
├── app.ts                 # Configuración Express
└── server.ts              # Arranque dinámico del servidor
```

---

## 🗄️ Base de Datos (Supabase – PostgreSQL)

### Tablas utilizadas

* `propiedades`
* `estados_propiedad`
* `tipo_publico`
* `usuarios` (solo referencia por `propietario_id`)

### Relaciones clave

* `propiedades.estado_id → estados_propiedad.id_estado`
* `propiedades.publico_objetivo_id → tipo_publico.id_tipo`
* `propiedades.propietario_id → usuarios.id_usuario`

---

## 🌐 Endpoints REST

### 1️⃣ Listar propiedades

```http
GET /propiedades
```

**Descripción**
Devuelve todas las propiedades con su estado y público objetivo.

---

### 2️⃣ Crear propiedad

```http
POST /propiedades
```

```json
{
  "propietario_id": "uuid-usuario",
  "estado_id": 1,
  "publico_objetivo_id": 1,
  "titulo_anuncio": "Suite Norte",
  "descripcion": "Cómoda suite amoblada",
  "precio_mensual": 400,
  "direccion_texto": "Av. Manabí",
  "latitud_mapa": -0.9536,
  "longitud_mapa": -80.7371,
  "es_amoblado": true
}
```

---

### 3️⃣ Cambiar estado de una propiedad (TIEMPO REAL)

```http
PUT /propiedades/:id/estado
```

```json
{
  "estado_id": 2
}
```

📡 **Este endpoint emite un evento WebSocket** a todos los clientes conectados.

---

### 4️⃣ Editar una propiedad completa

```http
PUT /propiedades/:id
```

Actualiza únicamente los campos enviados (edición parcial tipo Amazon).

---

### 5️⃣ Obtener datos relacionados por ID

```http
GET /propiedades/:id/servicios
GET /propiedades/:id/fotos
GET /propiedades/:id/propietario
GET /propiedades/:id/perfil-verificado
```

---

## 🔍 Filtros Inteligentes

```http
GET /filtros/propiedades?estado=DISPONIBLE
GET /filtros/propiedades?precio_min=300&precio_max=500
GET /filtros/propiedades?estado=DISPONIBLE&publico_objetivo_id=2
```

### Comportamiento

* Los filtros se traducen a SQL dinámico.
* Si no hay coincidencias → devuelve `[]`.
* No genera errores innecesarios.

---

## 🔴 Comunicación en Tiempo Real (WebSocket)

### Evento emitido

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

### Comportamiento en frontend

* Escucha el evento.
* Actualiza el estado global.
* Refresca UI y mapa sin recargar la página.

---

## 🧪 Pruebas Realizadas

* Endpoints REST probados con **Postman**.
* WebSocket validado mediante logs.
* Confirmación de actualización visual en frontend.
* Verificación de filtros combinados.

---

## 🚀 Ejecución Local

### Variables de entorno

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

### Arranque dinámico de puerto

El backend **inicia automáticamente en el primer puerto disponible**, comenzando desde el definido en `PORT`.

---

## 📍 URLs locales

* Backend: `http://localhost:8004`
* Frontend: `http://localhost:3000`

---

## ✅ Estado Actual

✔ Backend funcional
✔ Conectado a Supabase
✔ Endpoints REST completos
✔ WebSocket operativo
✔ Frontend sincronizado en tiempo real
✔ Arquitectura limpia y escalable

---

## 🧭 Próximos Pasos

* Filtros por cercanía geográfica.
* Autenticación y roles.
* Persistencia de favoritos.
* Optimización de consultas espaciales.

---

## 👨‍💻 Autor

Proyecto académico — **Portoviejo 360**
Microservicio: **Panel de Disponibilidad y Búsqueda Inteligente**
