import * as scheduleModel from '../models/scheduleModel.js';
import * as routeModel from '../models/routeModel.js';
import * as studentModel from '../models/studentModel.js';

// Get all bus schedules for a specific date
export const getBusSchedules = async (req, res) => {
    try {
        const { date, from, to } = req.query;
        
        if (!date) {
            return res.status(400).json({
                status: 'error',
                message: 'Date parameter is required'
            });
        }

        const schedules = await scheduleModel.getSchedulesByDate(date);
        
        // Filter schedules based on from and to locations if provided
        const filteredSchedules = schedules.filter(schedule => {
            const matchesFrom = !from || schedule.start_location.toLowerCase().includes(from.toLowerCase());
            const matchesTo = !to || schedule.end_location.toLowerCase().includes(to.toLowerCase());
            return matchesFrom && matchesTo;
        });

        res.status(200).json({
            status: 'success',
            data: { 
                schedules: filteredSchedules,
                total: filteredSchedules.length
            }
        });
    } catch (err) {
        console.error('Get schedules error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch schedules'
        });
    }
};

// Get bus schedules for a specific route
export const getRouteSchedules = async (req, res) => {
    try {
        const { routeId, date } = req.query;
        const schedules = await scheduleModel.getSchedulesByRoute(routeId, date);
        res.status(200).json({
            status: 'success',
            data: { schedules }
        });
    } catch (err) {
        console.error('Get route schedules error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch route schedules'
        });
    }
};

// Verify student payment status
export const verifyStudentPayment = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payment = await studentModel.checkPaymentStatus(studentId);
        
        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'No active payment found for student'
            });
        }

        const isExpired = new Date(payment.expiry_date) < new Date();
        
        res.status(200).json({
            status: 'success',
            data: {
                isValid: !isExpired,
                payment: {
                    ...payment,
                    isExpired
                }
            }
        });
    } catch (err) {
        console.error('Verify payment error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify payment'
        });
    }
};

// Get bus location (for real-time tracking)
export const updateBusLocation = async (req, res) => {
    try {
        const { busId, latitude, longitude } = req.body;
        // Here you would implement real-time location tracking
        // This could involve WebSocket or a similar technology
        res.status(200).json({
            status: 'success',
            message: 'Bus location updated'
        });
    } catch (err) {
        console.error('Update location error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update bus location'
        });
    }
};

// Get bus driver information
export const getBusDriverInfo = async (req, res) => {
    try {
        const { busId } = req.params;
        const bus = await busModel.getBusById(busId);
        
        if (!bus) {
            return res.status(404).json({
                status: 'error',
                message: 'Bus not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                driver: {
                    name: bus.driver_name,
                    phone: bus.driver_phone
                }
            }
        });
    } catch (err) {
        console.error('Get driver info error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch driver information'
        });
    }
}; 