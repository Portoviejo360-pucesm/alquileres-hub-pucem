import multer from 'multer';
import { config } from '../config';
import { Request } from 'express';

// Configure multer for memory storage (files will be uploaded to Supabase)
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if file type is allowed
    if (config.allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${config.allowedFileTypes.join(', ')}`));
    }
};

// Create multer upload instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.maxFileSize, // Max file size from config (default 5MB)
    },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple file uploads
export const uploadMultiple = upload.array('files', 5); // Max 5 files
