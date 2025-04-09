import mysql from "mysql2/promise";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let connection;

export const connectToDatabase = async () => {
  try {
    if (!connection) {
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
      
      // Now connect to the database
      const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
      };
      
      // Only add password if it's provided
      if (process.env.DB_PASSWORD) {
        config.password = process.env.DB_PASSWORD;
      }
      
      connection = await mysql.createConnection(config);
      console.log('Database connected successfully ☘️');
    }
    return connection;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err; // Re-throw the error to handle it in the calling function
  }
};
