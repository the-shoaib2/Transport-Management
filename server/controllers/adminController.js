import * as busModel from '../models/busModel.js';
import * as routeModel from '../models/routeModel.js';
import * as scheduleModel from '../models/scheduleModel.js';
import * as studentModel from '../models/studentModel.js';
import * as paymentModel from '../models/paymentModel.js';
import * as locationModel from '../models/locationModel.js';
import { connectToDatabase } from '../database/mysql.js';


// Bus Management
export const createBus = async (req, res) => {
    try {
        const { bus_number, bus_nickname, capacity, model, driver_id } = req.body;

        // Validate required fields
        if (!bus_number || !bus_nickname || !capacity || !model) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: bus_number, bus_nickname, capacity, and model are required'
            });
        }

        // Create the bus with all necessary information
        const busId = await busModel.createBus({
            bus_number,
            bus_nickname,
            capacity: parseInt(capacity),
            model,
            driver_id: driver_id || null
        });

        // Get the created bus with all its details
        const bus = await busModel.getBusById(busId);

        res.status(201).json({
            status: 'success',
            data: { bus },
            message: 'Bus created successfully'
        });
    } catch (err) {
        console.error('Create bus error:', err);
        
        // Handle specific database errors
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'A bus with this number or nickname already exists'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to create bus'
        });
    }
};

export const getAllBuses = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const buses = await busModel.getAllBuses(parseInt(page), parseInt(limit));
        res.status(200).json({
            status: 'success',
            data: { buses }
        });
    } catch (err) {
        console.error('Get buses error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch buses'
        });
    }
};

export const getBusById = async (req, res) => {
    try {
        const { busId } = req.params;
        const bus = await busModel.getBusById(busId);
        res.status(200).json({
            status: 'success',
            data: { bus }
        });
    } catch (err) {
        console.error('Get bus by ID error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch bus by ID'
        });
    }
};

export const updateBus = async (req, res) => {
    try {
        const { busId } = req.params;
        const updatedBus = await busModel.updateBus(busId, req.body);
        res.status(200).json({
            status: 'success',
            data: { bus: updatedBus },
            message: 'Bus updated successfully'
        });
    } catch (err) {
        console.error('Update bus error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update bus'
        });
    }
};

export const updateBusStatus = async (req, res) => {
    try {
        const { busId } = req.params;   
        const { status } = req.body;
        const updatedBus = await busModel.updateBusStatus(busId, status);
        res.status(200).json({
            status: 'success',
            data: { bus: updatedBus },
            message: 'Bus status updated successfully'
        });
    } catch (err) {

        console.error('Update bus status error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update bus status'
        });
    }
};

export const deleteBus = async (req, res) => {
    try {
        const { busId } = req.params;
        await busModel.deleteBus(busId);
        res.status(200).json({
            status: 'success',
            message: 'Bus deleted successfully'
        });
    } catch (err) {
        console.error('Delete bus error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete bus'
        });
    }
};

// Route Management
export const createRoute = async (req, res) => {
    try {
        const { 
            route_name, 
            start_location, 
            end_location, 
            distance, 
            estimated_time 
        } = req.body;

        // Create start location if it doesn't exist
        let start_location_id;
        if (typeof start_location === 'object') {
            start_location_id = await routeModel.createLocation(start_location);
        } else {
            start_location_id = start_location;
        }

        // Create end location if it doesn't exist
        let end_location_id;
        if (typeof end_location === 'object') {
            end_location_id = await routeModel.createLocation(end_location);
        } else {
            end_location_id = end_location;
        }

        // Create the route with the location IDs
        const routeId = await routeModel.createRoute({
            route_name,
            start_location_id,
            end_location_id,
            distance,
            estimated_time
        });

        const route = await routeModel.getRouteById(routeId);
        res.status(201).json({
            status: 'success',
            data: { route }
        });
    } catch (err) {
        console.error('Create route error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create route',
            details: err.message
        });
    }
};

export const getAllRoutes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const routes = await routeModel.getAllRoutes(parseInt(page), parseInt(limit));
        res.status(200).json({
            status: 'success',
            data: { routes }
        });
    } catch (err) {
        console.error('Get routes error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch routes'
        });
    }
};

export const getRouteById = async (req, res) => {
    try {
        const { routeId } = req.params;
        const route = await routeModel.getRouteById(routeId);
        res.status(200).json({
            status: 'success',
            data: { route }
        });
    } catch (err) {
        console.error('Get route by ID error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch route by ID'
        });
    }
};

export const updateRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const updatedRoute = await routeModel.updateRoute(routeId, req.body);
        res.status(200).json({
            status: 'success',
            data: { route: updatedRoute },
            message: 'Route updated successfully'
        });
    } catch (err) {
        console.error('Update route error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update route'
        });
    }
};

export const deleteRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        await routeModel.deleteRoute(routeId);
        res.status(200).json({

            status: 'success',
            message: 'Route deleted successfully'
        });
    } catch (err) {
        console.error('Delete route error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete route'
        });
    }
};

// Schedule Management
export const createSchedule = async (req, res) => {
    try {
        const scheduleId = await scheduleModel.createSchedule(req.body);
        const schedule = await scheduleModel.getScheduleById(scheduleId);
        res.status(201).json({
            status: 'success',
            data: { schedule }
        });
    } catch (err) {
        console.error('Create schedule error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create schedule'
        });
    }
};

export const getAllSchedules = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const schedules = await scheduleModel.getAllSchedules(parseInt(page), parseInt(limit));
        res.status(200).json({
            status: 'success',
            data: { schedules }
        });
    } catch (err) {
        console.error('Get schedules error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch schedules'
        });
    }
};

export const getScheduleById = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await scheduleModel.getScheduleById(scheduleId);
        res.status(200).json({
            status: 'success',
            data: { schedule }
        });
    } catch (err) {
        console.error('Get schedule by ID error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch schedule by ID'
        });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const updatedSchedule = await scheduleModel.updateSchedule(scheduleId, req.body);
        res.status(200).json({
            status: 'success',
            data: { schedule: updatedSchedule },
            message: 'Schedule updated successfully'
        });
    } catch (err) {
        console.error('Update schedule error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update schedule'
        });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        await scheduleModel.deleteSchedule(scheduleId);
        res.status(200).json({
            status: 'success',
            message: 'Schedule deleted successfully'
        });
    } catch (err) {
        console.error('Delete schedule error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete schedule'
        });
    }
};


export const weeklySchedule = async (req, res) => {
    try {
        const { week } = req.params;
        const schedule = await scheduleModel.getWeeklySchedule(week);
        res.status(200).json({
            status: 'success',
            data: { schedule }
        });
    } catch (err) {
        console.error('Get weekly schedule error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get weekly schedule'
        });
    }
};


// Student Management
export const createStudent = async (req, res) => {
    try {
        const studentData = {
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            grade: req.body.grade,
            school: req.body.school,
            parent_name: req.body.parentName,
            parent_phone: req.body.parentPhone,
            emergency_contact: req.body.emergencyContact,
            emergency_phone: req.body.emergencyPhone,
            status: 'active'
        };

        const studentId = await studentModel.createStudent(studentData);
        const student = await studentModel.getStudentById(studentId);

        res.status(201).json({
            status: 'success',
            data: { student }
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to create student' 
        });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { students, total } = await studentModel.getAllStudents(page, limit);
        
        res.status(200).json({
            status: 'success',
            data: {
                students,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch students' 
        });
    }
};

export const getRecentStudents = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const students = await studentModel.getRecentStudents(limit);
        
        res.status(200).json({
            status: 'success',
            data: { students }
        });
    } catch (error) {
        console.error('Error fetching recent students:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch recent students' 
        });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await studentModel.getStudentById(studentId);
        
        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Student not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { student }
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch student' 
        });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const studentData = {
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            grade: req.body.grade,
            school: req.body.school,
            parent_name: req.body.parentName,
            parent_phone: req.body.parentPhone,
            emergency_contact: req.body.emergencyContact,
            emergency_phone: req.body.emergencyPhone
        };

        await studentModel.updateStudent(studentId, studentData);
        const student = await studentModel.getStudentById(studentId);
        
        res.status(200).json({
            status: 'success',
            data: { student }
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to update student' 
        });
    }
};

export const updateStudentStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status } = req.body;
        
        await studentModel.updateStudentStatus(studentId, status);
        const student = await studentModel.getStudentById(studentId);
        
        res.status(200).json({
            status: 'success',
            data: { student }
        });
    } catch (error) {
        console.error('Error updating student status:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to update student status' 
        });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        await studentModel.deleteStudent(studentId);
        
        res.status(200).json({
            status: 'success',
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to delete student' 
        });
    }
};

// Payment Management
export const createPayment = async (req, res) => {
    try {
        const paymentData = {
            student_id: req.body.studentId,
            amount: req.body.amount,
            payment_date: req.body.paymentDate,
            payment_method: req.body.paymentMethod,
            payment_type: req.body.paymentType,
            status: 'pending',
            description: req.body.description
        };

        const paymentId = await paymentModel.createPayment(paymentData);
        const payment = await paymentModel.getPaymentById(paymentId);
        
        res.status(201).json({
            status: 'success',
            data: { payment }
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to create payment' 
        });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { payments, total } = await paymentModel.getAllPayments(page, limit);
        
        res.status(200).json({
            status: 'success',
            data: {
                payments,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch payments' 
        });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await paymentModel.getPaymentById(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { payment }
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch payment' 
        });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const paymentData = {
            amount: req.body.amount,
            payment_date: req.body.paymentDate,
            payment_method: req.body.paymentMethod,
            payment_type: req.body.paymentType,
            description: req.body.description
        };

        await paymentModel.updatePayment(paymentId, paymentData);
        const payment = await paymentModel.getPaymentById(paymentId);
        
        res.status(200).json({
            status: 'success',
            data: { payment }
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to update payment' 
        });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;
        
        await paymentModel.updatePaymentStatus(paymentId, status);
        const payment = await paymentModel.getPaymentById(paymentId);
        
        res.status(200).json({
            status: 'success',
            data: { payment }
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to update payment status' 
        });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        await paymentModel.deletePayment(paymentId);
        
        res.status(200).json({
            status: 'success',
            message: 'Payment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to delete payment' 
        });
    }
};

// Location Tracking
export const getActiveLocations = async (req, res) => {
    try {
        const locations = await locationModel.getActiveLocations();
        
        res.status(200).json({
            status: 'success',
            data: { locations }
        });
    } catch (error) {
        console.error('Error fetching active locations:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch active locations' 
        });
    }
};

export const getBusLocation = async (req, res) => {
    try {
        const { busId } = req.params;
        const location = await locationModel.getBusLocation(busId);
        
        if (!location) {
            return res.status(404).json({
                status: 'error',
                message: 'Bus location not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { location }
        });
    } catch (error) {
        console.error('Error fetching bus location:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch bus location' 
        });
    }
};

export const getBusLocationHistory = async (req, res) => {
    try {
        const { busId } = req.params;
        const { startDate, endDate } = req.query;
        
        const history = await locationModel.getBusLocationHistory(busId, startDate, endDate);
        
        res.status(200).json({
            status: 'success',
            data: { history }
        });
    } catch (error) {
        console.error('Error fetching bus location history:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch bus location history' 
        });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const connection = await connectToDatabase();
        
        // Get bus stats
        const [busStats] = await connection.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
            FROM buses`
        );
        
        // Get route stats
        const [routeStats] = await connection.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive
            FROM routes`
        );
        
        // Get schedule stats
        const [scheduleStats] = await connection.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
                SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM schedules`
        );
        
        // Get student stats
        const [studentStats] = await connection.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
            FROM students`
        );
        
        // Get payment stats
        const [paymentStats] = await connection.query(
            `SELECT 
                COUNT(*) as total,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
            FROM payments`
        );
        
        // Get recent payments (last 5)
        const [recentPayments] = await connection.query(
            `SELECT p.*, s.first_name, s.last_name 
             FROM payments p
             JOIN students s ON p.student_id = s.id
             ORDER BY p.created_at DESC 
             LIMIT 5`
        );
        
        // Get upcoming schedules (next 5)
        const [upcomingSchedules] = await connection.query(
            `SELECT s.*, r.route_name, b.bus_nickname 
             FROM schedules s
             JOIN routes r ON s.route_id = r.id
             JOIN buses b ON s.bus_id = b.id
             WHERE s.departure_time > NOW() AND s.status = 'scheduled'
             ORDER BY s.departure_time ASC
             LIMIT 5`
        );
        
        return res.status(200).json({
            status: 'success',
            data: {
                buses: busStats[0],
                routes: routeStats[0],
                schedules: scheduleStats[0],
                students: studentStats[0],
                payments: paymentStats[0],
                recentPayments,
                upcomingSchedules
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get dashboard statistics'
        });
    }
};

export const getRevenueStats = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const connection = await connectToDatabase();
        
        let query;
        let groupBy;
        
        switch(period) {
            case 'daily':
                groupBy = 'DATE(payment_date)';
                break;
            case 'weekly':
                groupBy = 'YEARWEEK(payment_date, 1)';
                break;
            case 'monthly':
            default:
                groupBy = 'YEAR(payment_date), MONTH(payment_date)';
                break;
        }
        
        query = `
            SELECT 
                ${period === 'weekly' ? 'CONCAT(YEAR(payment_date), "-W", WEEK(payment_date, 1))' : 
                  period === 'daily' ? 'DATE(payment_date)' : 
                  'CONCAT(YEAR(payment_date), "-", MONTH(payment_date))'} as period,
                SUM(amount) as revenue,
                COUNT(*) as count
            FROM payments
            WHERE status = 'completed' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 ${period === 'daily' ? 'DAY' : period === 'weekly' ? 'WEEK' : 'MONTH'})
            GROUP BY ${groupBy}
            ORDER BY payment_date ASC
        `;
        
        const [revenueData] = await connection.query(query);
        
        return res.status(200).json({
            status: 'success',
            data: {
                period,
                revenue: revenueData
            }
        });
        
    } catch (error) {
        console.error('Error getting revenue stats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get revenue statistics'
        });
    }
};

export const getMaintenanceStats = async (req, res) => {
    try {
        const connection = await connectToDatabase();
        
        // Get buses that need maintenance soon (next 7 days)
        const [upcomingMaintenance] = await connection.query(
            `SELECT * FROM buses
             WHERE next_maintenance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
             ORDER BY next_maintenance_date ASC`
        );
        
        // Get buses currently in maintenance
        const [inMaintenance] = await connection.query(
            `SELECT * FROM buses
             WHERE status = 'maintenance'
             ORDER BY last_maintenance_date DESC`
        );
        
        return res.status(200).json({
            status: 'success',
            data: {
                upcomingMaintenance,
                inMaintenance
            }
        });
    } catch (error) {
        console.error('Error getting maintenance stats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get maintenance statistics'
        });
    }
};



