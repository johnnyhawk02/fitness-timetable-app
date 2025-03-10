import React from 'react';
import { getClassCategory } from '../../services/classService';

// Class descriptions
const classDescriptions = {
  "Aerobics": "A high-energy exercise class that combines rhythmic aerobic exercise with stretching and strength training routines.",
  "Aqua Aerobics": "Water-based exercises that take pressure off your bones, joints and muscles.",
  "Body Attack": "A high-energy fitness class with moves that cater for total beginners to total addicts.",
  "Body Balance": "A mix of yoga, tai chi and pilates to build flexibility and strength.",
  "Body Combat": "A high-energy martial arts-inspired workout that is non-contact and with no complex moves to master.",
  "Body Conditioning": "A full-body workout designed to strengthen and tone all major muscle groups.",
  "Body Pump": "A barbell workout for anyone looking to get lean, toned and fit.",
  "Body Tone": "Improve your muscle strength and tone with this full-body workout.",
  "Circuits": "A series of exercise stations that you rotate through to give you a full body workout.",
  "Core and Abs": "Focus on strengthening your core muscles to improve stability, balance, and overall fitness.",
  "Hiit": "High Intensity Interval Training alternating between intense bursts of activity and fixed periods of less-intense activity.",
  "Kettlebells": "A full-body workout that utilizes kettlebells for strength training and cardiovascular fitness.",
  "Pilates": "A method of exercise that focuses on improving flexibility, strength, and body awareness.",
  "Spin": "An indoor cycling workout where you ride to the rhythm of powerful music and take on the terrain with your inspiring team coach.",
  "Yoga": "A practice that brings together physical and mental disciplines to achieve peacefulness of body and mind.",
  "Zumba": "A fitness program that combines Latin and international music with dance moves."
};

/**
 * Displays detailed information about a selected class
 * 
 * @param {Object} props Component props
 * @param {Object} props.classInfo The class to display details for
 * @param {function} props.onClose Handler for closing the details
 * @param {Object} props.colors Color theme
 * @returns {JSX.Element}
 */
const ClassDetails = ({ classInfo, onClose, colors = {} }) => {
  if (!classInfo) return null;
  
  // Get a generic description based on the activity name
  const getDescription = (activity) => {
    if (!activity) return "No description available";
    
    // Try to find a direct match in our descriptions
    const activityLower = activity.toLowerCase();
    for (const [key, description] of Object.entries(classDescriptions)) {
      if (activityLower.includes(key.toLowerCase())) {
        return description;
      }
    }
    
    // Default description
    return "Join this class to improve your fitness level and well-being.";
  };
  
  // Get color based on class category
  const getClassColor = () => {
    const category = getClassCategory(classInfo.activity);
    return colors.categoryColors?.[category] || colors.primary || 'rgb(0,130,188)';
  };
  
  // Get color for center badge
  const getCenterColor = () => {
    return colors.centerColors?.[classInfo.center] || colors.primary || 'rgb(0,130,188)';
  };
  
  const headerColor = getClassColor();
  const centerColor = getCenterColor();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl transform transition-all">
        <div className="text-white px-4 py-3 flex justify-between items-center" style={{ backgroundColor: headerColor }}>
          <h3 className="text-lg font-medium">{classInfo.activity}</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4" style={{ backgroundColor: `${headerColor}10` }}>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-sm">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: headerColor }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-gray-700">{classInfo.day}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: headerColor }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">{classInfo.time}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: centerColor }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span className="text-gray-700">
                {classInfo.center}
                <span 
                  className="ml-2 text-xs px-1.5 py-0.5 rounded" 
                  style={{ 
                    backgroundColor: `${centerColor}10`,
                    color: centerColor
                  }}
                >
                  {classInfo.center}
                </span>
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: headerColor }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span className="text-gray-700">{classInfo.location}</span>
            </div>
            
            {classInfo.virtual && (
              <div className="col-span-2 mt-1">
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${colors.info || 'rgb(3,169,244)'}20`,
                    color: colors.info || 'rgb(3,169,244)'
                  }}
                >
                  Virtual Class
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="font-medium text-gray-800 mb-2" style={{ color: headerColor }}>About this class</h4>
          <p className="text-gray-600 text-sm">
            {getDescription(classInfo.activity)}
          </p>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="text-white px-4 py-2 rounded shadow-sm hover:opacity-90 transition-colors"
            style={{ backgroundColor: headerColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails; 