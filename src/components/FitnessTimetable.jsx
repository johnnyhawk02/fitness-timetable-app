import React, { useState } from 'react';
import bootleClasses from '../data/bootleData';
import crosbyClasses from '../data/crosbyData';
import meadowsClasses from '../data/meadowsData';

const FitnessTimetable = () => {
  // Combine all classes
  const allClasses = [...bootleClasses, ...crosbyClasses, ...meadowsClasses];

  // State hooks
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState({
    cardio: false,
    strength: false,
    'mind-body': false,
    core: false,
    spinning: false
  });
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);

  // Filter options
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const centers = ['Bootle', 'Crosby', 'Meadows'];
  const allLocations = [...new Set(allClasses.map(cls => cls.location))];

  // Class category definitions
  const classCategories = {
    cardio: 'Cardio',
    strength: 'Strength',
    'mind-body': 'Mind & Body',
    core: 'Core',
    spinning: 'Spinning'
  };

  // Determine category for a given activity
  const getClassCategory = (activity) => {
    if (activity.includes('Spinning') || activity.includes('RPM') || activity.includes('Sprint') || activity.includes('TRIP'))
      return 'spinning';
    if (activity.includes('Cardio') || activity.includes('Attack') || activity.includes('Combat') || activity.includes('Zumba') || activity.includes('Konga'))
      return 'cardio';
    if (activity.includes('Tone') || activity.includes('Conditioning') || activity.includes('Circuit') || activity.includes('Kettlebell') || activity.includes('Strength') || activity.includes('Synergy') || activity.includes('Bootcamp') || activity.includes('HIIT') || activity.includes('Bodypump'))
      return 'strength';
    if (activity.includes('Yoga') || activity.includes('Pilates') || activity.includes('Balance') || activity.includes('Relaxation') || activity.includes('Tai-Chi'))
      return 'mind-body';
    if (activity.includes('Core') || activity.includes('Abs') || activity.includes('Bums'))
      return 'core';
    return 'other';
  };

  // Handle category filter toggling
  const handleCategoryChange = (category) => {
    setSelectedCategories({
      ...selectedCategories,
      [category]: !selectedCategories[category]
    });
  };

  // Filter classes based on selected filters
  const filteredClasses = allClasses.filter(cls => {
    // Center filter
    if (selectedCenter !== 'all' && cls.center !== selectedCenter) return false;

    // If no filters other than center are active, include the class
    if (!Object.values(selectedCategories).some(v => v) && !showVirtualOnly) return true;

    const category = getClassCategory(cls.activity);
    const categorySelected = Object.values(selectedCategories).some(v => v);
    const categoryMatch = !categorySelected || selectedCategories[category];
    const virtualMatch = !showVirtualOnly || cls.virtual;

    return categoryMatch && virtualMatch;
  });

  // Get locations specific to the selected center (if needed)
  const centerLocations =
    selectedCenter === 'all'
      ? allLocations
      : [...new Set(allClasses.filter(cls => cls.center === selectedCenter).map(cls => cls.location))];

  // Group classes by day for display
  const classesByDay = {};
  days.forEach(day => {
    classesByDay[day] = filteredClasses.filter(cls => cls.day === day);
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-3 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Active Sefton Fitness</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowVirtualOnly(!showVirtualOnly)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded"
            >
              {showVirtualOnly ? 'All Classes' : 'Virtual Only'}
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 items-center">
          <span className="text-xs font-medium text-gray-700">Centre:</span>
          <button
            onClick={() => setSelectedCenter('all')}
            className={`px-2 py-0.5 rounded-full text-xs ${
              selectedCenter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {centers.map(center => (
            <button
              key={center}
              onClick={() => setSelectedCenter(center)}
              className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCenter === center
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {center}
            </button>
          ))}
        </div>

        <div className="mt-1 flex flex-wrap gap-1 items-center">
          <span className="text-xs font-medium text-gray-700">Type:</span>
          {Object.entries(classCategories).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleCategoryChange(value)}
              className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCategories[value]
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label.replace('Classes', '').trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          {days.map(day => {
            if (classesByDay[day].length === 0) return null;
            return (
              <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className={`${
                    day === 'Monday'
                      ? 'bg-blue-600'
                      : day === 'Tuesday'
                      ? 'bg-green-600'
                      : day === 'Wednesday'
                      ? 'bg-purple-600'
                      : day === 'Thursday'
                      ? 'bg-orange-600'
                      : day === 'Friday'
                      ? 'bg-red-600'
                      : day === 'Saturday'
                      ? 'bg-indigo-600'
                      : 'bg-teal-600'
                  } text-white font-semibold py-1 px-3 text-sm`}
                >
                  {day}
                </div>
                <div className="divide-y divide-gray-200">
                  {classesByDay[day].length === 0 ? (
                    <div className="p-4 text-gray-500">No classes available</div>
                  ) : (
                    classesByDay[day].map((cls, idx) => (
                      <div key={`${day}-${idx}`} className="flex items-start p-3 hover:bg-gray-50">
                        <div className="w-24 font-medium text-gray-700 text-xs pt-0.5">{cls.time}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{cls.activity}</div>
                          <div className="text-xs text-gray-500">{cls.location}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                              cls.center === 'Bootle'
                                ? 'bg-blue-100 text-blue-800'
                                : cls.center === 'Crosby'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            {cls.center}
                          </span>
                          {cls.virtual && (
                            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                              V
                            </span>
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

      <div className="mt-2 text-xs text-gray-500">
        <p>Bootle: Mon-Fri 7:00am-9:30pm • Crosby: Mon-Fri 6:30am-10:00pm</p>
        <p>Meadows: Mon-Fri 6:30am-10:00pm • Sat-Sun 8:00am-5:00pm</p>
        <p>Book: www.activeseftonfitness.co.uk</p>
      </div>
    </div>
  );
};

export default FitnessTimetable;
