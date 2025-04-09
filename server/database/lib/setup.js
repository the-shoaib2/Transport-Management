import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { ROLE_DEFINITIONS, DEFAULT_ADMIN, ROLES } from '../../constants.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function setupDatabase() {
    try {
        // Test the connection
        const connection = await pool.getConnection();

        // Check if roles table exists
        try {
            await connection.query('SELECT 1 FROM roles LIMIT 1');
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.log('Roles table does not exist. Initializing database schema...');
                
                // Read the SQL file from the migrations directory
                const sqlFilePath = path.join(__dirname, '../../database/migrations/database.sql');
                const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
                
                // Remove the CREATE DATABASE and USE statements since we're already connected to the database
                const sqlCommands = sqlContent
                    .replace(/CREATE DATABASE IF NOT EXISTS.*?;/, '')
                    .replace(/USE.*?;/, '')
                    .split(';')
                    .filter(cmd => cmd.trim());
                
                // Execute each command
                for (const command of sqlCommands) {
                    if (command.trim()) {
                        try {
                            await connection.query(command);
                            console.log('Executed SQL command successfully');
                        } catch (err) {
                            console.error('Error executing SQL command:', err.message);
                        }
                    }
                }
                
                console.log('Database schema initialized successfully');
            } else {
                throw error;
            }
        }

        // Check if roles exist
        const [roles] = await connection.query('SELECT * FROM roles');
        
        if (roles.length === 0) {
            console.log('Creating roles...');
            
            // Create roles with UUIDs
            for (const role of ROLE_DEFINITIONS) {
                const roleId = uuidv4();
                await connection.query(
                    'INSERT INTO roles (id, role_name, description) VALUES (?, ?, ?)',
                    [roleId, role.role_name, role.description]
                );
                
                // Update the ROLES constant with the actual UUID
                if (role.role_name === 'admin') {
                    ROLES.ADMIN = roleId;
                } else if (role.role_name === 'student') {
                    ROLES.STUDENT = roleId;
                } else if (role.role_name === 'driver') {
                    ROLES.DRIVER = roleId;
                }
            }
            console.log('Roles created successfully');
        } else {
            console.log('Roles already exist, skipping role creation');
            
            // Update the ROLES constant with the existing role IDs
            for (const role of roles) {
                if (role.role_name === 'admin') {
                    ROLES.ADMIN = role.id;
                } else if (role.role_name === 'student') {
                    ROLES.STUDENT = role.id;
                } else if (role.role_name === 'driver') {
                    ROLES.DRIVER = role.id;
                }
            }
        }

        // Get the admin role ID from the database
        const [adminRoles] = await connection.query(
            'SELECT id FROM roles WHERE role_name = ?',
            ['admin']
        );

        if (adminRoles.length === 0) {
            console.error('Admin role not found in the database');
            connection.release();
            return;
        }

        const adminRoleId = adminRoles[0].id;
        console.log(`Found admin role ID: ${adminRoleId}`);

        // Check if admin user exists
        const [adminUsers] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [DEFAULT_ADMIN.email]
        );

        if (adminUsers.length === 0) {
            console.log('Creating first admin user...');
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
            
            await connection.query(
                'INSERT INTO users (id, firstName, lastName, username, email, password, role_id) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
                [
                    DEFAULT_ADMIN.firstName,
                    DEFAULT_ADMIN.lastName,
                    DEFAULT_ADMIN.username,
                    DEFAULT_ADMIN.email,
                    hashedPassword,
                    adminRoleId
                ]
            );
            console.log('First admin user created successfully');
        } else {
            console.log('Admin user already exists, skipping admin creation');
        }

        connection.release();
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
} 