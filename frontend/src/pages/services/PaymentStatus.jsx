import React, { useState } from 'react';
import { publicAPI } from '../../services/api';

const PaymentStatus = () => {
  const [searchType, setSearchType] = useState('ticket');
  const [searchParams, setSearchParams] = useState({
    ticketNumber: '',
    name: '',
    email: ''
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPaymentStatus(null);

    try {
      let response;
      if (searchType === 'ticket') {
        response = await publicAPI.getPaymentStatus(searchParams.ticketNumber);
      } else {
        response = await publicAPI.searchPayments({
          name: searchParams.name,
          email: searchParams.email
        });
      }
      
      if (response.data.status === 'success') {
        setPaymentStatus(response.data.data.payment || response.data.data.payments);
      } else {
        setError('No payment records found');
      }
    } catch (err) {
      setError('Failed to fetch payment status. Please try again.');
      console.error('Error fetching payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Payment Status</h1>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setSearchType('ticket')}
                className={`px-4 py-2 rounded-md ${
                  searchType === 'ticket'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Search by Ticket
              </button>
              <button
                onClick={() => setSearchType('details')}
                className={`px-4 py-2 rounded-md ${
                  searchType === 'details'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Search by Details
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              {searchType === 'ticket' ? (
                <div>
                  <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700">
                    Enter Ticket Number
                  </label>
                  <input
                    type="text"
                    id="ticketNumber"
                    value={searchParams.ticketNumber}
                    onChange={(e) => setSearchParams({ ...searchParams, ticketNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your ticket number"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={searchParams.name}
                      onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={searchParams.email}
                      onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {paymentStatus && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
              {Array.isArray(paymentStatus) ? (
                <div className="space-y-4">
                  {paymentStatus.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Ticket Number</p>
                          <p className="font-medium">{payment.ticket_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`font-medium ${
                            payment.status === 'completed' ? 'text-green-600' : 
                            payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium">₹{payment.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{new Date(payment.payment_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Number</p>
                      <p className="font-medium">{paymentStatus.ticket_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`font-medium ${
                        paymentStatus.status === 'completed' ? 'text-green-600' : 
                        paymentStatus.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {paymentStatus.status.charAt(0).toUpperCase() + paymentStatus.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium">₹{paymentStatus.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(paymentStatus.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus; 