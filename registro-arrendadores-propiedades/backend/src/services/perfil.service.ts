import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { SolicitarVerificacionInput } from '../validators/perfil.validator';

// ============================================
// SERVICIO DE PERFIL DE ARRENDADOR
// ============================================

export class PerfilService {

    /**
     * Solicitar verificación de perfil de arrendador
     */
    static async solicitarVerificacion(
        usuarioId: string,
        data: SolicitarVerificacionInput
    ) {
        // Verificar que el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            include: {
                perfilVerificado: true
            }
        });

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Verificar si ya tiene un perfil verificado
        if (usuario.perfilVerificado) {
            // Si ya está verificado, no puede solicitar de nuevo
            if (usuario.perfilVerificado.estaVerificado) {
                throw new AppError('Tu perfil ya está verificado', 400);
            }

            // Si ya solicitó pero no está verificado, actualizar la solicitud
            const perfilActualizado = await prisma.perfilVerificado.update({
                where: { usuarioId },
                data: {
                    cedulaRuc: data.cedulaRuc,
                    telefonoContacto: data.telefonoContacto,
                    biografiaCorta: data.biografiaCorta,
                    fotoDocumentoUrl: data.fotoDocumentoUrl,
                    fechaSolicitud: new Date(),
                    estadoVerificacion: 'PENDIENTE'
                }
            });

            return {
                message: 'Solicitud de verificación actualizada',
                perfil: perfilActualizado
            };
        }

        // Verificar que la cédula/RUC no esté ya registrada
        const cedulaExistente = await prisma.perfilVerificado.findUnique({
            where: { cedulaRuc: data.cedulaRuc }
        });

        if (cedulaExistente) {
            throw new AppError('Esta cédula/RUC ya está registrada', 409);
        }

        // Crear nueva solicitud de verificación
        const nuevoPerfil = await prisma.perfilVerificado.create({
            data: {
                usuarioId,
                cedulaRuc: data.cedulaRuc,
                telefonoContacto: data.telefonoContacto,
                biografiaCorta: data.biografiaCorta,
                fotoDocumentoUrl: data.fotoDocumentoUrl,
                estaVerificado: false,
                estadoVerificacion: 'PENDIENTE'
            }
        });

        return {
            message: 'Solicitud de verificación enviada exitosamente',
            perfil: nuevoPerfil
        };
    }

    /**
     * Obtener estado de verificación del usuario
     */
    static async obtenerEstadoVerificacion(usuarioId: string) {
        const perfil = await prisma.perfilVerificado.findUnique({
            where: { usuarioId },
            select: {
                cedulaRuc: true,
                telefonoContacto: true,
                biografiaCorta: true,
                estaVerificado: true,
                fechaSolicitud: true
            }
        });

        if (!perfil) {
            return {
                tienePerfilVerificado: false,
                estaVerificado: false,
                mensaje: 'No has solicitado verificación de perfil'
            };
        }

        return {
            tienePerfilVerificado: true,
            estaVerificado: perfil.estaVerificado,
            perfil,
            mensaje: perfil.estaVerificado
                ? 'Tu perfil está verificado'
                : 'Tu solicitud está en revisión'
        };
    }

    /**
     * Actualizar perfil verificado (o crear si no existe)
     */
    static async actualizarPerfil(
        usuarioId: string,
        data: Partial<SolicitarVerificacionInput>
    ) {
        // Verificar que el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            include: {
                perfilVerificado: true
            }
        });

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Si no tiene perfil, crear uno nuevo
        if (!usuario.perfilVerificado) {
            // Validar que se proporcionen los campos requeridos
            if (!data.cedulaRuc || !data.telefonoContacto) {
                throw new AppError(
                    'Debes proporcionar cédula/RUC y teléfono de contacto',
                    400
                );
            }

            // Verificar que la cédula no esté ya registrada
            const cedulaExistente = await prisma.perfilVerificado.findUnique({
                where: { cedulaRuc: data.cedulaRuc }
            });

            if (cedulaExistente) {
                throw new AppError('Esta cédula/RUC ya está registrada', 409);
            }

            // Crear nuevo perfil
            const nuevoPerfil = await prisma.perfilVerificado.create({
                data: {
                    usuarioId,
                    cedulaRuc: data.cedulaRuc,
                    telefonoContacto: data.telefonoContacto,
                    biografiaCorta: data.biografiaCorta,
                    fotoDocumentoUrl: data.fotoDocumentoUrl,
                    estaVerificado: false,
                    estadoVerificacion: 'NO_SOLICITADO'
                }
            });

            return {
                message: 'Perfil de arrendador creado exitosamente',
                perfil: nuevoPerfil
            };
        }

        // Si ya tiene perfil, actualizarlo
        const perfilExistente = usuario.perfilVerificado;

        // Si está verificado, solo permitir actualizar biografía y teléfono
        if (perfilExistente.estaVerificado && data.cedulaRuc) {
            throw new AppError(
                'No puedes cambiar la cédula/RUC de un perfil verificado',
                400
            );
        }

        // Si quiere cambiar la cédula y no está verificado, verificar que no esté duplicada
        if (data.cedulaRuc && data.cedulaRuc !== perfilExistente.cedulaRuc) {
            const cedulaExistente = await prisma.perfilVerificado.findUnique({
                where: { cedulaRuc: data.cedulaRuc }
            });

            if (cedulaExistente) {
                throw new AppError('Esta cédula/RUC ya está registrada', 409);
            }
        }

        // Actualizar perfil
        const perfilActualizado = await prisma.perfilVerificado.update({
            where: { usuarioId },
            data: {
                ...(data.telefonoContacto && { telefonoContacto: data.telefonoContacto }),
                ...(data.biografiaCorta !== undefined && { biografiaCorta: data.biografiaCorta }),
                ...(data.fotoDocumentoUrl !== undefined && { fotoDocumentoUrl: data.fotoDocumentoUrl }),
                ...(!perfilExistente.estaVerificado && data.cedulaRuc && { cedulaRuc: data.cedulaRuc })
            }
        });

        return {
            message: 'Perfil actualizado exitosamente',
            perfil: perfilActualizado
        };
    }
}
