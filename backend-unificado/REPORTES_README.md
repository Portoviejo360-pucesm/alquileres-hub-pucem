# Módulo de Reportes - Problema de Compatibilidad

## 🚨 Problema

El módulo de **reportes-quejas-mantenimiento** está temporalmente **deshabilitado** en el Backend Unificado debido a un problema de compatibilidad de Prisma Client.

### Causa Raíz

El módulo fue desarrollado en **macOS (darwin-arm64)** y tiene rutas hardcodeadas en `node_modules/@prisma/client` que apuntan a:

```
/Users/marloveper__/Documents/proyectos/Portoviejo360 - Reportes/...
```

Cuando se intenta ejecutar en **Linux (rhel-openssl-3.0.x)**, Prisma no puede encontrar los binarios correctos.

### Error

```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x".
This happened because Prisma Client was generated for "darwin-arm64"
```

---

## ✅ Solución

### Opción 1: Reconstruir en la Máquina Original (Recomendado)

El desarrollador original debe ejecutar en su máquina macOS:

```bash
cd alquileres-hub-pucem/reportes-quejas-mantenimiento/backend

# Limpiar completamente
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Generar Prisma Client
npx prisma generate

# Commit y push
git add .
git commit -m "fix: regenerate Prisma Client without hardcoded paths"
git push
```

### Opción 2: Reconstruir en Linux

Si tienes acceso a la máquina Linux:

```bash
cd alquileres-hub-pucem/reportes-quejas-mantenimiento/backend

# Limpiar
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Generar con target específico
npx prisma generate
```

---

## 🔧 Habilitar el Módulo

Una vez solucionado el problema de Prisma, edita `/backend-unificado/src/app.ts`:

### 1. Descomentar el import (línea ~30)

```typescript
// Cambiar de:
// import incidentRoutes from '../../reportes-quejas-mantenimiento/backend/src/routes/incident.routes';

// A:
import incidentRoutes from '../../reportes-quejas-mantenimiento/backend/src/routes/incident.routes';
```

### 2. Descomentar la ruta (línea ~126)

```typescript
// Cambiar de:
// app.use(`${API_PREFIX}/incidencias`, incidentRoutes);

// A:
app.use(`${API_PREFIX}/incidencias`, incidentRoutes);
```

### 3. Actualizar health check (línea ~80)

```typescript
modules: {
    registro: 'active',
    inquilinos: 'active',
    disponibilidad: 'active',
    reportes: 'active'  // Cambiar de 'pending' a 'active'
}
```

### 4. Actualizar banner (línea ~186)

```typescript
║   ✅ Módulos Activos:                                      ║
║      • Registro de Propiedades                            ║
║      • Gestión de Inquilinos y Contratos                  ║
║      • Disponibilidad y Búsqueda                          ║
║      • Reportes, Quejas y Mantenimiento                   ║  // Mover aquí
```

---

## 📝 Notas Técnicas

### Schema.prisma ya está configurado correctamente

El archivo `prisma/schema.prisma` ya tiene los `binaryTargets` correctos:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "darwin-arm64"]
}
```

### El problema NO es el schema

El problema es que `node_modules/@prisma/client` contiene metadata generada en macOS que no se puede regenerar sin eliminar completamente el directorio.

### Por qué npm install no funciona

Cuando ejecutas `npm install`, npm restaura los paquetes desde el `package-lock.json`, que puede contener referencias a los binarios incorrectos. Por eso es necesario eliminar también el `package-lock.json`.

---

## 🎯 Estado Actual

- ✅ **3 módulos activos**: Registro, Inquilinos, Disponibilidad
- ⏳ **1 módulo pendiente**: Reportes (esperando reconstrucción)

El Backend Unificado funciona perfectamente con los 3 módulos principales. El módulo de reportes se puede habilitar una vez resuelto el problema de Prisma.
