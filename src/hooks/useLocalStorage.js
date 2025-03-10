import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state in localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Default value if nothing in localStorage
 * @returns {[any, function]} - The current value and a setter function
 */
function useLocalStorage(key, initialValue) {
  // Get stored value from localStorage or use initialValue
  const getStoredValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Update localStorage if the key changes
  useEffect(() => {
    setStoredValue(getStoredValue());
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage; 