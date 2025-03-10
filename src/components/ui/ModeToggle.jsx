import React, { useState, useRef, useEffect } from 'react';

/**
 * Toggle between swimming and fitness modes
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active
 * @param {function} props.onToggle Handler for mode toggle
 * @returns {JSX.Element}
 */
const ModeToggle = ({ isSwimmingMode, onToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRef = useRef(null);
  
  const toggleDropdown = () => {
    if (!dropdownOpen && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      // Position dropdown to align with left edge of button and add a small margin below
      setDropdownPosition({
        top: rect.bottom + 5,
        left: Math.min(rect.left, window.innerWidth - 176) // Ensure dropdown doesn't go off screen
      });
    }
    setDropdownOpen(!dropdownOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  return (
    <div className="relative inline-block mode-dropdown">
      <button
        ref={dropdownButtonRef}
        onClick={toggleDropdown}
        className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-center">
          {isSwimmingMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 010 8h-1"></path>
              <path d="M5 8h8a7 7 0 017 7v1a7 7 0 01-7 7H6a4 4 0 01-4-4v-8a4 4 0 014-4z"></path>
            </svg>
          )}
          <span className="text-sm font-medium mr-1 hidden sm:inline">{isSwimmingMode ? 'Swimming' : 'Fitness'}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>
      
      {/* Dropdown menu */}
      {dropdownOpen && (
        <div 
          className="fixed py-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-[100]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <button 
            onClick={() => {
              onToggle(false);
              setDropdownOpen(false);
            }}
            className={`w-full block px-4 py-2 text-sm text-left ${!isSwimmingMode ? 'text-[rgb(0,130,188)] font-medium' : 'text-gray-700'} hover:bg-gray-100`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"></path>
                <path d="M5 8h8a7 7 0 017 7v1a7 7 0 01-7 7H6a4 4 0 01-4-4v-8a4 4 0 014-4z"></path>
              </svg>
              Fitness Classes
            </div>
          </button>
          <button 
            onClick={() => {
              onToggle(true);
              setDropdownOpen(false);
            }}
            className={`w-full block px-4 py-2 text-sm text-left ${isSwimmingMode ? 'text-[rgb(0,130,188)] font-medium' : 'text-gray-700'} hover:bg-gray-100`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
              </svg>
              Swimming
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ModeToggle; 