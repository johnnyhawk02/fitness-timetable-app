import React, { useState, useEffect, useMemo } from 'react';
import { TimetableProvider, useTimetable } from '../context/TimetableContext';
import useLocalStorage from '../hooks/useLocalStorage';
import useFilteredClasses from '../hooks/useFilteredClasses';

// Component imports
import NowButton from './ui/NowButton';
import ClassList from './ui/ClassList';
import ClassDetails from './ui/ClassDetails';
import Toast from './ui/Toast';
import LoadingScreen from './ui/LoadingScreen';
import PoolTypeFilter from './filters/PoolTypeFilter';
import ClassTypeFilter from './filters/ClassTypeFilter';
import CentersFilter from './filters/CentersFilter';
import VirtualClassToggle from './filters/VirtualClassToggle';

// Service imports
import classService from '../services/classService';

// Constants
const centers = ['Bootle', 'Meadows', 'Netherton', 'Crosby', 'Dunes', 'Litherland'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Color themes - separate themes for fitness and swimming
const COLORS = {
  // Shared colors
  primary: 'rgb(0,130,188)', // Sefton blue
  primaryLight: 'rgb(0,130,188, 0.1)',
  primaryMedium: 'rgb(0,130,188, 0.6)',
  
  // Fitness mode colors (warm)
  fitness: {
    primary: 'rgb(239,68,68)', // Warmer red
    secondary: 'rgb(234,88,12)', // Bright orange
    accent: 'rgb(249,115,22)', // Burnt orange
    background: 'rgb(254,226,226)', // Light red/pink
    
    // Warm day colors for fitness
    dayColors: {
      'Monday': 'rgb(220,38,38)', // Red
      'Tuesday': 'rgb(234,88,12)', // Orange
      'Wednesday': 'rgb(245,158,11)', // Amber
      'Thursday': 'rgb(252,211,77)', // Yellow
      'Friday': 'rgb(217,70,0)', // Deep orange
      'Saturday': 'rgb(194,65,12)', // Rust
      'Sunday': 'rgb(153,27,27)', // Dark red
    }
  },
  
  // Swimming mode colors (beautiful aqua)
  swimming: {
    primary: 'rgb(20,184,166)', // Teal
    secondary: 'rgb(6,182,212)', // Cyan
    accent: 'rgb(14,165,233)', // Sky blue
    background: 'rgb(236,254,255)', // Light cyan
    
    // Aqua day colors for swimming
    dayColors: {
      'Monday': 'rgb(20,184,166)', // Teal
      'Tuesday': 'rgb(8,145,178)', // Cyan
      'Wednesday': 'rgb(13,148,136)', // Teal-green
      'Thursday': 'rgb(6,182,212)', // Bright cyan
      'Friday': 'rgb(14,116,144)', // Dark cyan
      'Saturday': 'rgb(59,130,246)', // Blue
      'Sunday': 'rgb(16,185,129)', // Emerald
    }
  },
  
  // Shared colors for categories regardless of mode
  categoryColors: {
    'cardio': 'rgb(233,30,99)', // Pink
    'strength': 'rgb(156,39,176)', // Purple
    'mind-body': 'rgb(121,85,72)', // Brown
    'core': 'rgb(255,152,0)', // Orange
    'spinning': 'rgb(0,188,212)', // Cyan
    'swimming': 'rgb(20,184,166)', // Teal
  },
  
  // Shared colors for centers regardless of mode
  centerColors: {
    'Bootle': 'rgb(3,169,244)', // Light Blue
    'Meadows': 'rgb(76,175,80)', // Green
    'Netherton': 'rgb(255,152,0)', // Orange
    'Crosby': 'rgb(233,30,99)', // Pink
    'Dunes': 'rgb(156,39,176)', // Purple
    'Litherland': 'rgb(121,85,72)', // Brown
  },
  
  // Helper function to get the active theme colors based on mode
  getThemeColors: (isSwimmingMode) => {
    return isSwimmingMode ? COLORS.swimming : COLORS.fitness;
  },
  
  // Helper function to get day color based on mode
  getDayColor: (day, isSwimmingMode) => {
    return isSwimmingMode 
      ? COLORS.swimming.dayColors[day] 
      : COLORS.fitness.dayColors[day];
  }
};

/**
 * The inner component that uses the context
 */
const FitnessTimetableInner = () => {
  // Get values from context
  const { state, actions, isSwimmingMode } = useTimetable();
  
  // Add debug logging
  console.log('Current mode:', state.mode);
  console.log('isSwimmingMode:', isSwimmingMode);
  
  useEffect(() => {
    console.log('Mode changed:', state.mode);
    console.log('isSwimmingMode updated:', isSwimmingMode);
  }, [state.mode, isSwimmingMode]);
  
  // Local state
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true); // This will start as true for initial load
  const [initialLoad, setInitialLoad] = useState(true); // Track if this is the first load
  const [toast, setToast] = useState({ show: false, message: '' });
  const [selectedClass, setSelectedClass] = useState(null);
  const [colorMode, setColorMode] = useLocalStorage('color_mode', 'standard'); // 'standard' or 'vibrant'
  
  // Function to show toast notifications - moved up before it's used
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };
  
  // Load classes on mount and when mode changes
  useEffect(() => {
    const loadClasses = async () => {
      // Only show loading screen on initial load, not on mode switch
      if (initialLoad) {
        setLoading(true);
      } else {
        // For mode switches, just show a toast instead of full loading screen
        showToast(`Switching to ${isSwimmingMode ? 'Swimming' : 'Fitness'} mode...`);
      }
      
      try {
        const data = await classService.getAllClasses();
        setClasses(data);
        console.log('Classes reloaded, total count:', data.length);
        
        // After first successful load, set initialLoad to false
        if (initialLoad) {
          setInitialLoad(false);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        showToast('Error loading classes');
      } finally {
        setLoading(false);
      }
    };
    
    loadClasses();
  }, [isSwimmingMode, initialLoad]); // Removed showToast from dependencies
  
  // Filter classes based on current filters
  const filteredClasses = useFilteredClasses(
    classes,
    state.filters,
    isSwimmingMode
  );
  
  // Group classes by day for display
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const classesByDay = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day] = filteredClasses.filter(cls => cls.day === day);
      return acc;
    }, {});
  }, [filteredClasses]); // Removed days from dependencies
  
  // Function to scroll to current time
  const scrollToCurrentTime = () => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get current hour
    const currentHour = now.getHours();
    
    console.log(`Scrolling to current time: ${dayOfWeek} at ${currentHour}:00`);
    
    // First find the day section
    const todayElement = document.getElementById(`day-${dayOfWeek}`);
    if (todayElement) {
      // Add a small delay to ensure layout is complete
      setTimeout(() => {
        // Try to find a class around the current hour on the current day
        let targetElement = null;
        
        // Look for classes starting at the current hour, or slightly before/after
        // Check current hour first, then expand search window if needed
        for (let offset = 0; offset <= 2; offset++) {
          // Try current hour first, then current hour - offset, then current hour + offset
          const hourOptions = [currentHour];
          if (offset > 0) {
            // Add hours before and after current hour to search window
            const hourBefore = Math.max(currentHour - offset, 0);
            const hourAfter = Math.min(currentHour + offset, 23);
            hourOptions.push(hourBefore, hourAfter);
          }
          
          // Check each potential hour but only on the current day
          for (const hour of hourOptions) {
            // Look specifically within today's section
            const hourElements = todayElement.querySelectorAll(`[data-hour="${hour}"]`);
            if (hourElements.length > 0) {
              targetElement = hourElements[0];
              break;
            }
          }
          
          if (targetElement) break;
        }
        
        // If no specific class found, just scroll to the day
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showToast(`Scrolled to current time (${currentHour}:00)`);
        } else {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showToast(`Scrolled to ${dayOfWeek}`);
        }
      }, 100);
    } else {
      showToast(`No classes available for ${dayOfWeek}`);
    }
  };
  
  // Function to get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    
    // Count centers that are not selected
    const unselectedCenters = centers.filter(center => !state.filters.centers[center]).length;
    if (unselectedCenters > 0) count++;
    
    // Count other active filters
    if (state.filters.category) count++;
    if (!state.filters.includeVirtual) count++;
    if (isSwimmingMode && state.filters.poolLocationType !== 'all') count++;
    
    return count;
  };
  
  // Function to toggle color mode
  const toggleColorMode = () => {
    setColorMode(colorMode === 'standard' ? 'vibrant' : 'standard');
    showToast(`Color mode: ${colorMode === 'standard' ? 'Vibrant' : 'Standard'}`);
  };
  
  // Function to handle class selection
  const handleClassClick = (classInfo) => {
    setSelectedClass(classInfo);
  };
  
  // Helper function to scroll to a specific day and time
  const scrollToDayAndTime = (day, hour) => {
    console.log(`Scrolling to ${day} at ${hour}:00`);
    
    // First find the day section
    const dayElement = document.getElementById(`day-${day}`);
    if (dayElement) {
      // Add a small delay to ensure layout is rendered after mode switch
      setTimeout(() => {
        // Try to find a class around the specified hour on the specified day
        let targetElement = null;
        
        // Look for classes starting at the specified hour, or slightly before/after
        for (let offset = 0; offset <= 2; offset++) {
          // Try specified hour first, then expand search window
          const hourOptions = [hour];
          if (offset > 0) {
            // Add hours before and after specified hour to search window
            const hourBefore = Math.max(hour - offset, 0);
            const hourAfter = Math.min(hour + offset, 23);
            hourOptions.push(hourBefore, hourAfter);
          }
          
          // Check each potential hour
          for (const h of hourOptions) {
            // Look specifically within the day's section
            const hourElements = dayElement.querySelectorAll(`[data-hour="${h}"]`);
            if (hourElements.length > 0) {
              targetElement = hourElements[0];
              break;
            }
          }
          
          if (targetElement) break;
        }
        
        // If no specific class found, just scroll to the day
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
          dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 300); // Wait for new mode data to render
    }
  };
  
  // Helper function to check if an element is in the viewport
  const isElementInViewport = (el) => {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    // Consider the element in viewport if it's at least partially visible
    // (top is above bottom of viewport AND bottom is below top of viewport)
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0
    );
  };
  
  // Improved function to find which day is most visible in the viewport
  const findVisibleDay = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let mostVisibleDay = days[0]; // Default to Monday
    let mostVisibleArea = 0;
    
    // Find which day has the most visible area in the viewport
    for (const day of days) {
      const dayElement = document.getElementById(`day-${day}`);
      if (!dayElement) continue;
      
      const rect = dayElement.getBoundingClientRect();
      // Skip if element is not visible at all
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      
      // Calculate visible area
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const visibleHeight = visibleBottom - visibleTop;
      
      if (visibleHeight > mostVisibleArea) {
        mostVisibleArea = visibleHeight;
        mostVisibleDay = day;
      }
    }
    
    console.log(`Most visible day detected: ${mostVisibleDay}`);
    return mostVisibleDay;
  };
  
  // Function to handle mode switching - updated to preserve day/time position
  const handleModeSwitch = (newMode) => {
    console.log('Manual mode switch to:', newMode);
    
    // Find the most visible day in the viewport before switching
    const targetDay = findVisibleDay();
    console.log(`Switching modes - will maintain position at ${targetDay}`);
    
    // Get the scroll container
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (!scrollContainer) return;
    
    // Instead of fading, use a simpler approach - just hide instantly
    scrollContainer.style.visibility = 'hidden';
    
    // Set mode and show toast
    actions.setMode(newMode);
    showToast(`Switching to ${newMode} mode, staying on ${targetDay}`);
    
    // Use a single timeout with enough delay to let React render the new content
    setTimeout(() => {
      // Try to find and scroll to the target day
      const dayElement = document.getElementById(`day-${targetDay}`);
      if (dayElement) {
        // Scroll to the element without animation
        dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
      
      // Show the content again after position is set
      scrollContainer.style.visibility = 'visible';
    }, 150); // Single delay that's long enough for rendering but short enough to feel responsive
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Loading screen */}
      <LoadingScreen show={loading} colors={COLORS} />
      
      {/* Enhanced app bar with modern styling and gradient - dynamic based on mode */}
      <div 
        className={`${
          isSwimmingMode 
            ? 'bg-gradient-to-r from-teal-600 to-cyan-500' 
            : 'bg-gradient-to-r from-red-500 to-orange-500'
        } text-white px-3 py-3 shadow-md z-20 sticky top-0`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left section with mode switch only (logo removed) */}
          <div className="flex items-center">
            <button
              onClick={() => handleModeSwitch(isSwimmingMode ? 'fitness' : 'swimming')}
              className="text-4xl transition-transform hover:scale-110 focus:outline-none p-1"
              title={`Switch to ${isSwimmingMode ? 'Fitness' : 'Swimming'} Mode`}
            >
              {isSwimmingMode ? '🏊‍♂️' : '🏋️‍♂️'}
            </button>
          </div>
          
          {/* Right section with action buttons */}
          <div className="flex items-center gap-2">
            <NowButton onClick={scrollToCurrentTime} colors={COLORS} />
            
            {/* Color mode toggle */}
            <button
              onClick={toggleColorMode}
              className="flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 transition-all shadow-sm focus:outline-none border border-white/20"
              title={`Switch to ${colorMode === 'standard' ? 'vibrant' : 'standard'} colors`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-colors ${colorMode === 'vibrant' ? 'text-yellow-300' : 'text-white'}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Toast notification */}
      <Toast show={toast.show} message={toast.message} colors={COLORS} />
      
      {/* Stylish filter section */}
      <div className={`py-2 px-3 border-b border-gray-200 ${
        isSwimmingMode 
          ? 'bg-gradient-to-r from-cyan-50 to-teal-100/80' 
          : 'bg-gradient-to-r from-red-50 to-orange-100/80'
      }`}>
        <div className="max-w-5xl mx-auto">
          {/* Just the dropdowns in a stylish row */}
          <div className="overflow-x-auto py-0.5">
            <div className="flex gap-3">
              {isSwimmingMode ? (
                <>
                  <div className="flex-1 min-w-[140px]">
                    <PoolTypeFilter
                      value={state.filters.poolLocationType}
                      onChange={(value) => actions.setFilter('poolLocationType', value)}
                      colors={COLORS}
                      isSwimmingMode={isSwimmingMode}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[140px]">
                    <CentersFilter
                      centers={centers}
                      selected={state.filters.centers}
                      isSwimmingMode={isSwimmingMode}
                      onChange={(center) => {
                        // When a center is selected, reset all centers to false
                        // then set the selected one to true
                        const newCenters = {};
                        
                        if (center === 'All') {
                          // If 'All' is selected, set all centers to true to show all centers
                          centers.forEach(c => {
                            newCenters[c] = true;
                          });
                          actions.setFilter('centers', newCenters);
                          showToast('Showing all centers');
                        } else {
                          // Otherwise set just the selected center
                          centers.forEach(c => {
                            newCenters[c] = (c === center);
                          });
                          actions.setFilter('centers', newCenters);
                          showToast(`Showing ${center} only`);
                        }
                      }}
                      colors={COLORS}
                      colorMode={colorMode}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-[140px]">
                    <ClassTypeFilter
                      value={state.filters.category}
                      onChange={(value) => actions.setFilter('category', value)}
                      colors={COLORS}
                      colorMode={colorMode}
                      isSwimmingMode={isSwimmingMode}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[140px]">
                    <CentersFilter
                      centers={centers}
                      selected={state.filters.centers}
                      isSwimmingMode={isSwimmingMode}
                      onChange={(center) => {
                        // When a center is selected, reset all centers to false
                        // then set the selected one to true
                        const newCenters = {};
                        
                        if (center === 'All') {
                          // If 'All' is selected, set all centers to true to show all centers
                          centers.forEach(c => {
                            newCenters[c] = true;
                          });
                          actions.setFilter('centers', newCenters);
                          showToast('Showing all centers');
                        } else {
                          // Otherwise set just the selected center
                          centers.forEach(c => {
                            newCenters[c] = (c === center);
                          });
                          actions.setFilter('centers', newCenters);
                          showToast(`Showing ${center} only`);
                        }
                      }}
                      colors={COLORS}
                      colorMode={colorMode}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[160px]">
                    <VirtualClassToggle
                      value={state.filters.includeVirtual}
                      onChange={(value) => actions.setFilter('includeVirtual', value)}
                      colors={COLORS}
                      isSwimmingMode={isSwimmingMode}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timetable content - full screen scrollable area with mode-specific background */}
      <div className={`flex-1 overflow-hidden ${
        isSwimmingMode ? 'bg-cyan-50' : 'bg-red-50'
      }`}>
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Class list component - removed redundant mode indicator */}
          <ClassList 
            classesByDay={classesByDay}
            onClassClick={handleClassClick}
            mode={state.mode}
            colorMode={colorMode}
            days={days}
            colors={COLORS}
            isSwimmingMode={isSwimmingMode}
          />
        </div>
      </div>
      
      {/* Class details modal */}
      {selectedClass && (
        <ClassDetails 
          classInfo={selectedClass}
          onClose={() => setSelectedClass(null)}
          colors={COLORS}
          isSwimmingMode={isSwimmingMode}
        />
      )}
    </div>
  );
};

/**
 * Main FitnessTimetable component that provides the context
 */
const FitnessTimetable = () => {
  // Initialize state for centers and days
  const [centerStateInitialized] = useLocalStorage('centers_initialized', false);
  const [centersState, setCentersState] = useLocalStorage('selected_centers', null);
  const [daysState, setDaysState] = useLocalStorage('selected_days', null);
  
  // Initialize center and day states if needed
  useEffect(() => {
    if (!centerStateInitialized || !centersState) {
      const initialCenters = centers.reduce((acc, center) => {
        acc[center] = true;
        return acc;
      }, {});
      setCentersState(initialCenters);
    }
    
    if (!daysState) {
      const initialDays = days.reduce((acc, day) => {
        acc[day] = true;
        return acc;
      }, {});
      setDaysState(initialDays);
    }
  }, [centerStateInitialized, centersState, daysState, setCentersState, setDaysState]);
  
  // Don't render until we have initialized state
  if (!centersState || !daysState) {
    return <div>Loading...</div>;
  }
  
  return (
    <TimetableProvider defaultCenters={centersState} defaultDays={daysState}>
      <FitnessTimetableInner />
    </TimetableProvider>
  );
};

export default FitnessTimetable; 