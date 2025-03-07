import React, { useState, useEffect, useCallback, useMemo } from 'react';
import bootleClasses from '../data/bootleData';
import crosbyClasses from '../data/crosbyData';
import meadowsClasses from '../data/meadowsData';
import nethertonClasses from '../data/nethertonData';
import litherlandClasses from '../data/litherlandData';
import dunesClasses from '../data/dunesData';

// Local storage keys
const STORAGE_KEYS = {
  SELECTED_CENTERS: 'fitness_selected_centers',
  SELECTED_CATEGORY: 'fitness_selected_category',
  INCLUDE_VIRTUAL: 'fitness_include_virtual',
  SELECTED_TIME_BLOCK: 'fitness_selected_time_block',
  TIME_BLOCKS: 'fitness_time_blocks'
};

// Helper to load from localStorage with fallback
const getStoredValue = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.warn(`Error loading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const FitnessTimetable = () => {
  // Combine all classes using useMemo to maintain reference stability
  const allClasses = useMemo(() => [
    ...bootleClasses, 
    ...crosbyClasses, 
    ...meadowsClasses, 
    ...nethertonClasses, 
    ...litherlandClasses, 
    ...dunesClasses
  ], []);  // Empty dependency array means this only runs once

  // Default time blocks configuration
  const defaultTimeBlocks = {
    'morning': { label: 'Morning', start: 6, end: 12 },
    'afternoon-evening': { label: 'Afternoon/Evening', start: 12, end: 22 }
  };

  // Filter options
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const centers = ['Bootle', 'Crosby', 'Meadows', 'Netherton', 'Litherland', 'Dunes'];
  //const allLocations = [...new Set(allClasses.map(cls => cls.location))];

  // Default centers selection - all centers selected by default
  const defaultCentersSelection = centers.reduce((acc, center) => {
    acc[center] = true;
    return acc;
  }, {});

  // Class category definitions
  const classCategories = {
    cardio: 'Cardio',
    strength: 'Strength',
    'mind-body': 'Mind & Body',
    core: 'Core',
    spinning: 'Spinning'
  };

  // State hooks with localStorage integration
  const [selectedCenters, setSelectedCenters] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_CENTERS, defaultCentersSelection)
  );
  const [selectedCategory, setSelectedCategory] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_CATEGORY, '')
  );
  const [includeVirtual, setIncludeVirtual] = useState(() => 
    getStoredValue(STORAGE_KEYS.INCLUDE_VIRTUAL, true)
  );
  const [selectedTimeBlock, setSelectedTimeBlock] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_TIME_BLOCK, '')
  );
  const [isTimePopupOpen, setIsTimePopupOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState(null);
  const [timeBlocks, setTimeBlocks] = useState(() => 
    getStoredValue(STORAGE_KEYS.TIME_BLOCKS, defaultTimeBlocks)
  );
  const [timeSliderValues, setTimeSliderValues] = useState(() => 
    getStoredValue('fitness_time_dividers', [10, 14])
  );

  // Additional state for filter UI
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedDays, setSelectedDays] = useState(() => 
    getStoredValue('fitness_selected_days', days.reduce((acc, day) => {
      acc[day] = true;
      return acc;
    }, {}))
  );

  // Toggle all filters visibility
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Save selected days to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_selected_days', JSON.stringify(selectedDays));
  }, [selectedDays]);

  // Handle day selection toggling
  const handleDayChange = (day) => {
    // If it's the "all" option
    if (day === 'all') {
      const allSelected = Object.values(selectedDays).every(selected => selected);
      const daysUpdate = {};
      
      // Toggle between all selected and none selected
      days.forEach(d => {
        daysUpdate[d] = !allSelected;
      });
      
      setSelectedDays(daysUpdate);
    } else {
      setSelectedDays({
        ...selectedDays,
        [day]: !selectedDays[day]
      });
    }
  };

  // Determine category for a given activity - IMPORTANT: Define this BEFORE it's used
  const getClassCategory = useCallback((activity) => {
    if (!activity) return 'other';
    
    const activityLower = activity.toLowerCase();
    
    // Skip placeholder entries
    if (activityLower.includes('no classes') || 
        activityLower === 'none' || 
        activityLower === '-') 
      return 'other';

    // Spinning category
    if (activityLower.includes('spinning') || 
        activityLower.includes('rpm') || 
        activityLower.includes('sprint') || 
        activityLower.includes('trip') ||
        activityLower.includes('cycle') ||
        activityLower.includes('spin'))
      return 'spinning';
    
    // Cardio category
    if (activityLower.includes('cardio') || 
        activityLower.includes('attack') || 
        activityLower.includes('combat') || 
        activityLower.includes('zumba') || 
        activityLower.includes('konga') ||
        activityLower.includes('dance') ||
        activityLower.includes('aerodance') ||
        activityLower.includes('aerotone') ||
        activityLower.includes('fitsteps') ||
        activityLower.includes('step') ||
        activityLower.includes('aqua') ||
        activityLower.includes('boxing') ||
        activityLower.includes('boxercise') ||
        activityLower.includes('kickboxing') ||
        activityLower.includes('baby ballet'))
      return 'cardio';
    
    // Strength category
    if (activityLower.includes('tone') || 
        activityLower.includes('conditioning') || 
        activityLower.includes('circuit') || 
        activityLower.includes('kettlebell') || 
        activityLower.includes('strength') || 
        activityLower.includes('synergy') || 
        activityLower.includes('bootcamp') || 
        activityLower.includes('hiit') || 
        activityLower.includes('bodypump') ||
        activityLower.includes('grit') ||
        activityLower.includes('sculpt') ||
        activityLower.includes('pump') ||
        activityLower.includes('chair based') ||
        activityLower.includes('junior circuit') ||
        activityLower.includes('low level circuit'))
      return 'strength';
    
    // Mind-body category
    if (activityLower.includes('yoga') || 
        activityLower.includes('pilates') || 
        activityLower.includes('balance') || 
        activityLower.includes('bodybalance') ||
        activityLower.includes('relaxation') || 
        activityLower.includes('tai chi') ||
        activityLower.includes('tai-chi') ||
        activityLower.includes('mobility') ||
        activityLower.includes('barre') ||
        activityLower.includes('ballet barre') ||
        activityLower.includes('flow') ||
        activityLower.includes('gentle flow') ||
        activityLower.includes('vinyassa') ||
        activityLower.includes('hatha') ||
        activityLower.includes('yin'))
      return 'mind-body';
    
    // Core category
    if (activityLower.includes('core') || 
        activityLower.includes('abs') || 
        activityLower.includes('bums') ||
        activityLower.includes('legs') ||
        activityLower.includes('tums') ||
        activityLower.includes('body sculpt'))
      return 'core';
    
    // On Demand classes - categorize based on most likely content
    if (activityLower.includes('on demand')) {
      // If there's additional info, try to categorize based on that
      if (activityLower.includes('spin') || activityLower.includes('cycle'))
        return 'spinning';
      if (activityLower.includes('core') || activityLower.includes('abs'))
        return 'core';
      if (activityLower.includes('yoga') || activityLower.includes('pilates'))
        return 'mind-body';
      
      // Generic on demand classes could be any type, default to 'other'
      return 'other';
    }
    
    // Special case for Les Mills classes without specific type
    if (activityLower.includes('les mills') && !activityLower.includes('les mills on demand')) {
      // Try to guess the type from the name format
      return 'strength'; // Default to strength for generic Les Mills classes
    }
    
    // For classes that don't match any category
    console.log('Uncategorized activity:', activity);
    return 'other';
  }, []);

  // AFTER getClassCategory is defined, now we can use it
  // Check for uncategorized activities and log them
  useEffect(() => {
    const uncategorized = new Set();
    const categoryCounts = {
      'spinning': 0,
      'cardio': 0,
      'strength': 0,
      'mind-body': 0,
      'core': 0,
      'other': 0
    };
    
    allClasses.forEach(cls => {
      const category = getClassCategory(cls.activity);
      categoryCounts[category]++;
      
      if (category === 'other' && cls.activity !== 'No Classes') {
        uncategorized.add(cls.activity);
      }
    });
    
    if (uncategorized.size > 0) {
      console.warn('Uncategorized activities found:', Array.from(uncategorized));
    }
    
    console.info('Category distribution:', categoryCounts);
  }, [allClasses, getClassCategory]);

  // Toggle filter sections
  const toggleFilterSection = (section) => {
    setFiltersExpanded({
      ...filtersExpanded,
      [section]: !filtersExpanded[section]
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    // Reset centers to all selected
    setSelectedCenters(centers.reduce((acc, center) => {
      acc[center] = true;
      return acc;
    }, {}));
    
    // Reset days to all selected
    setSelectedDays(days.reduce((acc, day) => {
      acc[day] = true;
      return acc;
    }, {}));
    
    // Reset category and time block
    setSelectedCategory('');
    setSelectedTimeBlock('');
    
    // Reset virtual classes to included
    setIncludeVirtual(true);
    
    // Reset time blocks to defaults to avoid key mismatches
    setTimeBlocks(defaultTimeBlocks);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    
    // Count centers that are not selected
    const unselectedCenters = centers.filter(center => !selectedCenters[center]).length;
    if (unselectedCenters > 0) count++;
    
    // Count days that are not selected
    const unselectedDays = days.filter(day => !selectedDays[day]).length;
    if (unselectedDays > 0) count++;
    
    // Count other active filters
    if (selectedCategory) count++;
    if (selectedTimeBlock) count++;
    if (!includeVirtual) count++;
    
    return count;
  };

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CENTERS, JSON.stringify(selectedCenters));
  }, [selectedCenters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, JSON.stringify(selectedCategory));
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCLUDE_VIRTUAL, JSON.stringify(includeVirtual));
  }, [includeVirtual]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCK, JSON.stringify(selectedTimeBlock));
  }, [selectedTimeBlock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME_BLOCKS, JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  // Add reset for time blocks to handle potential localStorage conflicts
  useEffect(() => {
    // Reset time blocks to default on component load to avoid key mismatches
    setTimeBlocks(defaultTimeBlocks);
  }, []);

  // Save time slider values to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_time_dividers', JSON.stringify(timeSliderValues));
  }, [timeSliderValues]);

  // Time conversion utilities
  const convertTimeToHours = (timeString) => {
    try {
      // Handle different separator formats: "09:00 - 10:00" or "09:00-10:00"
      const separator = timeString.includes(' - ') ? ' - ' : '-';
      const startTime = timeString.split(separator)[0];
      const [hour, minute] = startTime.split(':').map(Number);
      return hour + (minute / 60);
    } catch (error) {
      console.warn(`Error parsing time: ${timeString}`, error);
      return 0; // Default to midnight if parsing fails
    }
  };

  const formatHourToTimeString = (hour) => {
    const wholeHour = Math.floor(hour);
    const minutes = Math.round((hour - wholeHour) * 60);
    const period = wholeHour >= 12 ? 'PM' : 'AM';
    const hour12 = wholeHour % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Handle category filter selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  // Handle time block selection
  const handleTimeBlockChange = (blockId) => {
    setSelectedTimeBlock(selectedTimeBlock === blockId ? '' : blockId);
  };

  // Handle opening the time popup for a specific time block
  const handleOpenTimePopup = (e, blockId) => {
    e.stopPropagation();
    setEditingTimeBlock(blockId);
    setIsTimePopupOpen(true);
  };

  // Handle applying custom time range to a specific time block
  const handleApplyCustomTime = () => {
    if (editingTimeBlock) {
      const updatedBlock = timeBlocks[editingTimeBlock];
      setTimeBlocks({
        ...timeBlocks,
        [editingTimeBlock]: updatedBlock
      });
      if (selectedTimeBlock !== editingTimeBlock) {
        setSelectedTimeBlock(editingTimeBlock);
      }
    }
    setIsTimePopupOpen(false);
    setEditingTimeBlock(null);
  };

  // Handle updating time range values
  const handleTimeRangeChange = (key, value) => {
    if (editingTimeBlock) {
      setTimeBlocks({
        ...timeBlocks,
        [editingTimeBlock]: {
          ...timeBlocks[editingTimeBlock],
          [key]: value
        }
      });
    }
  };

  // Handle center selection toggling
  const handleCenterChange = (center) => {
    // Check if at least one center will remain selected
    if (center === 'all') {
      const allSelected = Object.values(selectedCenters).every(selected => selected);
      const centersUpdate = {};
      
      // Toggle between all selected and none selected
      centers.forEach(c => {
        centersUpdate[c] = !allSelected;
      });
      
      setSelectedCenters(centersUpdate);
    } else {
      setSelectedCenters({
        ...selectedCenters,
        [center]: !selectedCenters[center]
      });
    }
  };

  // Handle slider change
  const handleSliderChange = (index, value) => {
    const newValues = [...timeSliderValues];
    
    // Ensure values don't cross each other and stay in bounds
    if (index === 0) {
      // First divider can't go past second divider minus buffer
      value = Math.min(value, timeSliderValues[1] - 0.5);
      value = Math.max(value, 6); // Min bound
    } else {
      // Second divider can't go before first divider plus buffer
      value = Math.max(value, timeSliderValues[0] + 0.5);
      value = Math.min(value, 22); // Max bound
    }
    
    newValues[index] = value;
    setTimeSliderValues(newValues);
  };

  // Filter classes based on selected filters
  const filteredClasses = allClasses.filter(cls => {
    // Center filter
    const anyCenterSelected = Object.values(selectedCenters).some(selected => selected);
    if (anyCenterSelected && !selectedCenters[cls.center]) return false;

    // Day filter
    if (!selectedDays[cls.day]) return false;

    // Time filter
    if (selectedTimeBlock) {
      const classStartHour = convertTimeToHours(cls.time);
      
      if (selectedTimeBlock === 'morning' && classStartHour >= timeSliderValues[0]) return false;
      if (selectedTimeBlock === 'midday' && (classStartHour < timeSliderValues[0] || classStartHour >= timeSliderValues[1])) return false;
      if (selectedTimeBlock === 'afternoon-evening' && classStartHour < timeSliderValues[1]) return false;
    }

    // If no other filters are active, include the class
    if (!selectedCategory && includeVirtual) return true;

    const category = getClassCategory(cls.activity);
    const categoryMatch = !selectedCategory || selectedCategory === category;
    const virtualMatch = includeVirtual || !cls.virtual;

    return categoryMatch && virtualMatch;
  });

  // Get locations specific to the selected center (if needed)
  // const centerLocations =
  //   selectedCenter === 'all'
  //     ? allLocations
  //     : [...new Set(allClasses.filter(cls => cls.center === selectedCenter).map(cls => cls.location))];

  // Group classes by day for display and sort by time
  const classesByDay = {};
  days.forEach(day => {
    const dayClasses = filteredClasses.filter(cls => cls.day === day);
    
    // Sort classes by time
    dayClasses.sort((a, b) => {
      const timeA = convertTimeToHours(a.time);
      const timeB = convertTimeToHours(b.time);
      return timeA - timeB;
    });
    
    classesByDay[day] = dayClasses;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-3 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Active Sefton Fitness</h1>
          <button 
            onClick={toggleFilters}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span className="mr-1">Filters</span>
            {getActiveFilterCount() > 0 && 
              <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            }
            <svg 
              className={`w-4 h-4 ml-1 transition-transform ${filtersExpanded ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        {filtersExpanded && (
          <div className="mt-3">
            {/* Centers filter */}
            <div className="border-b pb-2 mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Centres</div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleCenterChange('all')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    Object.values(selectedCenters).every(selected => selected)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {centers.map(center => (
                  <button
                    key={center}
                    onClick={() => handleCenterChange(center)}
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedCenters[center]
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {center}
                  </button>
                ))}
              </div>
            </div>

            {/* Days filter */}
            <div className="border-b pb-2 mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Days</div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleDayChange('all')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    Object.values(selectedDays).every(selected => selected)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => handleDayChange(day)}
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedDays[day]
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Class types filter */}
            <div className="border-b pb-2 mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Class Type</div>
              <div className="flex flex-wrap gap-1">
                <button
                  key="all-categories"
                  onClick={() => handleCategoryChange('')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedCategory === ''
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Types
                </button>
                {Object.entries(classCategories).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleCategoryChange(value)}
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {label.replace('Classes', '').trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time filter */}
            <div className="border-b pb-2 mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Time</div>
              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  key="all-times"
                  onClick={() => setSelectedTimeBlock('')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTimeBlock === ''
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Any Time
                </button>
                <button
                  key="morning"
                  onClick={() => setSelectedTimeBlock('morning')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTimeBlock === 'morning'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Early: 6:00 AM - {formatHourToTimeString(timeSliderValues[0])}
                </button>
                <button
                  key="midday"
                  onClick={() => setSelectedTimeBlock('midday')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTimeBlock === 'midday'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Midday: {formatHourToTimeString(timeSliderValues[0])} - {formatHourToTimeString(timeSliderValues[1])}
                </button>
                <button
                  key="afternoon-evening"
                  onClick={() => setSelectedTimeBlock('afternoon-evening')}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTimeBlock === 'afternoon-evening'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Later: {formatHourToTimeString(timeSliderValues[1])} - 10:00 PM
                </button>
              </div>
              
              {/* Time slider */}
              <div className="px-1">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>6:00 AM</span>
                  <span className="font-medium text-gray-700">{formatHourToTimeString(timeSliderValues[0])}</span>
                  <span className="font-medium text-gray-700">{formatHourToTimeString(timeSliderValues[1])}</span>
                  <span>10:00 PM</span>
                </div>
                <div className="relative w-full h-10 flex items-center">
                  {/* Background track */}
                  <div className="absolute w-full h-1 bg-gray-300 rounded"></div>
                  
                  {/* First divider slider */}
                  <input
                    type="range"
                    min="6"
                    max="22"
                    step="0.5"
                    value={timeSliderValues[0]}
                    onChange={(e) => handleSliderChange(0, parseFloat(e.target.value))}
                    className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                  />
                  
                  {/* Second divider slider */}
                  <input
                    type="range"
                    min="6"
                    max="22"
                    step="0.5"
                    value={timeSliderValues[1]}
                    onChange={(e) => handleSliderChange(1, parseFloat(e.target.value))}
                    className="absolute w-full h-8 opacity-0 cursor-pointer z-20"
                  />
                  
                  {/* Colored sections */}
                  <div 
                    className="absolute h-1 bg-orange-200 rounded-l" 
                    style={{ 
                      left: '0%', 
                      width: `${((timeSliderValues[0] - 6) / 16) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="absolute h-1 bg-orange-300" 
                    style={{ 
                      left: `${((timeSliderValues[0] - 6) / 16) * 100}%`, 
                      width: `${((timeSliderValues[1] - timeSliderValues[0]) / 16) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="absolute h-1 bg-orange-400 rounded-r" 
                    style={{ 
                      left: `${((timeSliderValues[1] - 6) / 16) * 100}%`, 
                      width: `${((22 - timeSliderValues[1]) / 16) * 100}%` 
                    }}
                  ></div>
                  
                  {/* First divider thumb */}
                  <div 
                    className="absolute w-5 h-5 bg-orange-600 rounded-full border-2 border-white shadow z-30" 
                    style={{ 
                      left: `${((timeSliderValues[0] - 6) / 16) * 100}%`, 
                      transform: 'translateX(-50%)' 
                    }}
                  ></div>
                  
                  {/* Second divider thumb */}
                  <div 
                    className="absolute w-5 h-5 bg-orange-600 rounded-full border-2 border-white shadow z-30" 
                    style={{ 
                      left: `${((timeSliderValues[1] - 6) / 16) * 100}%`, 
                      transform: 'translateX(-50%)' 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Virtual classes filter */}
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Class Format</div>
              <label 
                className="flex items-center space-x-1.5 cursor-pointer text-xs py-1 px-2 rounded bg-gray-100 hover:bg-gray-200 inline-block"
                onClick={() => setIncludeVirtual(!includeVirtual)}
              >
                <span>Include Virtual</span>
                <div className={`w-4 h-4 flex items-center justify-center border ${includeVirtual ? 'bg-purple-600 border-purple-700' : 'bg-white border-gray-400'}`}>
                  {includeVirtual && <span className="text-white text-xs font-bold">✓</span>}
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          {days.map(day => {
            if (classesByDay[day].length === 0) return null;
            return (
              <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className={`${
                    day === 'Monday'
                      ? 'bg-blue-600'
                      : day === 'Tuesday'
                      ? 'bg-green-600'
                      : day === 'Wednesday'
                      ? 'bg-purple-600'
                      : day === 'Thursday'
                      ? 'bg-orange-600'
                      : day === 'Friday'
                      ? 'bg-red-600'
                      : day === 'Saturday'
                      ? 'bg-indigo-600'
                      : 'bg-teal-600'
                  } text-white font-semibold py-1 px-3 text-sm`}
                >
                  {day}
                </div>
                <div className="divide-y divide-gray-200">
                  {classesByDay[day].length === 0 ? (
                    <div className="p-4 text-gray-500">No classes available</div>
                  ) : (
                    classesByDay[day].map((cls, idx) => (
                      <div key={`${day}-${idx}`} className="flex items-start p-3 hover:bg-gray-50">
                        <div className="w-28 font-medium text-gray-700 text-xs pt-0.5 text-left pr-4">{cls.time}</div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm flex items-center">
                            {cls.activity}
                            {cls.virtual && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                V
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{cls.location}</div>
                        </div>
                        <div className="w-20 flex justify-end">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                              cls.center === 'Bootle'
                                ? 'bg-blue-100 text-blue-800'
                                : cls.center === 'Crosby'
                                ? 'bg-amber-100 text-amber-800'
                                : cls.center === 'Meadows'
                                ? 'bg-pink-100 text-pink-800'
                                : cls.center === 'Netherton'
                                ? 'bg-purple-100 text-purple-800'
                                : cls.center === 'Litherland'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {cls.center}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        <a 
          href="https://www.activeseftonfitness.co.uk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Active Sefton Fitness
        </a>
      </div>
    </div>
  );
};

export default FitnessTimetable;
