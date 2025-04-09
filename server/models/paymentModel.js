import { connectToDatabase } from '../database/mysql.js';
import { v4 as uuidv4 } from 'uuid';

export const createPayment = async (paymentData) => {
    const { 
        studentId,
        amount, 
        paymentDate, 
        paymentMethod, 
        paymentType, 
        description,
        status = 'pending'
    } = paymentData;

    const id = uuidv4();
    const connection = await connectToDatabase();
    const [result] = await connection.query(
        `INSERT INTO payments (
            id, student_id, amount, payment_date, payment_method, 
            payment_type, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, studentId, amount, paymentDate, paymentMethod,
            paymentType, description, status
        ]
    );
    return id;
};

export const getAllPayments = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const connection = await connectToDatabase();
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
};

export const getPaymentById = async (id) => {
    const connection = await connectToDatabase();
    const [payments] = await connection.query(
        `SELECT p.*, s.first_name, s.last_name 
         FROM payments p
         JOIN students s ON p.student_id = s.id
         WHERE p.id = ?`,
        [id]
    );
    return payments[0];
};

export const updatePayment = async (id, paymentData) => {
    const { 
        amount, 
        paymentDate, 
        paymentMethod, 
        paymentType, 
        description,
        status
    } = paymentData;

    const connection = await connectToDatabase();
    await connection.query(
        `UPDATE payments SET 
            amount = ?, payment_date = ?, payment_method = ?, 
            payment_type = ?, description = ?, status = ?
        WHERE id = ?`,
        [
            amount, paymentDate, paymentMethod,
            paymentType, description, status, id
        ]
    );
    return true;
};

export const updatePaymentStatus = async (id, status) => {
    const connection = await connectToDatabase();
    await connection.query(
        'UPDATE payments SET status = ? WHERE id = ?',
        [status, id]
    );
    return true;
};

export const deletePayment = async (id) => {
    const connection = await connectToDatabase();
    await connection.query('DELETE FROM payments WHERE id = ?', [id]);
    return true;
};

export const getStudentPayments = async (studentId) => {
    const connection = await connectToDatabase();
    const [payments] = await connection.query(
        'SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC',
        [studentId]
    );
    return payments;
};

export const getPaymentTypes = async () => {
    const connection = await connectToDatabase();
    const [types] = await connection.query('SELECT * FROM payment_types');
    return types;
}; 