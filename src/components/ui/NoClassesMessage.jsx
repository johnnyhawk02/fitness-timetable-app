import React, { memo } from 'react';

/**
 * Component to display a message when no classes are available
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isSwimmingMode Whether the app is in swimming mode
 */
const NoClassesMessage = ({ isSwimmingMode }) => {
  return (
    <div className="p-4">
      <div className="mt-10 text-center p-6 bg-white rounded-lg shadow">
        <svg 
          className="w-12 h-12 mx-auto text-gray-400 mb-3" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d={isSwimmingMode 
              ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" // No data icon for swimming
              : "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" // Sad face icon for fitness
            } 
          />
        </svg>
        
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          {isSwimmingMode 
            ? "No Pool at this Centre" 
            : "No Classes Found"
          }
        </h3>
        
        <p className="text-gray-500">
          {isSwimmingMode 
            ? "Try Bootle, Meadows or Dunes for swimming facilities." 
            : "Try adjusting your filters to see more classes."
          }
        </p>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(NoClassesMessage); 