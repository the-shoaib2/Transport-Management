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
        // const { page = 1, limit = 1000 } = req.query;
        const buses = await busModel.getAllBuses();
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

        // Validate required fields
        if (!route_name || !start_location || !end_location || !distance || !estimated_time) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: route_name, start_location, end_location, distance, and estimated_time are required'
            });
        }

        // Validate location objects
        if (!start_location.name || !start_location.latitude || !start_location.longitude || !start_location.type) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid start location data'
            });
        }

        if (!end_location.name || !end_location.latitude || !end_location.longitude || !end_location.type) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid end location data'
            });
        }

        // Create the route with location objects
        const route = await routeModel.createRoute({
            route_name,
            start_location,
            end_location,
            distance,
            estimated_time
        });

        res.status(201).json({
            status: 'success',
            data: { route }
        });
    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create route'
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
        const routeData = req.body;

        // Validate route ID
        if (!routeId) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid route ID is required'
            });
        }

        // Validate numeric fields if they are provided
        if (routeData.distance !== undefined && isNaN(routeData.distance)) {
            return res.status(400).json({
                status: 'error',
                message: 'Distance must be a number'
            });
        }

        if (routeData.estimated_time !== undefined && isNaN(routeData.estimated_time)) {
            return res.status(400).json({
                status: 'error',
                message: 'Estimated time must be a number'
            });
        }

        // Validate location format if provided
        if (routeData.start_location_id !== undefined && !routeData.start_location_id.includes(',')) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid start location format. Expected format: latitude,longitude'
            });
        }

        if (routeData.end_location_id !== undefined && !routeData.end_location_id.includes(',')) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid end location format. Expected format: latitude,longitude'
            });
        }

        const updatedRoute = await routeModel.updateRoute(routeId, routeData);
        
        if (!updatedRoute) {
            return res.status(404).json({
                status: 'error',
                message: 'Route not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { route: updatedRoute }
        });
    } catch (error) {
        console.error('Error updating route:', error);
        if (error.message === 'Route not found') {
            return res.status(404).json({
                status: 'error',
                message: 'Route not found'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Failed to update route'
        });
    }
};

export const updateRouteStatus = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { status } = req.body;
        await routeModel.updateRouteStatus(routeId, status);
        const route = await routeModel.getRouteById(routeId);
        res.status(200).json({
            status: 'success',
            data: { route },
            message: 'Route status updated successfully'
        });
    } catch (err) {
        console.error('Update route status error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update route status'
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
        const {
            first_name,
            last_name,
            email,
            phone,
            address,
            grade,
            school,
            parent_name,
            parent_phone,
            emergency_contact,
            emergency_phone,
            status = 'active'
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !phone || !address || !grade || !school) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: first_name, last_name, email, phone, address, grade, and school are required'
            });
        }

        // Validate field types
        if (typeof first_name !== 'string' || typeof last_name !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'First name and last name must be strings'
            });
        }

        const studentData = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            grade: grade.trim(),
            school: school.trim(),
            parent_name: parent_name ? parent_name.trim() : null,
            parent_phone: parent_phone ? parent_phone.trim() : null,
            emergency_contact: emergency_contact ? emergency_contact.trim() : null,
            emergency_phone: emergency_phone ? emergency_phone.trim() : null,
            status
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
        const {
            student_id,
            amount,
            payment_date,
            payment_method,
            payment_type,
            description
        } = req.body;

        // Check if student exists
        const student = await studentModel.getStudentById(student_id);
        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Student not found'
            });
        }

        const paymentData = {
            student_id,
            amount: parseFloat(amount),
            payment_date,
            payment_method: payment_method.toLowerCase(),
            payment_type: payment_type.toLowerCase(),
            status: 'pending',
            description: description || null
        };

        const paymentId = await paymentModel.createPayment(paymentData);
        const payment = await paymentModel.getPaymentById(paymentId);

        res.status(201).json({
            status: 'success',
            data: { payment },
            message: 'Payment created successfully'
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
        const paymentData = req.body;

        const updatedPayment = await paymentModel.updatePayment(paymentId, paymentData);
        res.status(200).json({
            status: 'success',
            data: { payment: updatedPayment },
            message: 'Payment updated successfully'
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

       

        const updatedPayment = await paymentModel.updatePaymentStatus(paymentId, status);

        if (!updatedPayment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                payment: updatedPayment
            }
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update payment status'
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
        
        // Get total counts
        const [buses] = await connection.query('SELECT COUNT(*) as total FROM buses');
        const [routes] = await connection.query('SELECT COUNT(*) as total FROM routes');
        const [schedules] = await connection.query('SELECT COUNT(*) as total FROM schedules');
        const [students] = await connection.query('SELECT COUNT(*) as total FROM students');
        const [payments] = await connection.query('SELECT COUNT(*) as total FROM payments');
        
        // Get active counts
        const [activeBuses] = await connection.query("SELECT COUNT(*) as total FROM buses WHERE status = 'active'");
        const [activeRoutes] = await connection.query("SELECT COUNT(*) as total FROM routes WHERE is_active = true");
        const [activeSchedules] = await connection.query("SELECT COUNT(*) as total FROM schedules WHERE status = 'scheduled'");
        const [activeStudents] = await connection.query("SELECT COUNT(*) as total FROM students WHERE status = 'active'");
        const [completedPayments] = await connection.query("SELECT COUNT(*) as total FROM payments WHERE status = 'completed'");
        
        // Get recent payments
        const [recentPayments] = await connection.query(`
            SELECT p.*, s.first_name, s.last_name 
            FROM payments p
            JOIN students s ON p.student_id = s.id
            ORDER BY p.created_at DESC 
            LIMIT 5
        `);
        
        // Get upcoming schedules
        const [upcomingSchedules] = await connection.query(`
            SELECT s.*, r.route_name, b.bus_nickname 
            FROM schedules s
            JOIN routes r ON s.route_id = r.id
            JOIN buses b ON s.bus_id = b.id
            WHERE s.departure_time > NOW() AND s.status = 'scheduled'
            ORDER BY s.departure_time ASC
            LIMIT 5
        `);
        
        res.status(200).json({
            status: 'success',
            data: {
                overview: {
                    buses: {
                        total: buses[0].total,
                        active: activeBuses[0].total
                    },
                    routes: {
                        total: routes[0].total,
                        active: activeRoutes[0].total
                    },
                    schedules: {
                        total: schedules[0].total,
                        active: activeSchedules[0].total
                    },
                    students: {
                        total: students[0].total,
                        active: activeStudents[0].total
                    },
                    payments: {
                        total: payments[0].total,
                        completed: completedPayments[0].total
                    }
                },
                recentPayments,
                upcomingSchedules
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get dashboard statistics'
        });
    }
};

export const getRevenueStats = async (req, res) => {
    try {
        const connection = await connectToDatabase();
        
        // Get monthly revenue
        const [monthlyRevenue] = await connection.query(`
            SELECT 
                DATE_FORMAT(payment_date, '%Y-%m') as month,
                SUM(amount) as total
            FROM payments
            WHERE status = 'completed'
            GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6
        `);
        
        // Get payment methods distribution
        const [paymentMethods] = await connection.query(`
            SELECT 
                payment_method,
                COUNT(*) as count,
                SUM(amount) as total
            FROM payments
            WHERE status = 'completed'
            GROUP BY payment_method
        `);
        
        res.status(200).json({
            status: 'success',
            data: {
                monthlyRevenue,
                paymentMethods
            }
        });
    } catch (error) {
        console.error('Error getting revenue stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get revenue statistics'
        });
    }
};

export const getMaintenanceStats = async (req, res) => {
    try {
        const connection = await connectToDatabase();
        
        // Get buses needing maintenance
        const [maintenanceNeeded] = await connection.query(`
            SELECT * FROM buses
            WHERE next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY next_maintenance_date ASC
            LIMIT 5
        `);
        
        // Get maintenance history
        const [maintenanceHistory] = await connection.query(`
            SELECT 
                b.bus_nickname,
                b.last_maintenance_date,
                b.next_maintenance_date
            FROM buses b
            WHERE b.last_maintenance_date IS NOT NULL
            ORDER BY b.last_maintenance_date DESC
            LIMIT 5
        `);
        
        res.status(200).json({
            status: 'success',
            data: {
                maintenanceNeeded,
                maintenanceHistory
            }
        });
    } catch (error) {
        console.error('Error getting maintenance stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get maintenance statistics'
        });
    }
};



