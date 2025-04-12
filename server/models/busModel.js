import { connectToDatabase } from '../database/mysql.js';

// First, we need to create a bus type if it doesn't exist
export const createBusType = async (typeData) => {
    const db = await connectToDatabase();
    const { type_name, capacity, model } = typeData;
    const [result] = await db.query(
        `INSERT INTO bus_types (id, type_name, capacity, model) 
         VALUES (UUID(), ?, ?, ?)`,
        [type_name, capacity, model]
    );
    return result.insertId;
};

export const createBus = async (busData) => {
    const db = await connectToDatabase();
    
    // First, create or get the bus type
    const [existingType] = await db.query(
        'SELECT id FROM bus_types WHERE model = ? AND capacity = ?',
        [busData.model, busData.capacity]
    );

    let busTypeId;
    if (existingType.length === 0) {
        // Create new bus type
        const [result] = await db.query(
            `INSERT INTO bus_types (id, type_name, capacity, model) 
             VALUES (UUID(), ?, ?, ?)`,
            [`${busData.model} - ${busData.capacity}`, busData.capacity, busData.model]
        );
        const [newType] = await db.query('SELECT id FROM bus_types WHERE type_name = ?', 
            [`${busData.model} - ${busData.capacity}`]);
        busTypeId = newType[0].id;
    } else {
        busTypeId = existingType[0].id;
    }

    // Now create the bus with the correct bus type ID
    const [result] = await db.query(
        `INSERT INTO buses (id, bus_number, bus_nickname, bus_type_id, driver_id, status) 
         VALUES (UUID(), ?, ?, ?, ?, 'active')`,
        [busData.bus_number, busData.bus_nickname, busTypeId, busData.driver_id]
    );

    // Get the ID of the newly created bus
    const [newBus] = await db.query(
        'SELECT id FROM buses WHERE bus_number = ? AND bus_nickname = ?',
        [busData.bus_number, busData.bus_nickname]
    );
    
    return newBus[0].id;
};

export const getBusById = async (id) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT b.*, bt.capacity, bt.model, bt.type_name,
               u.username as driver_name, u.phone as driver_phone
        FROM buses b
        LEFT JOIN bus_types bt ON b.bus_type_id = bt.id
        LEFT JOIN users u ON b.driver_id = u.id
        WHERE b.id = ?
    `, [id]);
    return rows[0];
};

export const getAllBuses = async (page = 1, limit = 10) => {
    const db = await connectToDatabase();
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`
        SELECT b.*, bt.capacity, bt.model, bt.type_name,
               u.username as driver_name, u.phone as driver_phone
        FROM buses b
        LEFT JOIN bus_types bt ON b.bus_type_id = bt.id
        LEFT JOIN users u ON b.driver_id = u.id
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
};

export const updateBus = async (id, busData) => {
    const db = await connectToDatabase();
    const { bus_number, bus_nickname, driver_id, status } = busData;
    await db.query(
        `UPDATE buses 
         SET bus_number = ?, bus_nickname = ?, driver_id = ?, status = ?
         WHERE id = ?`,
        [bus_number, bus_nickname, driver_id, status, id]
    );
    return true;
};

export const deleteBus = async (id) => {
    const db = await connectToDatabase();
    await db.query('DELETE FROM buses WHERE id = ?', [id]);
    return true;
};

export const getBusSchedule = async (busId, date) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT s.*, r.route_name
        FROM schedules s
        JOIN routes r ON s.route_id = r.id
        WHERE s.bus_id = ? AND DATE(s.departure_time) = ?
        ORDER BY s.departure_time
    `, [busId, date]);
    return rows;
};

export const updateBusStatus = async (id, status) => {
    const db = await connectToDatabase();
    await db.query(
        `UPDATE buses 
         SET status = ?
         WHERE id = ?`,
        [status, id]
    );
    return await getBusById(id);
}; 