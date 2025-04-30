/**
 * Number Formatter
 * Handles the actual formatting of numbers according to format patterns
 */

/**
 * Format a number according to a format pattern
 */
export function formatNumber(value: number, format: string, options: {
  locale?: string;
  currency?: string;
  decimalPlaces?: number;
} = {}): string {
  // Default options
  const locale = options.locale || undefined;
  const currency = options.currency || 'USD';
  const defaultDecimalPlaces = options.decimalPlaces !== undefined ? options.decimalPlaces : 2;
  
  // Handle empty or invalid format
  if (!format || format === 'General') {
    return value.toString();
  }
  
  // Handle percent format
  if (format.includes('%')) {
    const percentValue = value * 100;
    const decimalPlaces = getDecimalPlacesFromFormat(format) || defaultDecimalPlaces;
    return formatWithIntl(percentValue, {
      locale,
      style: 'percent',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  }
  
  // Handle currency format
  if (format.includes('$')) {
    const decimalPlaces = getDecimalPlacesFromFormat(format) || defaultDecimalPlaces;
    const useGrouping = format.includes(',');
    
    return formatWithIntl(value, {
      locale,
      style: 'currency',
      currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping
    });
  }
  
  // Handle standard number format
  const decimalPlaces = getDecimalPlacesFromFormat(format) || defaultDecimalPlaces;
  const useGrouping = format.includes(',');
  
  return formatWithIntl(value, {
    locale,
    style: 'decimal',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping
  });
}

/**
 * Format a number using Intl.NumberFormat
 */
function formatWithIntl(value: number, options: Intl.NumberFormatOptions & { locale?: string }): string {
  const { locale, ...formatOptions } = options;
  return new Intl.NumberFormat(locale, formatOptions).format(value);
}

/**
 * Get the number of decimal places from a format string
 */
function getDecimalPlacesFromFormat(format: string): number | null {
  // Look for decimal point followed by zeros or hashes
  const decimalMatch = format.match(/\.([0#]+)/);
  if (!decimalMatch) return null;
  
  // Count the number of digits after decimal point
  return decimalMatch[1].length;
}

/**
 * Clean a currency symbol from a formatted string
 * Useful when we want to add our own prefix/suffix
 */
export function cleanCurrencySymbol(formattedValue: string, currencySymbol = '$'): string {
  return formattedValue.replace(currencySymbol, '').trim();
}
