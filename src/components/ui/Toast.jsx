import React from 'react';

/**
 * Toast notification
 * 
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the toast
 * @param {string} props.message Message to display
 * @returns {JSX.Element}
 */
const Toast = ({ show, message }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-[200] flex items-center">
      <span>{message}</span>
    </div>
  );
};

export default Toast; 