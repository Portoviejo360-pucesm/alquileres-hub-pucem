import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadMultiple } from '../middlewares/upload.middleware';
import { createIncidenciaSchema, updateIncidenciaSchema, updateStatusSchema } from '../validators/incident.schema';

// Import sub-routes
import bitacoraRoutes from './bitacora.routes';
import comentarioRoutes from './comentario.routes';
import adjuntoRoutes from './adjunto.routes';

const router = Router();

// Require auth for all incident routes
router.use(authenticate);

// Create Incident (with optional file uploads)
router.post(
    '/',
    uploadMultiple, // Allow up to 5 files
    IncidentController.create
);

// Get user properties with active contracts
router.get('/user-properties', IncidentController.getUserProperties);

// List Incidents
router.get('/', IncidentController.list);

// Get Incident by ID
router.get('/:id', IncidentController.getById);

// Update Incident
router.patch(
    '/:id',
    validate(updateIncidenciaSchema),
    IncidentController.update
);

// Update Incident Status
router.patch(
    '/:id/status',
    validate(updateStatusSchema),
    IncidentController.updateStatus
);

// Delete Incident
router.delete('/:id', IncidentController.delete);

// Mount sub-routes
router.use('/:id/bitacora', bitacoraRoutes);
router.use('/:id/comentarios', comentarioRoutes);
router.use('/:id/adjuntos', adjuntoRoutes);

export default router;
