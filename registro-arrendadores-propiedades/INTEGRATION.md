# Guía de Integración Frontend-Backend

## 📁 Estructura del Proyecto

```
registro-arrendadores-propiedades/
├── backend/                    # API Backend (Node.js + Express + Prisma)
├── frontend/                   # Frontend (Next.js) - Git Submodule
└── INTEGRATION.md             # Esta guía
```

## 🔗 Frontend como Submódulo de Git

El frontend está configurado como un **submódulo de Git**, lo que significa:

✅ **Ventajas:**
- El código del frontend se mantiene en su propio repositorio
- Puedes hacer push/pull independientemente
- No se duplica el código en el repositorio principal
- Fácil de mantener y actualizar

### Comandos Importantes para Submódulos

```bash
# Clonar el proyecto con submódulos (para nuevos colaboradores)
git clone --recurse-submodules https://github.com/Portoviejo360-pucesm/alquileres-hub-pucem.git

# Si ya clonaste el proyecto, inicializa los submódulos
git submodule update --init --recursive

# Actualizar el frontend a la última versión de su rama
cd registro-arrendadores-propiedades/frontend
git pull origin registro-arrendador-propiedad

# Hacer cambios en el frontend
cd registro-arrendadores-propiedades/frontend
# ... hacer cambios ...
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin registro-arrendador-propiedad

# Actualizar la referencia del submódulo en el proyecto principal
cd /home/srchaoz/ChaozDev/alquileres-hub-pucem
git add registro-arrendadores-propiedades/frontend
git commit -m "chore: actualizar referencia del frontend"
git push
```

## ⚙️ Configuración del Frontend

### 1. Crear archivo de variables de entorno

Crea el archivo `.env.local` en la carpeta `frontend/`:

```bash
cd registro-arrendadores-propiedades/frontend
touch .env.local
```

### 2. Configurar variables de entorno

Edita `.env.local` con el siguiente contenido:

```env
# URL del Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_PREFIX=/api/v1
```

### 3. Instalar dependencias

```bash
cd registro-arrendadores-propiedades/frontend
npm install
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 🚀 Iniciar el Proyecto Completo

### Opción 1: Terminales Separadas

**Terminal 1 - Backend:**
```bash
cd registro-arrendadores-propiedades/backend
npm run dev
# Backend en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd registro-arrendadores-propiedades/frontend
npm run dev
# Frontend en http://localhost:3000
```

### Opción 2: Script Único (Recomendado)

Puedes crear un script para iniciar ambos servicios. Crea el archivo `start-dev.sh` en la raíz de `registro-arrendadores-propiedades/`:

```bash
#!/bin/bash

# Iniciar backend en segundo plano
cd backend
npm run dev &
BACKEND_PID=$!

# Iniciar frontend en segundo plano
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Esperar a que ambos terminen
wait $BACKEND_PID $FRONTEND_PID
```

Luego hazlo ejecutable y ejecútalo:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 🔌 Verificación de la Integración

### 1. Verificar que el backend esté corriendo

```bash
curl http://localhost:3001/api/v1/health
```

Deberías recibir una respuesta como:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T22:30:00.000Z"
}
```

### 2. Verificar que el frontend se conecte al backend

Abre el navegador en `http://localhost:3000` y verifica que:
- La aplicación cargue correctamente
- Las llamadas a la API funcionen (revisa la consola del navegador)
- No haya errores de CORS

## 🔧 Configuración de CORS en el Backend

Asegúrate de que el backend tenga configurado CORS para permitir peticiones desde el frontend. En el archivo `backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
```

## 📦 Stack Tecnológico

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL** (Supabase) - Base de datos
- **JWT** - Autenticación

### Frontend
- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Zustand** - Gestión de estado
- **React 19** - Biblioteca UI

## 🐛 Solución de Problemas

### El frontend no se conecta al backend

1. Verifica que el backend esté corriendo en el puerto 3001
2. Verifica que las variables de entorno estén correctamente configuradas
3. Revisa la consola del navegador para errores de CORS
4. Asegúrate de que `FRONTEND_URL` esté configurado en el backend

### Error al clonar el proyecto

Si obtienes errores al clonar, asegúrate de usar:
```bash
git clone --recurse-submodules <url-del-repo>
```

### El submódulo está vacío

```bash
git submodule update --init --recursive
```

### Quiero actualizar el frontend a la última versión

```bash
cd registro-arrendadores-propiedades/frontend
git pull origin registro-arrendador-propiedad
cd ../..
git add registro-arrendadores-propiedades/frontend
git commit -m "chore: actualizar frontend"
```

## 📚 Recursos Adicionales

- [Documentación de Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
