import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage timetable state including mode and filters
 * 
 * @param {Object} options Initial options
 * @param {boolean} options.initialSwimmingMode Whether to start in swimming mode
 * @param {Object} options.initialFilters Initial filter values
 * @param {Function} options.onModeChange Callback when mode changes
 * @returns {Object} Timetable state and management functions
 */
export const useTimetableState = (options = {}) => {
  const {
    initialSwimmingMode = false,
    initialFilters = {
      center: "Dunes",
      category: "All",
      day: "All",
      instructor: "All",
    },
    onModeChange = null,
  } = options;

  // Mode state
  const [isSwimmingMode, setIsSwimmingMode] = useState(initialSwimmingMode);
  
  // Filter state
  const [filters, setFilters] = useState(initialFilters);
  
  // Selected day state
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  
  // Track if any classes are available based on current filters
  const [hasAnyClasses, setHasAnyClasses] = useState(true);
  const [prevHasAnyClasses, setPrevHasAnyClasses] = useState(true);
  
  /**
   * Get the current day of the week
   */
  function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  }
  
  /**
   * Handle switching between fitness and swimming modes
   */
  const handleModeSwitch = useCallback(() => {
    setIsSwimmingMode(prev => {
      const newMode = !prev;
      
      // Call onModeChange callback if provided
      if (onModeChange) {
        onModeChange(newMode);
      }
      
      return newMode;
    });
    
    // Reset filters when changing modes except for center
    setFilters(prev => ({
      ...prev,
      category: "All",
      day: "All",
      instructor: "All",
    }));
  }, [onModeChange]);
  
  /**
   * Update a specific filter value
   * 
   * @param {string} filterName Name of the filter to update
   * @param {string} value New value for the filter
   */
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);
  
  /**
   * Reset all filters to their initial values
   */
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  
  // Update prevHasAnyClasses when hasAnyClasses changes
  useEffect(() => {
    setPrevHasAnyClasses(hasAnyClasses);
  }, [hasAnyClasses]);
  
  return {
    // State values
    isSwimmingMode,
    filters,
    selectedDay,
    hasAnyClasses,
    prevHasAnyClasses,
    
    // State setters
    setIsSwimmingMode,
    setFilters,
    setSelectedDay,
    setHasAnyClasses,
    setPrevHasAnyClasses,
    
    // Helper functions
    handleModeSwitch,
    updateFilter,
    resetFilters,
  };
};

export default useTimetableState; 