import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on component mount and when location changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
        // Fetch user profile to verify token is still valid
        try {
          await authAPI.getAdminInfo();
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // If token is invalid, log out
          handleLogout();
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname]); // Re-run when path changes

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Remove user data from localStorage
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Don't show navbar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white text-xl font-bold">
                Transport Management
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  location.pathname === '/'
                    ? 'border-indigo-300 text-white'
                    : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              {isLoggedIn && (
                <Link
                  to="/admin"
                  className={`${
                    location.pathname === '/admin'
                      ? 'border-indigo-300 text-white'
                      : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loading ? (
              <div className="text-indigo-100">Loading...</div>
            ) : isLoggedIn ? (
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-indigo-100 mr-4">
                    {user?.username || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`${
                location.pathname === '/'
                  ? 'bg-indigo-700 border-indigo-300 text-white'
                  : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-indigo-300 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Home
            </Link>
            {isLoggedIn && (
              <Link
                to="/admin"
                className={`${
                  location.pathname === '/admin'
                    ? 'bg-indigo-700 border-indigo-300 text-white'
                    : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-indigo-300 hover:text-white'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-700">
            {loading ? (
              <div className="px-4 text-indigo-100">Loading...</div>
            ) : isLoggedIn ? (
              <div className="px-4">
                <div className="text-base font-medium text-white">
                  {user?.username || 'User'}
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-indigo-100 hover:text-white hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link
                  to="/login"
                  className="block text-base font-medium text-indigo-100 hover:text-white"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 