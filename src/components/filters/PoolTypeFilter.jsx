import React from 'react';

/**
 * Component for filtering by pool type using a dropdown
 * 
 * @param {Object} props Component props
 * @param {string} props.value Current selected pool type
 * @param {function} props.onChange Handler for change
 * @returns {JSX.Element}
 */
const PoolTypeFilter = ({ value, onChange }) => {
  // Options for the dropdown
  const poolTypes = [
    { value: 'all', label: 'All Pools' },
    { value: 'main', label: 'Main Pool' },
    { value: 'leisure', label: 'Leisure/Learner Pool' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-2">
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full rounded-md border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:border-[rgb(0,130,188)] focus:outline-none focus:ring-1 focus:ring-[rgb(0,130,188)]"
            style={{
              color: value !== 'all' ? 'rgb(0,130,188)' : 'inherit',
              fontWeight: value !== 'all' ? '500' : 'normal'
            }}
          >
            {poolTypes.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{
                  color: option.value === value ? 'rgb(0,130,188)' : 'inherit',
                  fontWeight: option.value === value ? '500' : 'normal',
                  backgroundColor: option.value === value ? 'rgba(0,130,188,0.1)' : 'transparent'
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

export default PoolTypeFilter; 