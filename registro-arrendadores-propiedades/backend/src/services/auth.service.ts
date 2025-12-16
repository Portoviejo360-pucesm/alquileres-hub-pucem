import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../config/jwt';
import { RegistroInput, LoginInput } from '../validators/auth.validator';

// ============================================
// SERVICIO DE AUTENTICACIÓN
// ============================================

export class AuthService {

    /**
     * Registrar un nuevo usuario
     */
    static async registrarUsuario(data: RegistroInput) {
        // Verificar si el correo ya existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { correo: data.correo }
        });

        if (usuarioExistente) {
            throw new AppError('El correo electrónico ya está registrado', 409);
        }

        // Verificar que el rol existe
        const rol = await prisma.rol.findUnique({
            where: { id: data.rolId || 2 }
        });

        if (!rol) {
            throw new AppError('Rol inválido', 400);
        }

        // Hash de la contraseña
        const passwordHash = await hashPassword(data.password);

        // Crear el usuario
        const usuario = await prisma.usuario.create({
            data: {
                nombresCompletos: data.nombresCompletos,
                correo: data.correo,
                passwordHash,
                rolId: data.rolId || 2
            },
            select: {
                id: true,
                nombresCompletos: true,
                correo: true,
                rolId: true,
                fechaRegistro: true,
                rol: {
                    select: {
                        nombre: true
                    }
                }
            }
        });

        // Generar token JWT
        const token = generateToken({
            id: usuario.id,
            correo: usuario.correo,
            rolId: usuario.rolId
        });

        return {
            usuario,
            token
        };
    }

    /**
     * Login de usuario
     */
    static async loginUsuario(data: LoginInput) {
        // Buscar usuario por correo
        const usuario = await prisma.usuario.findUnique({
            where: { correo: data.correo },
            include: {
                rol: {
                    select: {
                        nombre: true
                    }
                },
                perfilVerificado: {
                    select: {
                        estaVerificado: true
                    }
                }
            }
        });

        if (!usuario) {
            throw new AppError('Credenciales inválidas', 401);
        }

        // Verificar contraseña
        if (!usuario.passwordHash) {
            throw new AppError('Usuario no tiene contraseña configurada', 400);
        }

        const passwordValida = await comparePassword(data.password, usuario.passwordHash);

        if (!passwordValida) {
            throw new AppError('Credenciales inválidas', 401);
        }

        // Generar token JWT
        const token = generateToken({
            id: usuario.id,
            correo: usuario.correo,
            rolId: usuario.rolId
        });

        // Remover password hash de la respuesta
        const { passwordHash, ...usuarioSinPassword } = usuario;

        return {
            usuario: usuarioSinPassword,
            token
        };
    }

    /**
     * Obtener perfil del usuario autenticado
     */
    static async obtenerPerfil(usuarioId: string) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nombresCompletos: true,
                correo: true,
                rolId: true,
                fechaRegistro: true,
                rol: {
                    select: {
                        nombre: true
                    }
                },
                perfilVerificado: {
                    select: {
                        cedulaRuc: true,
                        telefonoContacto: true,
                        biografiaCorta: true,
                        estaVerificado: true,
                        fechaSolicitud: true
                    }
                },
                propiedades: {
                    select: {
                        id: true,
                        tituloAnuncio: true,
                        precioMensual: true,
                        estado: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            }
        });

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return usuario;
    }
}
