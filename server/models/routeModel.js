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
    const { route_name, start_location, end_location, distance, estimated_time } = routeData;

    try {
        // Create start location
        const startLocationId = await createLocation({
            name: start_location.name,
            latitude: start_location.latitude,
            longitude: start_location.longitude,
            type: start_location.type
        });

        // Create end location
        const endLocationId = await createLocation({
            name: end_location.name,
            latitude: end_location.latitude,
            longitude: end_location.longitude,
            type: end_location.type
        });

        // Create the route with the location IDs
        const routeId = uuidv4();
        await db.query(
            `INSERT INTO routes (id, route_name, start_location_id, end_location_id, distance, estimated_time, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [routeId, route_name, startLocationId, endLocationId, distance, estimated_time, true]
        );

        // Get the created route with location details
        const [route] = await db.query(`
            SELECT r.*, 
                   sl.name as start_location_name, sl.latitude as start_latitude, sl.longitude as start_longitude,
                   el.name as end_location_name, el.latitude as end_latitude, el.longitude as end_longitude
            FROM routes r
            JOIN locations sl ON r.start_location_id = sl.id
            JOIN locations el ON r.end_location_id = el.id
            WHERE r.id = ?
        `, [routeId]);

        return route[0];
    } catch (error) {
        console.error('Error creating route:', error);
        throw error;
    }
};

export const getRouteById = async (id) => {
    const db = await connectToDatabase();
    const [rows] = await db.query(`
        SELECT r.*, 
               sl.name as start_location_name, sl.latitude as start_latitude, sl.longitude as start_longitude,
               el.name as end_location_name, el.latitude as end_latitude, el.longitude as end_longitude
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
               sl.name as start_location_name, sl.latitude as start_latitude, sl.longitude as start_longitude,
               el.name as end_location_name, el.latitude as end_latitude, el.longitude as end_longitude
        FROM routes r
        JOIN locations sl ON r.start_location_id = sl.id
        JOIN locations el ON r.end_location_id = el.id
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
};

export const updateRouteStatus = async (id, status) => {
    const db = await connectToDatabase();
    const [result] = await db.query(
        `UPDATE routes 
         SET is_active = ?
         WHERE id = ?`,
        [status, id]
    );
    
    if (result.affectedRows === 0) {
        throw new Error('Route not found');
    }
    
    return true;
};

export const updateRoute = async (id, routeData) => {
    const db = await connectToDatabase();
    try {
        // First check if route exists
        const [existingRoute] = await db.query(
            'SELECT id FROM routes WHERE id = ?',
            [id]
        );

        if (!existingRoute || existingRoute.length === 0) {
            throw new Error('Route not found');
        }

        // Build update query dynamically based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (routeData.route_name !== undefined) {
            updateFields.push('route_name = ?');
            updateValues.push(routeData.route_name);
        }

        if (routeData.start_location_id !== undefined) {
            const [startLat, startLng] = routeData.start_location_id.split(',').map(Number);
            if (isNaN(startLat) || isNaN(startLng)) {
                throw new Error('Invalid start location coordinates');
            }

            // Get or create start location
            const [startLocation] = await db.query(
                'SELECT id FROM locations WHERE latitude = ? AND longitude = ?',
                [startLat, startLng]
            );

            let startLocationId;
            if (startLocation.length === 0) {
                const newLocationId = uuidv4();
                await db.query(
                    'INSERT INTO locations (id, name, latitude, longitude, type) VALUES (?, ?, ?, ?, ?)',
                    [newLocationId, 'Custom Location', startLat, startLng, 'stop']
                );
                startLocationId = newLocationId;
            } else {
                startLocationId = startLocation[0].id;
            }

            updateFields.push('start_location_id = ?');
            updateValues.push(startLocationId);
        }

        if (routeData.end_location_id !== undefined) {
            const [endLat, endLng] = routeData.end_location_id.split(',').map(Number);
            if (isNaN(endLat) || isNaN(endLng)) {
                throw new Error('Invalid end location coordinates');
            }

            // Get or create end location
            const [endLocation] = await db.query(
                'SELECT id FROM locations WHERE latitude = ? AND longitude = ?',
                [endLat, endLng]
            );

            let endLocationId;
            if (endLocation.length === 0) {
                const newLocationId = uuidv4();
                await db.query(
                    'INSERT INTO locations (id, name, latitude, longitude, type) VALUES (?, ?, ?, ?, ?)',
                    [newLocationId, 'Custom Location', endLat, endLng, 'stop']
                );
                endLocationId = newLocationId;
            } else {
                endLocationId = endLocation[0].id;
            }

            updateFields.push('end_location_id = ?');
            updateValues.push(endLocationId);
        }

        if (routeData.distance !== undefined) {
            updateFields.push('distance = ?');
            updateValues.push(routeData.distance);
        }

        if (routeData.estimated_time !== undefined) {
            updateFields.push('estimated_time = ?');
            updateValues.push(routeData.estimated_time);
        }

        if (routeData.is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(routeData.is_active);
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        // Add id to the end of values array
        updateValues.push(id);

        // Update the route
        const [result] = await db.query(
            `UPDATE routes SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        if (result.affectedRows === 0) {
            throw new Error('Route not found');
        }

        // Get the updated route with location details
        const [updatedRoute] = await db.query(`
            SELECT r.*, 
                   sl.name as start_location_name, sl.latitude as start_latitude, sl.longitude as start_longitude,
                   el.name as end_location_name, el.latitude as end_latitude, el.longitude as end_longitude
            FROM routes r
            JOIN locations sl ON r.start_location_id = sl.id
            JOIN locations el ON r.end_location_id = el.id
            WHERE r.id = ?
        `, [id]);

        if (!updatedRoute || updatedRoute.length === 0) {
            throw new Error('Route not found');
        }

        return updatedRoute[0];
    } catch (error) {
        console.error('Error updating route:', error);
        throw error;
    }
};

export const deleteRoute = async (id) => {
    const db = await connectToDatabase();
    const [result] = await db.query('DELETE FROM routes WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
        throw new Error('Route not found');
    }
    
    return true;
}; 