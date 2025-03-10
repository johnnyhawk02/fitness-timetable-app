import React from 'react';

/**
 * Component for filtering by class type using a dropdown
 * 
 * @param {Object} props Component props
 * @param {string} props.value Current selected class type
 * @param {function} props.onChange Handler for change
 * @returns {JSX.Element}
 */
const ClassTypeFilter = ({ value, onChange }) => {
  // Options for the dropdown
  const classTypes = [
    { value: '', label: 'All Classes' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Strength' },
    { value: 'mind-body', label: 'Mind & Body' },
    { value: 'core', label: 'Core' },
    { value: 'spinning', label: 'Spinning' }
  ];
  
  // Handle change to ensure "All Classes" is exclusive
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue); // Pass the new value to parent component
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="px-2 py-1.5 sm:px-3 sm:py-2 border-b border-gray-100">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Class Type
        </h3>
      </div>
      
      <div className="px-2 py-1.5 sm:px-3 sm:py-2">
        <div className="relative">
          <select
            value={value}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 bg-white py-1 sm:py-1.5 pl-2 pr-8 text-xs sm:text-sm text-gray-700 focus:border-[rgb(0,130,188)] focus:outline-none focus:ring-1 focus:ring-[rgb(0,130,188)]"
            style={{
              color: value ? 'rgb(0,130,188)' : 'inherit',
              fontWeight: value ? '500' : 'normal'
            }}
          >
            {classTypes.map(option => (
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 sm:px-2 text-gray-500">
            <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassTypeFilter; 