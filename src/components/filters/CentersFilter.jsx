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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-2">
        <div className="relative">
          <select
            value={selectedCenter || (isAllSelected ? '' : '')}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:border-[rgb(0,130,188)] focus:outline-none focus:ring-1 focus:ring-[rgb(0,130,188)]"
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

export default CentersFilter; 