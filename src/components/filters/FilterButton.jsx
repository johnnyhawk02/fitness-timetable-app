import React from 'react';

/**
 * A reusable button component for filter options
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.icon Icon to display
 * @param {string} props.label Text label
 * @param {boolean} props.isSelected Whether this option is selected
 * @param {function} props.onClick Click handler
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element}
 */
const FilterButton = ({ 
  icon, 
  label, 
  isSelected, 
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        isSelected
          ? 'bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]'
          : 'bg-[rgb(0,130,188)]/5 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/10'
      } ${className}`}
    >
      <div className="flex items-center">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </div>
      {isSelected && (
        <svg
          className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      )}
    </button>
  );
};

export default FilterButton; 