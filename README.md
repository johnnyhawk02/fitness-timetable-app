# Fitness Timetable App

A modern, responsive web application for viewing and managing fitness and swimming class schedules.

## Features

- **Dual Mode Support**: Toggle between fitness classes and swimming schedules
- **Filtering**: Filter classes by center, category, day, and instructor
- **Responsive Design**: Works on all devices from mobile to desktop
- **Day Navigation**: Quick navigation to specific days of the week
- **Class Details**: View detailed information about each class

## Project Structure

The application has been refactored to follow a more modular, maintainable structure:

### Components

- **UI Components**
  - `ClassList.jsx`: Displays classes grouped by day
  - `ClassDetails.jsx`: Modal with detailed class information
  - `DayNavigator.jsx`: Navigation between days of the week
  - `FilterBar.jsx`: Filter controls for classes
  - `LoadingScreen.jsx`: Loading indicator
  - `ModeToggle.jsx`: Switch between fitness and swimming modes
  - `NoClassesMessage.jsx`: Message when no classes are available

### Custom Hooks

- `useScrollUtils.js`: Utilities for scrolling behavior
- `useTimetableState.js`: State management for the timetable
- `useFilteredClasses.js`: Logic for filtering and grouping classes

### Utilities

- `colorThemes.js`: Color definitions for the application
- `dateUtils.js`: Date and time utility functions

### Services

- `classService.js`: Service for fetching and processing class data

## Key Refactoring Improvements

1. **Component Decomposition**: Breaking down large components into smaller, focused ones
2. **Custom Hooks**: Extracting reusable logic into custom hooks
3. **Improved State Management**: Using React hooks effectively for cleaner state management
4. **Separation of Concerns**: Clear separation between UI components, data fetching, and application logic
5. **Code Reuse**: Eliminating code duplication through shared utilities and hooks
6. **Performance Optimization**: Using memoization to prevent unnecessary re-renders

## Mode-Specific UX

- **Fitness Mode**: Shows instructor, duration, and category information
- **Swimming Mode**: Shows simplified information focused on pool availability
- **Visual Distinction**: Different color schemes for different modes

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Access the application at `http://localhost:3000`

## Technologies Used

- React
- Context API for state management
- CSS Modules with Tailwind CSS
- Modern JavaScript (ES6+)
