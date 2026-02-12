import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const API_URL = 'http://localhost:8001/api/v1';

async function main() {
    try {
        console.log('1. Registrando usuario prueba...');
        const email = `test.propiedad.${Date.now()}@gmail.com`;
        const password = 'Password123!';

        try {
            await axios.post(`${API_URL}/auth/register`, {
                nombresCompletos: 'Test Propiedad Owner',
                correo: email,
                password: password,
                rolId: 2 // Usuario común
            });
            console.log('   ✅ Usuario registrado');
        } catch (e: any) {
            console.log('   ℹ️ Usuario ya existe o error:', e.response?.data?.message || e.message || e);
        }

        console.log('2. Verificando usuario (script backend)...');
        const scriptPath = path.join(__dirname, 'approve_verification.ts');
        await execPromise(`npx ts-node -r dotenv/config "${scriptPath}" ${email}`, {
            cwd: __dirname
        });
        console.log('   ✅ Usuario verificado');

        console.log('3. Iniciando sesión...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            correo: email,
            password: password
        });
        const token = loginRes.data.token;
        console.log('   ✅ Login exitoso');

        console.log('4. Subiendo imagen...');
        // Crear imagen dummy si no existe
        const imagePath = path.join(__dirname, 'test_image.png');
        if (!fs.existsSync(imagePath)) {
            // Crear un archivo vacío o texto renombrado a png es suficiente para multer a veces, 
            // pero multer con fileFilter image intenta verificar magic numbers.
            // Mejor usamos un archivo real si podemos, o esperamos que multer sea laxo.
            // Node no puede crear png valido facilmente sin libs.
            // Usaremos una imagen existente o crearemos un archivo dummy con cabecera PNG.
            const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            fs.writeFileSync(imagePath, pngHeader);
        }

        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        const uploadRes = await axios.post(`${API_URL}/uploads/image`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        const imageUrl = uploadRes.data.data.url;
        console.log('   ✅ Imagen subida:', imageUrl);

        console.log('5. Creando propiedad...');
        const propiedadData = {
            tituloAnuncio: 'Propiedad de Prueba Automática',
            descripcion: 'Esta es una propiedad de prueba creada por el script de verificación. Tiene una descripción larga para cumplir validaciones.',
            precioMensual: 500.00,
            direccionTexto: 'Av. Test 123 y Calle Falsa',
            latitudMapa: -1.05,
            longitudMapa: -80.45,
            esAmoblado: true,
            estadoId: 1,
            publicoObjetivoId: 1,
            servicios: [
                { servicioId: 1, incluidoEnPrecio: true },
                { servicioId: 2, incluidoEnPrecio: false }
            ],
            fotos: [
                { urlImagen: imageUrl, esPrincipal: true }
            ]
        };

        const createRes = await axios.post(`${API_URL}/propiedades`, propiedadData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   ✅ Propiedad creada. ID:', createRes.data.id);

        console.log('6. Verificando "Mis Propiedades"...');
        const misPropiedadesRes = await axios.get(`${API_URL}/propiedades/mis-propiedades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const propiedades = misPropiedadesRes.data;
        if (Array.isArray(propiedades) && propiedades.length > 0) {
            console.log(`   ✅ Listado correcto. Encontradas ${propiedades.length} propiedades.`);
        } else {
            console.error('   ❌ No se encontraron propiedades o formato incorrecto');
            process.exit(1);
        }

        const propiedadId = createRes.data.id;

        console.log('7. Actualizando propiedad...');
        const updateData = {
            tituloAnuncio: 'Propiedad Actualizada por Script',
            precioMensual: 600.00
        };

        const updateRes = await axios.put(`${API_URL}/propiedades/${propiedadId}`, updateData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (updateRes.data.tituloAnuncio === updateData.tituloAnuncio && parseFloat(updateRes.data.precioMensual) === 600.00) {
            console.log('   ✅ Propiedad actualizada correctamente');
        } else {
            throw new Error('Error al validar actualización');
        }

        console.log('8. Eliminando propiedad...');
        await axios.delete(`${API_URL}/propiedades/${propiedadId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   ✅ Propiedad eliminada correctamente');

        console.log('🎉 VERIFICACIÓN EXITOSA COMPLETA');

    } catch (error: any) {
        console.error('❌ ERROR EN VERIFICACIÓN:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

main();
