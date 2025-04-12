import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  // Create a connection without specifying a database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('Connected to MySQL server');
    
    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);
    
    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log(`Using database '${process.env.DB_NAME}'`);
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'migrations', 'database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remove the CREATE DATABASE and USE statements since we've already done that
    const sqlCommands = sqlContent
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/, '')
      .replace(/USE.*?;/, '')
      .split(';')
      .filter(cmd => cmd.trim());
    
    // Execute each command
    for (const command of sqlCommands) {
      if (command.trim()) {
        try {
          // Skip the payment types insert if it's already been done
          if (command.includes('INSERT INTO payment_types')) {
            const [existingTypes] = await connection.query('SELECT COUNT(*) as count FROM payment_types');
            if (existingTypes[0].count > 0) {
              console.log('Payment types already exist, skipping insertion');
              continue;
            }
          }
          
          await connection.query(command);
          console.log('Executed SQL command successfully');
        } catch (err) {
          console.error('Error executing SQL command:', err.message);
          console.error('Command:', command);
        }
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the initialization
initializeDatabase(); 