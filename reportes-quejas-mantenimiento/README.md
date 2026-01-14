# CAMPUS360 — INCIDENCIAS

Microservicio desarrollado para el ecosistema CAMPUS360 en la materia Desarrollo de Sistemas de Información.

## 🚀 Tecnologías
* Python 3.10+
* FastAPI
* Uvicorn
* PostgreSQL
* SQLAlchemy
* Pydantic
* Swagger UI (automático)

## 📁 Estructura del proyecto

```
/app
    /routers          # Endpoints del API
        - health.py
        - incidencias.py
        - db.py
    /schemas          # Schemas de Pydantic para validación
        - schemas.py
    /models           # Modelos de SQLAlchemy
        - models.py
    /services         # Lógica de negocio
        - services.py
    /utils            # Utilidades (permisos, helpers)
        - permissions.py
    config.py         # Configuración (DB, JWT)
    dependencies.py   # Dependencias (get_db, validate_jwt)
    main.py           # Aplicación principal
/database
    schema.sql        # Esquema de base de datos PostgreSQL
/tests                # Tests unitarios
init_db.py            # Script de inicialización de DB
PERMISSIONS.md        # Documentación de control de acceso
```

## ⚙️ Configuración

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/campus360_incidencias
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_AUTH_SERVICE_URL=http://localhost:8000/auth/validate
```

### 2. Base de datos

Asegúrate de tener PostgreSQL instalado y crear la base de datos:

```sql
CREATE DATABASE campus360_incidencias;
```

### 3. Instalación de dependencias

```bash
# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 4. Inicializar base de datos

```bash
# Crear las tablas en la base de datos
python init_db.py
```

## ▶ Cómo ejecutar el proyecto

```bash
# Desarrollo con recarga automática
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Una vez ejecutado, accede a:
- **API**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc

## 📌 Endpoints principales

### Health Check
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET    | `/health` | Verificar estado del servicio | Público |

### Catálogos
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET    | `/tickets/catalogos/estados` | Listar estados | Autenticado |
| GET    | `/tickets/catalogos/prioridades` | Listar prioridades | Autenticado |
| GET    | `/tickets/catalogos/categorias` | Listar categorías | Autenticado |
| GET    | `/tickets/catalogos/ubicaciones` | Listar ubicaciones | Autenticado |

### Tickets
| Método | Endpoint | Descripción | RF | Acceso |
|--------|----------|-------------|-----|---------|
| POST   | `/tickets/` | Crear nuevo ticket | RF2 | Todos |
| GET    | `/tickets/` | Listar tickets (con filtros) | RF5 | Todos* |
| GET    | `/tickets/{ticket_id}` | Obtener ticket por ID | RF5 | Propio o Admin |
| PUT    | `/tickets/{ticket_id}` | Actualizar ticket | - | Propio o Admin |
| DELETE | `/tickets/{ticket_id}` | Eliminar ticket | - | **Solo Admin** |
| POST   | `/tickets/{ticket_id}/asignar` | Asignar responsable | RF3 | **Solo Admin** |
| POST   | `/tickets/{ticket_id}/cambiar-estado` | Cambiar estado | RF4 | **Solo Admin** |
| GET    | `/tickets/{ticket_id}/historial` | Obtener historial | RF7 | Propio o Admin |
| POST   | `/tickets/{ticket_id}/comentarios` | Agregar comentario | - | Propio o Admin |
| GET    | `/tickets/{ticket_id}/comentarios` | Listar comentarios | - | Propio o Admin |

**Nota**: *Los usuarios no-admin solo ven sus propios tickets automáticamente.

**Nota**: Todos los endpoints requieren autenticación JWT (RF1)

## 🔐 Autenticación y Autorización

El módulo valida tokens JWT mediante el servicio de autenticación e implementa control de acceso basado en roles.

### Autenticación
1. Obtén un token JWT del módulo de autenticación
2. Inclúyelo en el header: `Authorization: Bearer <token>`
3. El token debe contener campos: `user_id`/`id`/`sub` y `role`

### Autorización (Roles)

#### 👨‍💼 Administrador (`administrador` o `admin`)
- ✓ Ver todos los tickets
- ✓ Asignar responsables
- ✓ Cambiar estados de tickets
- ✓ Eliminar tickets
- ✓ Ver comentarios internos

#### 👨‍🎓 Profesor/Estudiante
- ✓ Ver solo sus propios tickets (reportados por él)
- ✓ Crear nuevos tickets
- ✓ Comentar en sus propios tickets
- ✗ NO puede asignar responsables
- ✗ NO puede cambiar estados
- ✗ NO puede ver tickets de otros usuarios

Para más detalles, consulta [PERMISSIONS.md](./PERMISSIONS.md).

## 📊 Modelos de Datos

### Incidencia
- Estados: `pendiente`, `asignada`, `en_proceso`, `resuelta`, `cerrada`, `cancelada`
- Prioridades: `baja`, `media`, `alta`, `urgente`

### Historial
- Registra todos los cambios realizados en una incidencia
- Incluye: acción, usuario, valores anteriores/nuevos, timestamp

## 🧪 Testing

```bash
# Ejecutar tests
pytest tests/
```

## 📝 Requerimientos Funcionales Implementados

- ✅ **RF1**: Validación JWT con control de acceso basado en roles
- ✅ **RF2**: Crear incidencia (todos los usuarios autenticados)
- ✅ **RF3**: Asignar responsable (solo administradores)
- ✅ **RF4**: Estados del ticket (solo administradores pueden cambiar)
- ✅ **RF5**: Consultar incidencias (con filtros automáticos según rol)
- ✅ **RF7**: Historial de cambios con auditoría
- ✅ **RF8**: API REST con Swagger y documentación completa

## 🏗️ Arquitectura

### Microservicios
Este módulo forma parte de la arquitectura de microservicios Campus360:

- **Usuarios**: Gestionados por módulo de autenticación externo
- **Salones**: Gestionados por módulo de salones externo
- **Incidencias**: Este módulo (gestiona tickets, comentarios, historial)

Los módulos se comunican mediante:
- IDs (sin Foreign Keys entre servicios)
- JWT tokens para autenticación
- APIs REST para integración

### Normalización de Base de Datos
- **Nivel 3NF** (Tercera Forma Normal)
- Catálogos separados: estados, prioridades, categorías, ubicaciones
- Sin redundancia de datos
- Integridad referencial dentro del módulo

## 👥 Integrantes del Equipo
* Dev Principal: Daniel Zambrano Macias y Marlon Mendoza Mendoza
* Product Owner del módulo: Yhony Cantos
* Scrum Master asignado: Yakov Seni
