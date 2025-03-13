import { useMemo } from 'react';
import { getClassCategory } from '../services/classService';
import logger from '../utils/logger';

/**
 * Custom hook to filter classes based on various criteria
 * @param {Array} allClasses - Array of all classes
 * @param {Object} filters - Object containing filter criteria
 * @param {boolean} isSwimmingMode - Whether we're in swimming mode
 * @returns {Array} Filtered and sorted array of classes
 */
function useFilteredClasses(allClasses, filters, isSwimmingMode) {
  // Add debug logging
  logger.log('useFilteredClasses called with isSwimmingMode:', isSwimmingMode);
  logger.log('Total classes before filtering:', allClasses.length);
  
  // Find pool classes for debugging
  const poolClassesTotal = allClasses.filter(cls => 
    cls.location && (
      cls.location.includes('Pool') || 
      cls.location.includes('Splash') || 
      cls.location.includes('Swimming')
    )
  ).length;
  logger.log('Total pool classes in dataset:', poolClassesTotal);
  
  // Step 1: Filter by pool/regular classes - force explicit boolean check
  const filteredByMode = useMemo(() => {
    logger.log('Filtering by mode, isSwimmingMode:', isSwimmingMode);
    const swimMode = isSwimmingMode === true; // Force boolean evaluation
    logger.log('Evaluated swim mode:', swimMode);
    
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
      logger.log('Pool classes found:', poolClasses.length);
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
      logger.log('Non-pool classes found:', nonPoolClasses.length);
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
  
  // Add debug logging
  logger.log('Converting time:', timeString);
  
  // Handle time range format (e.g., "09:00 - 10:00" or "06:35-07:05")
  if (timeString.includes('-')) {
    timeString = timeString.split('-')[0].trim();
    logger.log('Extracted start time:', timeString);
  }
  
  // Extract hours, minutes and am/pm (if present)
  const match = timeString.match(/(\d+)(?::(\d+))?\s*([aApP][mM])?/);
  if (!match) {
    logger.log('Failed to parse time:', timeString);
    return 0;
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const isPM = match[3] && match[3].toLowerCase() === 'pm';
  
  logger.log('Parsed time components:', { hours, minutes, isPM, hasAmPm: !!match[3] });
  
  // Only apply AM/PM conversion if AM/PM is actually specified
  if (match[3]) {
    // Convert to 24-hour format if AM/PM is specified
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  }
  
  // For times without AM/PM, assume they're already in 24-hour format
  // This is the case for our data files (e.g., "06:35-07:05")
  
  const result = hours + (minutes / 60);
  logger.log('Converted to decimal hours:', result);
  return result;
}

export default useFilteredClasses; 