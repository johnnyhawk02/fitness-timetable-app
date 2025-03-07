import React, { useState, useEffect } from 'react';
import bootleClasses from '../data/bootleData';
import crosbyClasses from '../data/crosbyData';
import meadowsClasses from '../data/meadowsData';
import nethertonClasses from '../data/nethertonData';
import litherlandClasses from '../data/litherlandData';
import dunesClasses from '../data/dunesData';

// Local storage keys
const STORAGE_KEYS = {
  SELECTED_CENTERS: 'fitness_selected_centers',
  SELECTED_CATEGORY: 'fitness_selected_category',
  INCLUDE_VIRTUAL: 'fitness_include_virtual',
  SELECTED_TIME_BLOCK: 'fitness_selected_time_block',
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

const FitnessTimetable = () => {
  // Combine all classes
  const allClasses = [...bootleClasses, ...crosbyClasses, ...meadowsClasses, ...nethertonClasses, ...litherlandClasses, ...dunesClasses];

  // Default time blocks configuration
  const defaultTimeBlocks = {
    'early-morning': { label: 'Early Morning', start: 6.5, end: 9 },
    'morning': { label: 'Morning', start: 9, end: 12 },
    'afternoon': { label: 'Afternoon', start: 12, end: 17 },
    'evening': { label: 'Evening', start: 17, end: 22 }
  };

  // Filter options
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const centers = ['Bootle', 'Crosby', 'Meadows', 'Netherton', 'Litherland', 'Dunes'];
  //const allLocations = [...new Set(allClasses.map(cls => cls.location))];

  // Default centers selection - all centers selected by default
  const defaultCentersSelection = centers.reduce((acc, center) => {
    acc[center] = true;
    return acc;
  }, {});

  // State hooks with localStorage integration
  const [selectedCenters, setSelectedCenters] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_CENTERS, defaultCentersSelection)
  );
  const [selectedCategory, setSelectedCategory] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_CATEGORY, '')
  );
  const [includeVirtual, setIncludeVirtual] = useState(() => 
    getStoredValue(STORAGE_KEYS.INCLUDE_VIRTUAL, true)
  );
  const [selectedTimeBlock, setSelectedTimeBlock] = useState(() => 
    getStoredValue(STORAGE_KEYS.SELECTED_TIME_BLOCK, '')
  );
  const [isTimePopupOpen, setIsTimePopupOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState(null);
  const [timeBlocks, setTimeBlocks] = useState(() => 
    getStoredValue(STORAGE_KEYS.TIME_BLOCKS, defaultTimeBlocks)
  );

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
    localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_BLOCK, JSON.stringify(selectedTimeBlock));
  }, [selectedTimeBlock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME_BLOCKS, JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  // Class category definitions
  const classCategories = {
    cardio: 'Cardio',
    strength: 'Strength',
    'mind-body': 'Mind & Body',
    core: 'Core',
    spinning: 'Spinning'
  };

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

  // Handle category filter selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  // Handle time block selection
  const handleTimeBlockChange = (blockId) => {
    setSelectedTimeBlock(selectedTimeBlock === blockId ? '' : blockId);
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
      if (selectedTimeBlock !== editingTimeBlock) {
        setSelectedTimeBlock(editingTimeBlock);
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

  // Handle center selection toggling
  const handleCenterChange = (center) => {
    // Check if at least one center will remain selected
    if (center === 'all') {
      const allSelected = Object.values(selectedCenters).every(selected => selected);
      const centersUpdate = {};
      
      // Toggle between all selected and none selected
      centers.forEach(c => {
        centersUpdate[c] = !allSelected;
      });
      
      setSelectedCenters(centersUpdate);
    } else {
      setSelectedCenters({
        ...selectedCenters,
        [center]: !selectedCenters[center]
      });
    }
  };

  // Filter classes based on selected filters
  const filteredClasses = allClasses.filter(cls => {
    // Center filter
    const anyCenterSelected = Object.values(selectedCenters).some(selected => selected);
    if (anyCenterSelected && !selectedCenters[cls.center]) return false;

    // Time block filter
    if (selectedTimeBlock) {
      const classStartHour = convertTimeToHours(cls.time);
      const { start, end } = timeBlocks[selectedTimeBlock];
      if (classStartHour < start || classStartHour >= end) return false;
    }

    // If no other filters are active, include the class
    if (!selectedCategory && includeVirtual) return true;

    const category = getClassCategory(cls.activity);
    const categoryMatch = !selectedCategory || selectedCategory === category;
    const virtualMatch = includeVirtual || !cls.virtual;

    return categoryMatch && virtualMatch;
  });

  // Get locations specific to the selected center (if needed)
  // const centerLocations =
  //   selectedCenter === 'all'
  //     ? allLocations
  //     : [...new Set(allClasses.filter(cls => cls.center === selectedCenter).map(cls => cls.location))];

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
          <div className="flex space-x-2 items-center">
            <label 
              className="flex items-center space-x-1.5 cursor-pointer text-xs py-1 px-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setIncludeVirtual(!includeVirtual)}
            >
              <span>Include Virtual</span>
              <div className={`w-4 h-4 flex items-center justify-center border ${includeVirtual ? 'bg-purple-600 border-purple-700' : 'bg-white border-gray-400'}`}>
                {includeVirtual && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </label>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1 items-center">
          <span className="text-xs font-medium text-gray-700">Centre:</span>
          <button
            onClick={() => handleCenterChange('all')}
            className={`px-2 py-0.5 rounded-full text-xs ${
              Object.values(selectedCenters).every(selected => selected)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {centers.map(center => (
            <button
              key={center}
              onClick={() => handleCenterChange(center)}
              className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCenters[center]
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
          <button
            key="all"
            onClick={() => setSelectedCategory('')}
            className={`px-2 py-0.5 rounded-full text-xs ${
              selectedCategory === ''
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {Object.entries(classCategories).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleCategoryChange(value)}
              className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCategory === value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label.replace('Classes', '').trim()}
            </button>
          ))}
        </div>

        <div className="mt-1 flex flex-wrap gap-1 items-center relative">
          <span className="text-xs font-medium text-gray-700">Time:</span>
          <button
            key="all-times"
            onClick={() => setSelectedTimeBlock('')}
            className={`px-2 py-0.5 rounded-full text-xs ${
              selectedTimeBlock === ''
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Any Time
          </button>
          {Object.entries(timeBlocks).map(([blockId, block]) => (
            <button
              key={blockId}
              onClick={() => handleTimeBlockChange(blockId)}
              className={`px-2 py-0.5 rounded-full text-xs flex items-center ${
                selectedTimeBlock === blockId
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{formatHourToTimeString(block.start)} - {formatHourToTimeString(block.end)}</span>
              <svg 
                onClick={(e) => handleOpenTimePopup(e, blockId)} 
                className="ml-1 w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          ))}

          {isTimePopupOpen && editingTimeBlock && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200 w-72">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Edit Time Range</h3>
                <button 
                  onClick={() => {
                    setIsTimePopupOpen(false);
                    setEditingTimeBlock(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Start Time</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="5"
                    max="21"
                    step="0.5"
                    value={timeBlocks[editingTimeBlock].start}
                    onChange={(e) => handleTimeRangeChange('start', parseFloat(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {formatHourToTimeString(timeBlocks[editingTimeBlock].start)}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs text-gray-700 mb-1">End Time</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min={timeBlocks[editingTimeBlock].start + 0.5}
                    max="22"
                    step="0.5"
                    value={timeBlocks[editingTimeBlock].end}
                    onChange={(e) => handleTimeRangeChange('end', parseFloat(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {formatHourToTimeString(timeBlocks[editingTimeBlock].end)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleApplyCustomTime}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
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
                                : cls.center === 'Meadows'
                                ? 'bg-pink-100 text-pink-800'
                                : cls.center === 'Netherton'
                                ? 'bg-purple-100 text-purple-800'
                                : cls.center === 'Litherland'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-indigo-100 text-indigo-800'
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
