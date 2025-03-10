import React from 'react';

/**
 * Toggle for virtual class inclusion using a dropdown select
 * 
 * @param {Object} props Component props
 * @param {boolean} props.value Whether virtual classes are included
 * @param {function} props.onChange Handler for change
 * @returns {JSX.Element}
 */
const VirtualClassToggle = ({ value, onChange }) => {
  const options = [
    { value: 'true', label: 'Include virtual classes' },
    { value: 'false', label: 'Exclude virtual classes' }
  ];

  const currentValue = value ? 'true' : 'false';

  const handleChange = (e) => {
    onChange(e.target.value === 'true');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-2">
        <div className="relative">
          <select
            value={currentValue}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:border-[rgb(0,130,188)] focus:outline-none focus:ring-1 focus:ring-[rgb(0,130,188)]"
            style={{
              color: value ? 'rgb(0,130,188)' : 'inherit',
              fontWeight: value ? '500' : 'normal'
            }}
          >
            {options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{
                  color: option.value === currentValue ? 'rgb(0,130,188)' : 'inherit',
                  fontWeight: option.value === currentValue ? '500' : 'normal',
                  backgroundColor: option.value === currentValue ? 'rgba(0,130,188,0.1)' : 'transparent'
                }}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualClassToggle; 