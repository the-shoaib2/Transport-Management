import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Home = () => {
  const [schedules, setSchedules] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

  const fetchUpcomingSchedules = async () => {
    try {
      const response = await publicAPI.getUpcomingSchedules();
      if (response.data && response.data.status === 'success') {
        setUpcomingSchedules(response.data.data.schedules.slice(0, 5) || []);
      }
    } catch (err) {
      console.error('Error fetching upcoming schedules:', err);
    }
  };

  const fetchWeeklySchedules = async () => {
    try {
      const response = await publicAPI.getWeeklySchedules();
      if (response.data && response.data.status === 'success') {
        setWeeklySchedules(response.data.data.schedules || []);
      }
    } catch (err) {
      console.error('Error fetching weekly schedules:', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchUpcomingSchedules();
    fetchWeeklySchedules();
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSearchParams(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search and Results */}
          <div className="lg:col-span-2">
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Bus Schedules</h2>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Upcoming Schedules Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Schedules</h2>
              <div className="space-y-4">
                {upcomingSchedules.map((schedule) => (
                  <div key={schedule.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.start_location} → {schedule.end_location}</h3>
                        <p className="text-sm text-gray-500">Departure: {schedule.departure_time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">₹{schedule.fare}</p>
                        <Link to={`/book/${schedule.id}`} className="text-sm text-blue-600 hover:underline">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedules Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Schedules</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weeklySchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.start_location} → {schedule.end_location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{schedule.day}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{schedule.departure_time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-600">₹{schedule.fare}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/book/${schedule.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Book Now
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h2>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="border-0"
                tileClassName="hover:bg-blue-100 rounded-md"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;