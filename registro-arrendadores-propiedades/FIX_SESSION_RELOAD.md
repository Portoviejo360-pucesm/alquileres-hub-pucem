# 🔧 Solución: Redirección a Login al Recargar

## 🐛 Problema

Al recargar la página, el usuario es redirigido automáticamente a `/login` aunque haya iniciado sesión correctamente.

---

## 🔍 Diagnóstico

He agregado logs de debug para identificar el problema. Ahora verás en la consola del navegador:

```
🔍 loadUser - Token from state: null
🔍 loadUser - Token from localStorage: eyJhbGc...
🔍 loadUser - Calling perfil API...
✅ loadUser - User loaded: {...}
```

O si hay un error:

```
🔍 loadUser - Token from state: null
🔍 loadUser - Token from localStorage: eyJhbGc...
🔍 loadUser - Calling perfil API...
❌ loadUser - Error: [mensaje de error]
```

---

## 📋 Pasos para Diagnosticar

### 1. Abre la Consola del Navegador

- **Chrome/Edge:** `F12` o `Ctrl + Shift + I`
- **Firefox:** `F12` o `Ctrl + Shift + K`
- Ve a la pestaña "Console"

### 2. Inicia Sesión

1. Ve a `http://localhost:3000/login`
2. Inicia sesión con tus credenciales
3. Observa los logs en la consola

### 3. Recarga la Página

1. Presiona `F5` o `Ctrl + R`
2. Observa los logs en la consola
3. Anota qué mensaje aparece

---

## 🎯 Posibles Causas y Soluciones

### Causa 1: Token No Se Guarda en localStorage

**Síntoma:**
```
🔍 loadUser - Token from localStorage: null
```

**Solución:**
El token no se está guardando correctamente. Verifica que el login esté funcionando.

**Verificación:**
1. Abre DevTools → Application → Local Storage
2. Busca la clave `p360_token`
3. Debería tener un valor JWT (largo string)

---

### Causa 2: Token Inválido o Expirado

**Síntoma:**
```
❌ loadUser - Error: Error 401
```

**Solución:**
El token expiró o es inválido. Esto es normal si:
- El token tiene un tiempo de expiración corto
- El backend rechaza el token

**Verificación:**
Revisa en el backend el `JWT_EXPIRES_IN` en `.env`:
```env
JWT_EXPIRES_IN="7d"  # 7 días
```

---

### Causa 3: Error en la API de Perfil

**Síntoma:**
```
❌ loadUser - Error: [mensaje específico]
```

**Solución:**
Hay un error al llamar `/auth/perfil`. Revisa:
1. Que el backend esté corriendo
2. Que la respuesta del backend sea correcta
3. Que no haya errores de CORS

---

### Causa 4: Estado Inicial del Store

**Síntoma:**
El token está en localStorage pero no se carga en el estado inicial.

**Solución:**
Ya lo arreglé en el código. Ahora `loadUser()` verifica localStorage si el estado está vacío.

---

## ✅ Solución Implementada

He actualizado `auth.store.ts` para:

1. **Verificar localStorage si el estado está vacío**
   ```typescript
   if (!token) {
     const storedToken = tokenStorage.get();
     if (storedToken) {
       set({ token: storedToken, loading: true });
     }
   }
   ```

2. **Agregar logs de debug**
   - Ver qué token se está usando
   - Ver si la API responde correctamente
   - Ver errores específicos

---

## 🧪 Prueba Ahora

1. **Limpia el localStorage:**
   - DevTools → Application → Local Storage
   - Click derecho → Clear
   - O ejecuta en consola: `localStorage.clear()`

2. **Inicia sesión de nuevo:**
   - Ve a `/login`
   - Ingresa credenciales
   - Deberías ver logs en consola

3. **Recarga la página:**
   - Presiona `F5`
   - Observa los logs
   - Deberías permanecer autenticado

---

## 📊 Logs Esperados (Flujo Correcto)

### Al Iniciar Sesión:
```
🔍 loadUser - Token from state: null
🔍 loadUser - Token from localStorage: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔍 loadUser - Calling perfil API...
✅ loadUser - User loaded: {
  id: "...",
  nombresCompletos: "Juan Pérez",
  correo: "juan@example.com",
  ...
}
```

### Al Recargar:
```
🔍 loadUser - Token from state: null
🔍 loadUser - Token from localStorage: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔍 loadUser - Calling perfil API...
✅ loadUser - User loaded: {
  id: "...",
  nombresCompletos: "Juan Pérez",
  correo: "juan@example.com",
  ...
}
```

---

## 🔧 Si Sigue Sin Funcionar

### Verifica el Backend

1. **Endpoint de perfil:**
   ```bash
   curl -H "Authorization: Bearer TU_TOKEN" http://localhost:3001/api/v1/auth/perfil
   ```

2. **Debería responder:**
   ```json
   {
     "success": true,
     "data": {
       "id": "...",
       "nombresCompletos": "...",
       "correo": "...",
       ...
     }
   }
   ```

### Verifica el Token

1. Copia el token de localStorage
2. Ve a [jwt.io](https://jwt.io)
3. Pega el token
4. Verifica:
   - Que no esté expirado (`exp` timestamp)
   - Que tenga los datos correctos (`id`, `correo`, `rolId`)

---

## 📚 Archivos Modificados

- [`store/auth.store.ts`](file:///home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend/src/store/auth.store.ts) - Agregados logs y verificación de localStorage

---

## 💡 Próximos Pasos

1. **Recarga la página** y revisa los logs en consola
2. **Comparte los logs** que veas para ayudarte mejor
3. **Verifica localStorage** que tenga el token guardado
