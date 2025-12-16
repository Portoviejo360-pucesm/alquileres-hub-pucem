import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { CrearPropiedadInput, ActualizarPropiedadInput } from '../validators/propiedad.validator';



// ============================================
// SERVICIO DE PROPIEDADES
// ============================================

export class PropiedadService {

    /**
     * Crear una nueva propiedad con sus servicios y fotos
     */
    static async crearPropiedad(
        propietarioId: string,
        data: CrearPropiedadInput
    ) {
        // Verificar que el usuario existe y tiene perfil verificado
        const usuario = await prisma.usuario.findUnique({
            where: { id: propietarioId },
            include: {
                perfilVerificado: true
            }
        });

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        if (!usuario.perfilVerificado?.estaVerificado) {
            throw new AppError(
                'Debes tener un perfil verificado para publicar propiedades',
                403
            );
        }

        // Verificar que el estado existe
        const estado = await prisma.estadoPropiedad.findUnique({
            where: { id: data.estadoId }
        });

        if (!estado) {
            throw new AppError('Estado de propiedad inválido', 400);
        }

        // Verificar que el público objetivo existe (si se proporciona)
        if (data.publicoObjetivoId) {
            const publicoObjetivo = await prisma.tipoPublico.findUnique({
                where: { id: data.publicoObjetivoId }
            });

            if (!publicoObjetivo) {
                throw new AppError('Tipo de público objetivo inválido', 400);
            }
        }

        // Verificar que todos los servicios existen
        const serviciosIds = data.servicios.map(s => s.servicioId);
        const serviciosExistentes = await prisma.catalogoServicio.findMany({
            where: { id: { in: serviciosIds } }
        });

        if (serviciosExistentes.length !== serviciosIds.length) {
            throw new AppError('Uno o más servicios no existen', 400);
        }

        // Crear la propiedad con transacción
        const propiedad = await prisma.$transaction(async (tx: any) => {
            // 1. Crear la propiedad
            const nuevaPropiedad = await tx.propiedad.create({
                data: {
                    propietarioId,
                    estadoId: data.estadoId,
                    publicoObjetivoId: data.publicoObjetivoId,
                    tituloAnuncio: data.tituloAnuncio,
                    descripcion: data.descripcion,
                    precioMensual: data.precioMensual,
                    direccionTexto: data.direccionTexto,
                    latitudMapa: data.latitudMapa,
                    longitudMapa: data.longitudMapa,
                    esAmoblado: data.esAmoblado
                }
            });

            // 2. Crear las relaciones con servicios
            await tx.propiedadServicio.createMany({
                data: data.servicios.map(servicio => ({
                    propiedadId: nuevaPropiedad.id,
                    servicioId: servicio.servicioId,
                    incluidoEnPrecio: servicio.incluidoEnPrecio
                }))
            });

            // 3. Crear las fotos
            await tx.fotoPropiedad.createMany({
                data: data.fotos.map(foto => ({
                    propiedadId: nuevaPropiedad.id,
                    urlImagen: foto.urlImagen,
                    esPrincipal: foto.esPrincipal
                }))
            });

            // 4. Retornar la propiedad completa con todas sus relaciones
            return await tx.propiedad.findUnique({
                where: { id: nuevaPropiedad.id },
                include: {
                    estado: true,
                    publicoObjetivo: true,
                    propietario: {
                        select: {
                            id: true,
                            nombresCompletos: true,
                            correo: true,
                            perfilVerificado: {
                                select: {
                                    telefonoContacto: true,
                                    biografiaCorta: true
                                }
                            }
                        }
                    },
                    servicios: {
                        include: {
                            servicio: true
                        }
                    },
                    fotos: {
                        orderBy: {
                            esPrincipal: 'desc'
                        }
                    }
                }
            });
        });

        return propiedad;
    }

    /**
     * Obtener todas las propiedades con filtros opcionales
     */
    static async obtenerPropiedades(filtros?: {
        estadoId?: number;
        publicoObjetivoId?: number;
        precioMin?: number;
        precioMax?: number;
        esAmoblado?: boolean;
    }) {
        const where: any = {};

        if (filtros?.estadoId) {
            where.estadoId = filtros.estadoId;
        }

        if (filtros?.publicoObjetivoId) {
            where.publicoObjetivoId = filtros.publicoObjetivoId;
        }

        if (filtros?.precioMin || filtros?.precioMax) {
            where.precioMensual = {};
            if (filtros.precioMin) {
                where.precioMensual.gte = filtros.precioMin;
            }
            if (filtros.precioMax) {
                where.precioMensual.lte = filtros.precioMax;
            }
        }

        if (filtros?.esAmoblado !== undefined) {
            where.esAmoblado = filtros.esAmoblado;
        }

        const propiedades = await prisma.propiedad.findMany({
            where,
            include: {
                estado: true,
                publicoObjetivo: true,
                propietario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        perfilVerificado: {
                            select: {
                                telefonoContacto: true
                            }
                        }
                    }
                },
                servicios: {
                    include: {
                        servicio: true
                    }
                },
                fotos: {
                    where: {
                        esPrincipal: true
                    },
                    take: 1
                }
            },
            orderBy: {
                fechaCreacion: 'desc'
            }
        });

        return propiedades;
    }

    /**
     * Obtener una propiedad por ID
     */
    static async obtenerPropiedadPorId(id: number) {
        const propiedad = await prisma.propiedad.findUnique({
            where: { id },
            include: {
                estado: true,
                publicoObjetivo: true,
                propietario: {
                    select: {
                        id: true,
                        nombresCompletos: true,
                        correo: true,
                        perfilVerificado: {
                            select: {
                                telefonoContacto: true,
                                biografiaCorta: true,
                                estaVerificado: true
                            }
                        }
                    }
                },
                servicios: {
                    include: {
                        servicio: true
                    }
                },
                fotos: {
                    orderBy: {
                        esPrincipal: 'desc'
                    }
                }
            }
        });

        if (!propiedad) {
            throw new AppError('Propiedad no encontrada', 404);
        }

        return propiedad;
    }

    /**
     * Actualizar una propiedad
     */
    static async actualizarPropiedad(
        id: number,
        propietarioId: string,
        data: ActualizarPropiedadInput
    ) {
        // Verificar que la propiedad existe y pertenece al usuario
        const propiedadExistente = await prisma.propiedad.findUnique({
            where: { id }
        });

        if (!propiedadExistente) {
            throw new AppError('Propiedad no encontrada', 404);
        }

        if (propiedadExistente.propietarioId !== propietarioId) {
            throw new AppError('No tienes permiso para editar esta propiedad', 403);
        }

        // Actualizar con transacción
        const propiedadActualizada = await prisma.$transaction(async (tx: any) => {
            // 1. Actualizar datos básicos de la propiedad
            const { servicios, fotos, ...datosBasicos } = data;

            await tx.propiedad.update({
                where: { id },
                data: datosBasicos
            });

            // 2. Actualizar servicios si se proporcionan
            if (servicios && servicios.length > 0) {
                // Eliminar servicios existentes
                await tx.propiedadServicio.deleteMany({
                    where: { propiedadId: id }
                });

                // Crear nuevos servicios
                await tx.propiedadServicio.createMany({
                    data: servicios.map(servicio => ({
                        propiedadId: id,
                        servicioId: servicio.servicioId,
                        incluidoEnPrecio: servicio.incluidoEnPrecio
                    }))
                });
            }

            // 3. Actualizar fotos si se proporcionan
            if (fotos && fotos.length > 0) {
                // Eliminar fotos existentes
                await tx.fotoPropiedad.deleteMany({
                    where: { propiedadId: id }
                });

                // Crear nuevas fotos
                await tx.fotoPropiedad.createMany({
                    data: fotos.map(foto => ({
                        propiedadId: id,
                        urlImagen: foto.urlImagen,
                        esPrincipal: foto.esPrincipal
                    }))
                });
            }

            // 4. Retornar la propiedad actualizada
            return await tx.propiedad.findUnique({
                where: { id },
                include: {
                    estado: true,
                    publicoObjetivo: true,
                    propietario: {
                        select: {
                            id: true,
                            nombresCompletos: true,
                            correo: true
                        }
                    },
                    servicios: {
                        include: {
                            servicio: true
                        }
                    },
                    fotos: {
                        orderBy: {
                            esPrincipal: 'desc'
                        }
                    }
                }
            });
        });

        return propiedadActualizada;
    }

    /**
     * Eliminar una propiedad
     */
    static async eliminarPropiedad(id: number, propietarioId: string) {
        // Verificar que la propiedad existe y pertenece al usuario
        const propiedad = await prisma.propiedad.findUnique({
            where: { id }
        });

        if (!propiedad) {
            throw new AppError('Propiedad no encontrada', 404);
        }

        if (propiedad.propietarioId !== propietarioId) {
            throw new AppError('No tienes permiso para eliminar esta propiedad', 403);
        }

        // Eliminar con transacción (Prisma manejará las cascadas)
        await prisma.$transaction(async (tx: any) => {
            // Eliminar servicios asociados
            await tx.propiedadServicio.deleteMany({
                where: { propiedadId: id }
            });

            // Eliminar fotos asociadas
            await tx.fotoPropiedad.deleteMany({
                where: { propiedadId: id }
            });

            // Eliminar la propiedad
            await tx.propiedad.delete({
                where: { id }
            });
        });

        return { message: 'Propiedad eliminada exitosamente' };
    }

    /**
     * Obtener propiedades de un usuario específico
     */
    static async obtenerPropiedadesPorUsuario(propietarioId: string) {
        const propiedades = await prisma.propiedad.findMany({
            where: { propietarioId },
            include: {
                estado: true,
                publicoObjetivo: true,
                servicios: {
                    include: {
                        servicio: true
                    }
                },
                fotos: {
                    where: {
                        esPrincipal: true
                    },
                    take: 1
                }
            },
            orderBy: {
                fechaCreacion: 'desc'
            }
        });

        return propiedades;
    }
}
