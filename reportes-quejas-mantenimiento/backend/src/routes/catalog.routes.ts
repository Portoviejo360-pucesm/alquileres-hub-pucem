import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All catalog routes require authentication (as per user request)
router.use(authenticate);

// Get catalogs
router.get('/estados', CatalogController.getEstados);
router.get('/prioridades', CatalogController.getPrioridades);
router.get('/categorias', CatalogController.getCategorias);

export default router;
