import React from 'react';

/**
 * Filter button for the app bar
 * 
 * @param {Object} props Component props
 * @param {function} props.onClick Handler for click
 * @param {number} props.activeCount Number of active filters
 * @returns {JSX.Element}
 */
const FilterButton = ({ onClick, activeCount = 0 }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
    >
      <svg 
        className="w-4 h-4 mr-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        ></path>
      </svg>
      <span className="text-sm font-medium mr-1 hidden sm:inline">Filters</span>
      {activeCount > 0 && 
        <span className="bg-orange-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full px-1.5">
          {activeCount}
        </span>
      }
    </button>
  );
};

export default FilterButton; 