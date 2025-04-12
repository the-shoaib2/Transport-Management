import { connectToDatabase } from '../database/mysql.js';
import { v4 as uuidv4 } from 'uuid';

export const createPayment = async (paymentData) => {
    const { 
        student_id,
        amount, 
        payment_date, 
        payment_method, 
        payment_type, 
        description,
        status = 'pending'
    } = paymentData;

    // Validate required fields
    if (!student_id || !amount || !payment_date || !payment_method || !payment_type) {
        throw new Error('Missing required fields');
    }

    const id = uuidv4();
    const pool = await connectToDatabase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(
            `INSERT INTO payments (
                id, student_id, amount, payment_date, payment_method, 
                payment_type, description, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, student_id, amount, payment_date, payment_method,
                payment_type, description, status
            ]
        );
        return id;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const getAllPayments = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const pool = connectToDatabase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [payments] = await connection.query(
            `SELECT p.*, s.first_name, s.last_name 
             FROM payments p
             JOIN students s ON p.student_id = s.id
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        const [total] = await connection.query('SELECT COUNT(*) as total FROM payments');
        return { payments, total: total[0].total };
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const getPaymentById = async (id) => {
    const pool = await connectToDatabase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [payments] = await connection.query(
            `SELECT p.*, s.first_name, s.last_name 
             FROM payments p
             JOIN students s ON p.student_id = s.id
             WHERE p.id = ?`,
            [id]
        );
        return payments[0];
    } catch (error) {
        console.error('Error fetching payment by ID:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const updatePayment = async (id, paymentData) => {
    const { 
        student_id,
        amount, 
        payment_date, 
        payment_method, 
        payment_type, 
        description,
        status
    } = paymentData;

    const connection = await connectToDatabase();
    try {
        await connection.query(
            `UPDATE payments SET 
                student_id = ?,
                amount = ?, 
                payment_date = ?, 
                payment_method = ?, 
                payment_type = ?, 
                description = ?,
                status = ?
            WHERE id = ?`,
            [
                student_id,
                amount, 
                payment_date, 
                payment_method, 
                payment_type, 
                description,
                status,
                id
            ]
        );
        return await getPaymentById(id);
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
};

export const updatePaymentStatus = async (id, status) => {
    const pool = connectToDatabase();
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Model updatePaymentStatus called with:', { id, status }); // Debug log

        if (!id) {
            throw new Error('Payment ID is required');
        }

        if (!status) {
            throw new Error('Status is required');
        }

        // Check if payment exists
        const [existingPayment] = await connection.query(
            'SELECT * FROM payments WHERE id = ?',
            [id]
        );

        if (existingPayment.length === 0) {
            throw new Error('Payment not found');
        }

        // Validate status against enum values
        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(status.toLowerCase())) {
            throw new Error('Invalid payment status');
        }

        // Update payment status
        await connection.query(
            'UPDATE payments SET status = ? WHERE id = ?',
            [status.toLowerCase(), id]
        );

        // Get updated payment with student details
        const [updatedPayment] = await connection.query(
            `SELECT p.*, s.first_name, s.last_name 
             FROM payments p
             JOIN students s ON p.student_id = s.id
             WHERE p.id = ?`,
            [id]
        );

        return updatedPayment[0];
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const deletePayment = async (id) => {
    const connection = await connectToDatabase();
    await connection.query('DELETE FROM payments WHERE id = ?', [id]);
    return true;
};

export const getStudentPayments = async (studentId) => {
    const pool = await connectToDatabase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [payments] = await connection.query(
            'SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC',
            [studentId]
        );
        return payments;
    } catch (error) {
        console.error('Error fetching student payments:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export const getPaymentTypes = async () => {
    const pool = await connectToDatabase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [types] = await connection.query('SELECT * FROM payment_types');
        return types;
    } catch (error) {
        console.error('Error fetching payment types:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}; 