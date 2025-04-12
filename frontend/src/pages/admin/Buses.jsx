import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBus, setCurrentBus] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    busNickname: '',
    busType: '',
    capacity: '',
    status: 'active',
    driverName: '',
    driverPhone: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBuses();
      console.log(response);
      setBuses(Array.isArray(response.data?.data?.buses) ? response.data.data.buses : []);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Failed to fetch buses');
      toast.error('Failed to fetch buses');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        bus_number: formData.busNumber,
        bus_nickname: formData.busNickname,
        capacity: parseInt(formData.capacity),
        model: formData.busType,
        status: formData.status,
        driver_name: formData.driverName,
        driver_phone: formData.driverPhone,
        last_maintenance_date: formData.lastMaintenanceDate || null,
        next_maintenance_date: formData.nextMaintenanceDate || null
      };

      if (isEdit) {
        await adminAPI.updateBus(currentBus.id, submitData);
        toast.success('Bus updated successfully');
      } else {
        await adminAPI.createBus(submitData);
        toast.success('Bus added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBuses();
    } catch (err) {
      toast.error(isEdit ? 'Failed to update bus' : 'Failed to add bus');
    }
  };

  const handleEdit = (bus) => {
    setCurrentBus(bus);
    setFormData({
      busNumber: bus.bus_number,
      busNickname: bus.bus_nickname,
      busType: bus.model,
      capacity: bus.capacity.toString(),
      status: bus.status,
      driverName: bus.driver_name || '',
      driverPhone: bus.driver_phone || '',
      lastMaintenanceDate: bus.last_maintenance_date || '',
      nextMaintenanceDate: bus.next_maintenance_date || ''
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await adminAPI.deleteBus(id);
        toast.success('Bus deleted successfully');
        fetchBuses();
      } catch (err) {
        toast.error('Failed to delete bus');
      }
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminAPI.updateBusStatus(id, newStatus);
      toast.success(`Bus status updated to ${newStatus}`);
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus.id === id ? { ...bus, status: newStatus } : bus
        )
      );
    } catch (err) {
      console.error('Error updating bus status:', err);
      toast.error(err.response?.data?.message || 'Failed to update bus status');
    }
  };

  const resetForm = () => {
    setFormData({
      busNumber: '',
      busNickname: '',
      busType: '',
      capacity: '',
      status: 'active',
      driverName: '',
      driverPhone: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: ''
    });
    setIsEdit(false);
    setCurrentBus(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bus Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bus
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{bus.bus_number}</div>
                    <div className="text-sm text-gray-500">{bus.bus_nickname}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{bus.type_name}</div>
                    <div className="text-sm text-gray-500">Capacity: {bus.capacity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{bus.driver_name || 'No Driver'}</div>
                    <div className="text-sm text-gray-500">{bus.driver_phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bus.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(bus)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusChange(bus.id, bus.status)}
                      className={`${
                        bus.status === 'active'
                          ? 'text-yellow-600 hover:text-yellow-900'
                          : 'text-green-600 hover:text-green-900'
                      } mr-3 transition duration-150`}
                    >
                      {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(bus.id)}
                      className="text-red-600 hover:text-red-900 transition duration-150"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-[800px] shadow-lg rounded-lg bg-white">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 transition duration-150"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3">
              <h3 className="text-xl leading-6 font-medium text-gray-900 mb-6">
                {isEdit ? 'Edit Bus' : 'Add New Bus'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number</label>
                    <input
                      type="text"
                      name="busNumber"
                      value={formData.busNumber}
                      onChange={handleChange}
                      placeholder="e.g., BUS-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bus Nickname</label>
                    <input
                      type="text"
                      name="busNickname"
                      value={formData.busNickname}
                      onChange={handleChange}
                      placeholder="e.g., City Rider"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bus Type/Model</label>
                    <input
                      type="text"
                      name="busType"
                      value={formData.busType}
                      onChange={handleChange}
                      placeholder="e.g., Toyota Coaster"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g., 30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleChange}
                      placeholder="e.g., John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone</label>
                    <input
                      type="text"
                      name="driverPhone"
                      value={formData.driverPhone}
                      onChange={handleChange}
                      placeholder="e.g., +1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance</label>
                    <input
                      type="date"
                      name="lastMaintenanceDate"
                      value={formData.lastMaintenanceDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Maintenance</label>
                    <input
                      type="date"
                      name="nextMaintenanceDate"
                      value={formData.nextMaintenanceDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition duration-150"
                  >
                    {isEdit ? 'Update' : 'Add'} Bus
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

export default Buses;