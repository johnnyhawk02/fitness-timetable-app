import React from 'react';
import FilterButton from './FilterButton';

// Class categories
const classCategories = {
  cardio: 'Cardio',
  strength: 'Strength',
  'mind-body': 'Mind & Body',
  core: 'Core',
  spinning: 'Spinning'
};

// Icons for each category
const categoryIcons = {
  cardio: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.4 3.6a2 2 0 0 0-2.8 0l-8.5 8.5a2 2 0 0 0 0 2.8l3.4 3.4a2 2 0 0 0 2.8 0l8.5-8.5a2 2 0 0 0 0-2.8l-3.4-3.4Z" />
      <path d="m2 22 3-3" />
      <path d="M18 2 6 14" />
      <path d="m17 7-5 5" />
      <path d="m7 17-5 5" />
    </svg>
  ),
  strength: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5v14" />
      <path d="M18 5v14" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
      <path d="M6 5h12" />
      <path d="M6 19h12" />
    </svg>
  ),
  'mind-body': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 1 1-8 0 4 4 0 1 1 8 0" />
    </svg>
  ),
  core: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a4.2 4.2 0 0 0 4 4 4.2 4.2 0 0 1 4 4 4.2 4.2 0 0 1-4 4 4.2 4.2 0 0 0-4 4" />
      <path d="M12 22a4.2 4.2 0 0 1-4-4 4.2 4.2 0 0 0-4-4 4.2 4.2 0 0 0 4-4 4.2 4.2 0 0 1 4-4" />
    </svg>
  ),
  spinning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M3 12h3" />
      <path d="M15 12h3" />
      <path d="M7.5 7.5 6 6" />
      <path d="M16.5 7.5 18 6" />
      <path d="M7.5 16.5 6 18" />
      <path d="M16.5 16.5 18 18" />
    </svg>
  ),
  all: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
      <path d="M12 12v9" />
      <path d="M8 21h8" />
      <path d="M4.5 9 2 12l2.5 3" />
      <path d="M19.5 9 22 12l-2.5 3" />
    </svg>
  )
};

/**
 * Component for filtering by class type
 * 
 * @param {Object} props Component props
 * @param {string} props.value Current selected class type
 * @param {function} props.onChange Handler for change
 * @returns {JSX.Element}
 */
const ClassTypeFilter = ({ value, onChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Class Type
      </h3>
      
      <div className="flex flex-wrap gap-2 items-center">
        {Object.entries(classCategories).map(([categoryId, categoryName]) => (
          <FilterButton
            key={categoryId}
            icon={categoryIcons[categoryId]}
            label={categoryName}
            isSelected={value === categoryId}
            onClick={() => onChange(categoryId)}
          />
        ))}
        
        <FilterButton
          icon={categoryIcons.all}
          label="All"
          isSelected={!value}
          onClick={() => onChange('')}
        />
      </div>
    </div>
  );
};

export default ClassTypeFilter; 