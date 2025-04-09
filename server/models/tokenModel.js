import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '../database/mysql.js';

export const createToken = async (tokenData) => {
    const { user_id, token, expires_at } = tokenData;
    
    const query = `
        INSERT INTO user_tokens (id, user_id, token, expires_at)
        VALUES (?, ?, ?, ?)
    `;
    
    const values = [uuidv4(), user_id, token, expires_at];
    
    try {
        const connection = await connectToDatabase();
        await connection.query(query, values);
        return true;
    } catch (error) {
        console.error('Error creating token:', error);
        throw error;
    }
};

export const deactivateToken = async (token) => {
    const query = `
        UPDATE user_tokens
        SET is_active = FALSE
        WHERE token = ? AND is_active = TRUE
    `;
    
    try {
        const connection = await connectToDatabase();
        await connection.query(query, [token]);
        return true;
    } catch (error) {
        console.error('Error deactivating token:', error);
        throw error;
    }
};

export const validateToken = async (token) => {
    const query = `
        SELECT * FROM user_tokens
        WHERE token = ? AND is_active = TRUE AND expires_at > NOW()
    `;
    
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query(query, [token]);
        return rows.length > 0;
    } catch (error) {
        console.error('Error validating token:', error);
        throw error;
    }
};

export const getActiveTokensByUserId = async (userId) => {
    const query = `
        SELECT * FROM user_tokens
        WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
    `;
    
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query(query, [userId]);
        return rows;
    } catch (error) {
        console.error('Error getting active tokens:', error);
        throw error;
    }
};

export const cleanupExpiredTokens = async () => {
    const query = `
        UPDATE user_tokens
        SET is_active = FALSE
        WHERE expires_at <= NOW()
    `;
    
    try {
        const connection = await connectToDatabase();
        await connection.query(query);
        return true;
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
        throw error;
    }
}; 