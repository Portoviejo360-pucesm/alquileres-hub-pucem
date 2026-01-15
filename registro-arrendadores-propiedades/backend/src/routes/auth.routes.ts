import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { registroSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post(
    '/register',
    validate(registroSchema),
    AuthController.registrar
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
    '/login',
    validate(loginSchema),
    AuthController.login
);

// ============================================
// RUTAS PROTEGIDAS
// ============================================

/**
 * @route   GET /api/v1/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get(
    '/perfil',
    authenticate,
    AuthController.obtenerPerfil
);

export default router;
