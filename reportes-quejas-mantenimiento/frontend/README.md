# Portoviejo360 - Frontend de Pruebas

Frontend básico para probar los endpoints del API de gestión de incidencias.

## 📁 Estructura

```
frontend/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── app.js          # Lógica JavaScript
└── README.md           # Este archivo
```

## 🚀 Cómo usar

### Opción 1: Abrir directamente
Simplemente abre el archivo `index.html` en tu navegador.

### Opción 2: Usar un servidor local
```bash
# Con Python 3
cd frontend
python -m http.server 8080

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8080
```

Luego abre http://localhost:8080 en tu navegador.

## ⚙️ Configuración

1. **URL del API**: Por defecto apunta a `http://localhost:3000/api`. Modifícalo si tu backend está en otro puerto o dirección.

2. **Token JWT**: Ingresa un token válido de autenticación. Puedes generar uno de prueba con:
   ```bash
   cd backend
   npx ts-node src/utils/generate_test_token.ts
   ```

## 🧪 Funcionalidades

### ➕ Crear Incidencia
- Título (mínimo 3 caracteres)
- Descripción (mínimo 10 caracteres)
- Prioridad: LOW, MEDIUM, HIGH, CRITICAL
- Categoría: ELECTRICAL, PLUMBING, STRUCTURAL, GENERAL
- ID de Propiedad

### 📋 Listar Incidencias
- Filtrar por estado
- Limitar resultados
- Vista de tarjetas con información resumida

### 🔍 Operaciones por ID
- Obtener detalles de una incidencia
- Eliminar una incidencia

### 🔄 Actualizar Estado
- Cambiar el estado de una incidencia
- Agregar descripción opcional del cambio

### 💬 Comentarios
- Agregar comentarios a una incidencia
- Marcar comentarios como internos

### 📝 Log de Peticiones
- Visualiza todas las peticiones HTTP realizadas
- Muestra método, endpoint, código de respuesta y tiempo
- Diferenciación visual por tipo de respuesta (éxito/error)

## 🎨 Características del UI

- Diseño responsive
- Indicadores de estado con colores
- Badges de prioridad
- Guardado automático de configuración en localStorage
- Log de peticiones en tiempo real

## 🔧 Endpoints utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /health | Verificar conexión |
| POST | /incidents | Crear incidencia |
| GET | /incidents | Listar incidencias |
| GET | /incidents/:id | Obtener por ID |
| PATCH | /incidents/:id/status | Actualizar estado |
| DELETE | /incidents/:id | Eliminar incidencia |
| POST | /incidents/:id/comentarios | Agregar comentario |

## 📌 Notas

- Asegúrate de que el backend esté corriendo antes de usar este frontend
- El CORS debe estar habilitado en el backend (ya está configurado)
- La configuración se guarda automáticamente en el navegador
