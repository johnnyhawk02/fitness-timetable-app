import React from 'react';

/**
 * Splash screen component shown during app initialization
 * 
 * @returns {JSX.Element}
 */
const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[rgb(0,130,188)] text-white z-50">
      <div className="relative">
        {/* Logo with pulsing animation */}
        <div className="animate-pulse">
          <img 
            src="/images/logo.jpg" 
            alt="Active Sefton Fitness" 
            className="h-32 md:h-40 object-contain rounded-lg shadow-lg"
          />
        </div>
        
        {/* Loading indicator */}
        <div className="mt-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
          <p className="text-lg font-medium">Loading Timetable...</p>
        </div>
      </div>
      
      {/* Animated wave background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <div className="absolute bottom-[-10px] left-0 right-0 h-20 bg-white/10 rounded-t-full transform animate-wave"></div>
        <div className="absolute bottom-[-15px] left-0 right-0 h-20 bg-white/5 rounded-t-full transform animate-wave-slow"></div>
      </div>
    </div>
  );
};

export default SplashScreen; 