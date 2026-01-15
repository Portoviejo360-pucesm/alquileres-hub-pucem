import { Router } from 'express';
import { PropiedadController } from '../controllers/propiedad.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { crearPropiedadSchema, actualizarPropiedadSchema } from '../validators/propiedad.validator';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * @route   GET /api/v1/propiedades
 * @desc    Obtener todas las propiedades con filtros opcionales
 * @access  Public
 * @query   estadoId, publicoObjetivoId, precioMin, precioMax, esAmoblado
 */
router.get(
    '/',
    PropiedadController.obtenerPropiedades
);

/**
 * @route   GET /api/v1/propiedades/:id
 * @desc    Obtener una propiedad por ID
 * @access  Public
 */
router.get(
    '/:id',
    PropiedadController.obtenerPropiedadPorId
);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @route   GET /api/v1/propiedades/mis-propiedades
 * @desc    Obtener propiedades del usuario autenticado
 * @access  Private
 */
router.get(
    '/mis-propiedades',
    authenticate,
    PropiedadController.obtenerMisPropiedades
);

/**
 * @route   POST /api/v1/propiedades
 * @desc    Crear una nueva propiedad
 * @access  Private (requiere perfil verificado)
 */
router.post(
    '/',
    authenticate,
    validate(crearPropiedadSchema),
    PropiedadController.crearPropiedad
);

/**
 * @route   PUT /api/v1/propiedades/:id
 * @desc    Actualizar una propiedad
 * @access  Private (solo el propietario)
 */
router.put(
    '/:id',
    authenticate,
    validate(actualizarPropiedadSchema),
    PropiedadController.actualizarPropiedad
);

/**
 * @route   DELETE /api/v1/propiedades/:id
 * @desc    Eliminar una propiedad
 * @access  Private (solo el propietario)
 */
router.delete(
    '/:id',
    authenticate,
    PropiedadController.eliminarPropiedad
);

export default router;
