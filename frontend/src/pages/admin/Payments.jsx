import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: '',
    payment_method: '',
    payment_type: '',
    status: '',
    notes: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllPayments(page);
      if (response.data && response.data.status === 'success') {
        setPayments(response.data.data.payments);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getAllStudents(1);
      if (response.data && response.data.status === 'success') {
        setStudents(response.data.data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
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
        // For edit mode, check if any changes were made
        if (isEditMode && currentPayment) {
            const hasChanges = Object.keys(formData).some(key => {
                // Special handling for amount to compare numbers
                if (key === 'amount') {
                    return parseFloat(formData[key]) !== parseFloat(currentPayment[key]);
                }
                // For other fields, compare as strings
                return String(formData[key]) !== String(currentPayment[key]);
            });

            if (!hasChanges) {
                toast.info('No changes were made');
                setShowModal(false);
                return;
            }

            // For edit mode, just submit the changes without validation
            await adminAPI.updatePayment(currentPayment.id, { ...formData, isEdit: true });
            toast.success('Payment updated successfully');
        } else {
            // For new payments, validate all required fields
            if (!formData.student_id || !formData.amount || !formData.payment_date || 
                !formData.payment_method || !formData.payment_type) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Validate amount is a positive number
            if (isNaN(formData.amount) || formData.amount <= 0) {
                toast.error('Amount must be a positive number');
                return;
            }

            // Validate payment method
            const validPaymentMethods = ['cash', 'credit_card', 'debit_card', 'bank_transfer'];
            if (!validPaymentMethods.includes(formData.payment_method.toLowerCase())) {
                toast.error('Invalid payment method');
                return;
            }

            // Validate payment type
            const validPaymentTypes = ['monthly', 'quarterly', 'yearly', 'one-time'];
            if (!validPaymentTypes.includes(formData.payment_type.toLowerCase())) {
                toast.error('Invalid payment type');
                return;
            }

            await adminAPI.createPayment(formData);
            toast.success('Payment created successfully');
        }

        // Refresh payments list
        fetchPayments();
        // Reset form and close modal
        setFormData({
            student_id: '',
            amount: '',
            payment_date: '',
            payment_method: '',
            payment_type: '',
            status: '',
            notes: ''
        });
        setIsEditMode(false);
        setCurrentPayment(null);
        setShowModal(false);
    } catch (error) {
        console.error('Error submitting payment:', error);
        toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

  const handleEdit = (payment) => {
    if (!payment || !payment.id) {
        toast.error('Invalid payment data');
        return;
    }

    // Format the date to YYYY-MM-DD for the date input
    const formattedDate = payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : '';

    setCurrentPayment(payment);
    setIsEditMode(true);
    setFormData({
        student_id: payment.student_id || '',
        amount: payment.amount || '',
        payment_date: formattedDate,
        payment_method: payment.payment_method || '',
        payment_type: payment.payment_type || '',
        status: payment.status || '',
        notes: payment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await adminAPI.deletePayment(id);
        toast.success('Payment deleted successfully');
        fetchPayments();
      } catch (err) {
        console.error('Error deleting payment:', err);
        toast.error('Failed to delete payment');
      }
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      console.log('handleStatusChange called with:', { paymentId, newStatus }); // Debug log

      // Validate payment ID
      if (!paymentId || typeof paymentId !== 'string') {
        toast.error('Valid payment ID is required');
        return;
      }

      // Validate status
      if (!newStatus || typeof newStatus !== 'string') {
        toast.error('Valid status is required');
        return;
      }

      // Validate status against valid values
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(newStatus.toLowerCase())) {
        toast.error('Invalid payment status');
        return;
      }

      // Call the API to update the status
      const response = await adminAPI.updatePaymentStatus(paymentId, newStatus);
      
      if (response) {
        toast.success('Payment status updated successfully');
        fetchPayments(); // Refresh the payments list
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      amount: '',
      payment_date: '',
      payment_method: '',
      payment_type: '',
      status: '',
      notes: ''
    });
    setIsEditMode(false);
    setCurrentPayment(null);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Payment Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Payment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getStudentName(payment.student_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${payment.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {payment.payment_method}
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(payment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusChange(payment.id, payment.status === 'completed' ? 'pending' : 'completed')}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      {payment.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditMode ? 'Edit Payment' : 'Add New Payment'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <select
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="e.g., 500.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                    <input
                      type="date"
                      id="payment_date"
                      name="payment_date"
                      value={formData.payment_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      id="payment_method"
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select
                      id="payment_type"
                      name="payment_type"
                      value={formData.payment_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any additional notes about the payment"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    {isEditMode ? 'Update' : 'Add'} Payment
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

export default Payments; 