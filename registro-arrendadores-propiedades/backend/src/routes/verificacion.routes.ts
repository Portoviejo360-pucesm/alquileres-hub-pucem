import { Router } from 'express';
import { VerificacionController } from '../controllers/verificacion.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { solicitudVerificacionSchema, actualizarVerificacionSchema } from '../validators/verificacion.validator';

const router = Router();

// ============================================
// RUTAS PROTEGIDAS - USUARIO
// ============================================

/**
 * @route   POST /api/v1/verificacion/solicitar
 * @desc    Solicitar verificación como arrendador
 * @access  Private (Usuario autenticado)
 */
router.post(
    '/solicitar',
    authenticate,
    validate(solicitudVerificacionSchema),
    VerificacionController.solicitarVerificacion
);

/**
 * @route   GET /api/v1/verificacion/mi-estado
 * @desc    Obtener estado de mi solicitud de verificación
 * @access  Private (Usuario autenticado)
 */
router.get(
    '/mi-estado',
    authenticate,
    VerificacionController.obtenerMiEstado
);

/**
 * @route   PUT /api/v1/verificacion/actualizar
 * @desc    Actualizar datos de mi solicitud de verificación
 * @access  Private (Usuario autenticado)
 */
router.put(
    '/actualizar',
    authenticate,
    validate(actualizarVerificacionSchema),
    VerificacionController.actualizarSolicitud
);

export default router;
