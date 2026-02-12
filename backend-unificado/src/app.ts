import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// ============================================
// IMPORTAR RUTAS DE CADA MÓDULO
// ============================================

// Módulo 1: Registro de Arrendadores y Propiedades (Puerto 8001)
import authRoutes from '../../registro-arrendadores-propiedades/backend/src/routes/auth.routes';
import perfilRoutes from '../../registro-arrendadores-propiedades/backend/src/routes/perfil.routes';
import propiedadRegistroRoutes from '../../registro-arrendadores-propiedades/backend/src/routes/propiedad.routes';
import catalogoRoutes from '../../registro-arrendadores-propiedades/backend/src/routes/catalogo.routes';

// Módulo 2: Gestión de Inquilinos y Contratos (Puerto 8002)
import reservaRoutes from '../../gestion-inquilinos-contratos/backend/src/routes/reservaRoutes';
import contratoRoutes from '../../gestion-inquilinos-contratos/backend/src/routes/contratoRoutes';

// Módulo 3: Disponibilidad y Búsqueda Inteligente (Puerto 8004)
import { propiedadesRouter as propiedadesDisponibilidadRouter } from '../../disponibilidad-busqueda-inteligente/BackendDisponibilidad/src/routers/propiedades.routes';
import { filtrosRouter } from '../../disponibilidad-busqueda-inteligente/BackendDisponibilidad/src/routers/filtros.routes';

// Módulo 4: Reportes, Quejas y Mantenimiento (Puerto 8003)
import incidentRoutes from '../../reportes-quejas-mantenimiento/backend/src/routes/incident.routes';
import incidentCatalogRoutes from '../../reportes-quejas-mantenimiento/backend/src/routes/catalog.routes';


// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================

// ... (existing code)




// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================

const app: Application = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet());

// Compresión de respuestas
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging - Siempre en modo dev para ver las peticiones
app.use(morgan('dev'));


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
        service: 'Backend Unificado - Alquileres Hub',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        modules: {
            registro: 'active',
            inquilinos: 'active',
            disponibilidad: 'active',
            reportes: 'pending'
        }

    });
});

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: '🏢 Backend Unificado - Sistema de Gestión de Alquileres',
        version: '1.0.0',
        documentation: '/api/docs',
        health: '/health'
    });
});

// ============================================
// RUTAS DE LA API - MÓDULOS UNIFICADOS
// ============================================

const API_PREFIX = '/api';


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MÓDULO 1: REGISTRO DE ARRENDADORES Y PROPIEDADES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/perfil`, perfilRoutes);
app.use(`${API_PREFIX}/propiedades/registro`, propiedadRegistroRoutes);
app.use(`${API_PREFIX}/catalogos`, catalogoRoutes);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MÓDULO 2: GESTIÓN DE INQUILINOS Y CONTRATOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(`${API_PREFIX}/reservas`, reservaRoutes);
app.use(`${API_PREFIX}/contratos`, contratoRoutes);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MÓDULO 3: DISPONIBILIDAD Y BÚSQUEDA INTELIGENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ruta principal de propiedades (usada por el frontend)
app.use(`${API_PREFIX}/propiedades`, propiedadesDisponibilidadRouter);
app.use(`${API_PREFIX}/filtros`, filtrosRouter);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MÓDULO 4: REPORTES, QUEJAS Y MANTENIMIENTO (DESHABILITADO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(`${API_PREFIX}/incidents`, (req, res, next) => {
    console.log('➡️ DEBUG: Petición entrante a /incidents');
    console.log('➡️ Headers:', req.headers.authorization);
    next();
}, incidentRoutes);

app.use(`${API_PREFIX}/catalogos-mantenimiento`, incidentCatalogRoutes);



// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        availableModules: [
            'auth',
            'perfil',
            'propiedades',
            'catalogos',
            'reservas',
            'contratos',
            'filtros'
        ]
    });
});

// ============================================
// MANEJO CENTRALIZADO DE ERRORES
// ============================================

app.use((err: any, req: Request, res: Response, _next: any) => {
    console.error('❌ Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

const PORT = process.env.PORT || 8001;

const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏢 BACKEND UNIFICADO - ALQUILERES HUB                    ║
║                                                            ║
║   🚀 Server running on port ${PORT}                           ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   📡 API Base: http://localhost:${PORT}${API_PREFIX}                ║
║                                                            ║
║   ✅ Módulos Activos:                                      ║
║      • Registro de Propiedades                            ║
║      • Gestión de Inquilinos y Contratos                  ║
║      • Disponibilidad y Búsqueda                          ║
║                                                            ║
║   ⏳ Módulos Pendientes:                                   ║
║      • Reportes (requiere reconstrucción)                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
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
