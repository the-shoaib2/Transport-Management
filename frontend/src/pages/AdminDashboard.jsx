import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [revenuePeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch admin info
      const adminRes = await authAPI.getAdminInfo();
      if (adminRes.data && adminRes.data.status === 'success') {
        setAdminInfo(adminRes.data.data.user);
      }
      
      // Fetch dashboard stats
      const dashboardRes = await adminAPI.getDashboardStats();
      if (dashboardRes.data && dashboardRes.data.status === 'success') {
        setDashboardStats(dashboardRes.data.data);
      }
      
      // Fetch maintenance data
      const maintenanceRes = await adminAPI.getMaintenanceStats();
      if (maintenanceRes.data && maintenanceRes.data.status === 'success') {
        setMaintenanceData(maintenanceRes.data.data);
      }
      
      // Fetch revenue data
      fetchRevenueData();
      
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
  
  const fetchRevenueData = async () => {
    try {
      const revenueRes = await adminAPI.getRevenueStats(revenuePeriod);
      if (revenueRes.data && revenueRes.data.status === 'success') {
        setRevenueData(revenueRes.data.data.revenue);
      }
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      toast.error('Failed to load revenue data');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Stat Card Component
  const StatCard = ({ title, value, total, icon, color, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 uppercase">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {total && (
            <p className="text-sm text-gray-500 mt-1">
              of {total} total ({Math.round((value / total) * 100)}%)
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-')} bg-opacity-10`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Overview Statistics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats && (
                  <>
                    <StatCard 
                      title="Active Buses" 
                      value={dashboardStats.buses.active}
                      total={dashboardStats.buses.total}
                      icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      color="border-green-500"
                      onClick={() => navigate('/admin/buses')}
                    />
                    <StatCard 
                      title="Active Routes" 
                      value={dashboardStats.routes.active}
                      total={dashboardStats.routes.total}
                      icon="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      color="border-blue-500"
                      onClick={() => navigate('/admin/routes')}
                    />
                    <StatCard 
                      title="Upcoming Schedules" 
                      value={dashboardStats.schedules.scheduled}
                      total={dashboardStats.schedules.total}
                      icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      color="border-purple-500"
                      onClick={() => navigate('/admin/schedules')}
                    />
                    <StatCard 
                      title="Active Students" 
                      value={dashboardStats.students.active}
                      total={dashboardStats.students.total}
                      icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      color="border-yellow-500"
                      onClick={() => navigate('/admin/students')}
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* Payment & Revenue Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">Revenue Overview</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setRevenuePeriod('daily')}
                      className={`px-3 py-1 text-sm rounded-md ${revenuePeriod === 'daily' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Daily
                    </button>
                    <button 
                      onClick={() => setRevenuePeriod('weekly')}
                      className={`px-3 py-1 text-sm rounded-md ${revenuePeriod === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Weekly
                    </button>
                    <button 
                      onClick={() => setRevenuePeriod('monthly')}
                      className={`px-3 py-1 text-sm rounded-md ${revenuePeriod === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                
                {revenueData.length > 0 ? (
                  <div className="mt-4 h-64">
                    <div className="flex flex-col">
                      <div className="overflow-x-auto">
                        <div className="py-2 align-middle inline-block min-w-full">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Period
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Payments
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {revenueData.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.period}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(item.revenue)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.count} payments
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-gray-500">
                    No revenue data available
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Stats</h2>
                {dashboardStats && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-50">
                      <h3 className="text-lg font-medium text-green-800">Completed</h3>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-2xl font-bold text-green-600">{dashboardStats.payments.completed}</p>
                        <p className="text-gray-600">
                          {formatCurrency(dashboardStats.payments.total_amount || 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-2xl font-bold text-yellow-600">{dashboardStats.payments.pending}</p>
                        <p className="text-yellow-600">{Math.round((dashboardStats.payments.pending / dashboardStats.payments.total) * 100)}%</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/admin/payments')}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-150"
                    >
                      View All Payments
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Activity and Maintenance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Payments</h2>
                {dashboardStats && dashboardStats.recentPayments && dashboardStats.recentPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardStats.recentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.first_name} {payment.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.payment_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No recent payments found</div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Maintenance Alerts</h2>
                {maintenanceData && maintenanceData.upcomingMaintenance && maintenanceData.upcomingMaintenance.length > 0 ? (
                  <div className="space-y-4">
                    {maintenanceData.upcomingMaintenance.slice(0, 3).map((bus) => (
                      <div key={bus.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-orange-800">{bus.bus_nickname}</h3>
                            <p className="text-sm text-gray-600">#{bus.bus_number}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-orange-600">Maintenance Due</p>
                            <p className="text-sm text-gray-600">{formatDate(bus.next_maintenance_date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => navigate('/admin/buses')}
                      className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition duration-150"
                    >
                      View All Maintenance
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No upcoming maintenance needed</div>
                )}
              </div>
            </div>
            
            {/* Upcoming Schedules */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Schedules</h2>
              {dashboardStats && dashboardStats.upcomingSchedules && dashboardStats.upcomingSchedules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Departure
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Arrival
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fare
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardStats.upcomingSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {schedule.route_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schedule.bus_nickname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(schedule.departure_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(schedule.arrival_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(schedule.fare)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No upcoming schedules found</div>
              )}
              
              <div className="mt-4 text-right">
                <button 
                  onClick={() => navigate('/admin/schedules')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-150"
                >
                  View All Schedules
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/admin/students/new')}
                  className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300 flex items-center"
                >
                  <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  <span className="font-medium text-indigo-800">Add Student</span>
                </button>
                
                <button 
                  onClick={() => navigate('/admin/payments/new')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-300 flex items-center"
                >
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="font-medium text-green-800">Record Payment</span>
                </button>
                
                <button 
                  onClick={() => navigate('/admin/schedules/new')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-300 flex items-center"
                >
                  <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className="font-medium text-purple-800">Create Schedule</span>
                </button>
                
                <button 
                  onClick={() => navigate('/admin/buses/new')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-300 flex items-center"
                >
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                  <span className="font-medium text-blue-800">Add Bus</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 