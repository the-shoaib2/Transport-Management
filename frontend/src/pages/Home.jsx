import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the updated public API endpoint
      const response = await publicAPI.getSchedules(searchParams);
      
      if (response.data && response.data.status === 'success') {
        setSchedules(response.data.data.schedules || []);
      } else {
        setError('No schedules found');
        setSchedules([]);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load schedules. Please try again later.';
      setError(errorMessage);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchParams.from || !searchParams.to) {
      toast('Please enter both departure and destination cities.', {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }
    fetchSchedules();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Bus Schedules</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                id="from"
                name="from"
                value={searchParams.from}
                onChange={handleInputChange}
                placeholder="Enter departure city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                id="to"
                name="to"
                value={searchParams.to}
                onChange={handleInputChange}
                placeholder="Enter destination city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={searchParams.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading schedules...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No schedules found for your search criteria.
            </div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{schedule.start_location}</h3>
                    <p className="text-sm text-gray-500">{schedule.departure_time}</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-0.5 bg-gray-300"></div>
                      <div className="mx-2 text-gray-400">→</div>
                      <div className="w-16 h-0.5 bg-gray-300"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{schedule.end_location}</h3>
                    <p className="text-sm text-gray-500">{schedule.arrival_time}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">₹{schedule.fare}</div>
                    <p className="text-sm text-gray-500">per seat</p>
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Book Now
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">Bus: {schedule.bus_number}</span>
                    <span className="mr-4">Operator: {schedule.operator_name}</span>
                    <span>Available Seats: {schedule.available_seats}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;