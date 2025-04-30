/**
 * Formatter Integration with GridStore
 * 
 * This module provides integration between the Excel formatter and the GridStore.
 */

import { createExcelFormatter, formatExcelValue, createAgGridCellRenderer } from '@/utils/formatters';
import { FormatterSettings } from '../gridStore';

/**
 * Create a formatter function for a column based on formatter settings
 */
export function createFormatterFromSettings(
  colId: string,
  formatterSettings: FormatterSettings
): (params: any) => string {
  // If no formatter type or set to None, return null
  if (!formatterSettings || formatterSettings.formatterType === 'None') {
    return (params) => params.value;
  }
  
  // Handle different formatter types
  switch (formatterSettings.formatterType) {
    case 'Number':
      // Create a number format string
      const decimalPlaces = formatterSettings.decimalPlaces || 2;
      const useThousandsSeparator = formatterSettings.useThousandsSeparator !== false;
      
      const formatString = useThousandsSeparator
        ? `#,##0.${'0'.repeat(decimalPlaces)}`
        : `0.${'0'.repeat(decimalPlaces)}`;
      
      // Create and return the formatter
      return createAgGridCellRenderer(formatString);
      
    case 'Currency':
      // Create a currency format string
      const currencyDecimalPlaces = formatterSettings.decimalPlaces || 2;
      const currencyUseThousandsSeparator = formatterSettings.useThousandsSeparator !== false;
      const currencySymbol = formatterSettings.currencySymbol || '$';
      const symbolPosition = formatterSettings.symbolPosition || 'before';
      
      const currencyFormatString = currencyUseThousandsSeparator
        ? `#,##0.${'0'.repeat(currencyDecimalPlaces)}`
        : `0.${'0'.repeat(currencyDecimalPlaces)}`;
      
      const fullCurrencyFormat = symbolPosition === 'before'
        ? `"${currencySymbol}"${currencyFormatString}`
        : `${currencyFormatString}"${currencySymbol}"`;
      
      // Create and return the formatter
      return createAgGridCellRenderer(fullCurrencyFormat);
      
    case 'Percent':
      // Create a percent format string
      const percentDecimalPlaces = formatterSettings.percentDecimals || 2;
      
      const percentFormatString = `0.${'0'.repeat(percentDecimalPlaces)}%`;
      
      // Create and return the formatter
      return createAgGridCellRenderer(percentFormatString);
      
    case 'Date':
      // Create a date format string (simplified)
      const dateFormat = formatterSettings.dateFormat || 'MM/dd/yyyy';
      
      // Create and return the formatter
      return (params) => {
        if (!params.value) return '';
        
        try {
          const date = params.value instanceof Date 
            ? params.value 
            : new Date(params.value);
            
          return new Intl.DateTimeFormat('en-US').format(date);
        } catch (error) {
          console.error('Error formatting date:', error);
          return String(params.value);
        }
      };
      
    case 'Custom':
      // Use the custom format string directly
      const customFormat = formatterSettings.customFormat || '';
      
      if (!customFormat) {
        return (params) => String(params.value || '');
      }
      
      // Create and return the formatter
      return createAgGridCellRenderer(customFormat);
      
    default:
      // Default formatter just returns the value as a string
      return (params) => String(params.value || '');
  }
}

/**
 * Apply a formatter to a column definition
 */
export function applyFormatterToColDef(
  colDef: any,
  formatterSettings: FormatterSettings
): void {
  // If no formatter type or set to None, do nothing
  if (!formatterSettings || formatterSettings.formatterType === 'None') {
    return;
  }
  
  // Get the column ID
  const colId = colDef.field || colDef.colId;
  
  if (!colId) {
    console.warn('Cannot apply formatter to column without ID');
    return;
  }
  
  // Create the formatter function
  const formatter = createFormatterFromSettings(colId, formatterSettings);
  
  // Apply the formatter to the column definition
  colDef.cellRenderer = formatter;
}
