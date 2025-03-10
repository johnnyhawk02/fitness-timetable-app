import { useMemo } from 'react';

/**
 * Custom hook to filter classes based on various criteria
 * @param {Array} allClasses - Array of all classes
 * @param {Object} filters - Object containing filter criteria
 * @param {boolean} isSwimmingMode - Whether we're in swimming mode
 * @returns {Array} Filtered and sorted array of classes
 */
function useFilteredClasses(allClasses, filters, isSwimmingMode) {
  // Add debug logging
  console.log('useFilteredClasses called with isSwimmingMode:', isSwimmingMode);
  console.log('Total classes before filtering:', allClasses.length);
  
  // Find pool classes for debugging
  const poolClassesTotal = allClasses.filter(cls => 
    cls.location && (
      cls.location.includes('Pool') || 
      cls.location.includes('Splash') || 
      cls.location.includes('Swimming')
    )
  ).length;
  console.log('Total pool classes in dataset:', poolClassesTotal);
  
  // Step 1: Filter by pool/regular classes - force explicit boolean check
  const filteredByMode = useMemo(() => {
    console.log('Filtering by mode, isSwimmingMode:', isSwimmingMode);
    const swimMode = isSwimmingMode === true; // Force boolean evaluation
    console.log('Evaluated swim mode:', swimMode);
    
    if (swimMode) {
      // In swimming mode, only show pool classes
      const poolClasses = allClasses.filter(cls => 
        cls.location && (
          cls.location.toLowerCase().includes('pool') || 
          cls.location.toLowerCase().includes('splash') || 
          cls.location.toLowerCase().includes('swimming') ||
          // Also check activity names for swim-related activities
          (cls.activity && (
            cls.activity.toLowerCase().includes('swim') ||
            cls.activity.toLowerCase().includes('aqua') ||
            cls.activity.toLowerCase().includes('water')
          ))
        )
      );
      console.log('Pool classes found:', poolClasses.length);
      return poolClasses;
    } else {
      // In fitness mode, exclude pool classes and swim-related activities
      const nonPoolClasses = allClasses.filter(cls => 
        // Exclude classes with pool-related locations
        (!cls.location || (
          !cls.location.toLowerCase().includes('pool') && 
          !cls.location.toLowerCase().includes('splash') && 
          !cls.location.toLowerCase().includes('swimming')
        )) && 
        // Exclude classes with swim-related activities
        (!cls.activity || (
          !cls.activity.toLowerCase().includes('swim') &&
          !cls.activity.toLowerCase().includes('aqua') &&
          !cls.activity.toLowerCase().includes('water')
        ))
      );
      console.log('Non-pool classes found:', nonPoolClasses.length);
      return nonPoolClasses;
    }
  }, [allClasses, isSwimmingMode]); // Make sure this recomputes when isSwimmingMode changes

  // Step 2: Apply pool location filter if applicable
  const filteredByPoolLocation = useMemo(() => {
    if (isSwimmingMode && filters.poolLocationType !== 'all') {
      return filteredByMode.filter(cls => {
        if (filters.poolLocationType === 'main') {
          return cls.location && cls.location.toLowerCase().includes('main pool');
        } else if (filters.poolLocationType === 'leisure') {
          return cls.location && (
            cls.location.toLowerCase().includes('leisure pool') || 
            cls.location.toLowerCase().includes('small pool') || 
            cls.location.toLowerCase().includes('learner pool')
          );
        }
        return true;
      });
    }
    return filteredByMode;
  }, [filteredByMode, isSwimmingMode, filters.poolLocationType]);

  // Step 3: Apply other filters and sort
  const filteredAndSortedClasses = useMemo(() => {
    // Apply remaining filters
    const filtered = filteredByPoolLocation.filter(cls => {
      // Center filter
      if (!filters.centers[cls.center]) return false;
      
      // Day filter
      if (filters.days && !filters.days[cls.day]) return false;
      
      // Virtual filter
      if (!filters.includeVirtual && cls.virtual) return false;
      
      // Category filter (only apply in fitness mode)
      if (!isSwimmingMode && filters.category && getClassCategory(cls.activity) !== filters.category) return false;
      
      // If all filters pass, include the class
      return true;
    });

    // Sort the filtered classes by day and time
    return filtered.sort((a, b) => {
      // First sort by day
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      
      // Then sort by time
      return convertTimeToHours(a.time) - convertTimeToHours(b.time);
    });
  }, [
    filteredByPoolLocation, 
    filters.centers, 
    filters.days, 
    filters.includeVirtual,
    filters.category,
    isSwimmingMode
  ]);

  return filteredAndSortedClasses;
}

// Helper function to convert time string to hours for sorting
function convertTimeToHours(timeString) {
  if (!timeString) return 0;
  
  // Extract hours, minutes and am/pm
  const match = timeString.match(/(\d+)(?::(\d+))?\s*([aApP][mM])?/);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const isPM = match[3] && match[3].toLowerCase() === 'pm';
  
  // Convert to 24-hour format
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  // Return as decimal hours
  return hours + (minutes / 60);
}

// Helper function to determine class category
function getClassCategory(activity) {
  if (!activity) return 'other';
  
  const activityLower = activity.toLowerCase();
  
  // Skip placeholder entries
  if (activityLower.includes('no classes') || 
      activityLower === 'none' || 
      activityLower === '-') 
    return 'other';
  
  // Cardio classes
  if (activityLower.includes('hiit') || 
      activityLower.includes('spin') || 
      activityLower.includes('zumba') || 
      activityLower.includes('aerobic') || 
      activityLower.includes('step') ||
      activityLower.includes('cardio') ||
      activityLower.includes('cycle') ||
      activityLower.includes('combat') ||
      activityLower.includes('box') ||
      activityLower.includes('circuit')) 
    return 'cardio';
  
  // Strength classes
  if (activityLower.includes('pump') || 
      activityLower.includes('kettlebell') || 
      activityLower.includes('strength') || 
      activityLower.includes('tone') || 
      activityLower.includes('conditioning') ||
      activityLower.includes('bodytone') ||
      activityLower.includes('body tone'))
    return 'strength';
  
  // Mind & body classes
  if (activityLower.includes('yoga') || 
      activityLower.includes('pilates') || 
      activityLower.includes('balance') || 
      activityLower.includes('flex') ||
      activityLower.includes('stretch') ||
      activityLower.includes('relax'))
    return 'mind-body';
  
  // Core classes
  if (activityLower.includes('abs') || 
      activityLower.includes('core'))
    return 'core';
  
  // Spinning classes
  if (activityLower.includes('spin') || 
      activityLower.includes('cycle') ||
      activityLower.includes('rpm'))
    return 'spinning';
  
  // Default category
  return 'other';
}

export default useFilteredClasses; 