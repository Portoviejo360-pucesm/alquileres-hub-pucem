import { Router } from 'express';
import { ComentarioController } from '../controllers/comentario.controller';
import { validate } from '../middlewares/validate.middleware';
import { addComentarioSchema } from '../validators/incident.schema';

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent route

// Add Comment
router.post(
    '/',
    validate(addComentarioSchema),
    ComentarioController.addComment
);

// Get Comments
router.get('/', ComentarioController.getComments);

// Update Comment
router.patch('/:commentId', ComentarioController.updateComment);

export default router;
