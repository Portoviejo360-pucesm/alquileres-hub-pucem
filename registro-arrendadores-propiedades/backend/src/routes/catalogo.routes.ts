import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';

const router = Router();

// ============================================
// RUTAS PÚBLICAS - CATÁLOGOS
// ============================================

/**
 * @route   GET /api/v1/catalogos/servicios
 * @desc    Obtener todos los servicios disponibles
 * @access  Public
 */
router.get('/servicios', CatalogoController.obtenerServicios);

/**
 * @route   GET /api/v1/catalogos/estados
 * @desc    Obtener todos los estados de propiedad
 * @access  Public
 */
router.get('/estados', CatalogoController.obtenerEstados);

/**
 * @route   GET /api/v1/catalogos/tipos-publico
 * @desc    Obtener todos los tipos de público objetivo
 * @access  Public
 */
router.get('/tipos-publico', CatalogoController.obtenerTiposPublico);

/**
 * @route   GET /api/v1/catalogos/roles
 * @desc    Obtener todos los roles de usuario
 * @access  Public
 */
router.get('/roles', CatalogoController.obtenerRoles);

export default router;
