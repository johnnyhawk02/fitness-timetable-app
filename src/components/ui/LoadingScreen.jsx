import React from 'react';

/**
 * LoadingScreen component that displays during initial app load
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the loading screen
 * @param {Object} props.colors - Color theme object
 * @returns {JSX.Element} Loading screen component
 */
const LoadingScreen = ({ show, colors = {} }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-blue-50 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md p-6 flex flex-col items-center">
        {/* Logo - Enlarged for more prominence */}
        <div className="mb-10 p-8 rounded-lg bg-white shadow-lg">
          <img 
            src="/images/logo.jpg" 
            alt="Active Sefton Fitness" 
            className="h-24 object-contain"
          />
        </div>
        
        {/* Loading text */}
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Loading Fitness Timetable
        </h2>
        
        {/* Spinner */}
        <div className="relative w-16 h-16 mb-6">
          {/* Sefton Blue spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-t-4 border-[rgb(0,130,188)] border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading message */}
        <p className="text-sm text-gray-600 mt-6 text-center">
          Fetching the latest class schedule.<br/>
          This may take a moment...
        </p>
        
        {/* Activity indicators */}
        <div className="flex gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[rgb(0,130,188)] animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[rgb(0,130,188)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[rgb(0,130,188)] animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 