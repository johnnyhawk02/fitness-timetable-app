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
  
  // Get background color for a day header
  const getDayHeaderColor = (day) => {
    if (colorMode === 'standard') {
      return colors.primaryMedium || 'rgb(0,130,188, 0.6)';
    }
    
    return colors.dayColors?.[day] || colors.primaryMedium || 'rgb(0,130,188, 0.6)';
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
    <div className="grid grid-cols-1 gap-4 p-4">
      {Object.entries(classesByDay).map(([day, dayClasses]) => {
        if (dayClasses.length === 0) return null;
        
        return (
          <div 
            key={day}
            id={`day-${day}`}
            className="bg-white rounded-lg overflow-hidden shadow"
          >
            <div 
              className="text-white font-semibold py-2 px-4 text-sm"
              style={{ backgroundColor: getDayHeaderColor(day) }}
            >
              {day}
            </div>
            <div className="divide-y divide-gray-100">
              {dayClasses.length === 0 ? (
                <div className="p-4 text-gray-500">No classes available</div>
              ) : (
                dayClasses.map((cls, idx) => {
                  const classColor = getClassColor(cls.activity);
                  const centerBgColor = getCenterColor(cls.center);
                  const centerTextColor = getCenterTextColor(cls.center);
                  
                  return (
                    <div 
                      key={`${day}-${idx}`} 
                      className="flex items-start p-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => onClassClick(cls)}
                    >
                      <div className="w-28 flex flex-col text-left pr-4">
                        <div className="font-medium text-gray-700 text-sm pt-0.5">{cls.time}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm flex items-center" style={{ color: classColor }}>
                            {cls.activity}
                            <svg 
                              className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <span
                            className="ml-2 w-fit px-1.5 py-0.5 text-xs font-medium rounded"
                            style={{ 
                              backgroundColor: centerBgColor,
                              color: centerTextColor
                            }}
                          >
                            {CENTER_ABBREVIATIONS[cls.center] || cls.center}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <svg 
                            className="w-3 h-3 text-gray-400 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1 1 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span className="text-xs text-gray-500">{cls.location}</span>
                        </div>
                        {cls.virtual && (
                          <div className="mt-1">
                            <span 
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ 
                                backgroundColor: `${colors.info || 'rgb(3,169,244)'}/5`,
                                color: colors.info || 'rgb(3,169,244)'
                              }}
                            >
                              Virtual
                            </span>
                          </div>
                        )}
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