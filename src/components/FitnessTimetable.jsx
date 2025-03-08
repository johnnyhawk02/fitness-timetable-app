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

  // Additional state for dropdown UIs
  const [openDropdown, setOpenDropdown] = useState(null);

  // Toggle all filters visibility
  const toggleFilters = () => {
    console.log('Current filtersExpanded:', filtersExpanded);
    setFiltersExpanded(!filtersExpanded);
  };

  // Save selected days to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_selected_days', JSON.stringify(selectedDays));
  }, [selectedDays]);

  // Handle day selection toggling with improved logic
  const handleDayChange = (day) => {
    const newSelectedDays = { ...selectedDays };
    
    // Special handling for "All" button
    if (day === 'all') {
      // Check if all days are currently selected
      const allSelected = Object.values(newSelectedDays).every(selected => selected);
      
      // Toggle all days
      const newValue = !allSelected;
      Object.keys(newSelectedDays).forEach(key => {
        newSelectedDays[key] = newValue;
      });
      
      // Always ensure at least one day is selected
      if (!newValue) {
        // If toggling off, select Monday as default
        newSelectedDays['Monday'] = true;
      }
    } 
    // Individual day selection
    else {
      // Toggle the clicked day
      newSelectedDays[day] = !newSelectedDays[day];
      
      // Ensure at least one day is always selected
      const anySelected = Object.values(newSelectedDays).some(selected => selected);
      if (!anySelected) {
        // If none are selected, reselect the one that was just deselected
        newSelectedDays[day] = true;
      }
    }
    
    setSelectedDays(newSelectedDays);
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

  // Simplified clear all filters function
  const clearAllFilters = () => {
    // Reset centers to all selected
    const resetCenters = centers.reduce((acc, center) => {
      acc[center] = true;
      return acc;
    }, {});
    
    // Reset days to all selected
    const resetDays = days.reduce((acc, day) => {
      acc[day] = true;
      return acc;
    }, {});
    
    // Reset time blocks to none selected (any time)
    const resetTimeBlocks = {
      morning: false,
      afternoon: false,
      evening: false
    };
    
    // Update all states
    setSelectedCenters(resetCenters);
    setSelectedDays(resetDays);
    setSelectedTimeBlocks(resetTimeBlocks);
    setSelectedCategory('');
    setIncludeVirtual(true);
    
    // Update localStorage
    localStorage.setItem(STORAGE_KEYS.SELECTED_CENTERS, JSON.stringify(resetCenters));
    localStorage.setItem('fitness_selected_days', JSON.stringify(resetDays));
    localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCKS, JSON.stringify(resetTimeBlocks));
    localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, '');
    localStorage.setItem(STORAGE_KEYS.INCLUDE_VIRTUAL, JSON.stringify(true));
  };

  // Quick filter presets
  const applyQuickFilter = (preset) => {
    switch(preset) {
      case 'today': {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const resetDays = days.reduce((acc, day) => {
          acc[day] = day === today;
          return acc;
        }, {});
        setSelectedDays(resetDays);
        localStorage.setItem('fitness_selected_days', JSON.stringify(resetDays));
        break;
      }
      case 'weekend': {
        const resetDays = days.reduce((acc, day) => {
          acc[day] = day === 'Saturday' || day === 'Sunday';
          return acc;
        }, {});
        setSelectedDays(resetDays);
        localStorage.setItem('fitness_selected_days', JSON.stringify(resetDays));
        break;
      }
      case 'evening': {
        const resetTimeBlocks = {
          morning: false,
          afternoon: false,
          evening: true
        };
        setSelectedTimeBlocks(resetTimeBlocks);
        localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCKS, JSON.stringify(resetTimeBlocks));
        break;
      }
      default:
        break;
    }
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

  // Handle category change - simplified
  const handleCategoryChange = (category) => {
    // If clicking the currently selected category or the "All Types" button when no category is selected,
    // clear the selection (meaning "all categories")
    if (selectedCategory === category) {
      setSelectedCategory('');
      localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, '');
    } else {
      // Otherwise, select the clicked category
      setSelectedCategory(category);
      localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, category);
    }
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

  // Handle center selection toggling - simplified and more intuitive
  const handleCenterChange = (center) => {
    const newSelectedCenters = { ...selectedCenters };
    
    // Special handling for "All" button
    if (center === 'all') {
      // Check if all centers are currently selected
      const allSelected = Object.values(newSelectedCenters).every(selected => selected);
      
      // Toggle all centers: If all selected, deselect all. If not all selected, select all.
      const newValue = !allSelected;
      Object.keys(newSelectedCenters).forEach(key => {
        newSelectedCenters[key] = newValue;
      });
    } 
    // Handling for individual center selection
    else {
      // Toggle the clicked center
      newSelectedCenters[center] = !newSelectedCenters[center];
      
      // Always ensure at least one center is selected
      const anySelected = Object.values(newSelectedCenters).some(selected => selected);
      if (!anySelected) {
        // If none are selected, reselect the one that was just deselected
        newSelectedCenters[center] = true;
      }
    }
    
    // Update state and localStorage
    setSelectedCenters(newSelectedCenters);
    localStorage.setItem(STORAGE_KEYS.SELECTED_CENTERS, JSON.stringify(newSelectedCenters));
  };

  // Simplify the time division selection logic
  const handleTimeDivisionChange = (division) => {
    const newSelectedTimeBlocks = { ...selectedTimeBlocks };
    
    // Special handling for "any" time option
    if (division === 'any') {
      // Check if any time blocks are currently selected
      const anySelected = Object.values(newSelectedTimeBlocks).some(selected => selected);
      
      // If any are selected, deselect all (meaning "any time")
      // If none are selected, this is already the "any time" state
      if (anySelected) {
        Object.keys(newSelectedTimeBlocks).forEach(key => {
          newSelectedTimeBlocks[key] = false;
        });
      }
    } 
    // Regular time block selection
    else {
      // Toggle the clicked time block
      newSelectedTimeBlocks[division] = !newSelectedTimeBlocks[division];
    }
    
    setSelectedTimeBlocks(newSelectedTimeBlocks);
    localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCKS, JSON.stringify(newSelectedTimeBlocks));
  };

  // Simplified filter classes logic
  const filteredClasses = useMemo(() => {
    return allClasses.filter(cls => {
      // Center filter - class center must be selected
      if (!selectedCenters[cls.center]) return false;

      // Day filter - class day must be selected
      if (!selectedDays[cls.day]) return false;

      // Time filter - only apply if any time block is selected
      const anyTimeBlockSelected = Object.values(selectedTimeBlocks).some(selected => selected);
      if (anyTimeBlockSelected) {
        const classStartHour = convertTimeToHours(cls.time);
        // Check if the class time falls within any of the selected time blocks
        const timeMatch = Object.entries(selectedTimeBlocks).some(([division, isSelected]) => {
          if (!isSelected) return false;
          const { start, end } = TIME_DIVISIONS[division];
          return classStartHour >= start && classStartHour < end;
        });
        
        if (!timeMatch) return false;
      }

      // Category filter - only apply if a category is selected
      if (selectedCategory) {
        const category = getClassCategory(cls.activity);
        if (category !== selectedCategory) return false;
      }

      // Virtual filter - exclude virtual classes if not included
      if (!includeVirtual && cls.virtual) return false;

      // If we pass all filters, include the class
      return true;
    });
  }, [
    allClasses, 
    selectedCenters, 
    selectedDays, 
    selectedTimeBlocks, 
    selectedCategory, 
    includeVirtual, 
    getClassCategory, 
    convertTimeToHours
  ]);

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
      center: cls.center,
      virtual: cls.virtual
    });
    setShowDescription(true);
    console.log('Showing description for:', cls.activity);
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

  // Dropdowns state management
  const toggleDropdown = (dropdownName) => {
    // If the dropdown is already open, close it
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      // Otherwise, open this dropdown and close any other
      setOpenDropdown(dropdownName);
    }
  };

  // Add event listener to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        // Check if the click was on a menu button
        const isMenuButton = 
          event.target.closest('button') && 
          (event.target.closest('button').title?.includes('Filter by') || 
           event.target.closest('button').title?.includes('Toggle Virtual'));
           
        // If clicking the active menu button, let toggleDropdown handle it
        if (isMenuButton && 
            ((openDropdown === 'centers' && event.target.closest('button').id === 'centers-btn') ||
             (openDropdown === 'days' && event.target.closest('button').id === 'days-btn') ||
             (openDropdown === 'class-types' && event.target.closest('button').id === 'class-types-btn') ||
             (openDropdown === 'time' && event.target.closest('button').id === 'time-btn'))) {
          return;
        }
        
        // Check if the click was inside a dropdown
        const isInDropdown = event.target.closest('.dropdown-menu');
        
        // If not clicking a dropdown or different menu button, close the dropdown
        if (!isInDropdown && !(isMenuButton && event.target.closest('button').id !== `${openDropdown}-btn`)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="flex flex-col h-screen bg-[rgba(0,0,0,0.2)] p-4 overflow-hidden">
      {/* Filter section - constrain its height */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col max-h-[80vh]">
        {/* App bar with logo, filter buttons and count */}
        <div className="bg-[rgb(0,130,188)] text-white p-3 rounded-t-lg flex justify-between items-center">
          <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-8 object-contain" />
          
          {/* Tiny menu buttons */}
          <div className="flex space-x-3">
            {/* Centers button */}
            <div className="relative">
              <button 
                id="centers-btn"
                onClick={() => toggleDropdown('centers')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                title="Filter by Centers"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </button>
            </div>
            
            {/* Days button */}
            <div className="relative">
              <button 
                id="days-btn"
                onClick={() => toggleDropdown('days')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                title="Filter by Days"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {/* Class Types button */}
            <div className="relative">
              <button 
                id="class-types-btn"
                onClick={() => toggleDropdown('class-types')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 transition-colors"
                title="Filter by Class Types"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {/* Time button */}
            <div className="relative">
              <button 
                id="time-btn"
                onClick={() => toggleDropdown('time')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-colors"
                title="Filter by Time of Day"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            {/* Virtual Classes button */}
            <button 
              onClick={() => setIncludeVirtual(!includeVirtual)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                includeVirtual ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title="Toggle Virtual Classes"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center">
            {/* Filter count badge */}
            <span className="bg-white/20 px-2 py-1 rounded-md text-xs font-medium">
              {getActiveFilterCount()} active
            </span>
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
                          className="flex items-start p-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                          onClick={() => handleShowDescription(cls)}
                        >
                          <div className="w-28 flex flex-col text-left pr-4">
                            <div className="font-medium text-gray-700 text-xs pt-0.5">{cls.time}</div>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-start justify-between">
                              <div className="font-medium text-sm flex items-center">
                                {cls.activity}
                                <svg 
                                  className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)] opacity-0 group-hover:opacity-100 transition-opacity" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <span
                                className="ml-2 w-fit px-1.5 py-0.5 text-xs font-medium rounded bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]"
                              >
                                {CENTER_ABBREVIATIONS[cls.center] || cls.center}
                              </span>
                            </div>
                            {cls.virtual && (
                              <div className="mt-1">
                                <span className="text-xs text-[rgb(0,130,188)] bg-[rgb(0,130,188)]/5 px-1.5 py-0.5 rounded">
                                  Virtual
                                </span>
                              </div>
                            )}
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleCloseDescription}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            <div className="overflow-y-auto scrollbar-hide max-h-[80vh]">
              <div className="sticky top-0 bg-[rgb(0,130,188)] text-white py-3 px-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{selectedClass}</h3>
                <button 
                  onClick={handleCloseDescription}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1 1 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-sm text-gray-700">{selectedClassDetails.center} - {selectedClassDetails.location}</span>
                  </div>
                  {selectedClassDetails.virtual && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-[rgb(0,130,188)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <span className="text-sm text-gray-700">Virtual Class</span>
                    </div>
                  )}
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <h4 className="font-medium text-[rgb(0,130,188)] mb-2">Class Description</h4>
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

      {/* All dropdowns rendered at the root level of the DOM for better visibility */}
      <div className="dropdown-container">
        {/* Centers dropdown */}
        {openDropdown === 'centers' && (
          <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-64 max-h-[400px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" style={{top: '5rem', left: '11rem'}}>
            <div className="p-2">
              <div 
                className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                  Object.values(selectedCenters).every(selected => selected)
                    ? 'bg-green-100 text-green-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleCenterChange('all')}
              >
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 mr-2 text-green-600 border-gray-300 rounded" 
                  checked={Object.values(selectedCenters).every(selected => selected)}
                  readOnly
                />
                <span>All Centers</span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                {centers.map(center => (
                  <div 
                    key={center}
                    className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                      selectedCenters[center]
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleCenterChange(center)}
                  >
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 mr-2 text-green-600 border-gray-300 rounded" 
                      checked={selectedCenters[center]}
                      readOnly
                    />
                    <span>{center}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Days dropdown */}
        {openDropdown === 'days' && (
          <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-64 max-h-[400px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" style={{top: '5rem', left: '14rem'}}>
            <div className="p-2">
              <div 
                className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                  Object.values(selectedDays).every(selected => selected)
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleDayChange('all')}
              >
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 mr-2 text-blue-600 border-gray-300 rounded" 
                  checked={Object.values(selectedDays).every(selected => selected)}
                  readOnly
                />
                <span>All Days</span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                {days.map(day => (
                  <div 
                    key={day}
                    className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                      selectedDays[day]
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleDayChange(day)}
                  >
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 mr-2 text-blue-600 border-gray-300 rounded" 
                      checked={selectedDays[day]}
                      readOnly
                    />
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Class type dropdown */}
        {openDropdown === 'class-types' && (
          <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-64 max-h-[400px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" style={{top: '5rem', left: '17rem'}}>
            <div className="p-2">
              <div 
                className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-purple-100 text-purple-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleCategoryChange('')}
              >
                <input 
                  type="radio" 
                  className="form-radio h-4 w-4 mr-2 text-purple-600 border-gray-300 rounded-full" 
                  checked={selectedCategory === ''}
                  readOnly
                />
                <span>All Types</span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                {Object.entries(classCategories).map(([value, label]) => (
                  <div 
                    key={value}
                    className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                      selectedCategory === value
                        ? 'bg-purple-100 text-purple-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleCategoryChange(value)}
                  >
                    <input 
                      type="radio" 
                      className="form-radio h-4 w-4 mr-2 text-purple-600 border-gray-300 rounded-full" 
                      checked={selectedCategory === value}
                      readOnly
                    />
                    <span>{label.replace('Classes', '').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Time dropdown */}
        {openDropdown === 'time' && (
          <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-64 max-h-[400px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" style={{top: '5rem', left: '20rem'}}>
            <div className="p-2">
              <div 
                className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                  !Object.values(selectedTimeBlocks).some(selected => selected)
                    ? 'bg-orange-100 text-orange-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleTimeDivisionChange('any')}
              >
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 mr-2 text-orange-600 border-gray-300 rounded" 
                  checked={!Object.values(selectedTimeBlocks).some(selected => selected)}
                  readOnly
                />
                <span>Any Time</span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                {Object.entries(TIME_DIVISIONS).map(([key, division]) => (
                  <div 
                    key={key}
                    className={`px-3 py-2 rounded-md flex items-center cursor-pointer ${
                      selectedTimeBlocks[key]
                        ? 'bg-orange-100 text-orange-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleTimeDivisionChange(key)}
                  >
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 mr-2 text-orange-600 border-gray-300 rounded" 
                      checked={selectedTimeBlocks[key]}
                      readOnly
                    />
                    <span>{division.start}:00 - {division.end}:00</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessTimetable;
