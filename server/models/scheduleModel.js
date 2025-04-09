import { connectToDatabase } from '../database/mysql.js';

export const createSchedule = async (scheduleData) => {
    const db = await connectToDatabase();
    const { bus_id, route_id, departure_time, arrival_time, fare } = scheduleData;
    const [result] = await db.query(
        `INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, fare, status) 
         VALUES (?, ?, ?, ?, ?, 'scheduled')`,
        [bus_id, route_id, departure_time, arrival_time, fare]
    );
    return result.insertId;
};

export const getScheduleById = async (id) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT s.*, b.bus_number, r.route_name, 
               start_loc.name as start_location, 
               end_loc.name as end_location
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        JOIN locations start_loc ON r.start_location_id = start_loc.id
        JOIN locations end_loc ON r.end_location_id = end_loc.id
        WHERE s.id = ?
    `, [id]);
    return rows[0];
};

export const getAllSchedules = async (page = 1, limit = 10) => {
    const db = await connectToDatabase();
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`
        SELECT s.*, b.bus_number, r.route_name, 
               start_loc.name as start_location, 
               end_loc.name as end_location
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        JOIN locations start_loc ON r.start_location_id = start_loc.id
        JOIN locations end_loc ON r.end_location_id = end_loc.id
        ORDER BY s.departure_time
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
};

export const updateSchedule = async (id, scheduleData) => {
    const db = await connectToDatabase();
    const { bus_id, route_id, departure_time, arrival_time, fare, status } = scheduleData;
    await db.query(
        `UPDATE schedules 
         SET bus_id = ?, route_id = ?, departure_time = ?, arrival_time = ?, fare = ?, status = ?
         WHERE id = ?`,
        [bus_id, route_id, departure_time, arrival_time, fare, status, id]
    );
    return true;
};

export const deleteSchedule = async (id) => {
    const db = await connectToDatabase();
    await db.query('DELETE FROM schedules WHERE id = ?', [id]);
    return true;
};

export const getSchedulesByDate = async (date) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT s.*, b.bus_number, r.route_name, 
               start_loc.name as start_location, 
               end_loc.name as end_location
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        JOIN locations start_loc ON r.start_location_id = start_loc.id
        JOIN locations end_loc ON r.end_location_id = end_loc.id
        WHERE DATE(s.departure_time) = ?
        ORDER BY s.departure_time
    `, [date]);
    return rows;
};

export const getSchedulesByRoute = async (routeId, date) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT s.*, b.bus_number, r.route_name, 
               start_loc.name as start_location, 
               end_loc.name as end_location
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        JOIN locations start_loc ON r.start_location_id = start_loc.id
        JOIN locations end_loc ON r.end_location_id = end_loc.id
        WHERE s.route_id = ? AND DATE(s.departure_time) = ?
        ORDER BY s.departure_time
    `, [routeId, date]);
    return rows;
}; 