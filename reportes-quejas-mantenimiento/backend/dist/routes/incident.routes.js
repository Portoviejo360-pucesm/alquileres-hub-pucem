"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incident_controller_1 = require("../controllers/incident.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const incident_schema_1 = require("../validators/incident.schema");
const router = (0, express_1.Router)();
// Require auth for all incident routes
router.use(auth_middleware_1.authenticate);
// Create Incident
router.post('/', (0, validate_middleware_1.validate)(incident_schema_1.createIncidenciaSchema), incident_controller_1.IncidentController.create);
// List Incidents
router.get('/', incident_controller_1.IncidentController.list);
exports.default = router;
