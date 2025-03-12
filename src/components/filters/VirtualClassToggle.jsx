import React from 'react';

/**
 * Toggle for virtual class inclusion using a dropdown select
 * 
 * @param {Object} props Component props
 * @param {boolean} props.value Whether virtual classes are included
 * @param {function} props.onChange Handler for change
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active (defaults to false)
 * @returns {JSX.Element}
 */
const VirtualClassToggle = ({ value, onChange, isSwimmingMode = false }) => {
  const options = [
    { value: 'true', label: 'Include virtual classes' },
    { value: 'false', label: 'Exclude virtual classes' }
  ];

  const currentValue = value ? 'true' : 'false';

  const handleChange = (e) => {
    onChange(e.target.value === 'true');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden w-[90%] mx-auto">
      <div className="p-1">
        <div className="relative">
          <select
            value={currentValue}
            onChange={handleChange}
            className={`block w-full rounded-md bg-white py-1 pl-2 pr-6 text-xs text-gray-700 focus:outline-none focus:ring-1 ${isSwimmingMode ? 'focus:ring-blue-400' : 'focus:ring-orange-400'} appearance-none`}
            style={{
              color: currentValue === 'false'
                ? (isSwimmingMode ? 'rgb(3,105,161)' : 'rgb(234,88,12)') 
                : 'inherit',
              fontWeight: currentValue === 'false' ? '500' : 'normal'
            }}
          >
            {options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{
                  color: option.value === currentValue 
                    ? (isSwimmingMode ? 'rgb(3,105,161)' : 'rgb(234,88,12)') 
                    : 'inherit',
                  fontWeight: option.value === currentValue ? '500' : 'normal',
                  backgroundColor: option.value === currentValue 
                    ? (isSwimmingMode ? 'rgba(3,105,161,0.08)' : 'rgba(234,88,12,0.08)') 
                    : 'transparent'
                }}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-500">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualClassToggle; 