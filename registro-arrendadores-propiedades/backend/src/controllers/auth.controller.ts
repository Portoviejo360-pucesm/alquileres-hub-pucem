import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middlewares/error.middleware';

// ============================================
// CONTROLADOR DE AUTENTICACIÓN
// ============================================

export class AuthController {

    /**
     * Registrar un nuevo usuario
     * POST /api/v1/auth/register
     */
    static registrar = asyncHandler(async (req: Request, res: Response) => {
        const data = req.body;

        const resultado = await AuthService.registrarUsuario(data);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: resultado
        });
    });

    /**
     * Login de usuario
     * POST /api/v1/auth/login
     */
    static login = asyncHandler(async (req: Request, res: Response) => {
        const data = req.body;

        const resultado = await AuthService.loginUsuario(data);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: resultado
        });
    });

    /**
     * Obtener perfil del usuario autenticado
     * GET /api/v1/auth/perfil
     */
    static obtenerPerfil = asyncHandler(async (req: Request, res: Response) => {
        const usuarioId = req.user!.id;

        const usuario = await AuthService.obtenerPerfil(usuarioId);

        res.status(200).json({
            success: true,
            data: usuario
        });
    });
    /**
     * Obtener todos los usuarios
     * GET /api/v1/auth/usuarios
     */
    static obtenerUsuarios = asyncHandler(async (req: Request, res: Response) => {
        const usuarios = await AuthService.obtenerUsuarios();

        res.status(200).json({
            success: true,
            data: usuarios
        });
    });
}
