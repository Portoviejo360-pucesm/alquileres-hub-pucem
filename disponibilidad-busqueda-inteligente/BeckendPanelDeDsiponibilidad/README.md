conectar la base de datos DATABASE_URL=postgresql://postgres.xxx:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require PORT=3000

# 🏠 Panel de Disponibilidad y Búsqueda Inteligente

**Microservicio – Portoviejo 360**

Este microservicio forma parte del sistema **Portoviejo 360** y es responsable de **gestionar la disponibilidad de propiedades inmobiliarias** y **permitir su búsqueda inteligente mediante filtros dinámicos**.

Se conecta a la **base de datos general del proyecto (Supabase)** y **NO maneja autenticación**, ya que consume datos compartidos del sistema principal.

---

## 📌 Responsabilidades del Microservicio

* Registrar propiedades inmobiliarias.
* Consultar propiedades disponibles.
* Filtrar propiedades según:

  * Estado (Disponible / Ocupado).
  * Público objetivo (Estudiantes, Trabajadores, Todo público).
  * Combinación de filtros.
* Preparar la base para integración futura con mapas y tiempo real.

---

## 🧱 Arquitectura

El microservicio sigue una **arquitectura por capas**, separando claramente responsabilidades:

```
src/
│
├── config/              # Configuración de base de datos
├── controllers/         # Manejo de requests HTTP
├── services/            # Lógica de negocio
├── modules/
│   ├── propiedades/     # Dominio propiedades
│   │   ├── DTO/         # Data Transfer Objects
│   │   └── propiedades.model.ts
│   ├── filtros/         # Dominio filtros
│   │   ├── DTO/
│   │   └── filtros.model.ts
│   └── tiempo-real/     # Preparado para mapa en tiempo real (futuro)
├── routers/             # Definición de rutas
├── middleware/          # Validaciones y middlewares
├── utils/               # Utilidades comunes (response, helpers)
├── app.ts               # Configuración de Express
└── server.ts            # Arranque del servidor
```

---

## 🗄️ Base de Datos (Supabase – Proyecto General)

Este microservicio se conecta al **Supabase general del proyecto Portoviejo 360** y utiliza las siguientes tablas:

### 📋 Tablas principales

* **propiedades**
* **estados_propiedad**
* **tipo_publico**
* **usuarios** (solo referencia por `propietario_id`)

### 🔗 Relaciones clave

* `propiedades.estado_id → estados_propiedad.id_estado`
* `propiedades.publico_objetivo_id → tipo_publico.id_tipo`
* `propiedades.propietario_id → usuarios.id_usuario`

---

## 🌐 Endpoints Disponibles

### 🔹 1. Obtener todas las propiedades disponibles

```http
GET /propiedades
```

📌 Devuelve todas las propiedades cuyo estado es **Disponible**.

---

### 🔹 2. Crear una propiedad

```http
POST /propiedades
```

#### 📥 Body (JSON)

```json
{
  "propietario_id": "uuid-del-usuario",
  "estado_id": 1,
  "publico_objetivo_id": 1,
  "titulo_anuncio": "Suite Norte",
  "descripcion": "Suite moderna",
  "precio_mensual": 400,
  "direccion_texto": "Av. Principal",
  "latitud_mapa": -0.18,
  "longitud_mapa": -78.47,
  "es_amoblado": true
}
```

📌 **Campos obligatorios**:

* `propietario_id`
* `estado_id`
* `publico_objetivo_id`

---

### 🔹 3. Cambiar estado de una propiedad

```http
PUT /propiedades/:id/estado
```

#### 📥 Body

```json
{
  "estado_id": 2
}
```

📌 Permite cambiar el estado (ej. Disponible → Ocupado).

---

## 🔍 Endpoints de Filtros Inteligentes

### 🔹 4. Filtrar por estado

```http
GET /filtros/propiedades?estado=Disponible
```

---

### 🔹 5. Filtrar por público objetivo

```http
GET /filtros/propiedades?publico_objetivo_id=2
```

Valores posibles:

* `1` → Solo estudiantes
* `2` → Solo trabajadores
* `3` → Todo público

---

### 🔹 6. Filtrar por estado + público objetivo (combinado)

```http
GET /filtros/propiedades?estado=Disponible&publico_objetivo_id=3
```

📌 Si no existen coincidencias, el endpoint devuelve:

```json
[]
```

Esto es un **comportamiento correcto**, no un error.

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` (NO subir a GitHub):

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

📌 El microservicio usa **PostgreSQL vía Supabase**.

---

## 🧪 Pruebas

Las pruebas de los endpoints se realizaron usando **Postman**, verificando:

* Creación correcta de propiedades.
* Filtros individuales y combinados.
* Respuestas correctas cuando no hay resultados.
* Integridad con la base de datos general.

---

## 🗺️ Módulo `tiempo-real` (Futuro)

La carpeta `tiempo-real/` está preparada para:

* Integración con mapas (Google Maps / Mapbox).
* Actualización en tiempo real de propiedades disponibles.
* Uso de WebSockets o servicios en tiempo real de Supabase.

📌 **No implementado aún** por alcance del curso.

---

## ✅ Estado del Microservicio

* ✔️ Funcional
* ✔️ Conectado a Supabase general
* ✔️ Arquitectura limpia
* ✔️ Endpoints probados
* ✔️ Listo para integración con frontend

---

## 👨‍💻 Autor

Proyecto académico desarrollado como parte del sistema **Portoviejo 360**
Microservicio: **Panel de Disponibilidad y Búsqueda Inteligente**
