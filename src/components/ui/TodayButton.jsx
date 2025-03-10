import React from 'react';

/**
 * Button to scroll to today's classes
 * 
 * @param {Object} props Component props
 * @param {function} props.onClick Handler for click
 * @param {Object} props.colors Color theme object
 * @returns {JSX.Element}
 */
const TodayButton = ({ onClick, colors = {} }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all shadow-sm backdrop-blur-sm h-8 px-3"
      title="Scroll to today's classes"
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        ></path>
      </svg>
      <span className="text-sm font-medium">Today</span>
    </button>
  );
};

export default TodayButton; 