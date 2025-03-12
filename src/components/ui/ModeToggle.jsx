import React, { memo, useState } from 'react';
import { COLORS } from '../../utils/colorThemes';

/**
 * ModeToggle component for switching between fitness and swimming modes
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isSwimmingMode Whether the app is in swimming mode
 * @param {Function} props.onModeSwitch Callback when the mode is switched
 */
const ModeToggle = ({ isSwimmingMode, onModeSwitch }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Function to directly toggle mode with animation
  const handleModeSwitch = () => {
    console.log(`Toggling mode to ${!isSwimmingMode ? 'swimming' : 'fitness'}`);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    // Call the mode switch handler
    onModeSwitch();
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        {/* Mode toggle with animation */}
        <button
          onClick={handleModeSwitch}
          className={`flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm h-8 px-3.5 focus:ring-2 focus:ring-white/30 focus:outline-none ${isAnimating ? 'scale-[0.98] bg-white/20' : ''}`}
          title={`Switch to ${isSwimmingMode ? 'Fitness' : 'Swimming'} mode`}
        >
          <div className="flex items-center">
            {/* Icons container with fixed width for proper alignment */}
            <div className="relative w-4 h-4 mr-1.5 flex-shrink-0">
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
            <span className="text-sm font-medium relative w-[70px]">
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
        
        <h2 className="text-xl font-bold ml-3">
          {isSwimmingMode ? "Swimming Timetable" : "Fitness Timetable"}
        </h2>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(ModeToggle); 