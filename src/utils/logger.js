/**
 * Utility for development-only logging
 * These logs will be automatically stripped in production builds
 */

// Custom logger that only logs in development
const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    // We keep warnings in production as they might indicate important issues
    console.warn(...args);
  },
  
  error: (...args) => {
    // We keep errors in production as they're critical
    console.error(...args);
  },
  
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...args);
    }
  }
};

export default logger; 