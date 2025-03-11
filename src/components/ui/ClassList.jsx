import React from 'react';
import { getClassCategory } from '../../services/classService';

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
 * Displays the list of classes grouped by day
 * 
 * @param {Object} props Component props
 * @param {Object} props.classesByDay Classes grouped by day
 * @param {function} props.onClassClick Handler for when a class is clicked
 * @param {Object} props.colors Color theme
 * @param {Array} props.days Array of day names
 * @param {boolean} props.isSwimmingMode Whether swimming mode is active
 * @returns {JSX.Element}
 */
const ClassList = ({ 
  classesByDay, 
  onClassClick, 
  colors = {}, 
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  isSwimmingMode = false
}) => {
  // Debug logging
  console.log('ClassList rendering with days:', Object.keys(classesByDay).length);
  
  // Get total class count for debugging
  const totalClasses = Object.values(classesByDay).reduce(
    (sum, dayClasses) => sum + (Array.isArray(dayClasses) ? dayClasses.length : 0), 
    0
  );
  console.log('Total classes:', totalClasses);
  
  // Get color for a class based on its category
  const getClassColor = (activity) => {
    // Use mode-specific primary colors
    return isSwimmingMode 
      ? colors.swimming.primary || 'rgb(3,105,161)'
      : colors.fitness.primary || 'rgb(233,84,32)';
  };
  
  // Get color for day header based on the day and mode
  const getDayHeaderColor = (day) => {
    // Use the helper function from COLORS that considers the current mode
    if (colors.getDayColor) {
      return colors.getDayColor(day, isSwimmingMode);
    }
    
    // Fallback if helper function not available
    if (isSwimmingMode) {
      // Simplified swimming colors - just two alternating colors
      const dayColors = {
        'Monday': 'rgb(20,184,166)', // Teal
        'Tuesday': 'rgb(6,182,212)', // Cyan
        'Wednesday': 'rgb(20,184,166)', // Teal
        'Thursday': 'rgb(6,182,212)', // Cyan
        'Friday': 'rgb(20,184,166)', // Teal
        'Saturday': 'rgb(6,182,212)', // Cyan
        'Sunday': 'rgb(20,184,166)', // Teal
      };
      return dayColors[day] || 'rgb(20,184,166)';
    } else {
      // Simplified fitness colors - just two alternating colors
      const dayColors = {
        'Monday': 'rgb(239,68,68)', // Red
        'Tuesday': 'rgb(234,88,12)', // Orange
        'Wednesday': 'rgb(239,68,68)', // Red
        'Thursday': 'rgb(234,88,12)', // Orange
        'Friday': 'rgb(239,68,68)', // Red
        'Saturday': 'rgb(234,88,12)', // Orange
        'Sunday': 'rgb(239,68,68)', // Red
      };
      return dayColors[day] || 'rgb(239,68,68)';
    }
  };
  
  // Format time range for better readability
  const formatTimeRange = (timeString) => {
    if (!timeString) return '';
    
    // Handle formats like "08:00-09:00" or "08:00 - 09:00"
    const times = timeString.replace(' ', '').split('-');
    if (times.length === 2) {
      return (
        <div className="flex flex-col items-start">
          <span className="font-medium">{times[0]}</span>
          <span className="text-xs text-gray-500">to {times[1]}</span>
        </div>
      );
    }
    
    return timeString;
  };
  
  // Extract hour from time string (format: "HH:MM" or "HH:MM-HH:MM")
  const extractHour = (timeString) => {
    if (!timeString) return 0;
    
    // Get the first part (start time)
    const startTime = timeString.split('-')[0].trim();
    
    // Extract hour
    const hourMatch = startTime.match(/^(\d+):/);
    if (hourMatch && hourMatch[1]) {
      return parseInt(hourMatch[1], 10);
    }
    
    return 0;
  };
  
  // Check if we have any classes across all days
  const hasAnyClasses = days.some(day => classesByDay[day]?.length > 0);
  
  // If no classes at all, show a message
  if (!hasAnyClasses) {
    // Show a swimming-specific message if in swimming mode
    if (isSwimmingMode) {
      return (
        <div className="p-4">
          <div className="mt-10 text-center p-6 bg-white rounded-lg shadow">
            <svg className="w-12 h-12 mx-auto text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No Pool at this Centre</h3>
            <p className="text-gray-500">Try Bootle, Meadows or Dunes</p>
          </div>
        </div>
      );
    }
    
    // Default message for fitness mode
    return (
      <div className="p-4">
        <div className="mt-10 text-center p-6 bg-white rounded-lg shadow">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Classes Found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more classes.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 pb-16 space-y-6">
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
                No classes on {day}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dayClasses.map((cls, idx) => (
                  <div 
                    key={`${day}-${idx}`}
                    className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-gray-50/40' : ''}`}
                    onClick={() => onClassClick(cls)}
                    data-hour={extractHour(cls.time)}
                  >
                    <div className="grid grid-cols-12 gap-2">
                      {/* Time column */}
                      <div className="col-span-2 pr-2 text-sm">
                        {formatTimeRange(cls.time)}
                      </div>
                      
                      {/* Activity & Location column */}
                      <div className="col-span-7 pr-2 flex flex-col items-start">
                        <div className="font-medium text-left truncate w-full" style={{ color: getClassColor(cls.activity) }}>
                          {cls.activity}
                        </div>
                        <div className="text-xs text-left text-gray-600 mt-0.5 truncate w-full">
                          {cls.location}
                        </div>
                      </div>
                      
                      {/* Center and virtual badges */}
                      <div className="col-span-3 flex flex-wrap items-start justify-end gap-1.5 h-full">
                        <div className="flex flex-col items-end">
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800 whitespace-nowrap">
                            {CENTER_ABBREVIATIONS[cls.center] || cls.center}
                          </span>
                          {cls.virtual && (
                            <span className="mt-1 inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 whitespace-nowrap">
                              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                              Virtual
                            </span>
                          )}
                        </div>
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

export default ClassList; 