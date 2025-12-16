import { supabase, VERIFICATION_DOCS_BUCKET, PROPERTY_PHOTOS_BUCKET } from '../config/supabase';
import { AppError } from '../middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// UTILIDADES PARA SUBIR ARCHIVOS A SUPABASE
// ============================================

interface UploadResult {
    url: string;
    path: string;
}

/**
 * Subir documento de verificación a Supabase
 */
export const uploadVerificationDocument = async (
    file: Buffer,
    fileName: string,
    usuarioId: string
): Promise<UploadResult> => {
    try {
        // Generar nombre único para el archivo
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${usuarioId}/${uuidv4()}.${fileExtension}`;

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
            .from(VERIFICATION_DOCS_BUCKET)
            .upload(uniqueFileName, file, {
                contentType: getContentType(fileExtension || ''),
                upsert: false
            });

        if (error) {
            throw new AppError(`Error al subir documento: ${error.message}`, 500);
        }

        // Obtener URL pública del archivo
        const { data: urlData } = supabase.storage
            .from(VERIFICATION_DOCS_BUCKET)
            .getPublicUrl(data.path);

        return {
            url: urlData.publicUrl,
            path: data.path
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Error al subir documento de verificación', 500);
    }
};

/**
 * Subir foto de propiedad a Supabase
 */
export const uploadPropertyPhoto = async (
    file: Buffer,
    fileName: string,
    propiedadId: number
): Promise<UploadResult> => {
    try {
        // Generar nombre único para el archivo
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `propiedad-${propiedadId}/${uuidv4()}.${fileExtension}`;

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
            .from(PROPERTY_PHOTOS_BUCKET)
            .upload(uniqueFileName, file, {
                contentType: getContentType(fileExtension || ''),
                upsert: false
            });

        if (error) {
            throw new AppError(`Error al subir foto: ${error.message}`, 500);
        }

        // Obtener URL pública del archivo
        const { data: urlData } = supabase.storage
            .from(PROPERTY_PHOTOS_BUCKET)
            .getPublicUrl(data.path);

        return {
            url: urlData.publicUrl,
            path: data.path
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Error al subir foto de propiedad', 500);
    }
};

/**
 * Eliminar archivo de Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        throw new AppError(`Error al eliminar archivo: ${error.message}`, 500);
    }
};

/**
 * Obtener content type basado en la extensión del archivo
 */
const getContentType = (extension: string): string => {
    const contentTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Validar tipo de archivo permitido
 */
export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
};

/**
 * Validar tamaño de archivo (en bytes)
 */
export const validateFileSize = (fileSize: number, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
};
