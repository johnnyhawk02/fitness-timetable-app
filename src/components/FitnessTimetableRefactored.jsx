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

/**
 * The inner component that uses the context
 */
const FitnessTimetableInner = () => {
  // Get values from context
  const { state, actions, isSwimmingMode } = useTimetable();
  
  // Local state
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const data = await classService.getAllClasses();
        setClasses(data);
      } catch (error) {
        console.error('Error loading classes:', error);
        showToast('Error loading classes');
      } finally {
        setLoading(false);
      }
    };
    
    loadClasses();
  }, []);
  
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
  
  // Function to handle class selection
  const handleClassClick = (classInfo) => {
    setSelectedClass(classInfo);
  };
  
  // Render swimming specific filters
  const renderSwimmingFilters = () => (
    <div className="space-y-6">
      <PoolTypeFilter
        value={state.filters.poolLocationType}
        onChange={(value) => actions.setFilter('poolLocationType', value)}
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
      />
    </div>
  );
  
  // Render fitness class specific filters
  const renderFitnessFilters = () => (
    <div className="space-y-6">
      <ClassTypeFilter
        value={state.filters.category}
        onChange={(value) => actions.setFilter('category', value)}
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
      />
      
      <VirtualClassToggle
        value={state.filters.includeVirtual}
        onChange={(value) => actions.setFilter('includeVirtual', value)}
      />
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App bar with logo, filter buttons and count */}
      <div className="bg-[rgb(0,130,188)] text-white p-3 flex flex-wrap justify-between items-center shadow-md z-20 relative">
        <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-8 object-contain" />
        
        {/* Mode toggle and filter buttons */}
        <div className="flex items-center gap-2">
          {/* Mode toggle button */}
          <ModeToggle
            isSwimmingMode={isSwimmingMode}
            onToggle={(value) => actions.setMode(value ? 'swimming' : 'fitness')}
          />
          
          {/* Filter button */}
          <FilterButton
            onClick={() => actions.toggleFiltersExpanded()}
            activeCount={getActiveFilterCount()}
          />
          
          {/* Today button */}
          <TodayButton onClick={scrollToToday} />
        </div>
      </div>
      
      {/* Toast notification */}
      <Toast show={toast.show} message={toast.message} />
      
      {/* Filter panel - slides down when expanded */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          state.ui.filtersExpanded ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-gray-100">
            {/* Render appropriate filter panel based on mode */}
            {isSwimmingMode ? renderSwimmingFilters() : renderFitnessFilters()}
            
            {/* Bottom close button */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md py-3 px-4">
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

      {/* Timetable content - full screen scrollable area */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Mode indicator */}
          <div className="sticky top-0 z-10 bg-gray-100 py-1.5 px-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Showing: <span className="text-[rgb(0,130,188)]">{isSwimmingMode ? 'Swimming Pool Sessions' : 'Fitness Classes'}</span>
            </span>
            <span className="text-sm font-medium text-[rgb(0,130,188)]">
              Class Timetable
            </span>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(0,130,188)]"></div>
            </div>
          ) : (
            <ClassList
              classes={filteredClasses}
              onClassClick={handleClassClick}
            />
          )}
        </div>
      </div>
      
      {/* Class details modal */}
      {selectedClass && (
        <ClassDetails
          classInfo={selectedClass}
          onClose={() => setSelectedClass(null)}
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