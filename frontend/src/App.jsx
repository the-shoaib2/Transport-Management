import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { authAPI } from './services/api';

// Layouts
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Service Pages
import BusServices from './pages/services/BusServices';
import StudentTransport from './pages/services/StudentTransport';
import DriverServices from './pages/services/DriverServices';
import PaymentStatus from './pages/services/PaymentStatus';
import BloodDonation from './pages/services/BloodDonation';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Buses from './pages/admin/Buses';
import BusRoutes from './pages/admin/Routes';
import BusSchedules from './pages/admin/Schedules';
import Students from './pages/admin/Students';
import Payments from './pages/admin/Payments';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token by making a request to get user profile
        await authAPI.getAdminInfo();
        setIsAuthenticated(true);
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Service Routes */}
          <Route path="/services/bus" element={<BusServices />} />
          <Route path="/services/student" element={<StudentTransport />} />
          <Route path="/services/driver" element={<DriverServices />} />
          <Route path="/services/payment-status" element={<PaymentStatus />} />
          <Route path="/services/blood-donation" element={<BloodDonation />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="buses" element={<Buses />} />
          <Route path="routes" element={<BusRoutes />} />
          <Route path="schedules" element={<BusSchedules />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<Payments />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
