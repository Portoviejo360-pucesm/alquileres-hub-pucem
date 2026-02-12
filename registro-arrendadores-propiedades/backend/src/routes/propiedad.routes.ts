import { Router } from 'express';
import { PropiedadController } from '../controllers/propiedad.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireVerification, isOwner } from '../middlewares/verification.middleware';
import { validate } from '../middlewares/validation.middleware';
import { crearPropiedadSchema, actualizarPropiedadSchema } from '../validators/propiedad.validator';

const router = Router();

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación Y verificación)
// ============================================

/**
 * @route   GET /api/propiedades/mis-propiedades
 * @desc    Obtener propiedades del usuario autenticado
 * @access  Private (requiere verificación)
 */
router.get(
    '/mis-propiedades',
    authenticate,
    requireVerification,
    PropiedadController.obtenerMisPropiedades
);

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * @route   GET /api/propiedades
 * @desc    Obtener todas las propiedades con filtros opcionales
 * @access  Public
 * @query   estadoId, publicoObjetivoId, precioMin, precioMax, esAmoblado
 */
router.get(
    '/',
    PropiedadController.obtenerPropiedades
);

/**
 * @route   GET /api/propiedades/:id
 * @desc    Obtener una propiedad por ID
 * @access  Public
 */
router.get(
    '/:id',
    PropiedadController.obtenerPropiedadPorId
);

/**
 * @route   POST /api/propiedades
 * @desc    Crear una nueva propiedad
 * @access  Private (requiere verificación)
 */
router.post(
    '/',
    authenticate,
    requireVerification,
    validate(crearPropiedadSchema),
    PropiedadController.crearPropiedad
);

/**
 * @route   PUT /api/propiedades/:id
 * @desc    Actualizar una propiedad
 * @access  Private (solo el propietario verificado)
 */
router.put(
    '/:id',
    authenticate,
    requireVerification,
    isOwner('id'),
    validate(actualizarPropiedadSchema),
    PropiedadController.actualizarPropiedad
);

/**
 * @route   DELETE /api/propiedades/:id
 * @desc    Eliminar una propiedad
 * @access  Private (solo el propietario verificado)
 */
router.delete(
    '/:id',
    authenticate,
    requireVerification,
    isOwner('id'),
    PropiedadController.eliminarPropiedad
);

export default router;

