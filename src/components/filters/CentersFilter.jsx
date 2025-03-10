import React from 'react';

// Centers with pools
const CENTERS_WITH_POOLS = ['Bootle', 'Meadows', 'Dunes'];

// Icons for each center
const centerIcons = {
  Bootle: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 9V5a2 2 0 0 1 2-2h2L8 7" />
      <path d="M13 5V3h6v6" />
      <path d="M21 9V3" />
    </svg>
  ),
  Meadows: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m2 12 10 5 10-5" />
      <path d="m2 12 10-5 10 5" />
      <path d="M12 22V12" />
      <path d="M12 12 7.5 6.5" />
      <path d="M12 12l4.5-5.5" />
    </svg>
  ),
  Dunes: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22 12 2l10 20" />
      <path d="M12 22V2" />
      <path d="M17 22V6" />
      <path d="M7 22v-8" />
    </svg>
  ),
  Netherton: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M9 22V12h6v10" />
      <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
    </svg>
  ),
  Crosby: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" />
      <path d="M8 7h.01" />
      <path d="M16 7h.01" />
      <path d="M12 7h.01" />
      <path d="M12 11h.01" />
      <path d="M16 11h.01" />
      <path d="M8 11h.01" />
      <path d="M10 22v-6.5m4 0V22" />
    </svg>
  ),
  Litherland: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m7 10 3 3 7-7" />
    </svg>
  )
};

/**
 * Component for center selection
 * 
 * @param {Object} props Component props
 * @param {Array} props.centers List of all centers
 * @param {Object} props.selected Object with center selection state
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active
 * @param {function} props.onChange Handler for selection change
 * @returns {JSX.Element}
 */
const CentersFilter = ({ centers, selected, isSwimmingMode, onChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
        </svg>
        Centers
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {centers.map(center => {
          const hasPool = CENTERS_WITH_POOLS.includes(center);
          const isSelected = selected[center];
          
          return (
            <button 
              key={center} 
              onClick={() => onChange(center)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left hover:bg-gray-50 ${
                isSelected ? 'bg-[rgb(0,130,188)]/5' : ''
              }`}
            >
              <div className="flex items-center">
                {centerIcons[center] || (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                )}
                <span className="hidden sm:inline text-sm text-gray-700">{center}</span>
                {isSwimmingMode && (
                  <span className={`ml-1.5 text-xs font-medium ${hasPool ? 'text-[rgb(0,130,188)]' : 'text-red-500'}`}>
                    <span className="hidden sm:inline">{hasPool ? '(Pool)' : '(No Pool)'}</span>
                    <span className="sm:hidden">{hasPool ? '🏊' : '❌'}</span>
                  </span>
                )}
              </div>
              {isSelected && (
                <svg className="w-4 h-4 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-3">
        <button 
          onClick={() => onChange('all')}
          className="px-2 py-1 text-xs font-medium text-[rgb(0,130,188)] bg-[rgb(0,130,188)]/5 hover:bg-[rgb(0,130,188)]/10 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z" />
            <path d="m9 13 2 2 4-4" />
          </svg>
          <span className="hidden sm:inline">Select All</span>
        </button>
        <button 
          onClick={() => onChange('none')}
          className="px-2 py-1 text-xs font-medium text-[rgb(0,130,188)] bg-[rgb(0,130,188)]/5 hover:bg-[rgb(0,130,188)]/10 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>
    </div>
  );
};

export default CentersFilter; 