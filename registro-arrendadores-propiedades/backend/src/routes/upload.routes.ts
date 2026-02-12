import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

/**
 * @route   POST /api/v1/uploads/image
 * @desc    Subir una sola imagen
 * @access  Private
 */
router.post(
    '/image',
    authenticate,
    upload.single('image'),
    UploadController.uploadImage
);

/**
 * @route   POST /api/v1/uploads/images
 * @desc    Subir múltiples imágenes
 * @access  Private
 */
router.post(
    '/images',
    authenticate,
    upload.array('images', 5),
    UploadController.uploadImages
);

export default router;
