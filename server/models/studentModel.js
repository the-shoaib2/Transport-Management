import { connectToDatabase } from '../database/mysql.js';
import { v4 as uuidv4 } from 'uuid';

export const createStudent = async (studentData) => {
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        address, 
        grade, 
        school, 
        parentName, 
        parentPhone, 
        emergencyContact, 
        emergencyPhone 
    } = studentData;

    const id = uuidv4();
    const connection = await connectToDatabase();
    const [result] = await connection.query(
        `INSERT INTO students (
            id, first_name, last_name, email, phone, address, 
            grade, school, parent_name, parent_phone, 
            emergency_contact, emergency_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, firstName, lastName, email, phone, address,
            grade, school, parentName, parentPhone,
            emergencyContact, emergencyPhone
        ]
    );
    return id;
};

export const getAllStudents = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const connection = await connectToDatabase();
    const [students] = await connection.query(
        'SELECT * FROM students ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
    const [total] = await connection.query('SELECT COUNT(*) as total FROM students');
    return { students, total: total[0].total };
};

export const getStudentById = async (id) => {
    const connection = await connectToDatabase();
    const [students] = await connection.query('SELECT * FROM students WHERE id = ?', [id]);
    return students[0];
};

export const updateStudent = async (id, studentData) => {
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        address, 
        grade, 
        school, 
        parentName, 
        parentPhone, 
        emergencyContact, 
        emergencyPhone,
        status 
    } = studentData;

    const connection = await connectToDatabase();
    await connection.query(
        `UPDATE students SET 
            first_name = ?, last_name = ?, email = ?, phone = ?, address = ?,
            grade = ?, school = ?, parent_name = ?, parent_phone = ?,
            emergency_contact = ?, emergency_phone = ?, status = ?
        WHERE id = ?`,
        [
            firstName, lastName, email, phone, address,
            grade, school, parentName, parentPhone,
            emergencyContact, emergencyPhone, status, id
        ]
    );
    return true;
};

export const updateStudentStatus = async (id, status) => {
    const connection = await connectToDatabase();
    await connection.query(
        'UPDATE students SET status = ? WHERE id = ?',
        [status, id]
    );
    return true;
};

export const deleteStudent = async (id) => {
    const connection = await connectToDatabase();
    await connection.query('DELETE FROM students WHERE id = ?', [id]);
    return true;
};

export const createPayment = async (studentId, paymentData) => {
    const { 
        amount, 
        paymentDate, 
        paymentMethod, 
        paymentType, 
        description 
    } = paymentData;

    const id = uuidv4();
    const connection = await connectToDatabase();
    const [result] = await connection.query(
        `INSERT INTO payments (
            id, student_id, amount, payment_date, 
            payment_method, payment_type, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, studentId, amount, paymentDate, paymentMethod, paymentType, description]
    );
    return id;
};

export const getStudentPayments = async (studentId) => {
    const connection = await connectToDatabase();
    const [payments] = await connection.query(
        'SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC',
        [studentId]
    );
    return payments;
};

export const getPaymentStatus = async (studentId) => {
    const connection = await connectToDatabase();
    const [status] = await connection.query(
        `SELECT 
            status, 
            COUNT(*) as count,
            SUM(amount) as total_amount
        FROM payments 
        WHERE student_id = ? 
        GROUP BY status`,
        [studentId]
    );
    return status;
};

export const updatePayment = async (paymentId, paymentData) => {
    const { 
        amount, 
        paymentDate, 
        paymentMethod, 
        paymentType, 
        status, 
        description 
    } = paymentData;

    const connection = await connectToDatabase();
    await connection.query(
        `UPDATE payments SET 
            amount = ?, payment_date = ?, payment_method = ?,
            payment_type = ?, status = ?, description = ?
        WHERE id = ?`,
        [amount, paymentDate, paymentMethod, paymentType, status, description, paymentId]
    );
    return true;
};

export const deletePayment = async (paymentId) => {
    const connection = await connectToDatabase();
    await connection.query('DELETE FROM payments WHERE id = ?', [paymentId]);
    return true;
}; 