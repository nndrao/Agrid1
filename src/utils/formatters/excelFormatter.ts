/**
 * Excel Formatter
 * Formats values according to Excel-style format strings
 */

import { parseExcelFormat, matchesCondition } from './formatParser';
import { formatNumber, cleanCurrencySymbol } from './numberFormatter';
import { 
  FormatValueParams, 
  ExcelFormatterOptions, 
  FormatterResult,
  ParsedExcelFormat,
  FormatSection
} from './types';

/**
 * Format a value according to an Excel-style format string
 */
export function formatExcelValue(
  params: FormatValueParams, 
  formatString: string, 
  options: ExcelFormatterOptions = {}
): FormatterResult {
  // Parse the format string
  const parsedFormat = parseExcelFormat(formatString);
  
  // Get the value to format
  const value = params.value;
  
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return { text: '' };
  }
  
  // For numeric values
  if (typeof value === 'number' || !isNaN(Number(value))) {
    return formatNumericValue(Number(value), parsedFormat, options);
  }
  
  // For date values
  if (value instanceof Date || !isNaN(new Date(value).getTime())) {
    return formatDateValue(value instanceof Date ? value : new Date(value), parsedFormat);
  }
  
  // For string values (default)
  return formatStringValue(String(value), parsedFormat);
}

/**
 * Format a numeric value
 */
function formatNumericValue(
  value: number, 
  parsedFormat: ParsedExcelFormat, 
  options: ExcelFormatterOptions
): FormatterResult {
  // Find the matching format section
  const section = findMatchingFormatSection(value, parsedFormat.sections);
  
  if (!section) {
    // If no section matches, use a default format
    return { text: value.toString() };
  }
  
  // Format the number according to the section's format
  let formattedValue = formatNumber(value, section.format, {
    locale: options.locale,
    currency: options.currency,
    decimalPlaces: options.defaultDecimalPlaces
  });
  
  // If the format includes a currency symbol and we have a prefix/suffix,
  // we need to clean the currency symbol from the formatted value
  if (section.format.includes('$') && (section.prefix || section.suffix)) {
    formattedValue = cleanCurrencySymbol(formattedValue, options.currency === 'USD' ? '$' : undefined);
  }
  
  // Add prefix and suffix
  const text = `${section.prefix || ''}${formattedValue}${section.suffix || ''}`;
  
  // Return the formatted value with color if specified
  if (section.color) {
    return {
      text,
      color: section.color.color
    };
  }
  
  return { text };
}

/**
 * Format a date value
 */
function formatDateValue(value: Date, parsedFormat: ParsedExcelFormat): FormatterResult {
  // Use the first section for dates (ignoring conditions for now)
  const section = parsedFormat.sections[0];
  
  // Format the date using Intl.DateTimeFormat
  // This is a simplified implementation - could be expanded for more Excel date formats
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(value);
  
  // Add prefix and suffix
  const text = `${section.prefix || ''}${formattedDate}${section.suffix || ''}`;
  
  // Return the formatted value with color if specified
  if (section.color) {
    return {
      text,
      color: section.color.color
    };
  }
  
  return { text };
}

/**
 * Format a string value
 */
function formatStringValue(value: string, parsedFormat: ParsedExcelFormat): FormatterResult {
  // Use the first section for strings (ignoring conditions for now)
  const section = parsedFormat.sections[0];
  
  // Add prefix and suffix
  const text = `${section.prefix || ''}${value}${section.suffix || ''}`;
  
  // Return the formatted value with color if specified
  if (section.color) {
    return {
      text,
      color: section.color.color
    };
  }
  
  return { text };
}

/**
 * Find the matching format section for a value
 */
function findMatchingFormatSection(value: number, sections: FormatSection[]): FormatSection | null {
  // If there's only one section, use it regardless of conditions
  if (sections.length === 1) {
    return sections[0];
  }
  
  // Check each section in order
  for (const section of sections) {
    // If this section has a condition, check if the value matches
    if (section.condition) {
      if (matchesCondition(value, section.condition)) {
        return section;
      }
    } else if (section.isDefault) {
      // This is a default section (no condition)
      return section;
    }
  }
  
  // If no section matches and there's no default section,
  // use the last section as a fallback
  return sections[sections.length - 1];
}

/**
 * Create a formatter function for a specific format string
 */
export function createExcelFormatter(
  formatString: string, 
  options: ExcelFormatterOptions = {}
): (params: FormatValueParams) => FormatterResult {
  // Parse the format string once
  const parsedFormat = parseExcelFormat(formatString);
  
  // Return a formatter function
  return (params: FormatValueParams): FormatterResult => {
    // Get the value to format
    const value = params.value;
    
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return { text: '' };
    }
    
    // For numeric values
    if (typeof value === 'number' || !isNaN(Number(value))) {
      return formatNumericValue(Number(value), parsedFormat, options);
    }
    
    // For date values
    if (value instanceof Date || !isNaN(new Date(value).getTime())) {
      return formatDateValue(value instanceof Date ? value : new Date(value), parsedFormat);
    }
    
    // For string values (default)
    return formatStringValue(String(value), parsedFormat);
  };
}
