import React from 'react';

/**
 * Toggle switch for virtual class inclusion
 * 
 * @param {Object} props Component props
 * @param {boolean} props.value Whether virtual classes are included
 * @param {function} props.onChange Handler for change
 * @returns {JSX.Element}
 */
const VirtualClassToggle = ({ value, onChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Virtual Classes
        </h3>
        <label className="inline-flex items-center cursor-pointer">
          <span className="mr-2 text-sm text-gray-700">
            {value ? 'Show' : 'Hide'}
          </span>
          <div className="relative">
            <input 
              type="checkbox" 
              value="" 
              className="sr-only peer" 
              checked={value} 
              onChange={() => onChange(!value)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(0,130,188)]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(0,130,188)]"></div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default VirtualClassToggle; 