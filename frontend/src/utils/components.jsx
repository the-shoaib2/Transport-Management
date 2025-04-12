import React from 'react';

/**
 * Get status badge component with appropriate styling
 * @param {string} status - The status to display
 * @returns {JSX.Element} Status badge component
 */
export const getStatusBadge = (status) => {
  const statusMap = {
    'scheduled': { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
    'in-progress': { color: 'bg-yellow-100 text-yellow-800', text: 'In Progress' },
    'completed': { color: 'bg-green-100 text-green-800', text: 'Completed' },
    'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
  };
  
  const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
      {statusInfo.text}
    </span>
  );
}; 