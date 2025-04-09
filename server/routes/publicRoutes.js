import express from 'express';
import * as publicController from '../controllers/publicController.js';

const router = express.Router();

// Bus Schedule Routes
router.get('/schedules', publicController.getBusSchedules);
router.get('/routes/:routeId/schedules', publicController.getRouteSchedules);

// Student Verification
router.get('/students/:studentId/verify', publicController.verifyStudentPayment);

// Bus Location and Driver Info
router.post('/buses/:busId/location', publicController.updateBusLocation);
router.get('/buses/:busId/driver', publicController.getBusDriverInfo);

export default router; 