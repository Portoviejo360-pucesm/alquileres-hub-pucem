import { Router } from 'express';
import * as contratoController from '../controllers/contratoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/generar', contratoController.generar);
router.get('/:reservaId/descargar', contratoController.descargar);

export default router;
