# Documentación de API - Gestión de Inquilinos y Contratos

**Base URL:** `http://localhost:3000/api`

## Autenticación
El sistema simula la autenticación mediante un header. El frontend debe enviar el UUID del usuario logueado en todas las peticiones.

- **Header Key:** `x-user-id`
- **Header Value:** `UUID_DEL_USUARIO` (Ej: `05849b45-3a8b-4cd3-b2d8-5de2162c42f3`)

---

## 1. Reservas

### 1.1 Crear Reserva
Solicita una reserva para una propiedad. Se crea en estado `PENDIENTE`.

- **Endpoint:** `POST /reservas`
- **Body:**
  ```json
  {
    "propiedadId": 1,
    "fechaEntrada": "2026-05-10",
    "fechaSalida": "2026-05-15"
  }
  ```
- **Respuesta Exitosa (201 Created):**
  ```json
  {
    "id": "c0d1191b-7cab-4c85-80e3-f469834f4657",
    "estado": "PENDIENTE",
    "totalPagar": "66.67",
    ...
  }
  ```
- **Errores Posibles:**
  - `400 Bad Request`: "La propiedad no está disponible en las fechas seleccionadas."

### 1.2 Ver Mis Reservas
Obtiene el historial de reservas del usuario actual.

- **Endpoint:** `GET /reservas/mis-viajes`
- **Respuesta Exitosa (200 OK):**
  ```json
  [
    {
      "id": "c0d1191b-...",
      "estado": "CONFIRMADA",
      "propiedad": {
        "tituloAnuncio": "Suite Centro",
        "precioMensual": "450"
        ...
      }
    }
  ]
  ```

### 1.3 Cancelar Reserva
Cancela una reserva existente.

- **Endpoint:** `PATCH /reservas/:id/cancelar`
- **Parámetro URL:** `id` (UUID de la reserva)

---

## 2. Contratos

### 2.1 Generar Contrato
Genera el PDF del contrato de arrendamiento.
**Requisito:** La reserva debe tener estado `CONFIRMADA`.

- **Endpoint:** `POST /contratos/generar`
- **Body:**
  ```json
  {
    "reservaId": "c0d1191b-7cab-4c85-80e3-f469834f4657"
  }
  ```
- **Respuesta Exitosa (201 Created):**
  ```json
  {
    "id": "48226a90-...",
    "urlArchivo": "/uploads/contrato-1767847192827.pdf",
    "fechaGeneracion": "2026-01-08..."
  }
  ```

### 2.2 Descargar Contrato
Permite descargar el archivo PDF.

- **Endpoint:** `GET /contratos/:reservaId/descargar`
- **Parámetro URL:** `reservaId` (UUID de la reserva asociada)
- **Respuesta:** Archivo binario (PDF).
