import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  mode: 'fitness', // 'fitness' or 'swimming'
  filters: {
    centers: {},
    days: {},
    category: '',
    includeVirtual: true,
    poolLocationType: 'all',
    timeBlocks: {
      morning: false,
      afternoon: false,
      evening: false
    }
  },
  ui: {
    filtersExpanded: false,
    showDescription: false,
    selectedClass: null,
  }
};

// Action types
const ActionTypes = {
  SET_MODE: 'SET_MODE',
  SET_FILTER: 'SET_FILTER',
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_UI_STATE: 'SET_UI_STATE',
  TOGGLE_FILTER_EXPANDED: 'TOGGLE_FILTER_EXPANDED',
  SET_SELECTED_CLASS: 'SET_SELECTED_CLASS',
};

// Reducer function
function timetableReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_MODE:
      console.log('SET_MODE reducer called with payload:', action.payload);
      console.log('Previous mode:', state.mode);
      return {
        ...state,
        mode: action.payload
      };
    
    case ActionTypes.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filterType]: action.payload.value
        }
      };
    
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    
    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: {
          ...initialState.filters,
          // Keep the centers and days structure but reset all to true
          centers: Object.keys(state.filters.centers).reduce((acc, center) => {
            acc[center] = true;
            return acc;
          }, {}),
          days: Object.keys(state.filters.days).reduce((acc, day) => {
            acc[day] = true;
            return acc;
          }, {})
        }
      };
    
    case ActionTypes.SET_UI_STATE:
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.key]: action.payload.value
        }
      };
    
    case ActionTypes.TOGGLE_FILTER_EXPANDED:
      return {
        ...state,
        ui: {
          ...state.ui,
          filtersExpanded: !state.ui.filtersExpanded
        }
      };
    
    case ActionTypes.SET_SELECTED_CLASS:
      return {
        ...state,
        ui: {
          ...state.ui,
          showDescription: action.payload !== null,
          selectedClass: action.payload
        }
      };
    
    default:
      return state;
  }
}

// Create context
const TimetableContext = createContext();

// Context provider
export function TimetableProvider({ children, defaultCenters = {}, defaultDays = {} }) {
  // Initialize state with provided defaults
  const actualInitialState = {
    ...initialState,
    filters: {
      ...initialState.filters,
      centers: defaultCenters,
      days: defaultDays
    }
  };
  
  const [state, dispatch] = useReducer(timetableReducer, actualInitialState);
  
  // Create action creators
  const actions = {
    setMode: (mode) => {
      console.log('setMode action called with:', mode);
      dispatch({ type: ActionTypes.SET_MODE, payload: mode });
    },
    setFilter: (filterType, value) => dispatch({ 
      type: ActionTypes.SET_FILTER, 
      payload: { filterType, value } 
    }),
    setFilters: (filtersObject) => dispatch({ 
      type: ActionTypes.SET_FILTERS, 
      payload: filtersObject 
    }),
    resetFilters: () => dispatch({ type: ActionTypes.RESET_FILTERS }),
    setUiState: (key, value) => dispatch({ 
      type: ActionTypes.SET_UI_STATE, 
      payload: { key, value } 
    }),
    toggleFiltersExpanded: () => dispatch({ type: ActionTypes.TOGGLE_FILTER_EXPANDED }),
    setSelectedClass: (classObj) => dispatch({ 
      type: ActionTypes.SET_SELECTED_CLASS, 
      payload: classObj 
    }),
  };
  
  // Computed values from state
  const isSwimmingMode = state.mode === 'swimming';
  
  // Export context value
  const contextValue = {
    state,
    actions,
    isSwimmingMode
  };
  
  return (
    <TimetableContext.Provider value={contextValue}>
      {children}
    </TimetableContext.Provider>
  );
}

// Custom hook to use the timetable context
export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
}

export default TimetableContext; 