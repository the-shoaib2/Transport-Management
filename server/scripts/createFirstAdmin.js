import bcrypt from 'bcrypt';
import { connectToDatabase } from '../lib/db.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, DEFAULT_ADMIN } from '../constants.js';

// Load environment variables
dotenv.config();

const createFirstAdmin = async () => {
    try {
        const db = await connectToDatabase();
        
        // Check if any admin already exists
        const [admins] = await db.query(
            `SELECT * FROM users WHERE role_id = ?`,
            [ROLES.ADMIN]
        );
        
        if (admins && admins.length > 0) {
            console.log('Admin already exists. Skipping creation.');
            process.exit(0);
        }
        
        // Create the first admin user with UUID
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
        
        await db.query(
            `INSERT INTO users (id, firstName, lastName, username, email, password, role_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                DEFAULT_ADMIN.firstName, 
                DEFAULT_ADMIN.lastName, 
                DEFAULT_ADMIN.username, 
                DEFAULT_ADMIN.email, 
                hashedPassword, 
                ROLES.ADMIN
            ]
        );
        
        console.log('First admin user created successfully!');
        console.log('User ID:', userId);
        console.log('Email:', DEFAULT_ADMIN.email);
        console.log('Password:', DEFAULT_ADMIN.password);
        console.log('Please change these credentials after first login.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error creating first admin:', err);
        process.exit(1);
    }
};

createFirstAdmin(); 