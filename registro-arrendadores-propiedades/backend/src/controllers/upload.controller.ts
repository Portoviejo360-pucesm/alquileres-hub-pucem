import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import { AppError } from '../middlewares/error.middleware';
import { uploadPropertyPhoto, validateFileType, validateFileSize } from '../utils/upload.util';

export class UploadController {

    /**
     * Subir una imagen a Supabase
     * POST /api/v1/uploads/image
     */
    static uploadImage = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No se proporcionó ningún archivo', 400);
        }

        // Validar tipo de archivo
        const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
        if (!validateFileType(req.file.originalname, allowedTypes)) {
            throw new AppError('Tipo de archivo no permitido. Solo se aceptan: jpg, jpeg, png, webp', 400);
        }

        // Validar tamaño (5MB máximo)
        if (!validateFileSize(req.file.size, 5)) {
            throw new AppError('El archivo es demasiado grande. Tamaño máximo: 5MB', 400);
        }

        // Subir a Supabase (usamos ID temporal, luego se puede asociar a propiedad)
        const tempId = Date.now(); // ID temporal hasta que se cree la propiedad
        const result = await uploadPropertyPhoto(
            req.file.buffer,
            req.file.originalname,
            tempId
        );

        res.status(200).json({
            success: true,
            message: 'Imagen subida exitosamente a Supabase',
            data: {
                url: result.url,
                path: result.path
            }
        });
    });

    /**
     * Subir múltiples imágenes a Supabase
     * POST /api/v1/uploads/images
     */
    static uploadImages = asyncHandler(async (req: Request, res: Response) => {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            throw new AppError('No se proporcionaron archivos', 400);
        }

        const files = req.files as Express.Multer.File[];
        const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];

        // Validar todos los archivos primero
        for (const file of files) {
            if (!validateFileType(file.originalname, allowedTypes)) {
                throw new AppError(`Archivo ${file.originalname}: tipo no permitido`, 400);
            }
            if (!validateFileSize(file.size, 5)) {
                throw new AppError(`Archivo ${file.originalname}: demasiado grande (máx 5MB)`, 400);
            }
        }

        // Subir todos los archivos a Supabase
        const tempId = Date.now();
        const uploadPromises = files.map(file =>
            uploadPropertyPhoto(file.buffer, file.originalname, tempId)
        );

        const uploadedFiles = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            message: 'Imágenes subidas exitosamente a Supabase',
            data: uploadedFiles.map(result => ({
                url: result.url,
                path: result.path
            }))
        });
    });
}

