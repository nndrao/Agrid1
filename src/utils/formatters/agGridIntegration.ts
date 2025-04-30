/**
 * AG-Grid Integration
 * Utilities for integrating the Excel formatter with AG-Grid
 */

import { createExcelFormatter, formatExcelValue } from './excelFormatter';
import { ExcelFormatterOptions, FormatterResult } from './types';

/**
 * Create an AG-Grid cell renderer function for a specific Excel format
 */
export function createAgGridCellRenderer(
  formatString: string, 
  options: ExcelFormatterOptions = {}
) {
  // Create a formatter function
  const formatter = createExcelFormatter(formatString, options);
  
  // Return a cell renderer function
  return (params: any) => {
    // Skip formatting if value is null/undefined/empty
    if (params.value === null || params.value === undefined || params.value === '') {
      return '';
    }
    
    try {
      // Format the value
      const result = formatter({
        value: params.value,
        row: params.data,
        column: params.colDef,
        field: params.colDef?.field
      });
      
      // Apply color if specified
      if (result.color) {
        return `<span style="color: ${result.color}">${result.text}</span>`;
      }
      
      return result.text;
    } catch (error) {
      console.error('Error formatting cell value:', error);
      return params.value;
    }
  };
}

/**
 * Create an AG-Grid cell style function for a specific Excel format
 */
export function createAgGridCellStyleFunction(
  formatString: string, 
  options: ExcelFormatterOptions = {}
) {
  // Create a formatter function
  const formatter = createExcelFormatter(formatString, options);
  
  // Return a cell style function
  return (params: any) => {
    // Skip styling if value is null/undefined/empty
    if (params.value === null || params.value === undefined || params.value === '') {
      return {};
    }
    
    try {
      // Format the value
      const result = formatter({
        value: params.value,
        row: params.data,
        column: params.colDef,
        field: params.colDef?.field
      });
      
      // Return styles
      const styles: Record<string, string> = {};
      
      if (result.color) {
        styles.color = result.color;
      }
      
      if (result.backgroundColor) {
        styles.backgroundColor = result.backgroundColor;
      }
      
      return styles;
    } catch (error) {
      console.error('Error applying cell style:', error);
      return {};
    }
  };
}

/**
 * Create both a cell renderer and a cell style function for a specific Excel format
 */
export function createAgGridFormatters(
  formatString: string, 
  options: ExcelFormatterOptions = {}
) {
  return {
    cellRenderer: createAgGridCellRenderer(formatString, options),
    cellStyle: createAgGridCellStyleFunction(formatString, options)
  };
}
