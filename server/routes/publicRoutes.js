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

// Blood Donation Routes
router.post('/blood-donors', publicController.createBloodDonor);
router.get('/blood-donors', publicController.getBloodDonors);
router.get('/blood-donors/search', publicController.searchBloodDonors);
router.get('/blood-donors/:donorId', publicController.getBloodDonorById);

// Payment Status Routes
router.get('/payments/status', publicController.getPaymentStatus);
router.get('/payments/search', publicController.searchPayments);

export default router; 