# Reportes, Quejas y Mantenimiento

## 📋 Descripción

Este módulo gestiona la **post-venta** y el servicio al cliente del arriendo. Permite a los inquilinos reportar problemas (mantenimiento, ruidos, etc.) y a los propietarios/administradores gestionarlos.

## 🛠️ Tecnologías

- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (vía Prisma y Supabase)
- **Mails**: `nodemailer` (para notificaciones de tickets).
- **Subida de Archivos**: `multer` (para evidencias en fotos/videos).
- **Validación**: `zod`.

## 🚀 Instalación y Ejecución

### Pasos

1. **Instalar dependencias**:

   ```bash
   cd backend
   npm install
   ```

2. **Base de Datos**:
   Configura `.env` y ejecuta:

   ```bash
   npm run prisma:generate
   # Si necesitas poblar datos de prueba:
   npm run prisma:seed
   ```

3. **Ejecutar**:

   ```bash
   npm run dev
   ```

## 🔑 Funcionalidades

- **Tickets de Mantenimiento**: Creación, asignación y cierre de tickets.
- **Quejas y Sugerencias**: Canal de comunicación formal.
- **Notificaciones por Correo**: Alertas automáticas al cambiar el estado de un ticket.
- **Evidencias Multimedia**: Adjuntar fotos del daño o reparación.

## 🔄 Flujo de Trabajo

1. Inquilino crea un reporte (ej. "Tubería rota").
2. El sistema notifica al propietario/admin.
3. El admin asigna el ticket a un técnico o lo atiende.
4. Se registra la solución y se cierra el ticket.
