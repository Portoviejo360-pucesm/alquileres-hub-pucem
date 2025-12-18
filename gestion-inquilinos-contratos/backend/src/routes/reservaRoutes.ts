import { Router } from 'express';
import * as reservaController from '../controllers/reservaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', reservaController.create);
router.get('/mis-viajes', reservaController.getMyReservations);
router.patch('/:id/cancelar', reservaController.cancel);

export default router;
