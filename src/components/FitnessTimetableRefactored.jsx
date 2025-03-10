import React, { useState, useEffect, useMemo } from 'react';
import { TimetableProvider, useTimetable } from '../context/TimetableContext';
import useLocalStorage from '../hooks/useLocalStorage';
import useFilteredClasses from '../hooks/useFilteredClasses';

// Component imports
import ModeToggle from './ui/ModeToggle';
import FilterButton from './ui/FilterButton';
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
  
  // Render swimming specific filters
  const renderSwimmingFilters = () => (
    <div>
      {/* Single row for swimming filters, including on mobile */}
      <div className="flex flex-row gap-2">
        <div className="flex-1 min-w-0">
          <PoolTypeFilter
            value={state.filters.poolLocationType}
            onChange={(value) => actions.setFilter('poolLocationType', value)}
            colors={COLORS}
          />
        </div>
        
        <div className="flex-1 min-w-0">
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
      </div>
    </div>
  );
  
  // Render fitness class specific filters
  const renderFitnessFilters = () => (
    <div>
      {/* Single row for fitness filters, including on mobile */}
      <div className="flex flex-row gap-2">
        <div className="flex-1 min-w-0">
          <ClassTypeFilter
            value={state.filters.category}
            onChange={(value) => actions.setFilter('category', value)}
            colors={COLORS}
            colorMode={colorMode}
          />
        </div>
        
        <div className="flex-1 min-w-0">
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
        
        <div className="flex-1 min-w-0">
          <VirtualClassToggle
            value={state.filters.includeVirtual}
            onChange={(value) => actions.setFilter('includeVirtual', value)}
            colors={COLORS}
          />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Loading screen */}
      <LoadingScreen show={loading} colors={COLORS} />
      
      {/* App bar with logo, filter buttons and count - always Sefton blue */}
      <div 
        className="bg-[rgb(0,130,188)]/95 backdrop-blur-sm text-white px-4 py-2.5 shadow-lg z-20 sticky top-0"
      >
        {/* Single row for app bar with all elements */}
        <div className="flex items-center justify-between">
          {/* Logo only - removed redundant mode indicator */}
          <div className="flex items-center">
            <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-8 object-contain rounded shadow-sm" />
          </div>
          
          {/* Action buttons group */}
          <div className="flex items-center gap-2">
            {/* Mode toggle button */}
            <ModeToggle
              isSwimmingMode={isSwimmingMode}
              onToggle={(value) => handleModeSwitch(value ? 'swimming' : 'fitness')}
              colors={COLORS}
            />
            
            {/* Filter button */}
            <FilterButton
              onClick={() => actions.toggleFiltersExpanded()}
              activeCount={getActiveFilterCount()}
              colors={COLORS}
            />
            
            {/* Now button */}
            <NowButton onClick={scrollToCurrentTime} colors={COLORS} />
            
            {/* Color mode toggle - redesigned to be distinct */}
            <button
              onClick={toggleColorMode}
              className="flex items-center justify-center bg-white/5 hover:bg-white/15 rounded w-7 h-7 transition-all shadow-sm focus:outline-none"
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
      
      {/* Filter panel - slides down when expanded with mode-specific colors */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-b border-gray-300 shadow-lg relative z-10 ${
          state.ui.filtersExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`${isSwimmingMode ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className="max-w-5xl mx-auto">
            <div className="divide-y divide-gray-200">
              {/* Filter header with mode info and switch button - mode-specific styling */}
              <div className={`px-2 py-1.5 sm:px-3 sm:py-2 border-b ${
                isSwimmingMode 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' 
                  : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-800 flex items-center">
                    <svg className={`w-4 h-4 mr-1 ${isSwimmingMode ? 'text-blue-600' : 'text-orange-600'}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    {isSwimmingMode ? 'Swimming Pool Filters' : 'Fitness Class Filters'}
                  </h3>
                  <button
                    onClick={() => handleModeSwitch(isSwimmingMode ? 'fitness' : 'swimming')}
                    className={`px-2 py-1 text-white hover:opacity-90 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm ${
                      isSwimmingMode ? 'bg-orange-600' : 'bg-blue-600'
                    }`}
                  >
                    Switch to {isSwimmingMode ? 'Fitness' : 'Swimming'}
                  </button>
                </div>
              </div>
              
              {/* Filter section wrapper with padding and background */}
              <div className="p-2 sm:p-4 bg-white">
                {/* Render appropriate filter panel based on mode */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible min-h-[180px]">
                  <div className="p-2 sm:p-4">
                    {isSwimmingMode ? renderSwimmingFilters() : renderFitnessFilters()}
                  </div>
                </div>
              </div>
              
              {/* Bottom close button - mode-specific styling */}
              <div className="sticky bottom-0 py-3 px-4 bg-gradient-to-b from-gray-50/80 to-gray-50 backdrop-blur-md border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => actions.toggleFiltersExpanded()}
                  className="w-full text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all shadow-sm bg-[rgb(0,130,188)]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable content - full screen scrollable area with mode-specific background */}
      <div className={`flex-1 overflow-hidden ${
        isSwimmingMode ? 'bg-blue-50' : 'bg-orange-50'
      }`}>
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Mode indicator in scrollable area */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between py-2 px-4">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span 
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    isSwimmingMode ? 'bg-cyan-500' : 'bg-orange-500'
                  }`}
                ></span>
                {isSwimmingMode ? 'Pool Sessions' : 'Fitness Classes'}
              </span>
            </div>
          </div>
          
          {/* Class list component */}
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