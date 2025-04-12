import mysql from "mysql2/promise";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a single pool instance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize the database
const initializeDatabase = async () => {
    try {
        // First, try to connect without specifying a database
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
        });
        
        // Check if the database exists
        const [rows] = await tempConnection.query(
            `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [process.env.DB_NAME]
        );
        
        // If the database doesn't exist, create it
        if (rows.length === 0) {
            console.log(`Database '${process.env.DB_NAME}' does not exist. Creating it...`);
            await tempConnection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database '${process.env.DB_NAME}' created successfully.`);
        }
        
        // Close the temporary connection
        await tempConnection.end();
        
        console.log('Database pool created successfully ☘️');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// Initialize the database when the module is loaded
initializeDatabase().catch(console.error);

// Export the pool
export const connectToDatabase = () => pool;
