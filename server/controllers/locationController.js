import { updateBusLocation, getBusLocation, getBusLocationHistory, getAllActiveBusLocations } from '../models/locationModel.js';

export const updateLocation = async (req, res) => {
    try {
        const { bus_id, latitude, longitude } = req.body;
        
        if (!bus_id || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const locationId = await updateBusLocation(bus_id, latitude, longitude);
        res.status(201).json({ 
            message: 'Location updated successfully',
            locationId 
        });
    } catch (error) {
        console.error('Error updating bus location:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLocation = async (req, res) => {
    try {
        const { busId } = req.params;
        const location = await getBusLocation(busId);
        
        if (!location) {
            return res.status(404).json({ error: 'Bus location not found' });
        }
        
        res.json(location);
    } catch (error) {
        console.error('Error getting bus location:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLocationHistory = async (req, res) => {
    try {
        const { busId } = req.params;
        const { startTime, endTime } = req.query;
        
        if (!startTime || !endTime) {
            return res.status(400).json({ error: 'Missing time range parameters' });
        }
        
        const history = await getBusLocationHistory(busId, startTime, endTime);
        res.json(history);
    } catch (error) {
        console.error('Error getting bus location history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getActiveLocations = async (req, res) => {
    try {
        const locations = await getAllActiveBusLocations();
        res.json(locations);
    } catch (error) {
        console.error('Error getting active bus locations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 