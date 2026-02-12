import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config';
import { AppError } from './utils/errors';

// Routes import
import incidentRoutes from './routes/incident.routes';
import catalogRoutes from './routes/catalog.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        environment: config.nodeEnv
    });
});

app.use('/api/incidents', incidentRoutes);
app.use('/api/catalogos', catalogRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada',
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    // Handle custom AppError instances
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    // Handle Multer file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            status: 'error',
            message: `Error de carga de archivo: ${err.message}`,
        });
    }

    // Handle Prisma errors
    if (err.code && err.code.startsWith('P')) {
        return res.status(400).json({
            status: 'error',
            message: 'Error de base de datos',
            ...(config.nodeEnv === 'development' && { details: err.message }),
        });
    }

    // Default error
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
});

export default app;
