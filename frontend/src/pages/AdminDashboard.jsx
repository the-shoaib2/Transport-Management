import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    buses: 0,
    routes: 0,
    schedules: 0
  });
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch admin info
      const adminRes = await authAPI.getAdminInfo();
      if (adminRes.data && adminRes.data.status === 'success') {
        setAdminInfo(adminRes.data.data.user);
      }
      
      // Fetch counts from each endpoint
      const [busesRes, routesRes, schedulesRes] = await Promise.all([
        adminAPI.getAllBuses(1, 1),
        adminAPI.getAllRoutes(1, 1),
        adminAPI.getAllSchedules(1, 1)
      ]);
      
      // Get total counts from response data
      setStats({
        buses: busesRes.data.data.total || 0,
        routes: routesRes.data.data.total || 0,
        schedules: schedulesRes.data.data.total || 0
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
      
      // If unauthorized, redirect to login
      if (err.response && err.response.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          
          {adminInfo && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <h2 className="text-lg font-semibold text-indigo-800 mb-2">Admin Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium">{adminInfo.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium">{adminInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">{adminInfo.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{adminInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{adminInfo.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{adminInfo.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium capitalize">{adminInfo.role_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      adminInfo.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {adminInfo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium">
                    {adminInfo.last_login 
                      ? new Date(adminInfo.last_login).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium">
                    {new Date(adminInfo.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date(adminInfo.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Buses</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.buses}</p>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/admin/buses')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all buses →
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Routes</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.routes}</p>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/admin/routes')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all routes →
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Schedules</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.schedules}</p>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/admin/schedules')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all schedules →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 