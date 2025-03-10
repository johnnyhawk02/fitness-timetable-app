import React, { useState, useEffect, useCallback, useMemo } from 'react';
import bootleClasses from '../data/bootleClassData';
import crosbyClasses from '../data/crosbyClassData';
import meadowsClasses from '../data/meadowsClassData';
import nethertonClasses from '../data/nethertonClassData';
import litherlandClasses from '../data/litherlandClassData';
import dunesClasses from '../data/dunesClassData';
import bootlePoolData from '../data/bootlePoolData';
import meadowsPoolData from '../data/meadowsPoolData';
import dunesSplashWorldData from '../data/dunesPoolData';
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
  // Filter options - moved to the top to avoid reference errors
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const centers = ['Bootle', 'Crosby', 'Meadows', 'Netherton', 'Litherland', 'Dunes'];
  
  // Day abbreviations
  const dayAbbreviations = {
    'Monday': 'Mo',
    'Tuesday': 'Tu',
    'Wednesday': 'We',
    'Thursday': 'Th',
    'Friday': 'Fr',
    'Saturday': 'Sa',
    'Sunday': 'Su'
  };

  // Add new state for pool/class filter
  const [showPoolClasses, setShowPoolClasses] = useState(() => 
    getStoredValue('fitness_show_pool_classes', false)
  );

  // Fitness class-specific filter states
  const [fitnessSelectedCenters, setFitnessSelectedCenters] = useState(() => 
    getStoredValue('fitness_selected_centers', centers.reduce((acc, center) => {
      acc[center] = true;
      return acc;
    }, {}))
  );
  const [fitnessSelectedCategory, setFitnessSelectedCategory] = useState(() => 
    getStoredValue('fitness_selected_category', '')
  );
  const [fitnessIncludeVirtual, setFitnessIncludeVirtual] = useState(() => 
    getStoredValue('fitness_include_virtual', true)
  );
  const [fitnessSelectedDays, setFitnessSelectedDays] = useState(() => 
    getStoredValue('fitness_selected_days', days.reduce((acc, day) => {
      acc[day] = true;
      return acc;
    }, {}))
  );
  const [fitnessSelectedTimeBlocks, setFitnessSelectedTimeBlocks] = useState(() => 
    getStoredValue('fitness_selected_time_blocks', Object.keys(TIME_DIVISIONS).reduce((acc, block) => {
      acc[block] = false;
      return acc;
    }, {}))
  );

  // Swimming pool-specific filter states
  const [poolSelectedCenters, setPoolSelectedCenters] = useState(() => 
    getStoredValue('pool_selected_centers', centers.reduce((acc, center) => {
      acc[center] = true;
      return acc;
    }, {}))
  );
  const [poolSelectedDays, setPoolSelectedDays] = useState(() => 
    getStoredValue('pool_selected_days', days.reduce((acc, day) => {
      acc[day] = true;
      return acc;
    }, {}))
  );
  const [poolSelectedTimeBlocks, setPoolSelectedTimeBlocks] = useState(() => 
    getStoredValue('pool_selected_time_blocks', Object.keys(TIME_DIVISIONS).reduce((acc, block) => {
      acc[block] = false;
      return acc;
    }, {}))
  );
  // Add pool location filter
  const [poolLocationType, setPoolLocationType] = useState(() => 
    getStoredValue('pool_location_type', 'all') // Options: 'all', 'main', 'leisure'
  );

  // Save pool location filter to localStorage
  useEffect(() => {
    localStorage.setItem('pool_location_type', poolLocationType);
  }, [poolLocationType]);

  // Combined state values that change based on current mode
  const selectedCenters = useMemo(() => 
    showPoolClasses ? poolSelectedCenters : fitnessSelectedCenters,
  [showPoolClasses, poolSelectedCenters, fitnessSelectedCenters]);
  
  const selectedDays = useMemo(() => 
    showPoolClasses ? poolSelectedDays : fitnessSelectedDays,
  [showPoolClasses, poolSelectedDays, fitnessSelectedDays]);
  
  const selectedTimeBlocks = useMemo(() => 
    showPoolClasses ? poolSelectedTimeBlocks : fitnessSelectedTimeBlocks,
  [showPoolClasses, poolSelectedTimeBlocks, fitnessSelectedTimeBlocks]);
  
  const selectedCategory = useMemo(() => 
    showPoolClasses ? '' : fitnessSelectedCategory,
  [showPoolClasses, fitnessSelectedCategory]);
  
  const includeVirtual = useMemo(() => 
    showPoolClasses ? false : fitnessIncludeVirtual,
  [showPoolClasses, fitnessIncludeVirtual]);

  // Combine all classes using useMemo to maintain reference stability
  const allClasses = useMemo(() => [
    ...bootleClasses, 
    ...crosbyClasses, 
    ...meadowsClasses, 
    ...nethertonClasses, 
    ...litherlandClasses, 
    ...dunesClasses,
    ...bootlePoolData,
    ...meadowsPoolData,
    ...dunesSplashWorldData
  ], []);  // Empty dependency array means this only runs once

  // Default time blocks configuration
  const defaultTimeBlocks = {
    'morning': { label: 'Morning', start: 6, end: 12 },
    'afternoon-evening': { label: 'Afternoon/Evening', start: 12, end: 22 }
  };

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

  // Additional state variables
  const [isTimePopupOpen, setIsTimePopupOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState(null);
  const [timeBlocks, setTimeBlocks] = useState(() => 
    getStoredValue(STORAGE_KEYS.TIME_BLOCKS, defaultTimeBlocks)
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Toggle all filters visibility
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Save mode-specific filters to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_selected_centers', JSON.stringify(fitnessSelectedCenters));
  }, [fitnessSelectedCenters]);

  useEffect(() => {
    localStorage.setItem('fitness_selected_category', JSON.stringify(fitnessSelectedCategory));
  }, [fitnessSelectedCategory]);

  useEffect(() => {
    localStorage.setItem('fitness_include_virtual', JSON.stringify(fitnessIncludeVirtual));
  }, [fitnessIncludeVirtual]);

  useEffect(() => {
    localStorage.setItem('fitness_selected_days', JSON.stringify(fitnessSelectedDays));
  }, [fitnessSelectedDays]);

  useEffect(() => {
    localStorage.setItem('fitness_selected_time_blocks', JSON.stringify(fitnessSelectedTimeBlocks));
  }, [fitnessSelectedTimeBlocks]);

  useEffect(() => {
    localStorage.setItem('pool_selected_centers', JSON.stringify(poolSelectedCenters));
  }, [poolSelectedCenters]);

  useEffect(() => {
    localStorage.setItem('pool_selected_days', JSON.stringify(poolSelectedDays));
  }, [poolSelectedDays]);

  useEffect(() => {
    localStorage.setItem('pool_selected_time_blocks', JSON.stringify(poolSelectedTimeBlocks));
  }, [poolSelectedTimeBlocks]);

  // Handle day selection based on current mode
  const handleDayChange = (day) => {
    if (showPoolClasses) {
      // Swimming mode
      const newSelectedDays = { ...poolSelectedDays };
      newSelectedDays[day] = !newSelectedDays[day];
      setPoolSelectedDays(newSelectedDays);
    } else {
      // Fitness mode
      const newSelectedDays = { ...fitnessSelectedDays };
      newSelectedDays[day] = !newSelectedDays[day];
      setFitnessSelectedDays(newSelectedDays);
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

  // Handle center selection based on current mode
  const handleCenterChange = (center) => {
    if (showPoolClasses) {
      // Swimming mode
      const newSelectedCenters = { ...poolSelectedCenters };
      
      if (center === 'all') {
        // Select/deselect all centers
        const allSelected = Object.values(newSelectedCenters).every(selected => selected);
        centers.forEach(c => {
          newSelectedCenters[c] = !allSelected;
        });
        // Ensure at least one center is selected
        if (allSelected) {
          newSelectedCenters[centers[0]] = true;
        }
      } 
      else if (center === 'none') {
        // Deselect all centers except the first one
        centers.forEach(c => {
          newSelectedCenters[c] = false;
        });
        newSelectedCenters[centers[0]] = true;
      }
      else {
        // Toggle individual center
        newSelectedCenters[center] = !newSelectedCenters[center];
        
        // Ensure at least one center is selected
        const anySelected = Object.values(newSelectedCenters).some(selected => selected);
        if (!anySelected) {
          newSelectedCenters[center] = true;
        }
      }
      
      setPoolSelectedCenters(newSelectedCenters);
    } 
    else {
      // Fitness mode
      const newSelectedCenters = { ...fitnessSelectedCenters };
      
      if (center === 'all') {
        // Select/deselect all centers
        const allSelected = Object.values(newSelectedCenters).every(selected => selected);
        centers.forEach(c => {
          newSelectedCenters[c] = !allSelected;
        });
        // Ensure at least one center is selected
        if (allSelected) {
          newSelectedCenters[centers[0]] = true;
        }
      } 
      else if (center === 'none') {
        // Deselect all centers except the first one
        centers.forEach(c => {
          newSelectedCenters[c] = false;
        });
        newSelectedCenters[centers[0]] = true;
      }
      else {
        // Toggle individual center
        newSelectedCenters[center] = !newSelectedCenters[center];
        
        // Ensure at least one center is selected
        const anySelected = Object.values(newSelectedCenters).some(selected => selected);
        if (!anySelected) {
          newSelectedCenters[center] = true;
        }
      }
      
      setFitnessSelectedCenters(newSelectedCenters);
    }
  };

  // Handle category selection (fitness mode only)
  const handleCategoryChange = (category) => {
    setFitnessSelectedCategory(category);
  };

  // Handle virtual class toggle (fitness mode only)
  const handleVirtualChange = (include) => {
    setFitnessIncludeVirtual(include);
  };

  // Handle time blocks based on current mode
  const handleTimeDivisionChange = (division) => {
    if (showPoolClasses) {
      // Swimming mode
      const newTimeBlocks = { ...poolSelectedTimeBlocks };
      newTimeBlocks[division] = !newTimeBlocks[division];
      setPoolSelectedTimeBlocks(newTimeBlocks);
    } else {
      // Fitness mode
      const newTimeBlocks = { ...fitnessSelectedTimeBlocks };
      newTimeBlocks[division] = !newTimeBlocks[division];
      setFitnessSelectedTimeBlocks(newTimeBlocks);
    }
  };

  // Clear all filters based on current mode
  const clearAllFilters = () => {
    if (showPoolClasses) {
      // Reset swimming filters
      const resetCenters = centers.reduce((acc, center) => {
        acc[center] = true;
        return acc;
      }, {});
      
      const resetDays = days.reduce((acc, day) => {
        acc[day] = true;
        return acc;
      }, {});
      
      const resetTimeBlocks = {
        morning: false,
        afternoon: false,
        evening: false
      };
      
      setPoolSelectedCenters(resetCenters);
      setPoolSelectedDays(resetDays);
      setPoolSelectedTimeBlocks(resetTimeBlocks);
      setPoolLocationType('all'); // Reset pool location filter
    } else {
      // Reset fitness filters
      const resetCenters = centers.reduce((acc, center) => {
        acc[center] = true;
        return acc;
      }, {});
      
      const resetDays = days.reduce((acc, day) => {
        acc[day] = true;
        return acc;
      }, {});
      
      const resetTimeBlocks = {
        morning: false,
        afternoon: false,
        evening: false
      };
      
      setFitnessSelectedCenters(resetCenters);
      setFitnessSelectedDays(resetDays);
      setFitnessSelectedTimeBlocks(resetTimeBlocks);
      setFitnessSelectedCategory('');
      setFitnessIncludeVirtual(true);
    }
  };

  // Quick filter presets
  const applyQuickFilter = (preset) => {
    if (showPoolClasses) {
      // Pool mode quick filters
      switch(preset) {
        case 'today': {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === today;
            return acc;
          }, {});
          setPoolSelectedDays(resetDays);
          break;
        }
        case 'weekend': {
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === 'Saturday' || day === 'Sunday';
            return acc;
          }, {});
          setPoolSelectedDays(resetDays);
          break;
        }
        case 'evening': {
          const resetTimeBlocks = {
            morning: false,
            afternoon: false,
            evening: true
          };
          setPoolSelectedTimeBlocks(resetTimeBlocks);
          break;
        }
        default:
          break;
      }
    } else {
      // Fitness mode quick filters
      switch(preset) {
        case 'today': {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === today;
            return acc;
          }, {});
          setFitnessSelectedDays(resetDays);
          break;
        }
        case 'weekend': {
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === 'Saturday' || day === 'Sunday';
            return acc;
          }, {});
          setFitnessSelectedDays(resetDays);
          break;
        }
        case 'evening': {
          const resetTimeBlocks = {
            morning: false,
            afternoon: false,
            evening: true
          };
          setFitnessSelectedTimeBlocks(resetTimeBlocks);
          break;
        }
        default:
          break;
      }
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

      // Use the appropriate setter based on current mode
      if (showPoolClasses) {
        if (poolSelectedTimeBlocks[editingTimeBlock] !== true) {
          setPoolSelectedTimeBlocks({
            ...poolSelectedTimeBlocks,
            [editingTimeBlock]: true
          });
        }
      } else {
        if (fitnessSelectedTimeBlocks[editingTimeBlock] !== true) {
          setFitnessSelectedTimeBlocks({
            ...fitnessSelectedTimeBlocks,
            [editingTimeBlock]: true
          });
        }
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

  // Filter classes based on pool/regular selection
  const filteredClasses = useMemo(() => {
    console.log("Current mode:", showPoolClasses ? "Swimming" : "Fitness Classes");
    console.log("Pool location type:", poolLocationType);
    
    if (showPoolClasses) {
      // Only show pool classes (assuming they have location containing "Pool" or "Splash")
      const poolClasses = allClasses.filter(cls => 
        cls.location && (cls.location.includes('Pool') || 
                         cls.location.includes('Splash') || 
                         cls.location.includes('Swimming'))
      );
      
      console.log("Total pool classes before location filter:", poolClasses.length);
      
      // Apply pool location filter if not set to "all"
      if (poolLocationType !== 'all') {
        const filteredByLocation = poolClasses.filter(cls => {
          if (poolLocationType === 'main') {
            return cls.location && cls.location.includes('Main Pool');
          } else if (poolLocationType === 'leisure') {
            return cls.location && (
              cls.location.includes('Leisure Pool') || 
              cls.location.includes('Small Pool') || 
              cls.location.includes('Learner Pool')
            );
          }
          return true;
        });
        
        console.log("Pool classes after location filter:", filteredByLocation.length);
        return filteredByLocation;
      }
      
      return poolClasses;
    } else {
      // Show regular fitness classes (not pool)
      return allClasses.filter(cls => 
        !cls.location || (!cls.location.includes('Pool') && 
                         !cls.location.includes('Splash') && 
                         !cls.location.includes('Swimming'))
      );
    }
  }, [allClasses, showPoolClasses, poolLocationType]);

  // Update localStorage when pool/class filter changes
  useEffect(() => {
    localStorage.setItem('fitness_show_pool_classes', JSON.stringify(showPoolClasses));
  }, [showPoolClasses]);

  // Toggle pool/class filter
  const togglePoolClasses = () => {
    console.log("Toggling pool mode from", showPoolClasses, "to", !showPoolClasses);
    setShowPoolClasses(!showPoolClasses);
  };

  // Helper function to check if a class is in a selected time block
  const isInSelectedTimeBlock = useCallback((timeString) => {
    const classStartHour = convertTimeToHours(timeString);
    return Object.entries(selectedTimeBlocks).some(([division, isSelected]) => {
      if (!isSelected) return false;
      const { start, end } = TIME_DIVISIONS[division];
      return classStartHour >= start && classStartHour < end;
    });
  }, [selectedTimeBlocks, convertTimeToHours]);

  // Update class filtering based on all filters (now using filteredClasses instead of allClasses)
  const filteredAndSortedClasses = useMemo(() => {
    // Start with pre-filtered classes (pool or regular)
    return filteredClasses
      .filter(cls => {
        // Apply all other existing filters
        return (
          selectedCenters[cls.center] &&
          selectedDays[cls.day] &&
          (includeVirtual || !cls.virtual) &&
          (!selectedCategory || getClassCategory(cls.activity) === selectedCategory) &&
          (!Object.values(selectedTimeBlocks).some(selected => selected) || isInSelectedTimeBlock(cls.time))
        );
      })
      .sort((a, b) => {
        // First sort by day
        const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
        if (dayOrder !== 0) return dayOrder;
        
        // Then sort by time
        return convertTimeToHours(a.time) - convertTimeToHours(b.time);
      });
  }, [filteredClasses, selectedCenters, selectedDays, includeVirtual, selectedCategory, selectedTimeBlocks]);

  // Group classes by day (now using filteredAndSortedClasses)
  const classesByDay = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day] = filteredAndSortedClasses.filter(cls => cls.day === day);
      return acc;
    }, {});
  }, [filteredAndSortedClasses, days]);

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
    console.log('Toggling dropdown:', dropdownName, 'Current state:', openDropdown);
    // If the dropdown is already open, close it
    if (openDropdown === dropdownName) {
      console.log('Closing dropdown');
      setOpenDropdown(null);
    } else {
      // Otherwise, open this dropdown and close any other
      console.log('Opening dropdown:', dropdownName);
      setOpenDropdown(dropdownName);
    }
  };

  // Add event listener to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        console.log('Click event:', event.target);
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
             (openDropdown === 'time' && event.target.closest('button').id === 'time-btn') ||
             (openDropdown === 'virtual' && event.target.closest('button').id === 'virtual-btn'))) {
          return;
        }
        
        // Check if the click was inside a dropdown
        const isInDropdown = event.target.closest('.dropdown-menu');
        
        // If not clicking a dropdown or different menu button, close the dropdown
        if (!isInDropdown) {
          console.log('Closing dropdown - click outside');
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [openDropdown]);

  // Handler for pool location type changes
  const handlePoolLocationType = (type) => {
    setPoolLocationType(type);
  };
  
  // Special function to render pool type filters
  const renderPoolTypeFilters = () => {
    return (
      <div className="p-4 bg-[rgb(0,130,188)]/5 border-y border-[rgb(0,130,188)]/10">
        <h3 className="text-sm font-semibold text-[rgb(0,130,188)] mb-2">Pool Type Filter</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePoolLocationType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              poolLocationType === 'all'
                ? 'bg-[rgb(0,130,188)] text-white'
                : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
            }`}
          >
            All Pools
          </button>
          <button
            onClick={() => handlePoolLocationType('main')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              poolLocationType === 'main'
                ? 'bg-[rgb(0,130,188)] text-white'
                : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
            }`}
          >
            Main Pool
          </button>
          <button
            onClick={() => handlePoolLocationType('leisure')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              poolLocationType === 'leisure'
                ? 'bg-[rgb(0,130,188)] text-white'
                : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
            }`}
          >
            Leisure/Learner Pool
          </button>
        </div>
      </div>
    );
  };

  // Let's add a custom filter panel for Pool classes
  const renderFilterPanel = () => {
    return (
      <>
        {/* Filter mode tabs */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => {
                setShowPoolClasses(false);
                console.log("Switched to Fitness Classes mode");
              }}
              className={`flex-1 py-3 text-sm font-medium ${
                !showPoolClasses 
                  ? 'text-[rgb(0,130,188)] border-b-2 border-[rgb(0,130,188)]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Fitness Classes
            </button>
            <button
              onClick={() => {
                setShowPoolClasses(true);
                console.log("Switched to Swimming mode");
              }}
              className={`flex-1 py-3 text-sm font-medium ${
                showPoolClasses 
                  ? 'text-[rgb(0,130,188)] border-b-2 border-[rgb(0,130,188)]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Swimming
            </button>
          </div>
        </div>

        {/* Filter content based on selected mode */}
        <div className="bg-[rgb(0,130,188)]/5 py-2">
          <div className="text-center text-sm font-medium text-[rgb(0,130,188)]">
            {showPoolClasses ? 'Swimming Pool Filters' : 'Fitness Class Filters'}
          </div>
        </div>

        {/* Mode-specific filters */}
        {showPoolClasses ? (
          // Pool filters
          <>
            {/* Pool instructions */}
            <div className="px-4 py-2 bg-yellow-50 text-yellow-800 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Swimming Pool Filters
            </div>

            {/* Pool type filters */}
            {renderPoolTypeFilters()}

            {/* Days filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Days</h3>
              <div className="flex flex-wrap gap-1.5">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => handleDayChange(day)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedDays[day]
                        ? 'bg-[rgb(0,130,188)] text-white'
                        : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
                    }`}
                  >
                    {dayAbbreviations[day]}
                  </button>
                ))}
              </div>
            </div>

            {/* Centers filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Swimming Pools</h3>
              <div className="grid grid-cols-2 gap-2">
                {centers.map(center => (
                  <label 
                    key={center} 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedCenters[center]}
                      onChange={() => handleCenterChange(center)}
                      className="form-checkbox h-4 w-4 text-[rgb(0,130,188)] rounded border-gray-300 focus:ring-[rgb(0,130,188)]"
                    />
                    <span className="text-sm text-gray-700">{center}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => handleCenterChange('all')}
                  className="text-xs text-[rgb(0,130,188)] hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={() => handleCenterChange('none')}
                  className="text-xs text-[rgb(0,130,188)] hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Time filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Time of Day</h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TIME_DIVISIONS).map(([divId, { label }]) => (
                  <button
                    key={divId}
                    onClick={() => handleTimeDivisionChange(divId)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTimeBlocks[divId]
                        ? 'bg-[rgb(0,130,188)] text-white'
                        : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset filters section */}
            <div className="p-4">
              <button 
                onClick={clearAllFilters}
                className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Reset Pool Filters
              </button>
            </div>
          </>
        ) : (
          // Fitness filters
          <>
            {/* Days filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Days</h3>
              <div className="flex flex-wrap gap-1.5">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => handleDayChange(day)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedDays[day]
                        ? 'bg-[rgb(0,130,188)] text-white'
                        : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
                    }`}
                  >
                    {dayAbbreviations[day]}
                  </button>
                ))}
              </div>
            </div>

            {/* Class types filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Class Type</h3>
              <div className="flex flex-wrap gap-1 items-center">
                {Object.entries(classCategories).map(([categoryId, categoryName]) => (
                  <button
                    key={categoryId}
                    onClick={() => handleCategoryChange(categoryId)}
                    className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium transition-colors ${
                      selectedCategory === categoryId
                        ? `bg-[rgb(0,130,188)] text-white`
                        : `bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30`
                    }`}
                  >
                    {categoryName}
                  </button>
                ))}
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? `bg-[rgb(0,130,188)] text-white`
                      : `bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30`
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Centers filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Centers</h3>
              <div className="grid grid-cols-2 gap-2">
                {centers.map(center => (
                  <label 
                    key={center} 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedCenters[center]}
                      onChange={() => handleCenterChange(center)}
                      className="form-checkbox h-4 w-4 text-[rgb(0,130,188)] rounded border-gray-300 focus:ring-[rgb(0,130,188)]"
                    />
                    <span className="text-sm text-gray-700">{center}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => handleCenterChange('all')}
                  className="text-xs text-[rgb(0,130,188)] hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={() => handleCenterChange('none')}
                  className="text-xs text-[rgb(0,130,188)] hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Time filter section */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Time of Day</h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TIME_DIVISIONS).map(([divId, { label }]) => (
                  <button
                    key={divId}
                    onClick={() => handleTimeDivisionChange(divId)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTimeBlocks[divId]
                        ? 'bg-[rgb(0,130,188)] text-white'
                        : 'bg-[rgb(0,130,188)]/20 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual class filter section */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Virtual Classes</h3>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2 text-sm text-gray-700">{includeVirtual ? 'Show' : 'Hide'}</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      value="" 
                      className="sr-only peer" 
                      checked={includeVirtual} 
                      onChange={() => handleVirtualChange(!includeVirtual)} 
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[rgb(0,130,188)]"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Reset filters section */}
            <div className="p-4">
              <button 
                onClick={clearAllFilters}
                className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Reset Class Filters
              </button>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Filter section - constrain its height */}
      <div className="bg-white rounded-none shadow-none overflow-hidden flex flex-col">
        {/* App bar with logo, filter buttons and count */}
        <div className="bg-[rgb(0,130,188)] text-white p-3 flex flex-wrap justify-between items-center relative">
          <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-8 object-contain" />
          
          {/* Filter button */}
          <button 
            onClick={toggleFilters}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[rgb(0,130,188)]/80 hover:bg-[rgb(0,130,188)]/90 rounded-full transition-colors"
          >
            <span className="text-sm font-medium">Filters</span>
            {getActiveFilterCount() > 0 && 
              <span className="bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {getActiveFilterCount()}
              </span>
            }
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Timetable content - full screen scrollable area */}
      <div className="flex-1 overflow-hidden bg-white mt-[52px]">
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Mode indicator */}
          <div className="sticky top-0 z-10 bg-gray-100 py-1 px-4 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Showing: <span className="text-[rgb(0,130,188)]">{showPoolClasses ? 'Swimming Pool Sessions' : 'Fitness Classes'}</span>
            </span>
            <span className="text-xs font-medium text-[rgb(0,130,188)]">
              Class Timetable
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4">
            {days.map(day => {
              if (classesByDay[day].length === 0) return null;
              return (
                <div key={day} className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="bg-[rgb(0,130,188)]/60 text-white font-semibold py-2 px-4 text-sm">
                    {day}
                  </div>
                  <div className="divide-y divide-gray-100">
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
                            <div className="flex items-center mt-1">
                              <svg 
                                className="w-3 h-3 text-gray-400 mr-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1 1 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              <span className="text-xs text-gray-500">{cls.location}</span>
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
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
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

      {/* Filter panel wrapper - slides over content */}
      <div 
        className={`fixed top-[52px] left-0 right-0 z-50 bg-white overflow-auto transition-all duration-300 ease-in-out shadow-md ${
          filtersExpanded ? 'h-[80vh] opacity-100' : 'h-0 opacity-0'
        }`}
      >
        <div className="bg-white">
          <div className="divide-y divide-[rgb(0,130,188)]/15">
            {/* Render appropriate filter panel based on mode */}
            {renderFilterPanel()}
            
            {/* Bottom close button */}
            <div className="sticky bottom-0 bg-white shadow-md">
              <button 
                onClick={toggleFilters}
                className="w-full px-4 py-2 text-[rgb(0,130,188)] font-medium hover:bg-gray-50 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render all dropdowns at the root level to prevent clipping */}
      {openDropdown === 'centers' && (
        <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-48 max-h-[350px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" 
             style={{
               top: document.getElementById('centers-btn')?.getBoundingClientRect().bottom + 5 + 'px', 
               left: Math.max(5, Math.min(
                 document.getElementById('centers-btn')?.getBoundingClientRect().left || 0,
                 window.innerWidth - 200
               )) + 'px'
             }}>
          <div className="p-2">
            <div 
              className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                Object.values(selectedCenters).every(selected => selected)
                  ? 'bg-green-100 text-green-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleCenterChange('all')}
            >
              <input 
                type="checkbox" 
                className="form-checkbox h-3.5 w-3.5 mr-1.5 text-green-600 rounded" 
                checked={Object.values(selectedCenters).every(selected => selected)}
                readOnly
              />
              <span className="text-sm">All Centers</span>
            </div>
            
            <div className="mt-1.5 pt-1.5">
              {centers.map(center => (
                <div 
                  key={center}
                  className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                    selectedCenters[center]
                      ? 'bg-green-100 text-green-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleCenterChange(center)}
                >
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-3.5 w-3.5 mr-1.5 text-green-600 rounded" 
                    checked={selectedCenters[center]}
                    readOnly
                  />
                  <span className="text-sm">{center}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {openDropdown === 'days' && (
        <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-48 max-h-[350px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
             style={{
               top: document.getElementById('days-btn')?.getBoundingClientRect().bottom + 5 + 'px', 
               left: Math.max(5, Math.min(
                 document.getElementById('days-btn')?.getBoundingClientRect().left || 0,
                 window.innerWidth - 200
               )) + 'px'
             }}>
          <div className="p-2">
            <div 
              className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                Object.values(selectedDays).every(selected => selected)
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleDayChange('all')}
            >
              <input 
                type="checkbox" 
                className="form-checkbox h-3.5 w-3.5 mr-1.5 text-blue-600 rounded" 
                checked={Object.values(selectedDays).every(selected => selected)}
                readOnly
              />
              <span className="text-sm">All Days</span>
            </div>
            
            <div className="mt-1.5 pt-1.5">
              {days.map(day => (
                <div 
                  key={day}
                  className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                    selectedDays[day]
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleDayChange(day)}
                >
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-3.5 w-3.5 mr-1.5 text-blue-600 rounded" 
                    checked={selectedDays[day]}
                    readOnly
                  />
                  <span className="text-sm">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {openDropdown === 'class-types' && (
        <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-48 max-h-[350px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
             style={{
               top: document.getElementById('class-types-btn')?.getBoundingClientRect().bottom + 5 + 'px', 
               left: Math.max(5, Math.min(
                 document.getElementById('class-types-btn')?.getBoundingClientRect().left || 0,
                 window.innerWidth - 200
               )) + 'px'
             }}>
          <div className="p-2">
            <div 
              className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-purple-100 text-purple-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleCategoryChange('')}
            >
              <input 
                type="radio" 
                className="form-radio h-3.5 w-3.5 mr-1.5 text-purple-600 rounded-full" 
                checked={selectedCategory === ''}
                readOnly
              />
              <span className="text-sm">All Types</span>
            </div>
            
            <div className="mt-1.5 pt-1.5">
              {Object.entries(classCategories).map(([value, label]) => (
                <div 
                  key={value}
                  className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                    selectedCategory === value
                      ? 'bg-purple-100 text-purple-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleCategoryChange(value)}
                >
                  <input 
                    type="radio" 
                    className="form-radio h-3.5 w-3.5 mr-1.5 text-purple-600 rounded-full" 
                    checked={selectedCategory === value}
                    readOnly
                  />
                  <span className="text-sm">{label.replace('Classes', '').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {openDropdown === 'time' && (
        <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-48 max-h-[350px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
             style={{
               top: document.getElementById('time-btn')?.getBoundingClientRect().bottom + 5 + 'px', 
               left: Math.max(5, Math.min(
                 document.getElementById('time-btn')?.getBoundingClientRect().left || 0,
                 window.innerWidth - 200
               )) + 'px'
             }}>
          <div className="p-2">
            <div 
              className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                !Object.values(selectedTimeBlocks).some(selected => selected)
                  ? 'bg-orange-100 text-orange-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleTimeDivisionChange('any')}
            >
              <input 
                type="checkbox" 
                className="form-checkbox h-3.5 w-3.5 mr-1.5 text-orange-600 rounded" 
                checked={!Object.values(selectedTimeBlocks).some(selected => selected)}
                readOnly
              />
              <span className="text-sm">Any Time</span>
            </div>
            
            <div className="mt-1.5 pt-1.5">
              {Object.entries(TIME_DIVISIONS).map(([key, division]) => (
                <div 
                  key={key}
                  className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                    selectedTimeBlocks[key]
                      ? 'bg-orange-100 text-orange-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleTimeDivisionChange(key)}
                >
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-3.5 w-3.5 mr-1.5 text-orange-600 rounded" 
                    checked={selectedTimeBlocks[key]}
                    readOnly
                  />
                  <span className="text-sm">{division.start}:00 - {division.end}:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Virtual dropdown menu */}
      {openDropdown === 'virtual' && (
        <div className="dropdown-menu fixed z-[100] bg-white shadow-xl w-48 max-h-[350px] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
             style={{
               top: document.getElementById('virtual-btn')?.getBoundingClientRect().bottom + 5 + 'px', 
               left: Math.max(5, Math.min(
                 document.getElementById('virtual-btn')?.getBoundingClientRect().left || 0,
                 window.innerWidth - 200
               )) + 'px'
             }}>
          <div className="p-2">
            <div 
              className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                includeVirtual
                  ? 'bg-purple-100 text-purple-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleVirtualChange(true)}
            >
              <input 
                type="radio" 
                className="form-radio h-3.5 w-3.5 mr-1.5 text-purple-600 rounded-full" 
                checked={includeVirtual}
                readOnly
              />
              <span className="text-sm">Include Virtual</span>
            </div>
            
            <div 
              className={`px-2 py-1.5 rounded-md flex items-center cursor-pointer ${
                !includeVirtual
                  ? 'bg-gray-100 text-gray-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleVirtualChange(false)}
            >
              <input 
                type="radio" 
                className="form-radio h-3.5 w-3.5 mr-1.5 text-gray-600 rounded-full" 
                checked={!includeVirtual}
                readOnly
              />
              <span className="text-sm">Exclude Virtual</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessTimetable;
