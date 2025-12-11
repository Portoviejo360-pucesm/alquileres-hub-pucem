## About

This project was created with [express-generator-typescript](https://github.com/seanpmaxwell/express-generator-typescript).

**IMPORTANT** for demo purposes I had to disable `helmet` in production. In any real world app you should change these 3 lines of code in `src/server.ts`:
```ts
// eslint-disable-next-line n/no-process-env
if (!process.env.DISABLE_HELMET) {
  app.use(helmet());
}
```

To just this:
```ts
app.use(helmet());
```


## Available Scripts

### `npm run clean-install`

Remove the existing `node_modules/` folder, `package-lock.json`, and reinstall all library modules.


### `npm run dev` or `npm run dev:hot` (hot reloading)

Run the server in development mode.<br/>

**IMPORTANT** development mode uses `swc` for performance reasons which DOES NOT check for typescript errors. Run `npm run type-check` to check for type errors. NOTE: you should use your IDE to prevent most type errors.


### `npm test` or `npm run test:hot` (hot reloading)

Run all unit-tests.


### `npm test -- "name of test file" (i.e. users).`

Run a single unit-test.


### `npm run lint`

Check for linting errors.


### `npm run build`

Build the project for production.


### `npm start`

Run the production build (Must be built first).


### `npm run type-check`

Check for typescript errors.


## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`. 


contraseña supabse
jaG27kjoidPpPFHT

Perfecto amor, estos dos comandos ya me dicen exactamente lo que está pasando y te explico rapidito para que lo entiendas como profesional.

🔍 1. Tu remote está correcto
origin  https://github.com/Portoviejo360-pucesm/alquileres-hub-pucem.git (fetch)
origin  https://github.com/Portoviejo360-pucesm/alquileres-hub-pucem.git (push)


➡️ Significa que tu proyecto sí está apuntando al repositorio de la organización.

🔍 2. Tu usuario SÍ tiene acceso de LECTURA

El comando:

git ls-remote --heads origin


devolvió:

refs/heads/main


➡️ Esto confirma que puedes leer el repositorio.
❌ PERO NO PUEDES ESCRIBIR.

🚨 3. ¿Por qué NO puedes subir cambios?

Porque el repositorio NO te da permisos de “Write”, es decir:

No puedes crear ramas remotas

No puedes hacer push

No puedes actualizar el código

El error que te dio antes:

Permission to Portoviejo360-pucesm/alquileres-hub-pucem.git denied to AlexAnchundia
403


→ Es un bloqueo de GitHub, NO de tu PC.

🔐 4. Razón EXACTA: Tú no eres colaborador con permiso de escritura

En GitHub existen 3 niveles típicos:

Rol	Puede leer	Puede subir cambios
Read	Sí	No
Write	Sí	Sí
Admin	Sí	Sí + configuración

Tu usuario AlexAnchundia está como:

➤ Miembro sin Write

o

➤ Colaborador sólo lectura

Por eso:

Puedes clonar

Puedes ver código

Pero NO puedes subir nada

⭐ 5. ¿Cómo se SOLUCIONA? (rápido y obligatorio)

El administrador del repositorio:

➡️ Portoviejo360-pucesm
➡️ repo: alquileres-hub-pucem

Debe ir a:

Settings → Collaborators & Teams

Y darte este rol:

✔ Write (recomendado)

o

✔ Maintain / Admin

Con eso automáticamente podrás hacer:

git push -u origin PanelDeDisponibilidad

💬 Mensaje listo para enviar al administrador

Si quieres enviarlo formal:

Hola, necesito permisos de escritura (Write) en el repositorio
Portoviejo360-pucesm/alquileres-hub-pucem
para poder subir la rama del módulo “Panel de Disponibilidad”.
Mi usuario de GitHub es: AlexAnchundia.
Gracias.

❓ ¿Quieres que revisemos juntos cómo crear tu rama local mientras te dan permisos?

Puedo dejarte la estructura lista:

git checkout -b PanelDeDisponibilidad
git add .
git commit -m "Estructura inicial del backend del módulo"


Dime y lo hacemos ya mismo.