import React, { useState, useEffect } from 'react';
import { TimetableProvider, useTimetable } from '../context/TimetableContext';
import useLocalStorage from '../hooks/useLocalStorage';
import useFilteredClasses from '../hooks/useFilteredClasses';

// Component imports
import ModeToggle from './ui/ModeToggle';
import FilterButton from './ui/FilterButton';
import TodayButton from './ui/TodayButton';
import ClassList from './ui/ClassList';
import ClassDetails from './ui/ClassDetails';
import Toast from './ui/Toast';
import PoolTypeFilter from './filters/PoolTypeFilter';
import ClassTypeFilter from './filters/ClassTypeFilter';
import CentersFilter from './filters/CentersFilter';
import VirtualClassToggle from './filters/VirtualClassToggle';

// Service imports
import classService from '../services/classService';

// Constants
const centers = ['Bootle', 'Meadows', 'Netherton', 'Crosby', 'Dunes', 'Litherland'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CENTERS_WITH_POOLS = ['Bootle', 'Meadows', 'Dunes'];

// Color theme
const COLORS = {
  primary: 'rgb(0,130,188)', // Sefton blue
  primaryLight: 'rgb(0,130,188, 0.1)',
  primaryMedium: 'rgb(0,130,188, 0.6)',
  secondary: 'rgb(255,152,0)', // Orange
  secondaryLight: 'rgb(255,152,0, 0.1)',
  success: 'rgb(76,175,80)', // Green
  successLight: 'rgb(76,175,80, 0.1)',
  error: 'rgb(244,67,54)', // Red
  errorLight: 'rgb(244,67,54, 0.1)',
  warning: 'rgb(255,193,7)', // Amber
  warningLight: 'rgb(255,193,7, 0.1)',
  info: 'rgb(3,169,244)', // Light Blue
  infoLight: 'rgb(3,169,244, 0.1)',
  
  // Day colors (more subtle)
  dayColors: {
    'Monday': 'rgb(3,169,244, 0.7)', // Light Blue
    'Tuesday': 'rgb(156,39,176, 0.7)', // Purple
    'Wednesday': 'rgb(76,175,80, 0.7)', // Green
    'Thursday': 'rgb(255,152,0, 0.7)', // Orange
    'Friday': 'rgb(233,30,99, 0.7)', // Pink
    'Saturday': 'rgb(0,188,212, 0.7)', // Cyan
    'Sunday': 'rgb(121,85,72, 0.7)', // Brown
  },
  
  // Category colors
  categoryColors: {
    'cardio': 'rgb(233,30,99)', // Pink
    'strength': 'rgb(156,39,176)', // Purple
    'mind-body': 'rgb(121,85,72)', // Brown
    'core': 'rgb(255,152,0)', // Orange
    'spinning': 'rgb(0,188,212)', // Cyan
  },
  
  // Center colors
  centerColors: {
    'Bootle': 'rgb(3,169,244)', // Light Blue
    'Meadows': 'rgb(76,175,80)', // Green
    'Netherton': 'rgb(255,152,0)', // Orange
    'Crosby': 'rgb(233,30,99)', // Pink
    'Dunes': 'rgb(156,39,176)', // Purple
    'Litherland': 'rgb(121,85,72)', // Brown
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
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [selectedClass, setSelectedClass] = useState(null);
  const [colorMode, setColorMode] = useLocalStorage('color_mode', 'standard'); // 'standard' or 'vibrant'
  
  // Load classes on mount and when mode changes
  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const data = await classService.getAllClasses();
        setClasses(data);
        console.log('Classes reloaded, total count:', data.length);
      } catch (error) {
        console.error('Error loading classes:', error);
        showToast('Error loading classes');
      } finally {
        setLoading(false);
      }
    };
    
    loadClasses();
  }, [isSwimmingMode]); // Re-run when mode changes
  
  // Add explicit effect to handle mode changes
  useEffect(() => {
    console.log('Mode effect triggered, current mode:', state.mode);
    console.log('isSwimmingMode in effect:', isSwimmingMode);
    
    // Force UI update by showing toast with mode
    showToast(`Mode: ${isSwimmingMode ? 'Swimming' : 'Fitness'}`);
    
  }, [state.mode, isSwimmingMode]);
  
  // Filter classes based on current filters
  const filteredClasses = useFilteredClasses(
    classes,
    state.filters,
    isSwimmingMode
  );
  
  // Function to show toast notifications
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };
  
  // Function to scroll to today's classes
  const scrollToToday = () => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    const todayElement = document.getElementById(`day-${dayOfWeek}`);
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(`Scrolled to ${dayOfWeek}`);
    } else {
      showToast('No classes available for today');
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
  
  // Add explicit handler for mode switching
  const handleModeSwitch = (newMode) => {
    console.log('Manual mode switch to:', newMode);
    // Show loading state while switching
    setLoading(true);
    // Set mode after a brief delay to ensure UI updates
    setTimeout(() => {
      actions.setMode(newMode);
      // Add a small delay before turning off loading for better UX
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }, 100);
  };
  
  // Render swimming specific filters
  const renderSwimmingFilters = () => (
    <div className="space-y-6">
      <PoolTypeFilter
        value={state.filters.poolLocationType}
        onChange={(value) => actions.setFilter('poolLocationType', value)}
        colors={COLORS}
      />
      
      <CentersFilter
        centers={centers}
        selected={state.filters.centers}
        isSwimmingMode={isSwimmingMode}
        onChange={(center) => {
          if (center === 'all' || center === 'none') {
            const newCenters = { ...state.filters.centers };
            
            if (center === 'all') {
              centers.forEach(c => {
                newCenters[c] = true;
              });
            } else if (center === 'none') {
              centers.forEach(c => {
                newCenters[c] = false;
              });
              // Ensure at least one center is selected
              const firstPoolCenter = CENTERS_WITH_POOLS[0] || centers[0];
              newCenters[firstPoolCenter] = true;
            }
            
            actions.setFilter('centers', newCenters);
          } else {
            // Toggle individual center
            const newCenters = { ...state.filters.centers };
            
            // Exclusive selection - only select the clicked center
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
  );
  
  // Render fitness class specific filters
  const renderFitnessFilters = () => (
    <div className="space-y-6">
      <ClassTypeFilter
        value={state.filters.category}
        onChange={(value) => actions.setFilter('category', value)}
        colors={COLORS}
        colorMode={colorMode}
      />
      
      <CentersFilter
        centers={centers}
        selected={state.filters.centers}
        isSwimmingMode={isSwimmingMode}
        onChange={(center) => {
          if (center === 'all' || center === 'none') {
            const newCenters = { ...state.filters.centers };
            
            if (center === 'all') {
              centers.forEach(c => {
                newCenters[c] = true;
              });
            } else if (center === 'none') {
              centers.forEach(c => {
                newCenters[c] = false;
              });
              // Ensure at least one center is selected
              newCenters[centers[0]] = true;
            }
            
            actions.setFilter('centers', newCenters);
          } else {
            // Toggle individual center
            const newCenters = { ...state.filters.centers };
            
            // Exclusive selection - only select the clicked center
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
      
      <VirtualClassToggle
        value={state.filters.includeVirtual}
        onChange={(value) => actions.setFilter('includeVirtual', value)}
        colors={COLORS}
      />
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App bar with logo, filter buttons and count */}
      <div className="bg-[rgb(0,130,188)]/95 backdrop-blur-sm text-white px-4 py-2.5 shadow-lg z-20 sticky top-0">
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
            
            {/* Today button */}
            <TodayButton onClick={scrollToToday} colors={COLORS} />
            
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
      
      {/* Filter panel - slides down when expanded */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-b border-gray-300 shadow-lg relative z-10 ${
          state.ui.filtersExpanded ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="divide-y divide-gray-200">
              {/* Filter header with mode info and switch button */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    {isSwimmingMode ? 'Swimming Pool Filters' : 'Fitness Class Filters'}
                  </h3>
                  <button
                    onClick={() => handleModeSwitch(isSwimmingMode ? 'fitness' : 'swimming')}
                    className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-all shadow-sm"
                  >
                    Switch to {isSwimmingMode ? 'Fitness' : 'Swimming'}
                  </button>
                </div>
              </div>
              
              {/* Filter section wrapper with padding and background */}
              <div className="p-4 bg-white">
                {/* Render appropriate filter panel based on mode */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4">
                    {isSwimmingMode ? renderSwimmingFilters() : renderFitnessFilters()}
                  </div>
                </div>
              </div>
              
              {/* Bottom close button */}
              <div className="sticky bottom-0 py-3 px-4 bg-gradient-to-b from-gray-50/80 to-gray-50 backdrop-blur-md border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => actions.toggleFiltersExpanded()}
                  className="w-full bg-[rgb(0,130,188)] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[rgb(0,130,188)]/90 transition-all shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable content - full screen scrollable area */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Mode indicator in scrollable area */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between py-2 px-4">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span 
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${isSwimmingMode ? 'bg-cyan-500' : 'bg-orange-500'}`}
                ></span>
                {isSwimmingMode ? 'Pool Sessions' : 'Fitness Classes'}
              </span>
              
              <button
                onClick={() => handleModeSwitch(isSwimmingMode ? 'fitness' : 'swimming')}
                className="text-xs py-1 px-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-medium flex items-center transition-colors"
              >
                <span className="mr-1">Switch to</span>
                <span className={isSwimmingMode ? 'text-orange-600' : 'text-cyan-600'}>
                  {isSwimmingMode ? 'Fitness' : 'Swimming'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Loading indicator */}
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(0,130,188)]"></div>
            </div>
          ) : (
            <div className="p-4">
              {/* Class list */}
              <ClassList
                classes={filteredClasses}
                onClassClick={handleClassClick}
                colors={COLORS}
                colorMode={colorMode}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Class details modal */}
      {selectedClass && (
        <ClassDetails
          classInfo={selectedClass}
          onClose={() => setSelectedClass(null)}
          colors={COLORS}
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