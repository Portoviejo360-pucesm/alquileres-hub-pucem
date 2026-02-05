import { Router } from 'express';
import { BitacoraController } from '../controllers/bitacora.controller';
import { validate } from '../middlewares/validate.middleware';
import { addBitacoraSchema } from '../validators/incident.schema';
import { requireLandlordOrAdmin } from '../middlewares/authorization.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent route

// Add Maintenance Entry (landlords/admins only)
router.post(
    '/',
    requireLandlordOrAdmin,
    validate(addBitacoraSchema),
    BitacoraController.addEntry
);

// Get Maintenance History
router.get('/', BitacoraController.getHistory);

export default router;
