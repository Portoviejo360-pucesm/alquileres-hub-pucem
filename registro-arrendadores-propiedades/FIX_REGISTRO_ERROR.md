# 🔧 Corrección: Error 400 en Registro

## ❌ Problema Identificado

El error **400 Bad Request** al intentar registrarse se debía a un **desajuste de nombres de campos** entre el frontend y el backend.

### Frontend enviaba:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456"
}
```

### Backend esperaba:
```json
{
  "nombresCompletos": "Juan Pérez",
  "correo": "juan@example.com",
  "password": "Password123"
}
```

Además, el backend tiene **validaciones más estrictas** para la contraseña:
- ❌ Mínimo 6 caracteres → ✅ Mínimo 8 caracteres
- ❌ Sin requisitos → ✅ Debe contener:
  - Al menos una letra mayúscula
  - Al menos una letra minúscula
  - Al menos un número

---

## ✅ Cambios Realizados

### 1. Tipos TypeScript Actualizados

**Archivo:** [`types/auth.ts`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/types/auth.ts)

```typescript
// Antes
export type LoginRequest = { 
  email: string; 
  password: string 
};

export type RegisterRequest = {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
};

// Después
export type LoginRequest = { 
  correo: string;  // ✅ Cambiado
  password: string 
};

export type RegisterRequest = {
  nombresCompletos: string;  // ✅ Cambiado
  correo: string;            // ✅ Cambiado
  password: string;
  rolId?: number;            // ✅ Agregado
};
```

### 2. Auth Store Actualizado

**Archivo:** [`store/auth.store.ts`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/store/auth.store.ts)

- ✅ Función `login()` ahora usa `correo` en lugar de `email`
- ✅ Función `register()` ahora usa `nombresCompletos` y `correo`

### 3. Página de Registro Actualizada

**Archivo:** [`register/page.tsx`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/app/(public)/register/page.tsx)

**Cambios:**
- ✅ Campo `nombre` → `nombresCompletos`
- ✅ Campo `email` → `correo`
- ✅ Eliminado campo `telefono` (no requerido por backend)
- ✅ Validación de contraseña mejorada:
  - Mínimo 8 caracteres
  - Debe contener mayúscula
  - Debe contener minúscula
  - Debe contener número

### 4. Página de Login Actualizada

**Archivo:** [`login/page.tsx`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/app/(public)/login/page.tsx)

- ✅ Campo `email` → `correo`

---

## 🧪 Cómo Probar

### 1. Asegúrate de que el backend esté corriendo

```bash
cd registro-arrendadores-propiedades/backend
npm run dev
# Backend en http://localhost:3001
```

### 2. Asegúrate de que el frontend esté corriendo

```bash
cd registro-arrendadores-propiedades/frontend
npm run dev
# Frontend en http://localhost:3000
```

### 3. Prueba el Registro

1. Ve a `http://localhost:3000/register`
2. Completa el formulario:
   - **Nombre completo:** Tu nombre (mín. 3 caracteres)
   - **Correo electrónico:** tu@email.com
   - **Contraseña:** Debe tener:
     - Mínimo 8 caracteres
     - Al menos una mayúscula (ej: `P`)
     - Al menos una minúscula (ej: `assword`)
     - Al menos un número (ej: `123`)
     - Ejemplo válido: `Password123`
   - **Confirmar contraseña:** Debe coincidir

3. Haz clic en "REGISTRARSE"

### 4. Resultado Esperado

- ✅ El registro debería ser exitoso
- ✅ Deberías ser redirigido automáticamente a `/dashboard`
- ✅ Deberías estar autenticado

---

## 📋 Resumen de Validaciones de Contraseña

| Requisito | Antes | Ahora |
|-----------|-------|-------|
| Longitud mínima | 6 caracteres | 8 caracteres |
| Letra mayúscula | ❌ No requerida | ✅ Requerida |
| Letra minúscula | ❌ No requerida | ✅ Requerida |
| Número | ❌ No requerido | ✅ Requerido |

**Ejemplos de contraseñas válidas:**
- ✅ `Password123`
- ✅ `MiClave2024`
- ✅ `Segura99`

**Ejemplos de contraseñas inválidas:**
- ❌ `password` (sin mayúscula ni número)
- ❌ `PASSWORD123` (sin minúscula)
- ❌ `Password` (sin número)
- ❌ `Pass123` (menos de 8 caracteres)

---

## 🎯 Estado Actual

✅ **Problema resuelto:** El frontend ahora envía los datos en el formato correcto que el backend espera.

✅ **Validaciones sincronizadas:** Las validaciones del frontend coinciden con las del backend.

✅ **Listo para probar:** Puedes registrarte e iniciar sesión sin errores.

---

## 📚 Archivos Modificados

1. [`types/auth.ts`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/types/auth.ts)
2. [`store/auth.store.ts`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/store/auth.store.ts)
3. [`register/page.tsx`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/app/(public)/register/page.tsx)
4. [`login/page.tsx`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/app/(public)/login/page.tsx)
