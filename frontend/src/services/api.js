import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both token and user data on unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    // Clear both token and user data on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  getAdminInfo: () => api.get('/auth/admin'),
};

// Public API
export const publicAPI = {
  // Bus Schedule Routes
  getSchedules: (params) => api.get('/public/schedules', { params }),
  getRouteSchedules: (routeId, date) => api.get(`/public/routes/${routeId}/schedules`, { params: { date } }),
  
  // Student Verification
  verifyStudentPayment: (studentId) => api.get(`/public/students/${studentId}/verify`),
  
  // Bus Location and Driver Info
  updateBusLocation: (busId, locationData) => api.post(`/public/buses/${busId}/location`, locationData),
  getBusDriverInfo: (busId) => api.get(`/public/buses/${busId}/driver`),
  
  // Blood Donation
  createBloodDonor: (donorData) => api.post('/public/blood-donors', donorData),
  getBloodDonors: () => api.get('/public/blood-donors'),
  searchBloodDonors: (params) => api.get('/public/blood-donors/search', { params }),
  getBloodDonorById: (donorId) => api.get(`/public/blood-donors/${donorId}`),

  // Payment Status
  getPaymentStatus: (ticketNumber) => api.get('/public/payments/status', { params: { ticketNumber } }),
  searchPayments: (params) => api.get('/public/payments/search', { params }),
  
  // Additional public routes
  getRoutes: () => api.get('/public/routes'),
  getLocations: () => api.get('/public/locations'),
};

// Admin API
export const adminAPI = {
  // Bus Management
  getAllBuses: (page = 1, limit = 10) => 
    api.get('/admin/buses', { params: { page, limit } }),
  getBusById: (id) => api.get(`/admin/buses/${id}`),
  createBus: (data) => api.post('/admin/buses', data),
  updateBus: (id, data) => api.put(`/admin/buses/${id}`, data),
  updateBusStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/buses/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating bus status:', error);
      throw error;
    }
  },
  deleteBus: (id) => api.delete(`/admin/buses/${id}`),

  // Route Management
  getAllRoutes: async () => {
    try {
      const response = await api.get('/admin/routes');
      if (response.data && response.data.status === 'success' && response.data.data.routes) {
        return response.data.data.routes;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },
  getRouteById: (id) => api.get(`/admin/routes/${id}`),
  createRoute: async (routeData) => {
    try {
      const response = await api.post('/admin/routes', routeData);
      return response.data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  },
  updateRoute: async (routeId, routeData) => {
    if (!routeId) {
      throw new Error('Valid route ID is required');
    }

    try {
      const response = await api.put(
        `/admin/routes/${routeId}`,
        routeData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to update route');
      }

      return response.data.data.route;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update route');
      }
      throw error;
    }
  },
  updateRouteStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/routes/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating route status:', error);
      throw error;
    }
  },
  deleteRoute: async (id) => {
    try {
      const response = await api.delete(`/admin/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  },

  // Schedule Management
  getAllSchedules: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/admin/schedules', { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },
  getScheduleById: (id) => api.get(`/admin/schedules/${id}`),
  createSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/admin/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await api.put(`/admin/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },
  updateScheduleStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/schedules/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating schedule status:', error);
      throw error;
    }
  },
  deleteSchedule: async (id) => {
    try {
      const response = await api.delete(`/admin/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },
  getWeeklySchedule: (params) => api.get('/admin/schedules/weekly', { params }),

  // Student Management
  getAllStudents: (page = 1, limit = 10) => 
    api.get('/admin/students', { params: { page, limit } }),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  updateStudentStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/students/${id}/status`, { status });
      if (response.data && response.data.status === 'success') {
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to update student status');
    } catch (error) {
      console.error('Error updating student status:', error);
      throw error;
    }
  },
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getRecentStudents: () => api.get('/admin/students/recent'),

  // Payment Management
  getAllPayments: (page = 1, limit = 10) => 
    api.get('/admin/payments', { params: { page, limit } }),
  getPaymentById: (id) => api.get(`/admin/payments/${id}`),
  createPayment: (data) => api.post('/admin/payments', data),
  updatePayment: async (paymentId, paymentData) => {
    try {
      const response = await api.put(
        `/admin/payments/${paymentId}`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to update payment');
      }

      return response.data.data.payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },
  updatePaymentStatus: async (paymentId, status) => {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      if (!status) {
        throw new Error('Status is required');
      }

      const response = await api.patch(
        `/admin/payments/${paymentId}/status`,
        { status: status.toLowerCase() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

  

      return response.data.data.payment;
    } catch (error) {
      console.error('Error updating payment status:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update payment status');
      }
      throw error;
    }
  },
  deletePayment: (id) => api.delete(`/admin/payments/${id}`),
  getStudentPayments: (studentId) => api.get(`/admin/students/${studentId}/payments`),
  getPaymentTypes: () => api.get('/admin/payments/types'),

  // Location Management
  getActiveLocations: () => api.get('/admin/locations/active'),
  getBusLocationHistory: (busId, startDate, endDate) => 
    api.get(`/admin/buses/${busId}/locations`, { params: { startDate, endDate } }),
  
  // Dashboard Statistics
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRevenueStats: (period = 'monthly') => 
    api.get('/admin/dashboard/revenue', { params: { period } }),
  getMaintenanceStats: () => api.get('/admin/dashboard/maintenance'),
};

export default api;