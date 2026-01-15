import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/auth.routes';
import perfilRoutes from './routes/perfil.routes';
import propiedadRoutes from './routes/propiedad.routes';
import catalogoRoutes from './routes/catalogo.routes';

// Middlewares
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// ============================================
// CONFIGURACIÓN DE MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// RUTAS DE LA API
// ============================================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/perfil`, perfilRoutes);
app.use(`${API_PREFIX}/propiedades`, propiedadRoutes);
app.use(`${API_PREFIX}/catalogos`, catalogoRoutes);

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// ============================================
// MANEJO CENTRALIZADO DE ERRORES
// ============================================

app.use(errorHandler);

// ============================================
// INICIO DEL SERVIDOR
// ============================================

const PORT = process.env.PORT || 3001;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║   🏢 Portoviejo360 - Backend API               ║
║   🚀 Server running on port ${PORT}               ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                  ║
║   📡 API Base: http://localhost:${PORT}${API_PREFIX}    ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error(' Error starting server:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Solo iniciar el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

export default app;
