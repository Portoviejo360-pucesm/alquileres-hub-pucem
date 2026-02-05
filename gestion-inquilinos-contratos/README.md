# Gestión de Inquilinos y Contratos

Este módulo maneja la generación de contratos, gestión de inquilinos y lógica relacionada con las reservas.

## Requisitos Previos

- Node.js (v18 o superior recomendado)
- PostgreSQL
- Configuración de variables de entorno

## Configuración

1.  **Variables de Entorno**:
    Crea un archivo `.env` en la carpeta `backend` (`gestion-inquilinos-contratos/backend/.env`) con el siguiente contenido (ajusta según tu entorno):

    ```env
    PORT=3002
    DATABASE_URL="postgresql://usuario:password@localhost:5432/tu_base_de_datos?schema=public"
    ```

2.  **Instalación de Dependencias**:
    Navega a la carpeta del backend y ejecuta:
    ```bash
    cd backend
    npm install
    ```

3.  **Base de Datos**:
    Genera el cliente de Prisma y (opcionalmente) ejecuta las migraciones:
    ```bash
    npx prisma generate
    # Si necesitas sincronizar la db
    # npx prisma db push 
    ```

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
cd backend
npm run dev
```

El servicio estará disponible en `http://localhost:3002`.

## Funcionalidades Principales

-   **Generación de Contratos**: Crea PDFs basados en plantillas Markdown.
-   **Gestión de Reservas**: Endpoints para crear y consultar reservas.

