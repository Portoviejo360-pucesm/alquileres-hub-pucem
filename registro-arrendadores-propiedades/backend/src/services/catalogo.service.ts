import { prisma } from '../config/database';



// ============================================
// SERVICIO DE CATÁLOGOS
// ============================================

export class CatalogoService {

    /**
     * Obtener todos los servicios disponibles
     */
    static async obtenerServicios() {
        return await prisma.catalogoServicio.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
    }

    /**
     * Obtener todos los estados de propiedad
     */
    static async obtenerEstados() {
        return await prisma.estadoPropiedad.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
    }

    /**
     * Obtener todos los tipos de público objetivo
     */
    static async obtenerTiposPublico() {
        return await prisma.tipoPublico.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
    }

    /**
     * Obtener todos los roles
     */
    static async obtenerRoles() {
        return await prisma.rol.findMany({
            orderBy: {
                nombre: 'asc'
            }
        });
    }
}
