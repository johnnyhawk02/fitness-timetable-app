// Import class data 
import bootleClassData from '../data/bootleClassData';
import bootlePoolData from '../data/bootlePoolData';
import crosbyClassData from '../data/crosbyClassData';
import dunesClassData from '../data/dunesClassData';
import dunesPoolData from '../data/dunesPoolData';
import litherlandClassData from '../data/litherlandClassData';
import meadowsClassData from '../data/meadowsClassData';
import meadowsPoolData from '../data/meadowsPoolData';
import nethertonClassData from '../data/nethertonClassData';
import classDescriptions from '../data/classDescriptions';

// Combine all class data
const allClassData = [
  ...bootleClassData,
  ...bootlePoolData,
  ...crosbyClassData,
  ...dunesClassData,
  ...dunesPoolData,
  ...litherlandClassData,
  ...meadowsClassData, 
  ...meadowsPoolData,
  ...nethertonClassData
];

/**
 * Gets a description for a class based on its activity name
 * @param {string} activity Activity name
 * @returns {string} Activity description
 */
export function getClassDescription(activity) {
  if (!activity) return "No description available";
  
  // Try to find a direct match in our imported descriptions
  if (classDescriptions[activity]) {
    return classDescriptions[activity];
  }
  
  // If no direct match, try to find a partial match
  const activityLower = activity.toLowerCase();
  for (const [key, description] of Object.entries(classDescriptions)) {
    if (activityLower.includes(key.toLowerCase())) {
      return description;
    }
  }
  
  // Swimming-related fallback descriptions
  if (activityLower.includes('swim')) {
    if (activityLower.includes('public')) {
      return "General swimming sessions open to the public.";
    }
    if (activityLower.includes('lane')) {
      return "Structured swimming in designated lanes for continuous lap swimming.";
    }
    if (activityLower.includes('adult')) {
      return "Swimming sessions reserved for adults only.";
    }
    if (activityLower.includes('family')) {
      return "Fun swimming sessions for the whole family.";
    }
    if (activityLower.includes('splash')) {
      return "Recreational swimming session with added fun elements.";
    }
    return "Swim sessions for all abilities.";
  }
  
  // Default description
  return "Join this class to improve your fitness level and well-being.";
}

/**
 * Helper function to determine class category
 * @param {string} activity - The activity name
 * @returns {string} The category identifier
 */
export function getClassCategory(activity) {
  if (!activity) return 'other';
  
  const activityLower = activity.toLowerCase();
  
  // Skip placeholder entries
  if (activityLower.includes('no classes') || 
      activityLower === 'none' || 
      activityLower === '-') 
    return 'other';
  
  // Swimming classes
  if (activityLower.includes('swim') ||
      activityLower.includes('aqua') ||
      activityLower.includes('water'))
    return 'swimming';
  
  // Spinning classes - moved up before cardio to prioritize this check
  if (activityLower.includes('spin') || 
      activityLower.includes('cycle') ||
      activityLower.includes('rpm') ||
      activityLower.includes('trip'))
    return 'spinning';
  
  // Cardio classes - removed 'spin' from this check
  if (activityLower.includes('hiit') || 
      activityLower.includes('zumba') || 
      activityLower.includes('aerobic') || 
      activityLower.includes('step') ||
      activityLower.includes('cardio') ||
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
  
  // Default category
  return 'other';
}

/**
 * Service for handling class data
 */
const classService = {
  /**
   * Gets all classes from all centers
   * @returns {Promise<Array>} Promise that resolves with array of all classes
   */
  getAllClasses: async () => {
    try {
      return Promise.resolve(allClassData);
    } catch (error) {
      console.error("Error fetching class data:", error);
      return [];
    }
  },
  
  /**
   * Get details for a specific class
   * @param {Object} classInfo Class to get details for
   * @returns {Promise<Object>} Promise that resolves with class details
   */
  getClassDetails: async (classInfo) => {
    return Promise.resolve({
      ...classInfo,
      description: getClassDescription(classInfo.activity)
    });
  }
};

export default classService; 