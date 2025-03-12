import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TimetableProvider, useTimetable } from '../context/TimetableContext';
import useFilteredClasses from '../hooks/useFilteredClasses';

// Import our custom hooks
import { useScrollUtils } from '../hooks/useScrollUtils';
import { useTimetableState } from '../hooks/useTimetableState';

// Import UI components
import ClassList from './ui/ClassList';
import ClassDetails from './ui/ClassDetails';
import LoadingScreen from './ui/LoadingScreen';
import DayNavigator from './ui/DayNavigator';
import FilterBar from './ui/FilterBar';
import ModeToggle from './ui/ModeToggle';
import NoClassesMessage from './ui/NoClassesMessage';

// Import theme utilities
import { COLORS } from '../utils/colorThemes';

// Service imports
import classService from '../services/classService';

// Constants
const centers = ['Bootle', 'Meadows', 'Netherton', 'Crosby', 'Dunes', 'Litherland'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * FitnessTimetable component wrapper
 */
const FitnessTimetable = () => {
  return (
    <TimetableProvider>
      <FitnessTimetableInner />
    </TimetableProvider>
  );
};

/**
 * Inner component with access to context
 */
const FitnessTimetableInner = () => {
  // Get timetable context
  const { 
    isLoading, 
    isError, 
    fetchTimetableData, 
    classes, 
    centers: centerOptions, 
    instructors, 
    categories
  } = useTimetable();

  // Initialize timetable state with our custom hook
  const timetableState = useTimetableState({
    initialSwimmingMode: false,
    initialFilters: {
      center: "Dunes",
      category: "All",
      day: "All", 
      instructor: "All"
    },
    onModeChange: (newMode) => {
      console.log(`Mode changed to ${newMode ? 'swimming' : 'fitness'}`);
    }
  });

  const {
    isSwimmingMode,
    filters,
    selectedDay,
    hasAnyClasses,
    prevHasAnyClasses,
    setHasAnyClasses,
    setSelectedDay,
    handleModeSwitch,
    updateFilter,
    resetFilters
  } = timetableState;

  // Initialize scrolling utilities
  const { scrollToDay } = useScrollUtils({ 
    scrollDelay: 120,
    secondScrollDelay: 120
  });

  // Selected class state
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and group classes
  const { filteredClasses, classesByDay } = useFilteredClasses(
    classes, 
    filters,
    isSwimmingMode
  );

  // Check if any classes exist based on current filters
  useEffect(() => {
    const anyClasses = Object.values(classesByDay).some(
      dayClasses => Array.isArray(dayClasses) && dayClasses.length > 0
    );
    setHasAnyClasses(anyClasses);
  }, [classesByDay, setHasAnyClasses]);

  // Detect transition from no classes to having classes and scroll to selected day
  useEffect(() => {
    if (hasAnyClasses && !prevHasAnyClasses) {
      console.log('Detected transition from no classes to having classes');
      setTimeout(() => {
        scrollToDay(selectedDay);
      }, 150); // Delay to ensure DOM is updated
    }
  }, [hasAnyClasses, prevHasAnyClasses, selectedDay, scrollToDay]);

  // Open modal when a class is selected
  const handleClassClick = useCallback((cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle day selection
  const handleDaySelect = useCallback((day) => {
    setSelectedDay(day);
  }, [setSelectedDay]);

  // Load timetable data on initial render and mode change
  useEffect(() => {
    fetchTimetableData(isSwimmingMode);
  }, [fetchTimetableData, isSwimmingMode]);

  // Options for the FilterBar component
  const filterOptions = useMemo(() => {
    return {
      centerOptions: centers,
      categoryOptions: ['All', ...categories],
      instructorOptions: ['All', ...instructors],
      dayOptions: ['All', ...days]
    };
  }, [categories, instructors]);

  // Show loading screen while data is being fetched
  if (isLoading) {
    return <LoadingScreen isSwimmingMode={isSwimmingMode} />;
  }

  // Show error message if there was an error fetching data
  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading timetable data. Please try again later.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Enhanced app bar with mode-specific styling and gradient */}
      <div 
        className={`
          ${isSwimmingMode 
            ? 'bg-gradient-to-r from-teal-600 to-cyan-500' 
            : 'bg-gradient-to-r from-red-500 to-orange-500'
          } text-white px-3 py-3 shadow-md z-20 sticky top-0
        `}
      >
        <div className="max-w-5xl mx-auto">
          {/* Mode toggle */}
          <ModeToggle 
            isSwimmingMode={isSwimmingMode} 
            onModeSwitch={handleModeSwitch} 
          />
        </div>
      </div>
      
      {/* Filter section */}
      <div className={`
        py-2 px-3 border-b border-gray-200
        ${isSwimmingMode 
          ? 'bg-gradient-to-r from-cyan-50 to-teal-100/80' 
          : 'bg-gradient-to-r from-red-50 to-orange-100/80'
        }
      `}>
        <div className="max-w-5xl mx-auto">
          {/* Two sections - FilterBar and DayNavigator side by side */}
          <div className="flex flex-col md:flex-row md:items-end">
            {/* Filter bar takes up most of the space */}
            <div className="flex-grow">
              <FilterBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                isSwimmingMode={isSwimmingMode}
                {...filterOptions}
              />
            </div>
            
            {/* Day navigator - right aligned */}
            <div className="md:ml-4 mt-3 md:mt-0 flex justify-end">
              <DayNavigator
                selectedDay={selectedDay}
                onDaySelect={handleDaySelect}
                scrollToDay={scrollToDay}
                isSwimmingMode={isSwimmingMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - scrollable container */}
      <div className={`
        flex-1 overflow-hidden
        ${isSwimmingMode ? 'bg-cyan-50' : 'bg-red-50'}
      `}>
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Class list or no classes message */}
          {hasAnyClasses ? (
            <div className="max-w-5xl mx-auto px-3 py-4">
              <ClassList
                classesByDay={classesByDay}
                onClassClick={handleClassClick}
                days={days}
                isSwimmingMode={isSwimmingMode}
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <NoClassesMessage isSwimmingMode={isSwimmingMode} />
            </div>
          )}
        </div>
      </div>

      {/* Class details modal */}
      {selectedClass && (
        <ClassDetails
          classData={selectedClass}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isSwimmingMode={isSwimmingMode}
        />
      )}
    </div>
  );
};

export default FitnessTimetable; 