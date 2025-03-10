import React, { useState } from 'react';

/**
 * Toggle between swimming and fitness modes
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active
 * @param {function} props.onToggle Handler for mode toggle
 * @param {Object} props.colors Color theme object
 * @returns {JSX.Element}
 */
const ModeToggle = ({ isSwimmingMode, onToggle, colors = {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Function to directly toggle mode with animation
  const directToggleMode = () => {
    const newMode = !isSwimmingMode;
    console.log(`Directly toggling mode to ${newMode ? 'swimming' : 'fitness'}`);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    // Toggle mode
    onToggle(newMode);
  };
  
  return (
    <div className="relative inline-block mode-toggle">
      {/* Direct toggle button */}
      <button
        onClick={directToggleMode}
        className={`flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm h-8 sm:w-auto sm:px-3.5 focus:ring-2 focus:ring-white/30 focus:outline-none ${isAnimating ? 'scale-[0.98] bg-white/20' : ''}`}
        title={`Switch to ${isSwimmingMode ? 'Fitness' : 'Swimming'} mode`}
      >
        <div className="flex items-center">
          {/* Icons container with fixed width for proper alignment */}
          <div className="relative w-4 h-4 sm:mr-1.5 flex-shrink-0">
            {/* Swimming icon with crossfade transition */}
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isSwimmingMode ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-1'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
              </svg>
            </div>
            
            {/* Fitness icon with crossfade transition */}
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${!isSwimmingMode ? 'opacity-100 transform-none' : 'opacity-0 translate-y-1'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"></path>
                <path d="M5 8h8a7 7 0 017 7v1a7 7 0 01-7 7H6a4 4 0 01-4-4v-8a4 4 0 014-4z"></path>
              </svg>
            </div>
          </div>
          
          {/* Text label with crossfade */}
          <span className="text-sm font-medium hidden sm:inline relative w-[70px]">
            <span className={`absolute left-0 whitespace-nowrap transition-all duration-500 ease-in-out ${isSwimmingMode ? 'opacity-100 transform-none' : 'opacity-0'}`}>
              Swimming
            </span>
            <span className={`absolute left-0 whitespace-nowrap transition-all duration-500 ease-in-out ${!isSwimmingMode ? 'opacity-100 transform-none' : 'opacity-0'}`}>
              Fitness
            </span>
            {/* Invisible spacer with the longer text to maintain consistent width */}
            <span className="invisible">Swimming</span>
          </span>
        </div>
      </button>
    </div>
  );
};

export default ModeToggle; 