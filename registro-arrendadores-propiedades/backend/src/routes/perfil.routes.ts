import { Router } from 'express';
import { PerfilController } from '../controllers/perfil.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { solicitarVerificacionSchema } from '../validators/perfil.validator';

const router = Router();

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @route   POST /api/v1/perfil/solicitar-verificacion
 * @desc    Solicitar verificación de perfil de arrendador
 * @access  Private
 */
router.post(
    '/solicitar-verificacion',
    authenticate,
    validate(solicitarVerificacionSchema),
    PerfilController.solicitarVerificacion
);

/**
 * @route   GET /api/v1/perfil/estado-verificacion
 * @desc    Obtener estado de verificación del perfil
 * @access  Private
 */
router.get(
    '/estado-verificacion',
    authenticate,
    PerfilController.obtenerEstadoVerificacion
);

/**
 * @route   PUT /api/v1/perfil
 * @desc    Actualizar perfil de arrendador
 * @access  Private
 */
router.put(
    '/',
    authenticate,
    PerfilController.actualizarPerfil
);

export default router;
