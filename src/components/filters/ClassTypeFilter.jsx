import React from 'react';

/**
 * Component for filtering by class type using a dropdown
 * 
 * @param {Object} props Component props
 * @param {string} props.value Current selected class type
 * @param {function} props.onChange Handler for change
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active (defaults to false)
 * @returns {JSX.Element}
 */
const ClassTypeFilter = ({ value, onChange, isSwimmingMode = false }) => {
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
    <div className={`bg-white rounded-lg shadow-sm border ${isSwimmingMode ? 'border-blue-200' : 'border-orange-200'} overflow-hidden`}>
      <div className="p-1.5">
        <div className="relative">
          <select
            value={value}
            onChange={handleChange}
            className={`block w-full rounded-md border ${isSwimmingMode ? 'border-blue-100 focus:border-blue-400' : 'border-orange-100 focus:border-orange-400'} bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 ${isSwimmingMode ? 'focus:ring-blue-400' : 'focus:ring-orange-400'} appearance-none`}
            style={{
              color: value 
                ? (isSwimmingMode ? 'rgb(3,105,161)' : 'rgb(234,88,12)') 
                : 'inherit',
              fontWeight: value ? '500' : 'normal'
            }}
          >
            {classTypes.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{
                  color: option.value === value 
                    ? (isSwimmingMode ? 'rgb(3,105,161)' : 'rgb(234,88,12)') 
                    : 'inherit',
                  fontWeight: option.value === value ? '500' : 'normal',
                  backgroundColor: option.value === value 
                    ? (isSwimmingMode ? 'rgba(3,105,161,0.08)' : 'rgba(234,88,12,0.08)') 
                    : 'transparent'
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

export default ClassTypeFilter; 