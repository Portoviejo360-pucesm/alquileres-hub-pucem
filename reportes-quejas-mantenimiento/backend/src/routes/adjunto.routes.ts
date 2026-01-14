import { Router } from 'express';
import { AdjuntoController } from '../controllers/adjunto.controller';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent route

// Upload Attachment
router.post(
    '/',
    uploadSingle,
    AdjuntoController.upload
);

// Get Attachments
router.get('/', AdjuntoController.getAttachments);

// Delete Attachment
router.delete('/:adjuntoId', AdjuntoController.delete);

export default router;
