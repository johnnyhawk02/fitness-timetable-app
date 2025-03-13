import React, { memo } from 'react';
import { getClassCategory } from '../../services/classService';
import { COLORS } from '../../utils/colorThemes';

// Centers abbreviations for compact display
const CENTER_ABBREVIATIONS = {
  'Bootle': 'BLC',
  'Meadows': 'MDW',
  'Netherton': 'NAC',
  'Crosby': 'CLC',
  'Dunes': 'DSW',
  'Litherland': 'LSP'
};

/**
 * Helper function to extract the hour from a time string
 * 
 * @param {string} timeString Time string in format "HH:MM"
 * @returns {number} The hour
 */
const extractHour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  const match = timeString.match(/^(\d+):/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Format a time range for display
 * 
 * @param {string} timeString Time string to format
 * @returns {string} Formatted time string
 */
const formatTimeRange = (timeString) => {
  if (!timeString) return '';
  
  // Handle formats like "08:00-09:00" or "08:00 - 09:00"
  const times = timeString.replace(' ', '').split('-');
  if (times.length === 2) {
    return (
      <>
        <div className="font-medium">{times[0]}</div>
        <div className="text-xs text-gray-500">to {times[1]}</div>
      </>
    );
  }
  
  return timeString;
};

/**
 * Displays the list of classes grouped by day
 * 
 * @param {Object} props Component props
 * @param {Object} props.classesByDay Classes grouped by day
 * @param {function} props.onClassClick Handler for when a class is clicked
 * @param {Array} props.days Array of day names
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active
 * @returns {JSX.Element}
 */
const ClassList = ({ 
  classesByDay, 
  onClassClick, 
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  isSwimmingMode = false
}) => {
  // Check if any classes exist for any day
  const hasAnyClasses = Object.values(classesByDay).some(
    dayClasses => Array.isArray(dayClasses) && dayClasses.length > 0
  );
  
  // Get color for day header based on the day and mode
  const getDayHeaderColor = (day) => {
    return COLORS.getDayColor(day, isSwimmingMode);
  };
  
  // If there are no classes at all, show a message
  if (!hasAnyClasses) {
    return (
      <div className="p-4">
        <div className="mt-10 text-center p-6 bg-white rounded-lg shadow">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            {isSwimmingMode ? "No Pool at this Centre" : "No Classes Found"}
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
  }

  return (
    <div className="pb-16 space-y-6">
      {days.map(day => {
        // Get classes for this day
        const dayClasses = classesByDay[day] || [];
        
        // If no classes for this day, still show the day header but with a message
        return (
          <div key={day} id={`day-${day}`} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            {/* Day header - styled with mode-specific colors */}
            <div 
              className="sticky top-0 z-10 py-2.5 px-4 text-white font-semibold flex items-center"
              style={{ backgroundColor: getDayHeaderColor(day) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {day}
            </div>
            
            {/* Classes for this day */}
            {dayClasses.length === 0 ? (
              <div className="p-6 text-left text-gray-500 italic">
                {isSwimmingMode ? 
                  `Small pool closed on ${day}` : 
                  `No classes on ${day}`
                }
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dayClasses.map((cls, idx) => (
                  <div 
                    key={`${day}-${idx}`}
                    className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors relative ${idx % 2 === 0 ? 'bg-gray-50/40' : ''}`}
                    onClick={() => onClassClick(cls)}
                    data-hour={extractHour(cls.time)}
                  >
                    <div className="grid grid-cols-12 gap-2 items-baseline">
                      {/* Time column */}
                      <div className="col-span-2 pr-2 text-sm">
                        <span className="font-medium">{cls.time?.split('-')[0] || ''}</span>
                        {cls.time?.includes('-') && (
                          <div className="text-xs text-gray-500 mt-0.5">to {cls.time?.split('-')[1]?.trim() || ''}</div>
                        )}
                      </div>
                      
                      {/* Activity column - reduced width on mobile */}
                      <div className="col-span-7 sm:col-span-8 text-left">
                        <span className="font-medium text-gray-900 text-left block w-full">{cls.activity}</span>
                        
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          {/* Location with icon only */}
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{cls.location}</span>
                          </div>
                          
                          {/* Virtual class indicator */}
                          {cls.virtual && (
                            <div className="flex items-center ml-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-blue-500">Virtual</span>
                            </div>
                          )}
                          
                          {/* Only show instructor in fitness mode */}
                          {!isSwimmingMode && cls.instructor && (
                            <div className="flex items-center ml-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {cls.instructor}
                            </div>
                          )}
                          
                          {/* Only show duration in fitness mode */}
                          {!isSwimmingMode && cls.duration && (
                            <div className="flex items-center ml-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {cls.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Center name - wider on mobile */}
                      <div className="col-span-3 sm:col-span-2 text-right">
                        {cls.center && (
                          <span 
                            className="inline-block px-1.5 sm:px-2 py-0.5 text-white text-[8px] sm:text-[9px] rounded capitalize font-medium align-baseline text-center"
                            style={{ 
                              backgroundColor: COLORS.centerColors[cls.center] || '#6B7280',
                              fontSize: '0.5375rem',
                              width: '70px',
                              maxWidth: '100%'
                            }}
                          >
                            {cls.center}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(ClassList); 