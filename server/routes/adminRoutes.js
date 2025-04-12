import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(verifyToken);

// Bus Management
router.post('/buses', adminController.createBus);
router.get('/buses', adminController.getAllBuses);
router.get('/buses/:busId', adminController.getBusById);
router.put('/buses/:busId', adminController.updateBus);
router.patch('/buses/:busId/status', adminController.updateBusStatus);
router.delete('/buses/:busId', adminController.deleteBus);

// Route Management
router.post('/routes', adminController.createRoute);
router.get('/routes', adminController.getAllRoutes);
router.get('/routes/:routeId', adminController.getRouteById);
router.put('/routes/:routeId', adminController.updateRoute);
router.patch('/routes/:routeId/status', adminController.updateRouteStatus);
router.delete('/routes/:routeId', adminController.deleteRoute);

// Schedule Management
router.post('/schedules', adminController.createSchedule);
router.get('/schedules', adminController.getAllSchedules);
router.get('/schedules/:scheduleId', adminController.getScheduleById);
router.put('/schedules/:scheduleId', adminController.updateSchedule);
router.delete('/schedules/:scheduleId', adminController.deleteSchedule);

// Student Management
router.post('/students', adminController.createStudent);
router.get('/students', adminController.getAllStudents);
router.get('/students/recent', adminController.getRecentStudents);
router.get('/students/:studentId', adminController.getStudentById);
router.put('/students/:studentId', adminController.updateStudent);
router.patch('/students/:studentId/status', adminController.updateStudentStatus);
router.delete('/students/:studentId', adminController.deleteStudent);

// Payment Management
router.post('/payments', adminController.createPayment);
router.get('/payments', adminController.getAllPayments);
router.get('/payments/:paymentId', adminController.getPaymentById);
router.put('/payments/:paymentId', adminController.updatePayment);
router.patch('/payments/:paymentId/status', adminController.updatePaymentStatus);
router.delete('/payments/:paymentId', adminController.deletePayment);

// Location Tracking
router.get('/locations/active', adminController.getActiveLocations);
router.get('/locations/bus/:busId', adminController.getBusLocation);
router.get('/locations/bus/:busId/history', adminController.getBusLocationHistory);

// Dashboard Statistics
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/revenue', adminController.getRevenueStats);
router.get('/dashboard/maintenance', adminController.getMaintenanceStats);

export default router; 