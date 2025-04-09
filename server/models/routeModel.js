import { connectToDatabase } from '../database/mysql.js';
import { v4 as uuidv4 } from 'uuid';

export const createLocation = async (locationData) => {
    const db = await connectToDatabase();
    const { name, latitude, longitude, type } = locationData;
    const id = uuidv4();
    await db.query(
        `INSERT INTO locations (id, name, latitude, longitude, type) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, name, latitude, longitude, type]
    );
    return id;
};

export const createRoute = async (routeData) => {
    const db = await connectToDatabase();
    const { route_name, start_location_id, end_location_id, distance, estimated_time } = routeData;
    const id = uuidv4();
    await db.query(
        `INSERT INTO routes (id, route_name, start_location_id, end_location_id, distance, estimated_time) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, route_name, start_location_id, end_location_id, distance, estimated_time]
    );
    return id;
};

export const getRouteById = async (id) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT r.*, 
               sl.name as start_location_name, 
               el.name as end_location_name
        FROM routes r
        JOIN locations sl ON r.start_location_id = sl.id
        JOIN locations el ON r.end_location_id = el.id
        WHERE r.id = ?
    `, [id]);
    return rows[0];
};

export const getAllRoutes = async (page = 1, limit = 10) => {
    const db = await connectToDatabase();
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`
        SELECT r.*, 
               sl.name as start_location_name, 
               el.name as end_location_name
        FROM routes r
        JOIN locations sl ON r.start_location_id = sl.id
        JOIN locations el ON r.end_location_id = el.id
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
};

export const updateRoute = async (id, routeData) => {
    const db = await connectToDatabase();
    const { route_name, start_location_id, end_location_id, distance, estimated_time } = routeData;
    await db.query(
        `UPDATE routes 
         SET route_name = ?, start_location_id = ?, end_location_id = ?, distance = ?, estimated_time = ?
         WHERE id = ?`,
        [route_name, start_location_id, end_location_id, distance, estimated_time, id]
    );
    return true;
};

export const deleteRoute = async (id) => {
    const db = await connectToDatabase();
    await db.query('DELETE FROM routes WHERE id = ?', [id]);
    return true;
}; 