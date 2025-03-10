import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Centers with swimming pools
const CENTERS_WITH_POOLS = ['Bootle', 'Meadows', 'Dunes'];

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

  // Initialize all centers selected by default
  const defaultCenters = centers.reduce((acc, center) => {
    acc[center] = true;
    return acc;
  }, {});

  // Fitness class filter states
  const [selectedCentersState, setSelectedCentersState] = useState(() => 
    getStoredValue('selected_centers', defaultCenters)
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
  const selectedCenters = selectedCentersState;
  
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [centersDropdownOpen, setCentersDropdownOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [quickFiltersPosition, setQuickFiltersPosition] = useState({ top: 0, left: 0 });
  const [centersDropdownPosition, setCentersDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRef = useRef(null);
  const quickFiltersButtonRef = useRef(null);
  const centersDropdownButtonRef = useRef(null);

  // Toggle all filters visibility
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Save mode-specific filters to localStorage
  useEffect(() => {
    localStorage.setItem('fitness_selected_centers', JSON.stringify(selectedCentersState));
  }, [selectedCentersState]);

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
    let newSelectedCenters = { ...selectedCentersState };
    
    if (center === 'all') {
      // Select all centers
      centers.forEach(c => {
        newSelectedCenters[c] = true;
      });
      
      // Show toast notification
      showToast('Showing all centers');
    } 
    else if (center === 'none') {
      // Deselect all centers except the first one
      centers.forEach(c => {
        newSelectedCenters[c] = false;
      });
      
      // Default to first center with a pool if in swimming mode, otherwise first center
      const defaultCenter = showPoolClasses ? (CENTERS_WITH_POOLS[0] || centers[0]) : centers[0];
      newSelectedCenters[defaultCenter] = true;
      
      // Show toast notification
      showToast(`Showing ${defaultCenter} only`);
    }
    else {
      // Exclusive selection - only select the clicked center
      centers.forEach(c => {
        newSelectedCenters[c] = (c === center);
      });
      
      // Show toast notification
      showToast(`Showing ${center} only`);
    }
    
    setSelectedCentersState(newSelectedCenters);
    
    // Close the centers dropdown after making a selection
    setCentersDropdownOpen(false);
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
      
      // Day filtering removed
      
      // Time blocks removed from filters
      
      setSelectedCentersState(resetCenters);
      // Day filter setting removed
      // Time block setting removed
      setPoolLocationType('all'); // Reset pool location filter
    } else {
      // Reset fitness filters
      const resetCenters = centers.reduce((acc, center) => {
        acc[center] = true;
        return acc;
      }, {});
      
      // Day filtering removed
      
      // Time blocks removed from filters
      
      setSelectedCentersState(resetCenters);
      // Day filter setting removed
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
          showToast(`Showing today's swimming sessions`);
          break;
        }
        case 'weekend': {
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === 'Saturday' || day === 'Sunday';
            return acc;
          }, {});
          setPoolSelectedDays(resetDays);
          showToast('Showing weekend swimming sessions');
          break;
        }
        case 'adult-swim': {
          // Adult Swim - all centers for today
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === today;
            return acc;
          }, {});
          
          // Select only centers with pools
          const poolCenters = centers.reduce((acc, center) => {
            acc[center] = CENTERS_WITH_POOLS.includes(center);
            return acc;
          }, {});
          
          // Set pool location type to main pool (typically where adult swim happens)
          setPoolLocationType('main');
          setPoolSelectedDays(resetDays);
          setSelectedCentersState(poolCenters);
          showToast('Showing adult swim sessions for today');
          break;
        }
        case 'small-pool-swims': {
          // Small Pool Swims - all centers, leisure/learner pools
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === today;
            return acc;
          }, {});
          
          // Select only centers with pools
          const poolCenters = centers.reduce((acc, center) => {
            acc[center] = CENTERS_WITH_POOLS.includes(center);
            return acc;
          }, {});
          
          // Set pool location type to leisure/learner pools
          setPoolLocationType('leisure');
          setPoolSelectedDays(resetDays);
          setSelectedCentersState(poolCenters);
          showToast('Showing leisure/learner pool sessions for today');
          break;
        }
        case 'childrens-swim': {
          // Children's Swim - focus on weekend days and afternoon timeblock
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === 'Saturday' || day === 'Sunday';
            return acc;
          }, {});
          
          // Select all centers
          const allCenters = centers.reduce((acc, center) => {
            acc[center] = true;
            return acc;
          }, {});
          
          // Set pool location type to leisure/learner pool and afternoon time block
          const resetTimeBlocks = {
            morning: false,
            afternoon: true,
            evening: false
          };
          
          setPoolLocationType('leisure');
          setPoolSelectedDays(resetDays);
          setSelectedCentersState(allCenters);
          setPoolSelectedTimeBlocks(resetTimeBlocks);
          showToast('Showing weekend children\'s swimming sessions');
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
          showToast(`Showing today's fitness classes`);
          break;
        }
        case 'weekend': {
          const resetDays = days.reduce((acc, day) => {
            acc[day] = day === 'Saturday' || day === 'Sunday';
            return acc;
          }, {});
          setFitnessSelectedDays(resetDays);
          showToast('Showing weekend fitness classes');
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
    
    // Days filtering removed
    
    // Time blocks removed from filter count
    
    // Count other active filters
    if (selectedCategory) count++;
    if (!includeVirtual) count++;
    
    return count;
  };

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CENTERS, JSON.stringify(selectedCentersState));
  }, [selectedCentersState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, JSON.stringify(selectedCategory));
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCLUDE_VIRTUAL, JSON.stringify(fitnessIncludeVirtual));
  }, [fitnessIncludeVirtual]);

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

  // Update class filtering based on all filters (now using filteredClasses instead of allClasses)
  const filteredAndSortedClasses = useMemo(() => {
    // Start with pre-filtered classes (pool or regular)
    return filteredClasses
      .filter(cls => {
        // If in swimming mode, exclude classes from centers without pools
        if (showPoolClasses && !CENTERS_WITH_POOLS.includes(cls.center)) {
          return false;
        }
        
        // Apply all other existing filters
        return (
          selectedCenters[cls.center] &&
          // Day filtering removed
          (includeVirtual || !cls.virtual) &&
          (!selectedCategory || getClassCategory(cls.activity) === selectedCategory)
          // Time filters removed
        );
      })
      .sort((a, b) => {
        // First sort by day
        const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
        if (dayOrder !== 0) return dayOrder;
        
        // Then sort by time
        return convertTimeToHours(a.time) - convertTimeToHours(b.time);
      });
  }, [filteredClasses, selectedCenters, includeVirtual, selectedCategory]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.mode-dropdown')) {
        setDropdownOpen(false);
      }
      if (quickFiltersOpen && !event.target.closest('.quick-filters-dropdown')) {
        setQuickFiltersOpen(false);
      }
      if (centersDropdownOpen && !event.target.closest('.centers-dropdown')) {
        setCentersDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, quickFiltersOpen, centersDropdownOpen]);

  // Handler for pool location type changes
  const handlePoolLocationType = (type) => {
    setPoolLocationType(type);
  };
  
  // Render swimming specific filters
  const renderSwimmingFilters = () => {
    return (
      <div className="space-y-6">
        {/* Pool type filters */}
        <div className="bg-[rgb(0,130,188)]/5 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Pool Type
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handlePoolLocationType("all")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                poolLocationType === "all"
                  ? "bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]"
                  : "bg-[rgb(0,130,188)]/5 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/10"
              }`}
            >
              <span>All Pools</span>
              {poolLocationType === "all" && (
                <svg className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
            <button
              onClick={() => handlePoolLocationType("main")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                poolLocationType === "main"
                  ? "bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]"
                  : "bg-[rgb(0,130,188)]/5 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/10"
              }`}
            >
              <span>Main Pool</span>
              {poolLocationType === "main" && (
                <svg className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
            <button
              onClick={() => handlePoolLocationType("leisure")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                poolLocationType === "leisure"
                  ? "bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]"
                  : "bg-[rgb(0,130,188)]/5 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/10"
              }`}
            >
              <span>Leisure/Learner Pool</span>
              {poolLocationType === "leisure" && (
                <svg className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Centers filter section */}
        {renderCentersFilter()}

        {/* Reset filters section */}
        <div className="p-4">
          <button 
            onClick={clearAllFilters}
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset Pool Filters
          </button>
        </div>
      </div>
    );
  };

  // Render fitness class specific filters
  const renderFitnessFilters = () => {
    return (
      <div className="space-y-6">
        {/* Class types filter section */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Class Type
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            {Object.entries(classCategories).map(([categoryId, categoryName]) => (
              <button
                key={categoryId}
                onClick={() => handleCategoryChange(categoryId)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === categoryId
                    ? `bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]`
                    : `bg-[rgb(0,130,188)]/5 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/10`
                }`}
              >
                <span>{categoryName}</span>
                {selectedCategory === categoryId && (
                  <svg className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>
            ))}
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                !selectedCategory
                  ? `bg-[rgb(0,130,188)]/10 text-[rgb(0,130,188)]`
                  : `bg-[rgb(0,130,188)]/5 text-[rgb(0,130,188)] hover:bg-[rgb(0,130,188)]/10`
              }`}
            >
              <span>All</span>
              {!selectedCategory && (
                <svg className="w-4 h-4 ml-1.5 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Centers filter section */}
        {renderCentersFilter()}

        {/* Virtual class filter section */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Virtual Classes
            </h3>
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
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset Class Filters
          </button>
        </div>
      </div>
    );
  };

  // Render filter tabs and content based on current mode
  const renderFilterPanel = () => {
    return (
      <div className="p-4">
        {/* Mode Selection Tabs */}
        <div className="mb-6">
          <div className="bg-gray-100 p-1.5 rounded-xl flex">
            <button
              onClick={() => {
                console.log("Setting mode to Fitness Classes");
                setShowPoolClasses(false);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg transition-all font-medium ${
                !showPoolClasses 
                  ? "bg-white text-[rgb(0,130,188)] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Fitness Classes</span>
              </div>
            </button>
            <button
              onClick={() => {
                console.log("Setting mode to Swimming");
                setShowPoolClasses(true);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg transition-all font-medium ${
                showPoolClasses 
                  ? "bg-white text-[rgb(0,130,188)] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>Swimming</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Filter content */}
        {showPoolClasses ? renderSwimmingFilters() : renderFitnessFilters()}
      </div>
    );
  };

  // Handle opening the dropdown and calculate its position
  const toggleModeDropdown = () => {
    if (!dropdownOpen && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      // Position dropdown to align with left edge of button and add a small margin below
      setDropdownPosition({
        top: rect.bottom + 5,
        left: Math.min(rect.left, window.innerWidth - 176) // Ensure dropdown doesn't go off screen (44px width + some margin)
      });
    }
    setDropdownOpen(!dropdownOpen);
  };

  // Handle opening the quick filters dropdown and calculate its position
  const toggleQuickFilters = () => {
    if (!quickFiltersOpen && quickFiltersButtonRef.current) {
      const rect = quickFiltersButtonRef.current.getBoundingClientRect();
      // Position dropdown to align with left edge of button and add a small margin below
      setQuickFiltersPosition({
        top: rect.bottom + 5,
        left: Math.min(rect.left, window.innerWidth - 176) // Ensure dropdown doesn't go off screen
      });
    }
    setQuickFiltersOpen(!quickFiltersOpen);
  };

  // Handle opening the centers dropdown and calculate its position
  const toggleCentersDropdown = () => {
    if (!centersDropdownOpen && centersDropdownButtonRef.current) {
      const rect = centersDropdownButtonRef.current.getBoundingClientRect();
      // Position dropdown to align with left edge of button and add a small margin below
      setCentersDropdownPosition({
        top: rect.bottom + 5,
        left: Math.min(rect.left, window.innerWidth - 176) // Ensure dropdown doesn't go off screen
      });
    }
    setCentersDropdownOpen(!centersDropdownOpen);
  };

  // Show toast notification
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

  // Common centers filter component
  const renderCentersFilter = () => {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-[rgb(0,130,188)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
        </svg>
        Centers
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {centers.map(center => {
          const hasPool = CENTERS_WITH_POOLS.includes(center);
          const isSelected = selectedCenters[center];
          
          return (
            <button 
              key={center} 
              onClick={() => handleCenterChange(center)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left hover:bg-gray-50 ${
                isSelected ? 'bg-[rgb(0,130,188)]/5' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-sm text-gray-700">{center}</span>
                {showPoolClasses && (
                  <span className={`ml-1.5 text-xs font-medium ${hasPool ? 'text-[rgb(0,130,188)]' : 'text-red-500'}`}>
                    {hasPool ? '(Pool)' : '(No Pool)'}
                  </span>
                )}
              </div>
              {isSelected && (
                <svg className="w-4 h-4 text-[rgb(0,130,188)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-3">
        <button 
          onClick={() => handleCenterChange('all')}
          className="px-2 py-1 text-xs font-medium text-[rgb(0,130,188)] bg-[rgb(0,130,188)]/5 hover:bg-[rgb(0,130,188)]/10 rounded-md transition-colors"
        >
          Select All
        </button>
        <button 
          onClick={() => handleCenterChange('none')}
          className="px-2 py-1 text-xs font-medium text-[rgb(0,130,188)] bg-[rgb(0,130,188)]/5 hover:bg-[rgb(0,130,188)]/10 rounded-md transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App bar with logo, filter buttons and count */}
      <div className="bg-[rgb(0,130,188)] text-white p-3 flex flex-wrap justify-between items-center shadow-md z-20 relative">
        <img src="/images/logo.jpg" alt="Active Sefton Fitness" className="h-8 object-contain" />
        
        {/* Mode toggle and filter buttons */}
        <div className="flex items-center gap-2">
          {/* Mode toggle button */}
          <div className="relative inline-block mode-dropdown">
            <button
              ref={dropdownButtonRef}
              onClick={toggleModeDropdown}
              className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center">
                {showPoolClasses ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 010 8h-1"></path>
                    <path d="M5 8h8a7 7 0 017 7v1a7 7 0 01-7 7H6a4 4 0 01-4-4v-8a4 4 0 014-4z"></path>
                  </svg>
                )}
                <span className="text-sm font-medium mr-1">{showPoolClasses ? 'Swimming' : 'Fitness'}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </button>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div 
                className="fixed py-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-[100]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                }}
              >
                <button 
                  onClick={() => {
                    setShowPoolClasses(false);
                    setDropdownOpen(false);
                  }}
                  className={`w-full block px-4 py-2 text-sm text-left ${!showPoolClasses ? 'text-[rgb(0,130,188)] font-medium' : 'text-gray-700'} hover:bg-gray-100`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 010 8h-1"></path>
                      <path d="M5 8h8a7 7 0 017 7v1a7 7 0 01-7 7H6a4 4 0 01-4-4v-8a4 4 0 014-4z"></path>
                    </svg>
                    Fitness Classes
                  </div>
                </button>
                <button 
                  onClick={() => {
                    setShowPoolClasses(true);
                    setDropdownOpen(false);
                  }}
                  className={`w-full block px-4 py-2 text-sm text-left ${showPoolClasses ? 'text-[rgb(0,130,188)] font-medium' : 'text-gray-700'} hover:bg-gray-100`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
                    </svg>
                    Swimming
                  </div>
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Filters button */}
          <div className="relative inline-block quick-filters-dropdown">
            <button
              ref={quickFiltersButtonRef}
              onClick={toggleQuickFilters}
              className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16"></path>
                  <path d="M7 12h10"></path>
                  <path d="M10 18h4"></path>
                </svg>
                <span className="text-sm font-medium mr-1">Quick Filters</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </button>
            
            {/* Quick Filters dropdown menu */}
            {quickFiltersOpen && (
              <div 
                className="fixed py-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[100]"
                style={{
                  top: `${quickFiltersPosition.top}px`,
                  left: `${quickFiltersPosition.left}px`,
                }}
              >
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase">
                  {showPoolClasses ? 'Swimming Presets' : 'Fitness Presets'}
                </div>
                
                {showPoolClasses ? (
                  <>
                    <button 
                      onClick={() => {
                        applyQuickFilter('adult-swim');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h20M2 12c0 5 4 8 10 8s10-3 10-8M2 12c0-5 4-8 10-8s10 3 10 8M12 4v16" />
                      </svg>
                      Adult Swim
                    </button>
                    <button 
                      onClick={() => {
                        applyQuickFilter('small-pool-swims');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 20.5H7" />
                        <path d="M3 20.5h2" />
                        <path d="M19 20.5h2" />
                        <path d="M15.47 17c-1.68 0-3-1.75-3-4s1.32-4 3-4 3 1.75 3 4-1.32 4-3 4z" />
                        <path d="M5 17s3-2 4-4l-1-1 .5-3.5 2 2 .5-1.5 3 1c.14 1.65.42 4.5.5 6.5" />
                      </svg>
                      Small Pool Swims
                    </button>
                    <button 
                      onClick={() => {
                        applyQuickFilter('childrens-swim');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="3" />
                        <path d="M12 8v2" />
                        <path d="m9 10 1 3" />
                        <path d="m14 10 1 3" />
                        <path d="M13 19h-2a2 2 0 0 1-2-2v-3c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2z" />
                        <path d="m7 19-3 1.5" />
                        <path d="m17 19 3 1.5" />
                      </svg>
                      Children's Swim
                    </button>
                    <button 
                      onClick={() => {
                        applyQuickFilter('today');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Today's Sessions
                    </button>
                    <button 
                      onClick={() => {
                        applyQuickFilter('weekend');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8L8 12H12V16L16 12H12z"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                      Weekend Sessions
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        applyQuickFilter('today');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Today's Classes
                    </button>
                    <button 
                      onClick={() => {
                        applyQuickFilter('weekend');
                        setQuickFiltersOpen(false);
                      }}
                      className="w-full block px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgb(0,130,188)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8L8 12H12V16L16 12H12z"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                      Weekend Classes
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Centers dropdown button */}
          <div className="relative inline-block centers-dropdown">
            <button
              ref={centersDropdownButtonRef}
              onClick={toggleCentersDropdown}
              className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="text-sm font-medium mr-1">
                  {(() => {
                    const selectedCenterCount = Object.values(selectedCenters).filter(selected => selected).length;
                    const selectedCenterNames = Object.entries(selectedCenters)
                      .filter(([center, isSelected]) => isSelected)
                      .map(([center]) => center);
                    
                    if (selectedCenterCount === 0) {
                      return "Select Center";
                    } else if (selectedCenterCount === 1) {
                      return selectedCenterNames[0];
                    } else if (selectedCenterCount === centers.length) {
                      return "All Centers";
                    } else {
                      return `${selectedCenterCount} Centers`;
                    }
                  })()}
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </button>
            
            {/* Centers dropdown menu */}
            {centersDropdownOpen && (
              <div 
                className="fixed py-1 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-[100]"
                style={{
                  top: `${centersDropdownPosition.top}px`,
                  left: `${centersDropdownPosition.left}px`,
                }}
              >
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase">
                  Leisure Centers
                </div>
                
                <div className="p-2">
                  {centers.map(center => {
                    const hasPool = CENTERS_WITH_POOLS.includes(center);
                    
                    return (
                      <button 
                        key={center} 
                        onClick={() => handleCenterChange(center)}
                        className="w-full flex items-center px-2 py-1.5 rounded-md text-left hover:bg-gray-50 cursor-pointer"
                      >
                        <div className={`h-4 w-4 rounded-full border flex-shrink-0 ${
                          selectedCenters[center] 
                            ? 'border-[rgb(0,130,188)] bg-white' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedCenters[center] && (
                            <div className="w-2 h-2 bg-[rgb(0,130,188)] rounded-full m-auto"></div>
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-700">
                          {center}
                          {showPoolClasses && hasPool && (
                            <span className="ml-1 text-xs font-medium text-[rgb(0,130,188)]">(Pool)</span>
                          )}
                          {showPoolClasses && !hasPool && (
                            <span className="ml-1 text-xs font-medium text-red-500">(No Pool)</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Filter button */}
          <button 
            onClick={toggleFilters}
            className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <span className="text-sm font-medium mr-1">Filters</span>
            {getActiveFilterCount() > 0 && 
              <span className="bg-orange-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full px-1.5">
                {getActiveFilterCount()}
              </span>
            }
          </button>
          
          {/* Today button */}
          <button 
            onClick={scrollToToday}
            className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-sm font-medium">Today</span>
          </button>
        </div>
      </div>
      
      {/* Toast notification */}
      {toast.show && (
        <div 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[rgb(0,130,188)] text-white px-4 py-2 rounded-lg shadow-lg z-[200] flex items-center"
          style={{ 
            animation: 'fadeInUp 0.3s ease-out forwards',
            minWidth: '200px',
            maxWidth: '90%'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Filter panel wrapper - slides over content */}
      <div 
        className={`fixed top-[52px] left-0 right-0 z-50 bg-white/95 backdrop-blur-md overflow-auto transition-all duration-300 ease-in-out shadow-lg border-b border-gray-200 ${
          filtersExpanded ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-gray-100">
            {/* Render appropriate filter panel based on mode */}
            {renderFilterPanel()}
            
            {/* Bottom close button */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md py-3 px-4">
              <button 
                onClick={toggleFilters}
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
              Showing: <span className="text-[rgb(0,130,188)]">{showPoolClasses ? 'Swimming Pool Sessions' : 'Fitness Classes'}</span>
            </span>
            <span className="text-sm font-medium text-[rgb(0,130,188)]">
              Class Timetable
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4">
            {days.map(day => {
              if (classesByDay[day].length === 0) return null;
              return (
                <div key={day} id={`day-${day}`} className="bg-white rounded-lg overflow-hidden shadow">
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
                            <div className="font-medium text-gray-700 text-sm pt-0.5">{cls.time}</div>
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
