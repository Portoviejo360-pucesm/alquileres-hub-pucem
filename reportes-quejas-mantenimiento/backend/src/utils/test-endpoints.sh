#!/bin/bash

# Configuration
API_URL="http://localhost:3000"
TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "Uso: ./test-endpoints.sh <JWT_TOKEN>"
    echo "Puedes generar un token con: npx ts-node src/utils/generate_test_token.ts"
    exit 1
fi

echo "--- Probando Health Check ---"
curl -s -X GET "$API_URL/health" | json_pp || curl -s -X GET "$API_URL/health"
echo -e "\n"

echo "--- Probando Listar Incidencias ---"
curl -s -X GET "$API_URL/api/incidents" \
  -H "Authorization: Bearer $TOKEN" | json_pp || curl -s -X GET "$API_URL/api/incidents" -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "--- Probando Crear Incidencia (Ejemplo) ---"
curl -s -X POST "$API_URL/api/incidents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Prueba desde script",
    "descripcion": "Esta es una incidencia de prueba",
    "prioridad_codigo": "alta",
    "categoria_id": 1,
    "propiedad_id": 1,
    "ubicacion_detallada": "Piso 1, Oficina 101"
  }' | json_pp || curl -s -X POST "$API_URL/api/incidents" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"titulo":"test"}'
echo -e "\n"
