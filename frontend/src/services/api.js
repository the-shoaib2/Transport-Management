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
  updateBusStatus: (id, status) => api.put(`/admin/buses/${id}/status`, { status }),
  deleteBus: (id) => api.delete(`/admin/buses/${id}`),

  // Route Management
  getAllRoutes: (page = 1, limit = 10) => 
    api.get('/admin/routes', { params: { page, limit } }),
  getRouteById: (id) => api.get(`/admin/routes/${id}`),
  createRoute: (data) => api.post('/admin/routes', data),
  updateRoute: (id, data) => api.put(`/admin/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/admin/routes/${id}`),

  // Schedule Management
  getAllSchedules: (page = 1, limit = 10) => 
    api.get('/admin/schedules', { params: { page, limit } }),
  getScheduleById: (id) => api.get(`/admin/schedules/${id}`),
  createSchedule: (data) => api.post('/admin/schedules', data),
  updateSchedule: (id, data) => api.put(`/admin/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/admin/schedules/${id}`),
  getWeeklySchedule: (params) => api.get('/admin/schedules/weekly', { params }),

  // Student Management
  getAllStudents: (page = 1, limit = 10) => 
    api.get('/admin/students', { params: { page, limit } }),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  updateStudentStatus: (id, status) => api.put(`/admin/students/${id}/status`, { status }),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getRecentStudents: () => api.get('/admin/students/recent'),

  // Payment Management
  getAllPayments: (page = 1, limit = 10) => 
    api.get('/admin/payments', { params: { page, limit } }),
  getPaymentById: (id) => api.get(`/admin/payments/${id}`),
  createPayment: (data) => api.post('/admin/payments', data),
  updatePayment: (id, data) => api.put(`/admin/payments/${id}`, data),
  updatePaymentStatus: (id, status) => api.put(`/admin/payments/${id}/status`, { status }),
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