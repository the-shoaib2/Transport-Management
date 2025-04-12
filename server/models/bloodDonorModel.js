import { pool } from './database.js';

// Create a new blood donor
export const createDonor = async (donorData) => {
    const { name, email, phone, blood_group } = donorData;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Generate UUID
        const [uuidResult] = await connection.query('SELECT UUID() as uuid');
        const id = uuidResult[0].uuid;

        // Insert donor
        const insertQuery = `
            INSERT INTO blood_donors (id, name, email, phone, blood_group)
            VALUES (?, ?, ?, ?, ?)
        `;
        await connection.query(insertQuery, [id, name, email, phone, blood_group]);

        // Get the created donor
        const [donor] = await connection.query(
            'SELECT * FROM blood_donors WHERE id = ?',
            [id]
        );

        await connection.commit();
        return donor[0];
    } catch (error) {
        await connection.rollback();
        console.error('Error creating blood donor:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Get all blood donors
export const getAllDonors = async () => {
    const query = `
        SELECT * FROM blood_donors
        WHERE is_active = TRUE
        ORDER BY created_at DESC
    `;
    
    try {
        const [donors] = await pool.query(query);
        return donors;
    } catch (error) {
        console.error('Error fetching blood donors:', error);
        throw error;
    }
};

// Search blood donors
export const searchDonors = async (searchParams) => {
    const { name, email, blood_group } = searchParams;
    let query = `
        SELECT * FROM blood_donors
        WHERE is_active = TRUE
    `;
    const params = [];

    if (name) {
        query += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }
    if (email) {
        query += ' AND email LIKE ?';
        params.push(`%${email}%`);
    }
    if (blood_group) {
        query += ' AND blood_group = ?';
        params.push(blood_group);
    }

    query += ' ORDER BY created_at DESC';

    try {
        const [donors] = await pool.query(query, params);
        return donors;
    } catch (error) {
        console.error('Error searching blood donors:', error);
        throw error;
    }
};

// Get blood donor by ID
export const getDonorById = async (donorId) => {
    const query = `
        SELECT * FROM blood_donors
        WHERE id = ? AND is_active = TRUE
    `;
    
    try {
        const [donors] = await pool.query(query, [donorId]);
        return donors[0] || null;
    } catch (error) {
        console.error('Error fetching blood donor:', error);
        throw error;
    }
};

// Update blood donor
export const updateDonor = async (donorId, donorData) => {
    const { name, email, phone, blood_group } = donorData;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const updateQuery = `
            UPDATE blood_donors
            SET name = ?, email = ?, phone = ?, blood_group = ?
            WHERE id = ? AND is_active = TRUE
        `;
        await connection.query(updateQuery, [name, email, phone, blood_group, donorId]);

        const [donor] = await connection.query(
            'SELECT * FROM blood_donors WHERE id = ?',
            [donorId]
        );

        await connection.commit();
        return donor[0] || null;
    } catch (error) {
        await connection.rollback();
        console.error('Error updating blood donor:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Soft delete blood donor
export const deleteDonor = async (donorId) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const updateQuery = `
            UPDATE blood_donors
            SET is_active = FALSE
            WHERE id = ?
        `;
        await connection.query(updateQuery, [donorId]);

        const [donor] = await connection.query(
            'SELECT * FROM blood_donors WHERE id = ?',
            [donorId]
        );

        await connection.commit();
        return donor[0] || null;
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting blood donor:', error);
        throw error;
    } finally {
        connection.release();
    }
};