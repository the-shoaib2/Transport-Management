import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import * as locationController from '../controllers/locationController.js';

const router = express.Router();

// Apply authentication middleware to all location routes
router.use(verifyToken);

// Real-time Location Updates
router.post('/update', locationController.updateLocation);
router.get('/active', locationController.getActiveLocations);
router.get('/bus/:busId', locationController.getBusLocation);
router.get('/bus/:busId/history', locationController.getBusLocationHistory);

// Location Analytics
router.get('/analytics/daily', locationController.getDailyLocationAnalytics);
router.get('/analytics/weekly', locationController.getWeeklyLocationAnalytics);
router.get('/analytics/monthly', locationController.getMonthlyLocationAnalytics);

export default router; 