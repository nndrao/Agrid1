/**
 * Formatter utilities for Excel-like conditional formatting
 */

// Color mapping for named colors
export const colorMapping: Record<string, string> = {
  'red': '#ff0000',
  'green': '#008000',
  'blue': '#0000ff',
  'yellow': '#ffff00',
  'cyan': '#00ffff',
  'magenta': '#ff00ff',
  'black': '#000000',
  'white': '#ffffff',
  'gray': '#808080',
  'orange': '#ffa500',
  'purple': '#800080',
  'brown': '#a52a2a'
};

/**
 * Extract a color from a format string if it starts with a color name in square brackets
 */
export function getColorFromFormat(format: string): string | null {
  const colorMatch = format.match(/^\[(Red|Green|Blue|Yellow|Cyan|Magenta|Black|White|Gray|Orange|Purple|Brown|#[0-9A-Fa-f]{3,6})\]/i);
  if (colorMatch) {
    const colorName = colorMatch[1].toLowerCase();
    if (colorName.startsWith('#')) {
      return colorName;
    } else {
      return colorMapping[colorName] || colorName;
    }
  }
  return null;
}

/**
 * Find a conditional format pattern in a string and check if the condition is met
 */
export function getConditionalColor(format: string, value: any): string | null {
  if (typeof value !== 'number' && isNaN(Number(value))) {
    return null;
  }

  const numValue = Number(value);
  
  // We'll use multiple regex executions instead of matchAll for compatibility
  const conditionalRegex = /\[(>|>=|<|<=|=|<>)(-?\d+(\.\d+)?)\]\[(Red|Green|Blue|Yellow|Cyan|Magenta|Black|White|Gray|Orange|Purple|Brown|#[0-9A-Fa-f]{3,6})\]/gi;
  
  let match;
  while ((match = conditionalRegex.exec(format)) !== null) {
    const operator = match[1];
    const compareValue = parseFloat(match[2]);
    const colorName = match[4].toLowerCase();
    
    // Check condition
    let conditionMet = false;
    switch (operator) {
      case '>': conditionMet = numValue > compareValue; break;
      case '>=': conditionMet = numValue >= compareValue; break;
      case '<': conditionMet = numValue < compareValue; break;
      case '<=': conditionMet = numValue <= compareValue; break;
      case '=': conditionMet = numValue === compareValue; break;
      case '<>': conditionMet = numValue !== compareValue; break;
    }
    
    if (conditionMet) {
      // Apply color if condition is met
      if (colorName.startsWith('#')) {
        return colorName;
      } else {
        return colorMapping[colorName] || colorName;
      }
    }
  }
  
  return null;
}

/**
 * Check if a value matches a case in switch/case format and get the color
 */
export function getSwitchCaseColor(format: string, value: any): string | null {
  const valueStr = value !== null && value !== undefined ? String(value) : '';
  
  // We'll use multiple regex executions instead of matchAll for compatibility
  const switchRegex = /\[([^\]]+)\]\[(Red|Green|Blue|Yellow|Cyan|Magenta|Black|White|Gray|Orange|Purple|Brown|#[0-9A-Fa-f]{3,6})\]/gi;
  
  let match;
  while ((match = switchRegex.exec(format)) !== null) {
    const caseValue = match[1];
    const colorName = match[2].toLowerCase();
    
    if (caseValue === valueStr) {
      // Apply color if case matches
      if (colorName.startsWith('#')) {
        return colorName;
      } else {
        return colorMapping[colorName] || colorName;
      }
    }
  }
  
  return null;
}

/**
 * Get the appropriate section from a semicolon-delimited format string
 */
export function getSectionColor(format: string, value: any): string | null {
  if (!format.includes(';')) {
    return null;
  }
  
  const sections = format.split(';');
  
  // Determine which section to use based on value
  let sectionIndex = 0;
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);
    if (numValue < 0 && sections.length > 1) {
      sectionIndex = 1; // Negative section
    } else if (numValue === 0 && sections.length > 2) {
      sectionIndex = 2; // Zero section
    }
  } else if (value !== null && value !== undefined && sections.length > 3) {
    sectionIndex = 3; // Text section
  }
  
  // Get color from the selected section
  if (sectionIndex < sections.length) {
    return getColorFromFormat(sections[sectionIndex]);
  }
  
  return null;
}

/**
 * Calculate cell text color based on Excel-like format string
 */
export function calculateCellColor(format: string, value: any): string | null {
  try {
    // 1. Check for direct color format [Red]
    const directColor = getColorFromFormat(format);
    if (directColor) {
      return directColor;
    }
    
    // 2. Check for conditional formatting [>100][Red]
    const conditionalColor = getConditionalColor(format, value);
    if (conditionalColor) {
      return conditionalColor;
    }
    
    // 3. Check for switch/case formatting [1][Red]
    const switchCaseColor = getSwitchCaseColor(format, value);
    if (switchCaseColor) {
      return switchCaseColor;
    }
    
    // 4. Check for section formatting (positive;negative;zero)
    const sectionColor = getSectionColor(format, value);
    if (sectionColor) {
      return sectionColor;
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating cell color:', error);
    return null;
  }
} 