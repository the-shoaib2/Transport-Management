import { connectToDatabase } from '../database/mysql.js';

export const findUserByEmail = async (email) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT u.id, u.firstName, u.lastName, u.username, u.email, u.password, u.phone, u.address, u.is_active, u.last_login, u.created_at, u.updated_at, r.role_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.email = ?
    `, [email]);
    return rows[0];
};

export const findUserById = async (id) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT u.id, u.firstName, u.lastName, u.username, u.email, u.phone, u.address, u.is_active, u.last_login, u.created_at, u.updated_at, r.role_name
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
    `, [id]);
    return rows[0];
};

export const createUser = async (userData) => {
    const db = await connectToDatabase();
    const { firstName, lastName, username, email, hashedPassword, role_id } = userData;
    const [result] = await db.query(
        `INSERT INTO users (firstName, lastName, username, email, password, role_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, username, email, hashedPassword, role_id]
    );
    return result.insertId;
};

export const updateUser = async (id, userData) => {
    const db = await connectToDatabase();
    const { username, email, phone, address } = userData;
    await db.query(
        `UPDATE users 
         SET username = ?, email = ?, phone = ?, address = ? 
         WHERE id = ?`,
        [username, email, phone, address, id]
    );
    return true;
};

export const deleteUser = async (id) => {
    const db = await connectToDatabase();
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
};

export const getAllUsers = async (page = 1, limit = 10) => {
    const db = await connectToDatabase();
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`
        SELECT u.id, u.firstName, u.lastName, u.username, u.email, u.phone, u.address, u.is_active, u.last_login, u.created_at, u.updated_at, r.role_name
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
};

export const getUsersByRole = async (roleId) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT u.id, u.firstName, u.lastName, u.username, u.email, u.phone, u.address, u.is_active, u.last_login, u.created_at, u.updated_at, r.role_name
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.role_id = ?
    `, [roleId]);
    return rows;
};

export const updateLastLogin = async (userId) => {
    const db = await connectToDatabase();
    await db.query(
        `UPDATE users 
         SET last_login = NOW() 
         WHERE id = ?`,
        [userId]
    );
    return true;
}; 