// Utility functions shared across store modules

// Deep clone helper for complex objects
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Failed to deep clone object:', error);
    return obj;
  }
}

// Generate a unique ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

// Helper function to format dates according to a format string
// Used by the formatter feature
export function formatDate(date: Date, format: string): string {
  // Helper function to pad numbers with leading zeros
  function pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Month names for formatting
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Replace format patterns
  return format
    .replace('YYYY', year.toString())
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds))
    .replace('MMM', monthNames[month - 1]);
}

// Helper function to debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Helper function to apply standard Excel formatting to a value
export const handleStandardExcelFormat = (params: { value: any }, formatter: any): string => {
  const customFormat = formatter.customFormat || '';

  // For numeric values, apply numeric formatting
  if (typeof params.value === 'number' || !isNaN(Number(params.value))) {
    const numValue = Number(params.value);

    // Handle basic Excel numeric formats
    if (customFormat.includes('#') || customFormat.includes('0')) {
      // Extract format sections (positive;negative;zero;text)
      const sections = customFormat.split(';');
      let formatToUse = sections[0]; // Default to positive format

      // Select appropriate section based on value
      if (numValue < 0 && sections.length > 1) {
        formatToUse = sections[1]; // Negative format
      } else if (numValue === 0 && sections.length > 2) {
        formatToUse = sections[2]; // Zero format
      }

      // Apply the formatting
      let result = formatToUse;
      const absValue = Math.abs(numValue);

      // Handle decimal part
      const hasDecimal = formatToUse.includes('.');
      if (hasDecimal) {
        const parts = formatToUse.split('.');
        const integerFormat = parts[0];
        const decimalFormat = parts[1] || '';

        // Format integer part
        const integerValue = Math.floor(absValue);
        let integerResult = integerValue.toString();

        // Add thousands separators if format includes commas
        if (integerFormat.includes(',')) {
          integerResult = new Intl.NumberFormat(undefined, {
            useGrouping: true,
            maximumFractionDigits: 0
          }).format(integerValue);
        }

        // Format decimal part
        let decimalResult = '';
        if (decimalFormat) {
          // Count the number of decimal digits required
          const decimalDigits = (decimalFormat.match(/[0#]/g) || []).length;

          // Format the decimal part with exact precision
          const decimalValue = absValue - integerValue;
          const scaledDecimal = Math.round(decimalValue * Math.pow(10, decimalDigits));
          const scaledDecimalStr = scaledDecimal.toString().padStart(decimalDigits, '0');

          // Handle trailing zeros based on format (0 shows zeros, # omits them)
          let formattedDecimal = '';
          for (let i = 0; i < decimalDigits; i++) {
            const digit = i < scaledDecimalStr.length ? scaledDecimalStr[i] : '0';
            const formatChar = i < decimalFormat.length ? decimalFormat[i] : '#';

            // If the format char is '0', always show the digit
            // If it's '#', only show non-zero digits
            if (formatChar === '0' || (formatChar === '#' && digit !== '0')) {
              formattedDecimal += digit;
            } else if (formatChar === '#' && digit === '0') {
              // Skip trailing zeros for # format
              if (formattedDecimal.length > 0) {
                formattedDecimal += digit;
              }
            } else {
              // For other characters in the format (not # or 0), preserve them
              formattedDecimal += formatChar;
            }
          }

          decimalResult = formattedDecimal;
        }

        // Combine parts - only add decimal point if there's a decimal part
        result = integerResult + (decimalResult ? '.' + decimalResult : '');
      } else {
        // No decimal part
        result = absValue.toString();

        // Add thousands separators if format includes commas
        if (formatToUse.includes(',')) {
          result = new Intl.NumberFormat(undefined, {
            useGrouping: true,
            maximumFractionDigits: 0
          }).format(absValue);
        }

        // Replace in the format - use regex to match the numeric part
        const numericPartRegex = /[#0,]+/;
        return formatToUse.replace(numericPartRegex, result);
      }
    }

    // Handle percent format
    if (customFormat.includes('%')) {
      const percentValue = numValue * 100;
      const decimalPlaces = (customFormat.match(/\.0+%/) || [''])[0].length - 2;
      return percentValue.toFixed(decimalPlaces >= 0 ? decimalPlaces : 0) + '%';
    }

    // Handle currency format like $#,##0.00
    if (customFormat.includes('$')) {
      const currencySymbol = '$';
      const hasCommas = customFormat.includes(',');
      const decimalPlaces = (customFormat.match(/\.0+/) || [''])[0].length - 1;

      return currencySymbol + new Intl.NumberFormat(undefined, {
        useGrouping: hasCommas,
        minimumFractionDigits: decimalPlaces >= 0 ? decimalPlaces : 0,
        maximumFractionDigits: decimalPlaces >= 0 ? decimalPlaces : 0
      }).format(numValue);
    }

    // Fall back to simple value replacement if no Excel formatting matched
    return customFormat.replace('{value}', numValue.toString());
  }

  // For date values
  if (params.value instanceof Date || !isNaN(new Date(params.value).getTime())) {
    const dateValue = params.value instanceof Date ? params.value : new Date(params.value);

    // Replace Excel date format codes with our format patterns
    let format = customFormat
      .replace('mm', 'MM')     // minutes in Excel, month in our formatter
      .replace('yyyy', 'YYYY') // 4-digit year
      .replace('yy', 'YY')     // 2-digit year
      .replace('dd', 'DD')     // day
      .replace('hh', 'HH')     // hour
      .replace('ss', 'ss');    // seconds

    return formatDate(dateValue, format);
  }

  // Default case - simple replacement for string values
  return customFormat.replace('{value}', String(params.value));
};

// Apply Excel format to a cell value
export const applyExcelFormat = (params: { value: any }, formatter: any): string => {
  // Get the custom format
  const customFormat = formatter.customFormat || '';

  // Handle complex formats first with custom logic
  // Then fall back to standard formats for simpler cases

  // Handle special Excel format types

  // 1. Handle conditional formatting with [condition]?[format]:[else_format]
  // Example: [>100]"Large":"Small"
  const conditionalRegex = /\[(>|>=|<|<=|=|<>)(-?\d+(\.\d+)?)\](.*):(.*)/;
  const conditionalMatch = customFormat.match(conditionalRegex);

  if (conditionalMatch) {
    const operator = conditionalMatch[1];
    const compareValue = parseFloat(conditionalMatch[2]);
    const trueFormat = conditionalMatch[4];
    const falseFormat = conditionalMatch[5];

    // Get numeric value to compare
    let valueToCompare = 0;
    if (typeof params.value === 'number') {
      valueToCompare = params.value;
    } else if (typeof params.value === 'string' && !isNaN(parseFloat(params.value))) {
      valueToCompare = parseFloat(params.value);
    }

    // Perform comparison and apply appropriate format
    let conditionMet = false;
    switch (operator) {
      case '>': conditionMet = valueToCompare > compareValue; break;
      case '>=': conditionMet = valueToCompare >= compareValue; break;
      case '<': conditionMet = valueToCompare < compareValue; break;
      case '<=': conditionMet = valueToCompare <= compareValue; break;
      case '=': conditionMet = valueToCompare === compareValue; break;
      case '<>': conditionMet = valueToCompare !== compareValue; break;
    }

    // Apply the appropriate format based on condition
    const formatToUse = conditionMet ? trueFormat : falseFormat;

    // Handle quoted strings vs. nested formats
    if (formatToUse.startsWith('"') && formatToUse.endsWith('"')) {
      // It's a literal string
      return formatToUse.substring(1, formatToUse.length - 1);
    } else {
      // It's another format to apply - recursive call with new format
      const nestedFormatter = { ...formatter, customFormat: formatToUse };
      return applyExcelFormat(params, nestedFormatter);
    }
  }

  // 2. Handle switch/case formatting with [value1]format1;[value2]format2;...;[default]
  // Example: [1]"One";[2]"Two";[3]"Three";"Other"
  const switchRegex = /^\[(.+?)\](.+?)(?:;|$)/;
  if (customFormat.includes(';') && switchRegex.test(customFormat)) {
    const cases: Array<{value: string, format: string}> = [];
    let remainingFormat = customFormat;
    let defaultCase = '';

    // Parse all cases
    while (remainingFormat && switchRegex.test(remainingFormat)) {
      const match = remainingFormat.match(switchRegex);
      if (match) {
        const caseValue = match[1];
        const caseFormat = match[2];
        cases.push({ value: caseValue, format: caseFormat });
        remainingFormat = remainingFormat.substring(match[0].length);

        // Check if there's a semicolon at the start and remove it
        if (remainingFormat.startsWith(';')) {
          remainingFormat = remainingFormat.substring(1);
        }
      } else {
        break;
      }
    }

    // If there's anything left, it's the default case
    if (remainingFormat && !switchRegex.test(remainingFormat)) {
      defaultCase = remainingFormat;
    }

    // Convert the value to string for comparison
    const valueStr = params.value?.toString() || '';

    // Find matching case
    let matchedFormat = null;
    for (const caseItem of cases) {
      if (caseItem.value === valueStr) {
        matchedFormat = caseItem.format;
        break;
      }
    }

    // Use default if no match found
    const formatToUse = matchedFormat || defaultCase;

    // Handle quoted strings vs. nested formats
    if (formatToUse.startsWith('"') && formatToUse.endsWith('"')) {
      // It's a literal string
      return formatToUse.substring(1, formatToUse.length - 1);
    } else {
      // It's another format to apply - recursive call
      const nestedFormatter = { ...formatter, customFormat: formatToUse };
      return applyExcelFormat(params, nestedFormatter);
    }
  }

  // 3. Handle color formatting with [color] prefix
  // Example: [Red]0.00;[Blue]-0.00;[Green]0.00
  // Also supports hex colors like [#FF5500]0.00
  const colorRegex = /^\[(Red|Green|Blue|Yellow|Cyan|Magenta|Black|White|Gray|Orange|Purple|Brown|#[0-9A-Fa-f]{3,6})\](.*)/i;
  const colorMatch = customFormat.match(colorRegex);

  if (colorMatch) {
    // Extract the format without the color
    const formatWithoutColor = colorMatch[2];

    // Apply the format without the color
    const nestedFormatter = { ...formatter, customFormat: formatWithoutColor };
    return applyExcelFormat(params, nestedFormatter);
  }

  // For all other cases, use the standard Excel formatting logic
  return handleStandardExcelFormat(params, formatter);
};

// High-specificity CSS selector creator
export function createHighSpecificitySelector(columnField: string, type: 'header' | 'cell'): string {
  if (type === 'header') {
    return `.ag-header-cell[col-id="${columnField}"] .ag-header-cell-label`;
  } else {
    return `.ag-row .ag-cell[col-id="${columnField}"]`;
  }
}

// Create a style element for specific column styling
export function createStyleElement(id: string): HTMLStyleElement {
  // Remove any existing element with this ID
  const existingElement = document.getElementById(id) as HTMLStyleElement;
  if (existingElement) {
    existingElement.parentNode?.removeChild(existingElement);
  }
  
  // Create a new style element
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.type = 'text/css';
  document.head.appendChild(styleElement);
  
  return styleElement;
}

// Generate CSS rules from style object
export function generateCSSFromStyle(
  selector: string,
  style: Record<string, any>
): string {
  // Skip if style is empty
  if (!style || Object.keys(style).length === 0) {
    return '';
  }
  
  let cssText = `${selector} {\n`;
  
  // Map style object properties to CSS properties
  for (const [key, value] of Object.entries(style)) {
    if (value) {
      // Convert camelCase to kebab-case for CSS properties
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssText += `  ${cssKey}: ${value};\n`;
    }
  }
  
  cssText += '}\n';
  return cssText;
}

// Convert style definition to CSS styles object
export function styleDefToCSS(style: any, applyOptions: any = {}): Record<string, string> {
  if (!style) return {};

  const result: Record<string, string> = {};
  
  // Apply text color if specified and allowed
  if (applyOptions.applyTextColor !== false && style.textColor) {
    result.color = style.textColor;
  }
  
  // Apply background color if specified and allowed
  if (applyOptions.applyBackgroundColor !== false && style.backgroundColor) {
    result.backgroundColor = style.backgroundColor;
  }
  
  // Apply font styles
  if (style.fontFamily) result.fontFamily = style.fontFamily;
  if (style.fontSize) result.fontSize = `${style.fontSize}px`;
  if (style.bold) result.fontWeight = 'bold';
  if (style.italic) result.fontStyle = 'italic';
  if (style.underline) result.textDecoration = 'underline';
  
  // Apply alignment
  if (style.alignH) result.textAlign = style.alignH;
  
  // Apply border if specified and allowed
  if (applyOptions.applyBorder !== false && 
      style.borderColor && 
      style.borderStyle && 
      style.borderWidth) {
    const borderStyle = `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}`;
    
    if (style.borderSides === 'All') {
      result.border = borderStyle;
    } else if (style.borderSides === 'Top') {
      result.borderTop = borderStyle;
    } else if (style.borderSides === 'Right') {
      result.borderRight = borderStyle;
    } else if (style.borderSides === 'Bottom') {
      result.borderBottom = borderStyle;
    } else if (style.borderSides === 'Left') {
      result.borderLeft = borderStyle;
    } else if (style.borderSides === 'TopBottom') {
      result.borderTop = borderStyle;
      result.borderBottom = borderStyle;
    } else if (style.borderSides === 'LeftRight') {
      result.borderLeft = borderStyle;
      result.borderRight = borderStyle;
    }
  }
  
  return result;
}