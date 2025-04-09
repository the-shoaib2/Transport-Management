import { connectToDatabase } from '../lib/db.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '../constants.js';

// Load environment variables
dotenv.config();

const setupRoles = async () => {
    try {
        const db = await connectToDatabase();
        
        // Check if roles already exist
        const [existingRoles] = await db.query(
            `SELECT * FROM roles`
        );
        
        if (existingRoles && existingRoles.length > 0) {
            console.log('Roles already exist. Skipping creation.');
            process.exit(0);
        }
        
        // Create the necessary roles with UUID
        const adminId = uuidv4();
        const studentId = uuidv4();
        const driverId = uuidv4();

        await db.query(
            `INSERT INTO roles (id, role_name, description) 
             VALUES 
             (?, 'admin', 'Administrator with full access'),
             (?, 'student', 'Student user'),
             (?, 'driver', 'Bus driver')`,
            [adminId, studentId, driverId]
        );
        
        console.log('Roles created successfully!');
        console.log('Created roles with IDs:');
        console.log('Admin ID:', adminId);
        console.log('Student ID:', studentId);
        console.log('Driver ID:', driverId);
        
        // Update the ROLES constant in the database or environment
        console.log('\nPlease update your constants.js file with these IDs:');
        console.log(`ADMIN: '${adminId}'`);
        console.log(`STUDENT: '${studentId}'`);
        console.log(`DRIVER: '${driverId}'`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error creating roles:', err);
        process.exit(1);
    }
};

setupRoles(); 