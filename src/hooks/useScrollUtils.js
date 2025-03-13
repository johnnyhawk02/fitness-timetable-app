import { useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Custom hook that provides scrolling utilities
 * 
 * @param {Object} options Configuration options
 * @param {number} options.scrollDelay Delay in ms before scrolling (default: 120ms)
 * @param {number} options.secondScrollDelay Delay for the second scroll phase (default: 120ms)
 * @returns {Object} Scrolling utility functions
 */
export const useScrollUtils = (options = {}) => {
  const {
    scrollDelay = 120,  // Default primary scroll delay
    secondScrollDelay = 120,  // Default second phase scroll delay
  } = options;
  
  /**
   * Scrolls to an element with smooth animation
   * 
   * @param {string} elementId ID of the element to scroll to
   * @param {Object} options Additional scroll options
   * @param {boolean} options.useSecondScroll Whether to use a second scroll phase
   * @param {string} options.behavior Scroll behavior ('smooth' or 'auto')
   * @param {Function} options.onSuccess Callback when scroll is successful
   */
  const scrollToElement = useCallback((elementId, options = {}) => {
    const {
      useSecondScroll = true, 
      behavior = 'smooth',
      onSuccess = null
    } = options;
    
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (!element) {
        logger.warn(`Element with ID '${elementId}' not found for scrolling.`);
        return;
      }
      
      // First scroll - initial positioning
      element.scrollIntoView({ behavior, block: 'start' });
      logger.log(`Scrolled to ${elementId}`);
      
      // Optional second scroll for fine adjustment
      if (useSecondScroll) {
        setTimeout(() => {
          element.scrollIntoView({ behavior, block: 'start' });
          logger.log(`Second scroll to ${elementId}`);
          
          if (onSuccess) {
            onSuccess();
          }
        }, secondScrollDelay);
      } else if (onSuccess) {
        onSuccess();
      }
    }, scrollDelay);
  }, [scrollDelay, secondScrollDelay]);
  
  /**
   * Specialized function to scroll to a specific day element
   * 
   * @param {string} day The day to scroll to (e.g., 'Monday')
   * @param {Object} options Additional scroll options
   */
  const scrollToDay = useCallback((day, options = {}) => {
    const elementId = `day-${day}`;
    scrollToElement(elementId, options);
  }, [scrollToElement]);
  
  return {
    scrollToElement,
    scrollToDay
  };
};

export default useScrollUtils; 