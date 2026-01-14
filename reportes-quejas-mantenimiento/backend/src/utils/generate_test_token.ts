import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const secret = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

const payload = {
    id: 'test-user-id',
    role: 'admin',
    email: 'admin@test.com',
    rol_id: 1
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('\n--- TOKEN DE PRUEBA GENERADO ---');
console.log(token);
console.log('--- COPIA ESTE TOKEN PARA TUS PRUEBAS ---\n');

console.log('Instrucciones para probar con curl:');
console.log(`curl -X GET http://localhost:3000/api/incidents -H "Authorization: Bearer ${token}"\n`);
