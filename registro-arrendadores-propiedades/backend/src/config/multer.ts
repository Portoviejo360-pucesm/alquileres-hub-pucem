import multer from 'multer';
import { AppError } from '../middlewares/error.middleware';

// ============================================
// CONFIGURACIÓN DE MULTER PARA SUPABASE
// ============================================
// Usamos memoryStorage porque vamos a subir directamente a Supabase
// y necesitamos acceso al buffer del archivo

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Tipo de archivo no soportado. Solo se permiten imágenes.', 400) as any, false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
        files: 5 // Máximo 5 archivos por request
    }
});

