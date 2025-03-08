import React, { useState, useEffect, useCallback, useMemo } from 'react';
import bootleClasses from '../data/bootleData';
import crosbyClasses from '../data/crosbyData';
import meadowsClasses from '../data/meadowsData';
import nethertonClasses from '../data/nethertonData';
import litherlandClasses from '../data/litherlandData';
import dunesClasses from '../data/dunesData';
import classDescriptions from '../data/classDescriptions';

// Local storage keys
const STORAGE_KEYS = {
  SELECTED_CENTERS: 'fitness_selected_centers',
  SELECTED_CATEGORY: 'fitness_selected_category',
  INCLUDE_VIRTUAL: 'fitness_include_virtual',
  SELECTED_TIME_BLOCKS: 'fitness_selected_time_blocks',
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

// Instead of 4 time divisions, simplify to just 3
const TIME_DIVISIONS = {
  morning: { label: 'Morning', start: 6, end: 12 },
  afternoon: { label: 'Afternoon', start: 12, end: 17 },
  evening: { label: 'Evening', start: 17, end: 22 }
};

// Add a mapping for center name abbreviations
const CENTER_ABBREVIATIONS = {
  'Bootle': 'BTL',
  'Crosby': 'CLAC',
  'Meadows': 'MDW',
  'Netherton': 'NAC',
  'Litherland': 'LSP',
  'Dunes': 'DSW'
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
  const dayAbbreviations = {
    'Monday': 'Mo',
    'Tuesday': 'Tu',
    'Wednesday': 'We',
    'Thursday': 'Th',
    'Friday': 'Fr',
    'Saturday': 'Sa',
    'Sunday': 'Su'
  };
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
  const [selectedTimeBlocks, setSelectedTimeBlocks] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_TIME_BLOCKS, {
      morning: false,
      afternoon: false,
      evening: false
    })
  );
  const [isTimePopupOpen, setIsTimePopupOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState(null);
  const [timeBlocks, setTimeBlocks] = useState(() => 
    getStoredValue(STORAGE_KEYS.TIME_BLOCKS, defaultTimeBlocks)
  );

  // Additional state for filter UI
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedDays, setSelectedDays] = useState(() => 
    getStoredValue('fitness_selected_days', days.reduce((acc, day) => {
      acc[day] = true;
      return acc;
    }, {}))
  );

  // Add state for class description modal
  const [showDescription, setShowDescription] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);

  // Toggle all filters visibility
  const toggleFilters = () => {
    console.log('Current filtersExpanded:', filtersExpanded);
    setFiltersExpanded(!filtersExpanded);
  };

  // Save selected days to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_selected_days', JSON.stringify(selectedDays));
  }, [selectedDays]);

  // Handle day selection toggling
  const handleDayChange = (day) => {
    setSelectedDays({
      ...selectedDays,
      [day]: !selectedDays[day]
    });
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
    
    // Reset category 
    setSelectedCategory('');
    
    // Reset time blocks
    setSelectedTimeBlocks({
      morning: false,
      afternoon: false,
      evening: false
    });
    
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
    
    // Count time blocks
    const activeTimeBlocks = Object.values(selectedTimeBlocks).filter(selected => selected).length;
    if (activeTimeBlocks > 0) count++;
    
    // Count other active filters
    if (selectedCategory) count++;
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
    localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCKS, JSON.stringify(selectedTimeBlocks));
  }, [selectedTimeBlocks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME_BLOCKS, JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  // Add reset for time blocks to handle potential localStorage conflicts
  useEffect(() => {
    // Reset time blocks to default on component load to avoid key mismatches
    setTimeBlocks(defaultTimeBlocks);
  }, []);

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
    setSelectedTimeBlocks({
      ...selectedTimeBlocks,
      [blockId]: !selectedTimeBlocks[blockId]
    });
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
      if (selectedTimeBlocks[editingTimeBlock] !== true) {
        setSelectedTimeBlocks({
          ...selectedTimeBlocks,
          [editingTimeBlock]: true
        });
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
    const newSelectedCenters = { ...selectedCenters };
    
    // Handle the "All" button click
    if (center === 'all') {
      const allSelected = Object.values(newSelectedCenters).every(selected => selected);
      
      // Only toggle if not all are selected
      if (!allSelected) {
        Object.keys(newSelectedCenters).forEach(key => {
          newSelectedCenters[key] = true;
        });
        
        // Update state and localStorage
        setSelectedCenters(newSelectedCenters);
        localStorage.setItem(STORAGE_KEYS.SELECTED_CENTERS, JSON.stringify(newSelectedCenters));
      }
      // If all are already selected, do nothing
    } 
    // Handle regular center selection
    else {
      // Check if all centers are currently selected
      const allSelected = Object.values(newSelectedCenters).every(selected => selected);
      
      if (allSelected) {
        // If all are selected, clear all and only select the clicked one
        Object.keys(newSelectedCenters).forEach(key => {
          newSelectedCenters[key] = (key === center);
        });
      } else {
        // Check if this is the last selected center and prevent deselection
        const selectedCount = Object.values(newSelectedCenters).filter(Boolean).length;
        if (selectedCount === 1 && newSelectedCenters[center]) {
          // Don't allow deselecting the last center
          return;
        }
        
        // Otherwise toggle the clicked center (add or remove)
        newSelectedCenters[center] = !newSelectedCenters[center];
      }
      
      // Update state and localStorage
      setSelectedCenters(newSelectedCenters);
      localStorage.setItem(STORAGE_KEYS.SELECTED_CENTERS, JSON.stringify(newSelectedCenters));
    }
  };

  // Update time division selection to allow multiple selections
  const handleTimeDivisionChange = (division) => {
    const newSelectedTimeBlocks = { ...selectedTimeBlocks };
    newSelectedTimeBlocks[division] = !selectedTimeBlocks[division];
    
    setSelectedTimeBlocks(newSelectedTimeBlocks);
    localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCKS, JSON.stringify(newSelectedTimeBlocks));
  };

  // Filter classes based on selected filters
  const filteredClasses = useMemo(() => {
    const anyTimeBlockSelected = Object.values(selectedTimeBlocks).some(selected => selected);
    
    return allClasses.filter(cls => {
      // Center filter
      const anyCenterSelected = Object.values(selectedCenters).some(selected => selected);
      if (anyCenterSelected && !selectedCenters[cls.center]) return false;

      // Day filter
      if (!selectedDays[cls.day]) return false;

      // Get the class category
      const category = getClassCategory(cls.activity);

      // Time filter - pass if no time blocks are selected or if the class time matches any selected block
      if (anyTimeBlockSelected) {
        const classStartHour = convertTimeToHours(cls.time);
        const matchesAnySelectedTimeBlock = Object.entries(selectedTimeBlocks).some(([division, isSelected]) => {
          if (!isSelected) return false;
          const timeDivision = TIME_DIVISIONS[division];
          return classStartHour >= timeDivision.start && classStartHour < timeDivision.end;
        });
        
        if (!matchesAnySelectedTimeBlock) return false;
      }

      // Category filter
      if (selectedCategory && category !== selectedCategory) {
        return false;
      }

      // Virtual filter
      if (!includeVirtual && cls.virtual) {
        return false;
      }

      // If we passed all filters, include the class
      return true;
    });
  }, [allClasses, selectedCenters, selectedDays, selectedTimeBlocks, selectedCategory, includeVirtual, getClassCategory]);

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

  // Function to handle showing class description
  const handleShowDescription = (cls) => {
    setSelectedClass(cls.activity);
    setSelectedClassDetails({
      day: cls.day,
      time: cls.time,
      location: cls.location,
      center: cls.center
    });
    setShowDescription(true);
  };
  
  // Function to close the description modal
  const handleCloseDescription = () => {
    setShowDescription(false);
    setSelectedClass(null);
    setSelectedClassDetails(null);
  };
  
  // Function to get class description with fuzzy matching
  const getClassDescription = (activity) => {
    if (!activity) return "No description available.";
    
    // The classDescriptions file is a direct object, not an array
    const descriptions = classDescriptions;
    
    // Check for exact match first
    if (descriptions[activity]) {
      return descriptions[activity];
    }
    
    // If no exact match, try to find the closest match
    const activityLower = activity.toLowerCase().trim();
    
    // First check if the activity is contained within any description key
    const containsMatch = Object.keys(descriptions).find(key => 
      activityLower.includes(key.toLowerCase()) || key.toLowerCase().includes(activityLower)
    );
    
    if (containsMatch) {
      return descriptions[containsMatch];
    }
    
    // Try to find the closest match by comparing words
    const activityWords = activityLower.split(/\s+/);
    
    // Score each description key by how many words match
    const scoredMatches = Object.keys(descriptions).map(key => {
      const keyLower = key.toLowerCase();
      const keyWords = keyLower.split(/\s+/);
      
      // Count matching words
      let matchScore = 0;
      activityWords.forEach(word => {
        if (word.length <= 2) return; // Skip very short words
        
        if (keyWords.some(keyWord => keyWord.includes(word) || word.includes(keyWord))) {
          matchScore++;
        }
      });
      
      return { key, score: matchScore };
    });
    
    // Sort by score (highest first)
    scoredMatches.sort((a, b) => b.score - a.score);
    
    // If we have a match with a score > 0, use it
    if (scoredMatches.length > 0 && scoredMatches[0].score > 0) {
      return descriptions[scoredMatches[0].key];
    }
    
    // No good match found
    return `No description available for "${activity}".`;
  };

  return (
    <div className="flex flex-col h-screen bg-[rgba(0,0,0,0.2)] p-4 overflow-hidden">
      {/* Filter section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header and filter toggle */}
        <button 
          onClick={toggleFilters}
          className="w-full bg-[rgb(0,130,188)] px-4 py-2 flex justify-between items-center hover:bg-[rgb(0,130,188)]/90 transition-colors"
        >
          <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-8 object-contain" />
          <div className="flex items-center text-sm font-medium text-white">
            <span className="mr-1">Filters</span>
            {getActiveFilterCount() > 0 && 
              <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            }
            <svg 
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${filtersExpanded ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </button>

        {/* Filter panel */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            filtersExpanded ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white overflow-y-auto scrollbar-hide">
            <div className="divide-y divide-[rgb(0,130,188)]/15">
              {/* Centers filter */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  <div className="text-sm font-medium text-gray-700">Centers</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCenterChange('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      Object.values(selectedCenters).every(selected => selected)
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                  >
                    All
                  </button>
                  {centers.map(center => (
                    <button
                      key={center}
                      onClick={() => handleCenterChange(center)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCenters[center]
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-green-200 text-green-800 hover:bg-green-300'
                      }`}
                    >
                      {CENTER_ABBREVIATIONS[center] || center}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days filter */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  <div className="text-sm font-medium text-gray-700">Days</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {days.map(day => (
                    <button
                      key={day}
                      onClick={() => handleDayChange(day)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedDays[day]
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                      }`}
                    >
                      {dayAbbreviations[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class types filter */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <div className="text-sm font-medium text-gray-700">Class Types</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    key="all-categories"
                    onClick={() => handleCategoryChange('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === ''
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                    }`}
                  >
                    All Types
                  </button>
                  {Object.entries(classCategories).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => handleCategoryChange(value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === value
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                      }`}
                    >
                      {label.replace('Classes', '').trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time filter */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <div className="text-sm font-medium text-gray-700">Time of Day</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(TIME_DIVISIONS).map(([key, division]) => (
                    <button
                      key={key}
                      onClick={() => handleTimeDivisionChange(key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTimeBlocks[key]
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
                      }`}
                    >
                      {division.start}:00 - {division.end}:00
                    </button>
                  ))}
                </div>
              </div>

              {/* Virtual classes filter */}
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <div className="text-sm font-medium text-gray-700">Class Format</div>
                </div>
                <div 
                  className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg bg-purple-200 hover:bg-purple-300 transition-colors w-fit"
                  onClick={() => setIncludeVirtual(!includeVirtual)}
                >
                  <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${includeVirtual ? 'bg-purple-600' : 'border-2 border-purple-600 bg-white'}`}>
                    {includeVirtual && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                  </div>
                  <span className="text-sm text-purple-700">Include Virtual Classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom close button - styled to match top header */}
          <div className="sticky bottom-0 bg-white">
            <button 
              onClick={toggleFilters}
              className="w-full flex justify-center items-center bg-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/90 transition-colors h-12"
            >
              <svg 
                className="w-6 h-6 text-white"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Timetable content */}
      <div className="mt-4 flex-1 overflow-hidden bg-white rounded-lg shadow-md">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 gap-4 p-4">
            {days.map(day => {
              if (classesByDay[day].length === 0) return null;
              return (
                <div key={day} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-[rgb(0,130,188)] text-white font-semibold py-2 px-4 text-sm">
                    {day}
                  </div>
                  <div className="divide-y divide-gray-200">
                    {classesByDay[day].length === 0 ? (
                      <div className="p-4 text-gray-500">No classes available</div>
                    ) : (
                      classesByDay[day].map((cls, idx) => (
                        <div 
                          key={`${day}-${idx}`} 
                          className="flex items-start p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleShowDescription(cls)}
                        >
                          <div className="w-28 flex flex-col text-left pr-4">
                            <div className="font-medium text-gray-700 text-xs pt-0.5">{cls.time}</div>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-start justify-between">
                              <div className="font-medium text-sm">
                                {cls.activity}
                              </div>
                              <span
                                className="ml-2 w-fit px-1.5 py-0.5 text-xs font-medium rounded bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]"
                              >
                                {CENTER_ABBREVIATIONS[cls.center] || cls.center}
                              </span>
                            </div>
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
      </div>

      {/* Class description modal */}
      {showDescription && selectedClass && selectedClassDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseDescription}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="overflow-y-auto scrollbar-hide max-h-[80vh]">
              <div className="sticky top-0 bg-[rgb(0,130,188)] text-white py-3 px-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{selectedClass}</h3>
                <button 
                  onClick={handleCloseDescription}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-[rgb(0,130,188)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span className="text-sm text-gray-700">{selectedClassDetails.day}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-[rgb(0,130,188)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-sm text-gray-700">{selectedClassDetails.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-[rgb(0,130,188)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-sm text-gray-700">{selectedClassDetails.center} - {selectedClassDetails.location}</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {getClassDescription(selectedClass) ? (
                    <div dangerouslySetInnerHTML={{ __html: getClassDescription(selectedClass) }} />
                  ) : (
                    <p>No description available for this class.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-xs text-center text-white">
        <a 
          href="https://www.activeseftonfitness.co.uk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-blue-200 hover:underline"
        >
          Active Sefton Fitness
        </a>
      </div>
    </div>
  );
};

export default FitnessTimetable;
