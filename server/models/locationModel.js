import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '../database/mysql.js';

// Update bus location
export const updateBusLocation = async (locationData) => {
    const { bus_id, latitude, longitude } = locationData;
    
    const query = `
        INSERT INTO bus_locations (id, bus_id, latitude, longitude, timestamp)
        VALUES (?, ?, ?, ?, NOW())
    `;
    
    const values = [uuidv4(), bus_id, latitude, longitude];
    
    try {
        await db.query(query, values);
        return true;
    } catch (error) {
        console.error('Error updating bus location:', error);
        throw error;
    }
};

// Get current location of a bus
export const getBusLocation = async (busId) => {
    try {
        const query = `
            SELECT * FROM bus_locations 
            WHERE bus_id = UUID_TO_BIN(?) 
            ORDER BY timestamp DESC 
            LIMIT 1
        `;
        const [rows] = await db.query(query, [busId]);
        return rows[0];
    } catch (error) {
        console.error('Error getting bus location:', error);
        throw error;
    }
};

// Get location history of a bus
export const getBusLocationHistory = async (busId, startDate, endDate) => {
    const query = `
        SELECT * FROM bus_locations
        WHERE bus_id = ? AND timestamp BETWEEN ? AND ?
        ORDER BY timestamp DESC
    `;
    
    try {
        const [history] = await db.query(query, [busId, startDate, endDate]);
        return history;
    } catch (error) {
        console.error('Error fetching bus location history:', error);
        throw error;
    }
};

// Get all active bus locations
export const getActiveLocations = async () => {
    const query = `
        SELECT bl.*, b.bus_number, b.bus_nickname
        FROM bus_locations bl
        JOIN buses b ON bl.bus_id = b.id
        WHERE bl.timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ORDER BY bl.timestamp DESC
    `;
    
    try {
        const [locations] = await db.query(query);
        return locations;
    } catch (error) {
        console.error('Error fetching active locations:', error);
        throw error;
    }
};

export const getDailyAnalytics = async () => {
    const query = `
        SELECT 
            DATE(timestamp) as date,
            COUNT(DISTINCT bus_id) as active_buses,
            COUNT(*) as location_updates
        FROM bus_locations
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
    `;
    
    try {
        const [analytics] = await db.query(query);
        return analytics;
    } catch (error) {
        console.error('Error fetching daily analytics:', error);
        throw error;
    }
};

export const getWeeklyAnalytics = async () => {
    const query = `
        SELECT 
            YEARWEEK(timestamp) as week,
            COUNT(DISTINCT bus_id) as active_buses,
            COUNT(*) as location_updates
        FROM bus_locations
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
        GROUP BY YEARWEEK(timestamp)
        ORDER BY week DESC
    `;
    
    try {
        const [analytics] = await db.query(query);
        return analytics;
    } catch (error) {
        console.error('Error fetching weekly analytics:', error);
        throw error;
    }
};

export const getMonthlyAnalytics = async () => {
    const query = `
        SELECT 
            DATE_FORMAT(timestamp, '%Y-%m') as month,
            COUNT(DISTINCT bus_id) as active_buses,
            COUNT(*) as location_updates
        FROM bus_locations
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(timestamp, '%Y-%m')
        ORDER BY month DESC
    `;
    
    try {
        const [analytics] = await db.query(query);
        return analytics;
    } catch (error) {
        console.error('Error fetching monthly analytics:', error);
        throw error;
    }
}; 