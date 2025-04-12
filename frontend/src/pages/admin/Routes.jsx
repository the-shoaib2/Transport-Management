import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationPicker = ({ onLocationSelect, startPosition, endPosition, isSelectingStart }) => {
  const map = useMap();

  // Set default location to Dhaka
  useEffect(() => {
    map.setView([23.8103, 90.4125], 13); // Dhaka coordinates
  }, [map]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
          onLocationSelect({
            latitude,
            longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  useMapEvents({
    click(e) {
      onLocationSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    },
  });

  return (
    <>
      {startPosition && (
        <Marker
          position={[startPosition.latitude, startPosition.longitude]}
          icon={startIcon}
        />
      )}
      {endPosition && (
        <Marker
          position={[endPosition.latitude, endPosition.longitude]}
          icon={endIcon}
        />
      )}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={getCurrentLocation}
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_name: '',
    start_location_id: '',
    end_location_id: '',
    distance: '',
    estimated_time: '',
    is_active: true
  });
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllRoutes();
      console.log('Fetched routes:', response);
      if (response && Array.isArray(response)) {
        setRoutes(response);
      } else {
        setRoutes([]);
        console.error('Invalid routes data format:', response);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes');
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationSelect = (location) => {
    if (isSelectingStart) {
      setStartPosition(location);
      setFormData(prev => ({
        ...prev,
        start_location_id: `${location.latitude},${location.longitude}`
      }));
    } else {
      setEndPosition(location);
      setFormData(prev => ({
        ...prev,
        end_location_id: `${location.latitude},${location.longitude}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.route_name) {
        toast.error('Please enter a route name');
        return;
      }
      if (!formData.start_location_id) {
        toast.error('Please select start location');
        return;
      }
      if (!formData.end_location_id) {
        toast.error('Please select end location');
        return;
      }
      if (!formData.distance || isNaN(formData.distance)) {
        toast.error('Please enter a valid distance');
        return;
      }
      if (!formData.estimated_time || isNaN(formData.estimated_time)) {
        toast.error('Please enter a valid estimated time');
        return;
      }

      // Parse location coordinates
      const [startLat, startLng] = formData.start_location_id.split(',').map(Number);
      const [endLat, endLng] = formData.end_location_id.split(',').map(Number);

      const submitData = {
        route_name: formData.route_name,
        start_location: {
          name: `Location ${startLat},${startLng}`,
          latitude: startLat,
          longitude: startLng,
          type: 'stop'
        },
        end_location: {
          name: `Location ${endLat},${endLng}`,
          latitude: endLat,
          longitude: endLng,
          type: 'stop'
        },
        distance: parseFloat(formData.distance),
        estimated_time: parseInt(formData.estimated_time)
      };

      if (isEditMode) {
        if (!currentRoute || !currentRoute.id) {
          toast.error('Invalid route ID');
          return;
        }
        await adminAPI.updateRoute(currentRoute.id, submitData);
        toast.success('Route updated successfully');
      } else {
        await adminAPI.createRoute(submitData);
        toast.success('Route created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchRoutes();
    } catch (err) {
      console.error('Error saving route:', err);
      toast.error(err.response?.data?.message || 'Failed to save route');
    }
  };

  const handleEdit = (route) => {
    if (!route || !route.id) {
        toast.error('Invalid route data');
        return;
    }

    setCurrentRoute(route);
    setFormData({
        route_name: route.route_name || '',
        start_location_id: route.start_location_id || '',
        end_location_id: route.end_location_id || '',
        distance: route.distance || '',
        estimated_time: route.estimated_time || '',
        is_active: route.is_active === 1
    });

    // Parse and set start location
    if (route.start_location_id) {
        const [startLat, startLng] = route.start_location_id.split(',').map(Number);
        if (!isNaN(startLat) && !isNaN(startLng)) {
            setStartPosition({ latitude: startLat, longitude: startLng });
        }
    }

    // Parse and set end location
    if (route.end_location_id) {
        const [endLat, endLng] = route.end_location_id.split(',').map(Number);
        if (!isNaN(endLat) && !isNaN(endLng)) {
            setEndPosition({ latitude: endLat, longitude: endLng });
        }
    }

    setIsSelectingStart(true);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await adminAPI.deleteRoute(id);
        toast.success('Route deleted successfully');
        fetchRoutes();
      } catch (err) {
        console.error('Error deleting route:', err);
        toast.error('Failed to delete route');
      }
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await adminAPI.updateRouteStatus(id, newStatus);
      toast.success(`Route status updated to ${newStatus === 1 ? 'active' : 'inactive'}`);
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === id ? { ...route, is_active: newStatus } : route
        )
      );
    } catch (err) {
      console.error('Error updating route status:', err);
      toast.error('Failed to update route status');
    }
  };

  const resetForm = () => {
    setFormData({
      route_name: '',
      start_location_id: '',
      end_location_id: '',
      distance: '',
      estimated_time: '',
      is_active: true
    });
    setCurrentRoute(null);
    setIsEditMode(false);
    setStartPosition(null);
    setEndPosition(null);
    setIsSelectingStart(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Route
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : routes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No routes found. Add a new route to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Time (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {route.route_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.start_location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.end_location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.distance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.estimated_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          route.is_active === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {route.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusChange(route.id, route.is_active)}
                          className={`${
                            route.is_active === 1
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {route.is_active === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-4 sm:p-8 border w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%] shadow-lg rounded-lg bg-white">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3">
              <h3 className="text-xl leading-6 font-medium text-gray-900 mb-6">
                {isEditMode ? 'Edit Route' : 'Add New Route'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                        <input
                          type="text"
                          name="route_name"
                          value={formData.route_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                        <input
                          type="number"
                          name="distance"
                          value={formData.distance}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
                        <input
                          type="number"
                          name="estimated_time"
                          value={formData.estimated_time}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Location</label>
                        <input
                          type="text"
                          name="start_location_id"
                          value={formData.start_location_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsSelectingStart(true)}
                          className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Select Start Location on Map
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Location</label>
                        <input
                          type="text"
                          name="end_location_id"
                          value={formData.end_location_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsSelectingStart(false)}
                          className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Select End Location on Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="h-[400px] lg:h-full border border-gray-300 rounded-md">
                    <MapContainer
                      center={[23.8103, 90.4125]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        startPosition={startPosition}
                        endPosition={endPosition}
                        isSelectingStart={isSelectingStart}
                      />
                    </MapContainer>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isEditMode ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes; 