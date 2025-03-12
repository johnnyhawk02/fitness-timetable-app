import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TimetableProvider, useTimetable } from '../context/TimetableContext';
import useFilteredClasses from '../hooks/useFilteredClasses';

// Component imports
import NowButton from './ui/NowButton';
import ClassList from './ui/ClassList';
import ClassDetails from './ui/ClassDetails';
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
    
    // Simplified day colors for fitness - just two alternating colors
    dayColors: {
      'Monday': 'rgb(239,68,68)', // Red
      'Tuesday': 'rgb(234,88,12)', // Orange
      'Wednesday': 'rgb(239,68,68)', // Red
      'Thursday': 'rgb(234,88,12)', // Orange
      'Friday': 'rgb(239,68,68)', // Red
      'Saturday': 'rgb(234,88,12)', // Orange
      'Sunday': 'rgb(239,68,68)', // Red
    }
  },
  
  // Swimming mode colors (beautiful aqua)
  swimming: {
    primary: 'rgb(20,184,166)', // Teal
    secondary: 'rgb(6,182,212)', // Cyan
    accent: 'rgb(14,165,233)', // Sky blue
    background: 'rgb(236,254,255)', // Light cyan
    
    // Simplified day colors for swimming - just two alternating colors
    dayColors: {
      'Monday': 'rgb(20,184,166)', // Teal
      'Tuesday': 'rgb(6,182,212)', // Cyan
      'Wednesday': 'rgb(20,184,166)', // Teal
      'Thursday': 'rgb(6,182,212)', // Cyan
      'Friday': 'rgb(20,184,166)', // Teal
      'Saturday': 'rgb(6,182,212)', // Cyan
      'Sunday': 'rgb(20,184,166)', // Teal
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
  const [selectedClass, setSelectedClass] = useState(null);
  
  // State to track which day is currently selected in the day navigator
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Track previous state to detect transitions
  const [prevHasAnyClasses, setPrevHasAnyClasses] = useState(false);
  
  // Initialize selected day to today on component mount
  useEffect(() => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    setSelectedDay(today);
    console.log('Selected day initialized to today:', today);
  }, []);
  
  // Load classes on mount and when mode changes
  useEffect(() => {
    const loadClasses = async () => {
      // Only show loading screen on initial load, not on mode switch
      if (initialLoad) {
        setLoading(true);
      } else {
        // For mode switches, just show a toast instead of full loading screen
        console.log('Switching to mode:', isSwimmingMode ? 'Swimming' : 'Fitness');
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
        console.log('Error loading classes');
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
  
  // Check if any classes are available
  const hasAnyClasses = useMemo(() => {
    return days.some(day => {
      const dayClasses = classesByDay[day] || [];
      return dayClasses.length > 0;
    });
  }, [days, classesByDay]);
   
  // Detect transition from no classes to having classes and scroll to selected day
  useEffect(() => {
    // If we previously had no classes but now we do, scroll to selected day
    if (!prevHasAnyClasses && hasAnyClasses) {
      console.log('Detected transition from no classes to having classes - scrolling to selected day');
       
      // Small delay to ensure DOM is fully updated
      setTimeout(() => {
        // Find the day section and scroll to it
        const targetDay = selectedDay || (new Date()).toLocaleDateString('en-US', { weekday: 'long' });
        const dayElement = document.getElementById(`day-${targetDay}`);
         
        if (dayElement) {
          // Scroll to the day section - ensure header is visible at top
          dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
          console.log(`Scrolled to ${targetDay} after classes became available`);
        } else {
          console.log(`Could not find ${targetDay} section after classes became available`);
        }
      }, 150);
    }
     
    // Update previous state for next comparison
    setPrevHasAnyClasses(hasAnyClasses);
  }, [hasAnyClasses, prevHasAnyClasses, selectedDay]);
  
  // Function to scroll to the currently selected day or default to today if none selected
  const scrollToSelectedDay = useCallback(() => {
    // Determine which day to scroll to (selected day or default to today)
    let targetDay = selectedDay;
    
    // If no day is selected, use today as default
    if (!targetDay) {
      const now = new Date();
      targetDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      // Update the selected day in the UI
      setSelectedDay(targetDay);
    }
    
    console.log(`Scrolling to selected day: ${targetDay}`);
    
    // Find the day section
    const dayElement = document.getElementById(`day-${targetDay}`);
    if (dayElement) {
      // Get the scroll container
      const scrollContainer = document.querySelector('.h-full.overflow-y-auto');
      if (scrollContainer) {
        // First scroll - initial positioning
        const doScroll = () => {
          // Get the element's position (needs to be recalculated each time)
          const rect = dayElement.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          
          // Fine-tuned offset to position the header perfectly at the top (1px reduces chance of header being cut off)
          const scrollPosition = Math.round(scrollContainer.scrollTop + rect.top - containerRect.top - 1);
          
          // Scroll to the position
          scrollContainer.scrollTo({
            top: scrollPosition,
            behavior: 'auto'
          });
        };
        
        // Do the initial scroll
        doScroll();
        
        // Second scroll after a brief delay to adjust for any layout shifts
        setTimeout(() => {
          doScroll();
        }, 120);
      } else {
        // Fallback to standard scrollIntoView if container not found
        dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    } else {
      console.log(`Could not find ${targetDay} section`);
    }
  }, [selectedDay, setSelectedDay]);
  
  // Function to scroll to the current day
  const scrollToNow = useCallback(() => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log(`Scrolling to now (${today})`);
    
    // Update selected day to today
    setSelectedDay(today);
    
    // Find today's section
    const dayElement = document.getElementById(`day-${today}`);
    if (dayElement) {
      // Get the scroll container
      const scrollContainer = document.querySelector('.h-full.overflow-y-auto');
      if (scrollContainer) {
        // First scroll - initial positioning
        const doScroll = () => {
          // Get the element's position (needs to be recalculated each time)
          const rect = dayElement.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          
          // Fine-tuned offset to position the header perfectly at the top
          const scrollPosition = Math.round(scrollContainer.scrollTop + rect.top - containerRect.top - 1);
          
          // Scroll to the position
          scrollContainer.scrollTo({
            top: scrollPosition,
            behavior: 'auto'
          });
        };
        
        // Do the initial scroll
        doScroll();
        
        // Second scroll after a brief delay to adjust for any layout shifts
        setTimeout(() => {
          doScroll();
        }, 120);
        
        console.log(`Viewing today (${today})`);
      } else {
        // Fallback to standard scrollIntoView if container not found
        dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
        console.log(`Viewing today (${today})`);
      }
    } else {
      console.log(`Could not find today's section`);
    }
  }, [setSelectedDay]);
  
  // Function to handle mode switching - preserve selected day when possible
  const handleModeSwitch = (newMode) => {
    console.log('Manual mode switch to:', newMode);
    
    // Set mode
    actions.setMode(newMode);
    console.log(`Switching to ${newMode} mode`);
    
    // Give a larger delay for the mode to change before scrolling
    setTimeout(() => {
      // Use the same check as hasAnyClasses
      if (hasAnyClasses) {
        console.log('Classes are available after mode switch - scrolling to selected day');
        
        // Find the day section again and scroll to it
        const targetDay = selectedDay || (new Date()).toLocaleDateString('en-US', { weekday: 'long' });
        const dayElement = document.getElementById(`day-${targetDay}`);
        
        if (dayElement) {
          // Get the scroll container
          const scrollContainer = document.querySelector('.h-full.overflow-y-auto');
          if (scrollContainer) {
            // Define scroll function for reuse
            const doScroll = () => {
              // Get the element's position (needs to be recalculated each time)
              const rect = dayElement.getBoundingClientRect();
              const containerRect = scrollContainer.getBoundingClientRect();
              
              // Fine-tuned offset to position the header perfectly at the top
              const scrollPosition = Math.round(scrollContainer.scrollTop + rect.top - containerRect.top - 1);
              
              // Scroll to the position
              scrollContainer.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
              });
            };
            
            // Do the initial scroll
            doScroll();
            
            // Second scroll after a brief delay to adjust for any layout shifts
            setTimeout(() => {
              doScroll();
            }, 120);
          } else {
            // Fallback to standard scrollIntoView if container not found
            dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        } else {
          console.log(`Could not find ${targetDay} section after mode switch`);
        }
      } else {
        console.log('No classes available after mode switch - skipping scroll');
      }
    }, 150); // Increased delay to ensure data is fully processed
  };
  
  // Use effect to scroll to selected day after classes are loaded and filtered
  useEffect(() => {
    // If classes are loaded and we have filtered classes
    if (!loading && classesByDay) {
      // Slight delay to ensure DOM is updated
      setTimeout(() => {
        scrollToSelectedDay();
      }, 200);
    }
  }, [loading, classesByDay, scrollToSelectedDay]);
  
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
              className="text-4xl focus:outline-none p-1"
              title={`Switch to ${isSwimmingMode ? 'Fitness' : 'Swimming'} Mode`}
            >
              {isSwimmingMode ? '🏊‍♂️' : '🏋️‍♂️'}
            </button>
          </div>
          
          {/* Empty middle section for balance */}
          <div className="flex-1"></div>
          
          {/* Day navigator on the right */}
          <div className="flex items-center justify-end">
            {/* Day navigator */}
            <div className="flex space-x-1 bg-white/10 rounded-full px-1 py-0.5">
              {days.map((day, index) => {
                // Get the abbreviated day name (Mo, Tu, We, etc.)
                const shortDay = day.substring(0, 2);
                
                // Check if this day is selected or is today
                const isSelected = day === selectedDay;
                const now = new Date();
                const today = now.toLocaleDateString('en-US', { weekday: 'long' });
                const isToday = day === today;
                
                // Determine button styling based on selection status
                let buttonStyle = 'hover:bg-white/20'; // Default hover effect
                
                // Selection styling for background/ring
                if (isSelected) {
                  buttonStyle = isSwimmingMode 
                    ? 'bg-teal-500 text-white ring-2 ring-white shadow-sm shadow-teal-400/50' 
                    : 'bg-orange-600 text-white ring-2 ring-white shadow-sm shadow-orange-400/50';
                }
                
                return (
                  <div key={day} className="relative flex flex-col items-center">
                    <button
                      onClick={() => {
                        setSelectedDay(day);
                        
                        // Find the day section and scroll to it
                        const dayElement = document.getElementById(`day-${day}`);
                        if (dayElement) {
                          // Get the scroll container
                          const scrollContainer = document.querySelector('.h-full.overflow-y-auto');
                          if (scrollContainer) {
                            // Define scroll function for reuse
                            const doScroll = () => {
                              // Get the element's position (needs to be recalculated each time)
                              const rect = dayElement.getBoundingClientRect();
                              const containerRect = scrollContainer.getBoundingClientRect();
                              
                              // Fine-tuned offset to position the header perfectly at the top
                              const scrollPosition = Math.round(scrollContainer.scrollTop + rect.top - containerRect.top - 1);
                              
                              // Scroll to the position
                              scrollContainer.scrollTo({
                                top: scrollPosition,
                                behavior: 'auto'
                              });
                            };
                            
                            // Do the initial scroll
                            doScroll();
                            
                            // Second scroll after a brief delay to adjust for any layout shifts
                            setTimeout(() => {
                              doScroll();
                            }, 120);
                            
                            console.log(`Viewing ${day}`);
                          } else {
                            // Fallback to standard scrollIntoView if container not found
                            dayElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                            console.log(`Viewing ${day}`);
                          }
                        } else {
                          console.log(`Could not find ${day} section`);
                        }
                      }}
                      className={`rounded-full w-8 h-8 flex items-center justify-center text-sm focus:outline-none ${buttonStyle}`}
                      title={day}
                    >
                      {shortDay}
                    </button>
                    {isToday && <span className="absolute bottom-0 text-xs leading-none">-</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
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
                      onChange={(value) => {
                        actions.setFilter('poolLocationType', value);
                        
                        // Scroll to selected day (respecting current selection)
                        scrollToSelectedDay();
                      }}
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
                          console.log('Showing all centers');
                        } else {
                          // Otherwise set just the selected center
                          centers.forEach(c => {
                            newCenters[c] = (c === center);
                          });
                          actions.setFilter('centers', newCenters);
                          console.log(`Showing ${center} only`);
                        }
                        
                        // Scroll to selected day (respecting current selection)
                        scrollToSelectedDay();
                      }}
                      colors={COLORS}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-[140px]">
                    <ClassTypeFilter
                      value={state.filters.category}
                      onChange={(value) => {
                        actions.setFilter('category', value);
                        
                        // Scroll to selected day (respecting current selection)
                        scrollToSelectedDay();
                      }}
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
                          console.log('Showing all centers');
                        } else {
                          // Otherwise set just the selected center
                          centers.forEach(c => {
                            newCenters[c] = (c === center);
                          });
                          actions.setFilter('centers', newCenters);
                          console.log(`Showing ${center} only`);
                        }
                        
                        // Scroll to selected day (respecting current selection)
                        scrollToSelectedDay();
                      }}
                      colors={COLORS}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-[160px]">
                    <VirtualClassToggle
                      value={state.filters.includeVirtual}
                      onChange={(value) => {
                        actions.setFilter('includeVirtual', value);
                        
                        // Scroll to selected day (respecting current selection)
                        scrollToSelectedDay();
                      }}
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
            onClassClick={setSelectedClass}
            mode={state.mode}
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
  const [centerStateInitialized, setCenterStateInitialized] = useState(false);
  const [centersState, setCentersState] = useState(null);
  const [daysState, setDaysState] = useState(null);
  
  // Initialize center and day states if needed
  useEffect(() => {
    if (!centerStateInitialized || !centersState) {
      const initialCenters = centers.reduce((acc, center) => {
        acc[center] = true;
        return acc;
      }, {});
      setCentersState(initialCenters);
      setCenterStateInitialized(true);
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