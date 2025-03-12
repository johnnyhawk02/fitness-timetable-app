/**
 * Utility functions for date and time operations
 */

/**
 * Get the current day of the week
 * 
 * @returns {string} Current day name (e.g., 'Monday')
 */
export const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};

/**
 * Get the current hour in 24-hour format
 * 
 * @returns {number} Current hour (0-23)
 */
export const getCurrentHour = () => {
  return new Date().getHours();
};

/**
 * Format a time string into a standardized format
 * 
 * @param {string} timeString Time string to format (e.g., "14:00")
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  // Handle 24-hour format (e.g., "14:00")
  // Could be extended to convert to 12-hour format if needed
  return timeString;
};

/**
 * Extract hour from a time string
 * 
 * @param {string} timeString Time string in format "HH:MM" or "HH:MM-HH:MM"
 * @returns {number} Hour as a number
 */
export const extractHour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  
  // Get the first part (start time) if it's a range
  const startTime = timeString.split('-')[0].trim();
  
  // Extract hour
  const match = startTime.match(/^(\d+):/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Format a time range for display
 * 
 * @param {string} timeString Time string to format (e.g., "14:00-15:00")
 * @returns {string} Formatted time range
 */
export const formatTimeRange = (timeString) => {
  if (!timeString) return '';
  
  // Handle formats like "08:00-09:00" or "08:00 - 09:00"
  const times = timeString.replace(' ', '').split('-');
  if (times.length === 2) {
    return `${times[0]} - ${times[1]}`;
  }
  
  return timeString;
}; 