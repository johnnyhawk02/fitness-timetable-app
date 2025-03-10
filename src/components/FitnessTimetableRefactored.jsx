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
    primary: 'rgb(233,84,32)', // Warm orange/red
    secondary: 'rgb(255,152,0)', // Orange
    accent: 'rgb(249,115,22)', // Burnt orange
    background: 'rgb(255,237,213)', // Light peach
    
    // Warm day colors for fitness
    dayColors: {
      'Monday': 'rgb(220,38,38)', // Red
      'Tuesday': 'rgb(234,88,12)', // Orange
      'Wednesday': 'rgb(217,119,6)', // Amber
      'Thursday': 'rgb(202,138,4)', // Yellow
      'Friday': 'rgb(180,83,9)', // Burnt orange
      'Saturday': 'rgb(194,65,12)', // Rust
      'Sunday': 'rgb(153,27,27)', // Dark red
    }
  },
  
  // Swimming mode colors (cool blues)
  swimming: {
    primary: 'rgb(3,105,161)', // Medium blue
    secondary: 'rgb(6,182,212)', // Cyan
    accent: 'rgb(14,165,233)', // Sky blue
    background: 'rgb(224,242,254)', // Light blue
    
    // Cool day colors for swimming
    dayColors: {
      'Monday': 'rgb(3,105,161)', // Blue
      'Tuesday': 'rgb(8,145,178)', // Cyan
      'Wednesday': 'rgb(13,148,136)', // Teal
      'Thursday': 'rgb(6,95,70)', // Green
      'Friday': 'rgb(7,89,133)', // Blue-green
      'Saturday': 'rgb(30,64,175)', // Indigo
      'Sunday': 'rgb(91,33,182)', // Purple
    }
  },
  
  // Shared colors for categories regardless of mode
  categoryColors: {
    'cardio': 'rgb(233,30,99)', // Pink
    'strength': 'rgb(156,39,176)', // Purple
    'mind-body': 'rgb(121,85,72)', // Brown
    'core': 'rgb(255,152,0)', // Orange
    'spinning': 'rgb(0,188,212)', // Cyan
    'swimming': 'rgb(3,169,244)', // Light Blue
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
  
  // Function to handle mode switching - updated to not use loading screen
  const handleModeSwitch = (newMode) => {
    console.log('Manual mode switch to:', newMode);
    // Don't show loading screen for mode switches
    // Just set the mode directly
    actions.setMode(newMode);
    // Show a toast to indicate the mode change
    showToast(`Switching to ${newMode} mode`);
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Loading screen */}
      <LoadingScreen show={loading} colors={COLORS} />
      
      {/* Enhanced app bar with modern styling and gradient */}
      <div 
        className="bg-gradient-to-r from-[rgb(0,120,178)] to-[rgb(0,150,210)] text-white px-3 py-3 shadow-md z-20 sticky top-0"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left section with logo and mode switch */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md shadow-sm">
              <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-6 object-contain rounded-sm" />
            </div>
            <button
              onClick={() => handleModeSwitch(isSwimmingMode ? 'fitness' : 'swimming')}
              className={`px-3 py-1.5 text-white text-xs font-medium transition-all shadow-sm rounded-full border border-white/30 backdrop-blur-sm ${
                isSwimmingMode 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
              }`}
            >
              {isSwimmingMode ? 'Swimming' : 'Fitness'} Mode
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
          ? 'bg-gradient-to-r from-blue-50 to-blue-100/80' 
          : 'bg-gradient-to-r from-orange-50 to-orange-100/80'
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
        isSwimmingMode ? 'bg-blue-50' : 'bg-orange-50'
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