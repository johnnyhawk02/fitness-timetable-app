import React, { memo } from 'react';
import { COLORS } from '../../utils/colorThemes';

/**
 * Day Navigator component for selecting and navigating between days
 * 
 * @param {Object} props Component props
 * @param {string} props.selectedDay Currently selected day
 * @param {Function} props.onDaySelect Callback when a day is selected
 * @param {Function} props.scrollToDay Function to scroll to a specific day
 * @param {boolean} props.isSwimmingMode Whether the app is in swimming mode
 */
const DayNavigator = ({ 
  selectedDay, 
  onDaySelect, 
  scrollToDay,
  isSwimmingMode 
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get the theme-specific day color
  const getDayColor = (day) => {
    return COLORS.getDayColor(day, isSwimmingMode);
  };

  // Get current day for highlighting "Today"
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  };
  
  const currentDay = getCurrentDay();

  return (
    <div className="inline-flex p-1 bg-white/20 rounded-full">
      {days.map((day) => {
        // Get the abbreviated day name (Mo, Tu, We, etc.)
        const shortDay = day.substring(0, 2);
        
        // Check if this day is selected
        const isSelected = day === selectedDay;
        const isToday = day === currentDay;
        
        // Determine button styling based on selection status
        let buttonStyle = 'hover:bg-white/20 text-white/90'; // Default hover effect
        
        // Selection styling for background/ring
        if (isSelected) {
          buttonStyle = isSwimmingMode 
            ? 'bg-teal-500 text-white ring-1 ring-white shadow-sm' 
            : 'bg-orange-600 text-white ring-1 ring-white shadow-sm';
        }
        
        return (
          <button
            key={day}
            onClick={() => {
              onDaySelect(day);
              scrollToDay(day);
            }}
            className={`relative rounded-full w-8 h-8 flex items-center justify-center text-sm focus:outline-none ${buttonStyle} ${isToday ? 'font-semibold' : ''}`}
            title={day}
            aria-label={`View ${day}${isToday ? ' (Today)' : ''}`}
          >
            {shortDay}
            {isToday && <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></span>}
          </button>
        );
      })}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(DayNavigator); 