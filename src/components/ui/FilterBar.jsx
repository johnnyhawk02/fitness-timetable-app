import React, { memo } from 'react';
import { COLORS } from '../../utils/colorThemes';

/**
 * FilterBar component to handle filtering of classes
 * 
 * @param {Object} props Component props
 * @param {Object} props.filters Current filter values
 * @param {Function} props.updateFilter Function to update a filter
 * @param {Function} props.resetFilters Function to reset all filters
 * @param {boolean} props.isSwimmingMode Whether the app is in swimming mode
 * @param {Array} props.centerOptions Array of available centers
 * @param {Array} props.categoryOptions Array of available categories
 * @param {Array} props.instructorOptions Array of available instructors
 * @param {Array} props.dayOptions Array of available days
 */
const FilterBar = ({
  filters,
  updateFilter,
  resetFilters,
  isSwimmingMode,
  centerOptions = ["Dunes", "Meadows", "Bootle"],
  categoryOptions = ["All", "Cardio", "Strength", "Mind Body"],
  instructorOptions = ["All", "John", "Jane", "Bob"],
  dayOptions = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
}) => {
  // Get current mode colors
  const themeColors = COLORS.getThemeColors(isSwimmingMode);

  // Calculate button styles based on mode
  const getButtonStyles = () => {
    return {
      backgroundColor: themeColors.primary,
      color: 'white',
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Center Filter */}
        <div className="relative">
          <label htmlFor="center-filter" className="block text-xs font-medium text-gray-500 mb-1">
            Center
          </label>
          <select
            id="center-filter"
            value={filters.center}
            onChange={(e) => updateFilter('center', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {centerOptions.map((center) => (
              <option key={center} value={center}>
                {center}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter - Hide in swimming mode */}
        {!isSwimmingMode && (
          <div className="relative">
            <label htmlFor="category-filter" className="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Day Filter */}
        <div className="relative">
          <label htmlFor="day-filter" className="block text-xs font-medium text-gray-500 mb-1">
            Day
          </label>
          <select
            id="day-filter"
            value={filters.day}
            onChange={(e) => updateFilter('day', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Instructor Filter - Hide in swimming mode */}
        {!isSwimmingMode && (
          <div className="relative">
            <label htmlFor="instructor-filter" className="block text-xs font-medium text-gray-500 mb-1">
              Instructor
            </label>
            <select
              id="instructor-filter"
              value={filters.instructor}
              onChange={(e) => updateFilter('instructor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {instructorOptions.map((instructor) => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Reset Filters Button */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={resetFilters}
          className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={getButtonStyles()}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(FilterBar); 