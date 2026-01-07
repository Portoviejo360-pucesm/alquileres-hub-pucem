# 📤 Guía para Subir Cambios a los Repositorios

## Resumen

Tienes cambios en dos repositorios:
1. **Frontend** (submódulo): 14 archivos modificados
2. **Proyecto principal**: Documentación y referencia al submódulo

---

## 🔄 Paso 1: Subir Cambios del Frontend (Submódulo)

### 1.1 Agregar archivos al staging

```bash
cd /home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend

# Agregar todos los archivos modificados
git add .
```

### 1.2 Hacer commit

```bash
git commit -m "feat: integrar datos reales del backend

- Dashboard: stats dinámicos desde user.propiedades
- Perfil: usar datos reales y APIs de actualización/verificación
- Propiedades: cargar desde API misPropiedades()
- Auth: corregir tipos y manejo de respuestas envueltas
- Navbar: fix dropdown clickability y datos de usuario
- Login/Register: usar campos correctos (correo, nombresCompletos)
- Hydration: fix error con mounted state
"
```

### 1.3 Subir a GitHub

```bash
# Subir a la rama actual (registro-arrendador-propiedad)
git push origin registro-arrendador-propiedad
```

---

## 🔄 Paso 2: Subir Cambios del Proyecto Principal

### 2.1 Volver al directorio principal

```bash
cd /home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades
```

### 2.2 Agregar archivos al staging

```bash
# Agregar documentación
git add API_INTEGRATION_ANALYSIS.md
git add FIX_NAVBAR.md
git add FIX_REGISTRO_ERROR.md
git add FIX_SESSION_RELOAD.md
git add FRONTEND_QUICKSTART.md
git add INTEGRATION.md

# Agregar la referencia actualizada del submódulo
git add frontend
```

### 2.3 Hacer commit

```bash
git commit -m "docs: agregar documentación de integración frontend-backend

- API_INTEGRATION_ANALYSIS.md: análisis completo de rutas
- INTEGRATION.md: guía de integración del submódulo
- FRONTEND_QUICKSTART.md: guía de inicio rápido
- FIX_REGISTRO_ERROR.md: solución error 400 en registro
- FIX_NAVBAR.md: solución navbar y logout
- FIX_SESSION_RELOAD.md: solución persistencia de sesión
- Actualizar referencia del submódulo frontend
"
```

### 2.4 Subir a GitHub

```bash
# Subir a la rama master
git push origin master
```

---

## ✅ Comandos Completos (Copiar y Pegar)

### Para el Frontend:

```bash
cd /home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades/frontend
git add .
git commit -m "feat: integrar datos reales del backend

- Dashboard: stats dinámicos desde user.propiedades
- Perfil: usar datos reales y APIs de actualización/verificación
- Propiedades: cargar desde API misPropiedades()
- Auth: corregir tipos y manejo de respuestas envueltas
- Navbar: fix dropdown clickability y datos de usuario
- Login/Register: usar campos correctos (correo, nombresCompletos)
- Hydration: fix error con mounted state
"
git push origin registro-arrendador-propiedad
```

### Para el Proyecto Principal:

```bash
cd /home/srchaoz/ChaozDev/alquileres-hub-pucem/registro-arrendadores-propiedades
git add API_INTEGRATION_ANALYSIS.md FIX_NAVBAR.md FIX_REGISTRO_ERROR.md FIX_SESSION_RELOAD.md FRONTEND_QUICKSTART.md INTEGRATION.md frontend
git commit -m "docs: agregar documentación de integración frontend-backend

- API_INTEGRATION_ANALYSIS.md: análisis completo de rutas
- INTEGRATION.md: guía de integración del submódulo
- FRONTEND_QUICKSTART.md: guía de inicio rápido
- FIX_REGISTRO_ERROR.md: solución error 400 en registro
- FIX_NAVBAR.md: solución navbar y logout
- FIX_SESSION_RELOAD.md: solución persistencia de sesión
- Actualizar referencia del submódulo frontend
"
git push origin master
```

---

## 📋 Archivos que se Subirán

### Frontend (14 archivos):
- ✅ `src/app/(protected)/dashboard/page.tsx` - Stats dinámicos
- ✅ `src/app/(protected)/layout.tsx` - Fix hydration
- ✅ `src/app/(protected)/perfil/page.tsx` - Datos reales + APIs
- ✅ `src/app/(protected)/propiedades/page.tsx` - Cargar desde API
- ✅ `src/app/(public)/login/page.tsx` - Campo `correo`
- ✅ `src/app/(public)/register/page.tsx` - Campos correctos
- ✅ `src/app/page.tsx` - Redirect a login
- ✅ `src/components/layout/PrivateTopBar.tsx` - Fix dropdown
- ✅ `src/lib/api/arrendadores.api.ts` - APIs implementadas
- ✅ `src/lib/api/auth.api.ts` - Respuestas envueltas
- ✅ `src/store/auth.store.ts` - Fix race condition
- ✅ `src/styles/components/topbar.css` - Z-index fix
- ✅ `src/types/arrendador.ts` - Tipos actualizados
- ✅ `src/types/auth.ts` - LoginResponse actualizado

### Proyecto Principal (7 archivos):
- ✅ `API_INTEGRATION_ANALYSIS.md`
- ✅ `FIX_NAVBAR.md`
- ✅ `FIX_REGISTRO_ERROR.md`
- ✅ `FIX_SESSION_RELOAD.md`
- ✅ `FRONTEND_QUICKSTART.md`
- ✅ `INTEGRATION.md`
- ✅ `frontend` (referencia al submódulo)

---

## ⚠️ Notas Importantes

> [!IMPORTANT]
> **Orden de commits:** Siempre haz commit primero en el **frontend** (submódulo) y luego en el **proyecto principal**. Esto asegura que la referencia del submódulo apunte al commit correcto.

> [!TIP]
> Si quieres verificar qué se va a subir antes de hacer push:
> ```bash
> git log origin/rama..HEAD  # Ver commits pendientes
> git diff origin/rama       # Ver cambios pendientes
> ```

> [!WARNING]
> Si alguien más ha hecho cambios en el repositorio, primero haz `git pull` antes de `git push`:
> ```bash
> git pull origin rama
> git push origin rama
> ```

---

## 🔍 Verificar que Todo se Subió Correctamente

### Frontend:
```bash
cd frontend
git log -1  # Ver el último commit
git status  # Debe decir "nothing to commit, working tree clean"
```

### Proyecto Principal:
```bash
cd ..
git log -1  # Ver el último commit
git status  # Debe decir "nothing to commit, working tree clean"
```

---

## 🎯 Resultado Esperado

Después de ejecutar todos los comandos:

1. ✅ Frontend actualizado en GitHub (rama `registro-arrendador-propiedad`)
2. ✅ Proyecto principal actualizado en GitHub (rama `master`)
3. ✅ Documentación disponible en el repositorio
4. ✅ Referencia del submódulo apunta al commit correcto
