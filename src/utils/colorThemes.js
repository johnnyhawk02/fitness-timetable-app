// Color themes - separate themes for fitness and swimming
export const COLORS = {
  // Shared colors
  primary: 'rgb(0,130,188)', // Sefton blue
  primaryLight: 'rgb(0,130,188, 0.1)',
  primaryMedium: 'rgb(0,130,188, 0.6)',
  
  // Fitness mode colors (warm)
  fitness: {
    primary: 'rgb(239,68,68)', // Warmer red
    secondary: 'rgb(234,88,12)', // Bright orange
    accent: 'rgb(249,115,22)', // Burnt orange
    background: 'rgb(254,226,226)', // Light red/pink
    
    // Simplified day colors for fitness - just two alternating colors
    dayColors: {
      'Monday': 'rgb(239,68,68)', // Red
      'Tuesday': 'rgb(234,88,12)', // Orange
      'Wednesday': 'rgb(239,68,68)', // Red
      'Thursday': 'rgb(234,88,12)', // Orange
      'Friday': 'rgb(239,68,68)', // Red
      'Saturday': 'rgb(234,88,12)', // Orange
      'Sunday': 'rgb(239,68,68)', // Red
    }
  },
  
  // Swimming mode colors (beautiful aqua)
  swimming: {
    primary: 'rgb(20,184,166)', // Teal
    secondary: 'rgb(6,182,212)', // Cyan
    accent: 'rgb(14,165,233)', // Sky blue
    background: 'rgb(236,254,255)', // Light cyan
    
    // Simplified day colors for swimming - just two alternating colors
    dayColors: {
      'Monday': 'rgb(20,184,166)', // Teal
      'Tuesday': 'rgb(6,182,212)', // Cyan
      'Wednesday': 'rgb(20,184,166)', // Teal
      'Thursday': 'rgb(6,182,212)', // Cyan
      'Friday': 'rgb(20,184,166)', // Teal
      'Saturday': 'rgb(6,182,212)', // Cyan
      'Sunday': 'rgb(20,184,166)', // Teal
    }
  },
  
  // Shared colors for categories regardless of mode
  categoryColors: {
    'cardio': 'rgb(233,30,99)', // Pink
    'strength': 'rgb(156,39,176)', // Purple
    'mind-body': 'rgb(121,85,72)', // Brown
    'core': 'rgb(255,152,0)', // Orange
    'spinning': 'rgb(0,188,212)', // Cyan
    'swimming': 'rgb(20,184,166)', // Teal
  },
  
  // Shared colors for centers regardless of mode
  centerColors: {
    'Bootle': 'rgb(3,169,244)', // Light Blue
    'Meadows': 'rgb(76,175,80)', // Green
    'Netherton': 'rgb(255,152,0)', // Orange
    'Crosby': 'rgb(233,30,99)', // Pink
    'Dunes': 'rgb(156,39,176)', // Purple
    'Litherland': 'rgb(121,85,72)', // Brown
  },
  
  // Helper function to get the active theme colors based on mode
  getThemeColors: (isSwimmingMode) => {
    return isSwimmingMode ? COLORS.swimming : COLORS.fitness;
  },
  
  // Helper function to get day color based on mode
  getDayColor: (day, isSwimmingMode) => {
    return isSwimmingMode 
      ? COLORS.swimming.dayColors[day] 
      : COLORS.fitness.dayColors[day];
  }
}; 