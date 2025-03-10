import React, { useMemo } from 'react';
import { getClassCategory } from '../../services/classService';

// Centers abbreviations for compact display
const CENTER_ABBREVIATIONS = {
  'Bootle': 'BTL',
  'Meadows': 'MDW',
  'Netherton': 'NTH',
  'Crosby': 'CRB',
  'Dunes': 'DNS',
  'Litherland': 'LTH'
};

/**
 * Displays the list of classes grouped by day
 * 
 * @param {Object} props Component props
 * @param {Array} props.classes Filtered and sorted classes to display
 * @param {function} props.onClassClick Handler for when a class is clicked
 * @param {Object} props.colors Color theme 
 * @param {string} props.colorMode 'standard' or 'vibrant'
 * @returns {JSX.Element}
 */
const ClassList = ({ classes, onClassClick, colors = {}, colorMode = 'standard' }) => {
  // Debug logging
  console.log('ClassList rendering with', classes.length, 'classes');
  const poolClasses = classes.filter(c => 
    c.location && (
      c.location.includes('Pool') || 
      c.location.includes('Splash') || 
      c.location.includes('Swimming')
    )
  );
  console.log('Pool classes count:', poolClasses.length);
  
  // Group classes by day
  const classesByDay = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = days.reduce((acc, day) => {
      acc[day] = classes.filter(cls => cls.day === day);
      return acc;
    }, {});
    return grouped;
  }, [classes]);
  
  // Get color for a class based on its category
  const getClassColor = (activity) => {
    if (colorMode === 'standard') {
      return colors.primary || 'rgb(0,130,188)';
    }
    
    const category = getClassCategory(activity);
    return colors.categoryColors?.[category] || colors.primary || 'rgb(0,130,188)';
  };
  
  // Get color for a day header
  const getDayHeaderColor = (day) => {
    if (colorMode === 'standard') {
      // Use a darker shade for standard mode to ensure good contrast
      return 'rgb(0,99,165)'; // Darker blue for better contrast
    }
    
    // Make sure color is dark enough for white text
    return colors.dayColors?.[day] || colors.primaryMedium || 'rgb(0,99,165)';
  };
  
  // Get color for a center badge
  const getCenterColor = (center) => {
    if (colorMode === 'standard') {
      return `${colors.primary || 'rgb(0,130,188)'}/10`;
    }
    
    const rgb = colors.centerColors?.[center] || colors.primary || 'rgb(0,130,188)';
    return `${rgb}/10`; // 10% opacity
  };
  
  // Get text color for a center badge
  const getCenterTextColor = (center) => {
    if (colorMode === 'standard') {
      return colors.primary || 'rgb(0,130,188)';
    }
    
    return colors.centerColors?.[center] || colors.primary || 'rgb(0,130,188)';
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {Object.entries(classesByDay).map(([day, dayClasses]) => {
        // Always render the day, even if no classes
        // Just remove the early return
        
        return (
          <div 
            key={day}
            id={`day-${day}`}
            className="bg-white rounded-xl overflow-hidden shadow-md"
          >
            {/* Day header with enhanced styling */}
            <div 
              className="py-3 px-4 flex items-center border-b border-gray-200 sticky top-0 z-10 shadow-sm"
              style={{ 
                background: getDayHeaderColor(day),
                color: 'white'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h2 className="text-sm font-bold text-white">{day}</h2>
            </div>
            
            {/* Classes container */}
            <div className="divide-y divide-gray-100">
              {dayClasses.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm italic">No classes on {day}</div>
              ) : (
                dayClasses.map((cls, idx) => {
                  const classColor = getClassColor(cls.activity);
                  const centerBgColor = getCenterColor(cls.center);
                  const centerTextColor = getCenterTextColor(cls.center);
                  
                  // Add slightly different background for alternating items for better readability
                  const isEven = idx % 2 === 0;
                  
                  return (
                    <div 
                      key={`${day}-${idx}`} 
                      className={`flex items-start p-3.5 hover:bg-gray-50 cursor-pointer transition-colors group ${isEven ? 'bg-gray-50/50' : 'bg-white'}`}
                      onClick={() => onClassClick(cls)}
                    >
                      {/* Time column with subtle styling */}
                      <div className="w-28 flex flex-col text-left pr-4">
                        <div className="font-medium text-gray-700 text-sm pt-0.5">{cls.time}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 
                              className="text-sm font-semibold mb-0.5 transition-colors"
                              style={{ color: classColor }}
                            >
                              {cls.activity}
                            </h3>
                            
                            {cls.instructor && (
                              <div className="text-xs text-gray-500 mb-1">
                                {cls.instructor}
                              </div>
                            )}
                            
                            {/* Location information if available */}
                            {cls.location && (
                              <div className="text-xs text-gray-500 italic mt-1">
                                {cls.location}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            {/* Virtual indicator */}
                            {cls.virtual && (
                              <div className="mr-2 px-1.5 py-0.5 rounded text-xs border border-green-200 bg-green-50 text-green-700 flex items-center">
                                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                Virtual
                              </div>
                            )}
                            
                            {/* Center badge */}
                            <div
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: centerBgColor,
                                color: centerTextColor
                              }}
                            >
                              {CENTER_ABBREVIATIONS[cls.center] || cls.center}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassList; 