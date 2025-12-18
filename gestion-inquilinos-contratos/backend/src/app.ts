import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import reservaRoutes from './routes/reservaRoutes';
import contratoRoutes from './routes/contratoRoutes';

// Routes
app.use('/api/reservas', reservaRoutes);
app.use('/api/contratos', contratoRoutes);

app.get('/', (req, res) => {
    res.send('API de Gestión de Inquilinos y Contratos funcionando');
});

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Conexión a base de datos establecida');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
