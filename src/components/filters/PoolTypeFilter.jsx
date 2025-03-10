import React from 'react';
import FilterButton from './FilterButton';

/**
 * Component for filtering by pool type
 * 
 * @param {Object} props Component props
 * @param {string} props.value Current selected pool type
 * @param {function} props.onChange Handler for change
 * @returns {JSX.Element}
 */
const PoolTypeFilter = ({ value, onChange }) => {
  // Icons for each pool type
  const poolTypeIcons = {
    all: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 sm:mr-1.5" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
      </svg>
    ),
    main: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 sm:mr-1.5" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
        <path d="M2 18V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12" />
        <path d="M3 16h18" />
      </svg>
    ),
    leisure: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 sm:mr-1.5" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M22 9a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1Z" />
        <path d="M18 16v2a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4h4" />
        <path d="M12 19v-8" />
      </svg>
    )
  };
  
  return (
    <div className="bg-[rgb(0,130,188)]/5 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" 
            clipRule="evenodd" 
          />
        </svg>
        Pool Type
      </h3>
      
      <div className="flex gap-2">
        <FilterButton
          icon={poolTypeIcons.all}
          label="All Pools"
          isSelected={value === 'all'}
          onClick={() => onChange('all')}
        />
        
        <FilterButton
          icon={poolTypeIcons.main}
          label="Main Pool"
          isSelected={value === 'main'}
          onClick={() => onChange('main')}
        />
        
        <FilterButton
          icon={poolTypeIcons.leisure}
          label="Leisure/Learner Pool"
          isSelected={value === 'leisure'}
          onClick={() => onChange('leisure')}
        />
      </div>
    </div>
  );
};

export default PoolTypeFilter; 