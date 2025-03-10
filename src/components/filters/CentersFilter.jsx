import React from 'react';

// Centers with pools
const CENTERS_WITH_POOLS = ['Bootle', 'Meadows', 'Dunes'];

/**
 * Component for center selection using a simple dropdown with exclusive selection
 * 
 * @param {Object} props Component props
 * @param {Array} props.centers List of all centers
 * @param {Object} props.selected Object with center selection state
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active
 * @param {function} props.onChange Handler for selection change
 * @returns {JSX.Element}
 */
const CentersFilter = ({ centers, selected, isSwimmingMode, onChange }) => {
  // Check if a specific center is selected (exclusive selection)
  const selectedCenter = centers.find(center => selected[center] && 
    centers.some(c => c !== center && !selected[c])) || '';
  
  // Check if all centers are selected
  const isAllSelected = centers.every(center => selected[center]) || 
    centers.every(center => !selected[center]);
  
  // Create options array with centers and their labels
  const options = [
    { value: '', label: 'All Centers' },
    ...centers.map(center => ({
      value: center,
      label: center + (isSwimmingMode && CENTERS_WITH_POOLS.includes(center) ? ' (Pool)' : '')
    }))
  ];

  // Handle selection change - always exclusive (only one center at a time)
  const handleChange = (e) => {
    const value = e.target.value;
    
    if (value === '') {
      // "All" option selected - set all centers to true
      onChange('All');
    } else if (value) {
      // Exclusive selection - only select the chosen center
      onChange(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="px-2 py-1.5 sm:px-3 sm:py-2 border-b border-gray-100">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
          </svg>
          Centers
        </h3>
      </div>
      
      <div className="px-2 py-1.5 sm:px-3 sm:py-2">
        <div className="relative">
          <select
            value={selectedCenter || (isAllSelected ? '' : '')}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 bg-white py-1 sm:py-1.5 pl-2 pr-8 text-xs sm:text-sm text-gray-700 focus:border-[rgb(0,130,188)] focus:outline-none focus:ring-1 focus:ring-[rgb(0,130,188)]"
            style={{
              color: selectedCenter || isAllSelected ? 'rgb(0,130,188)' : 'inherit',
              fontWeight: selectedCenter || isAllSelected ? '500' : 'normal'
            }}
          >
            {options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{
                  color: (option.value === selectedCenter || (option.value === '' && isAllSelected)) ? 'rgb(0,130,188)' : 'inherit',
                  fontWeight: (option.value === selectedCenter || (option.value === '' && isAllSelected)) ? '500' : 'normal',
                  backgroundColor: (option.value === selectedCenter || (option.value === '' && isAllSelected)) ? 'rgba(0,130,188,0.1)' : 'transparent'
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

export default CentersFilter; 