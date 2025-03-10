// Import class data here if available
// import bootleClassData from '../data/bootleClassData';
// import crobyClassData from '../data/crobyClassData';
// ... etc

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
      // In a real application, this would likely be an API call
      // For now, we'll simulate with a Promise that resolves with mock data
      
      // Always generate mock data for now since we don't have real data files
      return Promise.resolve(generateMockClasses());
      
      // When real data is available, uncomment this:
      // return Promise.resolve(allClassData);
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
    // In a real app, this might fetch additional details from an API
    // For now, we'll just return the class info with an added description
    return Promise.resolve({
      ...classInfo,
      description: getClassDescription(classInfo.activity)
    });
  }
};

/**
 * Generates mock class data for demonstration
 * @returns {Array} Array of mock classes
 */
function generateMockClasses() {
  const centers = ['Bootle', 'Meadows', 'Netherton', 'Crosby', 'Dunes', 'Litherland'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const activities = [
    'Aqua Aerobics', 'Swimming Lessons', 'Adult Swim', 'Family Swim', 'Ladies Only Swim',  // Pool activities
    'Yoga', 'Pilates', 'Spin', 'Body Pump', 'Zumba', 'HIIT', 'Body Combat', 'Core',        // Fitness activities
    'Circuits', 'Body Attack', 'Body Balance', 'Body Tone'
  ];
  const locations = [
    'Main Pool', 'Leisure Pool', 'Studio 1', 'Studio 2', 'Studio 3', 'Gym', 'Sports Hall'
  ];
  
  const classes = [];
  
  // Generate enough classes for demo purposes
  const classCount = 300;
  
  for (let i = 0; i < classCount; i++) {
    const center = centers[Math.floor(Math.random() * centers.length)];
    const day = days[Math.floor(Math.random() * days.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    const activityIndex = Math.floor(Math.random() * activities.length);
    const activity = activities[activityIndex];
    
    // Pool activities use pool locations
    let location;
    if (activityIndex < 5) {
      location = Math.random() > 0.5 ? 'Main Pool' : 'Leisure Pool';
    } else {
      location = locations[Math.floor(Math.random() * (locations.length - 2) + 2)];
    }
    
    // Add some virtual classes
    const virtual = Math.random() > 0.9;
    
    classes.push({
      center,
      day,
      time,
      activity,
      location,
      virtual
    });
  }
  
  return classes;
}

/**
 * Gets a description for a class based on its activity name
 * @param {string} activity Activity name
 * @returns {string} Activity description
 */
function getClassDescription(activity) {
  const descriptions = {
    "Aerobics": "A high-energy exercise class that combines rhythmic aerobic exercise with stretching and strength training routines.",
    "Aqua Aerobics": "Water-based exercises that take pressure off your bones, joints and muscles.",
    "Body Attack": "A high-energy fitness class with moves that cater for total beginners to total addicts.",
    "Body Balance": "A mix of yoga, tai chi and pilates to build flexibility and strength.",
    "Body Combat": "A high-energy martial arts-inspired workout that is non-contact and with no complex moves to master.",
    "Body Conditioning": "A full-body workout designed to strengthen and tone all major muscle groups.",
    "Body Pump": "A barbell workout for anyone looking to get lean, toned and fit.",
    "Body Tone": "Improve your muscle strength and tone with this full-body workout.",
    "Circuits": "A series of exercise stations that you rotate through to give you a full body workout.",
    "Core": "Focus on strengthening your core muscles to improve stability, balance, and overall fitness.",
    "Swimming": "Swim sessions for all abilities.",
    "Adult Swim": "Swimming sessions reserved for adults only.",
    "Family Swim": "Fun swimming sessions for the whole family.",
    "Hiit": "High Intensity Interval Training alternating between intense bursts of activity and fixed periods of less-intense activity.",
    "Kettlebells": "A full-body workout that utilizes kettlebells for strength training and cardiovascular fitness.",
    "Pilates": "A method of exercise that focuses on improving flexibility, strength, and body awareness.",
    "Spin": "An indoor cycling workout where you ride to the rhythm of powerful music and take on the terrain with your inspiring team coach.",
    "Yoga": "A practice that brings together physical and mental disciplines to achieve peacefulness of body and mind.",
    "Zumba": "A fitness program that combines Latin and international music with dance moves."
  };
  
  if (!activity) return "No description available";
  
  // Try to find a direct match
  const activityLower = activity.toLowerCase();
  for (const [key, description] of Object.entries(descriptions)) {
    if (activityLower.includes(key.toLowerCase())) {
      return description;
    }
  }
  
  // Default description
  return "Join this class to improve your fitness level and well-being.";
}

export default classService; 