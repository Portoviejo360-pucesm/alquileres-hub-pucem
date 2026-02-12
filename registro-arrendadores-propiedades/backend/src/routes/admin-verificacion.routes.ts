import { Router } from 'express';
import { AdminVerificacionController } from '../controllers/admin-verificacion.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validation.middleware';
import { aprobarVerificacionSchema, rechazarVerificacionSchema } from '../validators/verificacion.validator';

const router = Router();

// ============================================
// RUTAS PROTEGIDAS - SOLO ADMINISTRADORES
// ============================================

/**
 * @route   GET /api/v1/admin/verificaciones/pendientes
 * @desc    Listar solicitudes de verificación pendientes
 * @access  Private (Solo Admin)
 */
router.get(
    '/pendientes',
    authenticate,
    requireAdmin,
    AdminVerificacionController.listarPendientes
);

/**
 * @route   GET /api/v1/admin/verificaciones
 * @desc    Listar todas las verificaciones con filtros
 * @access  Private (Solo Admin)
 */
router.get(
    '/',
    authenticate,
    requireAdmin,
    AdminVerificacionController.listarTodas
);

/**
 * @route   GET /api/v1/admin/verificaciones/dashboard-stats
 * @desc    Obtener estadísticas para el dashboard
 * @access  Private (Solo Admin)
 */
router.get(
    '/dashboard-stats',
    authenticate,
    requireAdmin,
    AdminVerificacionController.obtenerDashboardStats
);

/**
 * @route   GET /api/v1/admin/verificaciones/:id
 * @desc    Obtener detalles de una solicitud de verificación
 * @access  Private (Solo Admin)
 */
router.get(
    '/:id',
    authenticate,
    requireAdmin,
    AdminVerificacionController.obtenerDetalle
);

/**
 * @route   POST /api/v1/admin/verificaciones/:id/aprobar
 * @desc    Aprobar solicitud de verificación
 * @access  Private (Solo Admin)
 */
router.post(
    '/:id/aprobar',
    authenticate,
    requireAdmin,
    validate(aprobarVerificacionSchema),
    AdminVerificacionController.aprobarVerificacion
);

/**
 * @route   POST /api/v1/admin/verificaciones/:id/rechazar
 * @desc    Rechazar solicitud de verificación
 * @access  Private (Solo Admin)
 */
router.post(
    '/:id/rechazar',
    authenticate,
    requireAdmin,
    validate(rechazarVerificacionSchema),
    AdminVerificacionController.rechazarVerificacion
);

export default router;
