// Formatting Management module for the grid store
import { StateCreator } from 'zustand';
import { GridStoreState, FormatterOptions } from './types';

// Formatting management slice creator
export const createFormattingManagerSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    createFormatterFunction: (colId: string, formatterOptions: FormatterOptions) => (value: any) => string;
    applyFormattersToGrid: () => void;
    getFormatterPreviewValue: (options: FormatterOptions) => string;
    formatValue: (value: any, options: FormatterOptions) => string;
    formatNumberValue: (value: number, options: FormatterOptions) => string;
    formatDateValue: (date: Date | string, format: string) => string;
    formatPercentValue: (value: number, decimals: number) => string;
    getCurrencySymbol: (currencyCode?: string) => string;
    formatCurrencyValue: (value: number, options: FormatterOptions) => string;
    formatExcelStyleValue: (value: any, format: string) => string;
    registerCustomFormatter: (name: string, formatter: (value: any) => string) => void;
    getRegisteredCustomFormatters: () => Record<string, (value: any) => string>;
  }
> = (set, get) => ({
  createFormatterFunction: (colId, formatterOptions) => {
    return (value: any) => get().formatValue(value, formatterOptions);
  },

  applyFormattersToGrid: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to apply formatters');
      return;
    }
    
    try {
      // In AG Grid 33+, column methods are directly on the grid API
      const columns = gridApi.getColumns();
      
      // Apply formatters to each column
      columns.forEach(column => {
        const colId = column.getColId();
        const columnState = get().getColumnState(colId);
        
        if (columnState && columnState.formatter && columnState.formatter.formatterType !== 'None') {
          get().updateColumnDefinitionFromState(colId);
        }
      });
      
      // Refresh the grid
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error applying formatters to grid:', error);
    }
  },

  getFormatterPreviewValue: (options) => {
    const formatterType = options.formatterType;
    let previewValue;
    
    switch (formatterType) {
      case 'Number':
        previewValue = 12345.678;
        break;
      case 'Percent':
        previewValue = 0.4567;
        break;
      case 'Currency':
        previewValue = 12345.67;
        break;
      case 'Date':
        previewValue = new Date();
        break;
      case 'Custom':
        previewValue = 'Custom';
        break;
      case 'Excel':
        previewValue = 12345.678;
        break;
      default:
        previewValue = 'Sample Text';
        break;
    }
    
    return get().formatValue(previewValue, options);
  },

  formatValue: (value, options) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const formatterType = options.formatterType;
    
    switch (formatterType) {
      case 'Number':
        // Ensure value is a number
        const numberValue = typeof value === 'number' ? value : Number(value);
        if (isNaN(numberValue)) return value.toString();
        return get().formatNumberValue(numberValue, options);
        
      case 'Percent':
        // Ensure value is a number
        const percentValue = typeof value === 'number' ? value : Number(value);
        if (isNaN(percentValue)) return value.toString();
        return get().formatPercentValue(percentValue, options.percentDecimals || 2);
        
      case 'Currency':
        // Ensure value is a number
        const currencyValue = typeof value === 'number' ? value : Number(value);
        if (isNaN(currencyValue)) return value.toString();
        return get().formatCurrencyValue(currencyValue, options);
        
      case 'Date':
        return get().formatDateValue(value, options.dateFormat || 'MM/dd/yyyy');
        
      case 'Excel':
        return get().formatExcelStyleValue(value, options.customFormat || '');
        
      case 'Custom':
        // Use custom formatter function if available
        const customFormatters = get().getRegisteredCustomFormatters();
        if (options.customFormat && customFormatters[options.customFormat]) {
          return customFormatters[options.customFormat](value);
        }
        return value.toString();
        
      default:
        return value.toString();
    }
  },

  formatNumberValue: (value, options) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return value.toString();
    }
    
    try {
      const decimalPlaces = options.decimalPlaces !== undefined ? options.decimalPlaces : 2;
      const useThousandSeparator = options.useThousandSeparator !== undefined ? options.useThousandSeparator : true;
      
      // Format with specified decimal places
      let formatted = value.toFixed(decimalPlaces);
      
      // Add thousand separators if requested
      if (useThousandSeparator) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      
      return formatted;
    } catch (error) {
      console.error('Error formatting number value:', error);
      return value.toString();
    }
  },

  formatDateValue: (date, format) => {
    if (!date) return '';
    
    try {
      // Parse string to Date if necessary
      let dateObj = date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      }
      
      // Check if we have a valid date
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return date.toString();
      }
      
      // Format the date according to the specified format
      // This is a simple date formatter, you might want to use a library like date-fns or moment.js
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const seconds = dateObj.getSeconds();
      
      // Pad single digits with leading zeros
      const pad = (num) => num.toString().padStart(2, '0');
      
      // Replace format tokens with actual values
      let formatted = format
        .replace(/yyyy/g, year.toString())
        .replace(/MM/g, pad(month))
        .replace(/dd/g, pad(day))
        .replace(/HH/g, pad(hours))
        .replace(/mm/g, pad(minutes))
        .replace(/ss/g, pad(seconds));
      
      return formatted;
    } catch (error) {
      console.error('Error formatting date value:', error);
      return date.toString();
    }
  },

  formatPercentValue: (value, decimals = 2) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return value.toString();
    }
    
    try {
      // Convert to percentage (multiply by 100) and format with specified decimal places
      const percentValue = value * 100;
      const formatted = percentValue.toFixed(decimals) + '%';
      
      return formatted;
    } catch (error) {
      console.error('Error formatting percent value:', error);
      return value.toString();
    }
  },

  getCurrencySymbol: (currencyCode) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      // Add more currency symbols as needed
    };
    
    return symbols[currencyCode] || currencyCode || '$';
  },

  formatCurrencyValue: (value, options) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return value.toString();
    }
    
    try {
      const symbol = options.currencySymbol || get().getCurrencySymbol();
      const decimalPlaces = options.decimalPlaces !== undefined ? options.decimalPlaces : 2;
      const useThousandSeparator = options.useThousandSeparator !== undefined ? options.useThousandSeparator : true;
      
      // Format with specified decimal places
      let formatted = value.toFixed(decimalPlaces);
      
      // Add thousand separators if requested
      if (useThousandSeparator) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      
      // Add currency symbol
      formatted = symbol + formatted;
      
      return formatted;
    } catch (error) {
      console.error('Error formatting currency value:', error);
      return value.toString();
    }
  },

  formatExcelStyleValue: (value, format) => {
    if (!format) return value.toString();
    
    try {
      // Simple Excel-style number formatting
      if (typeof value === 'number') {
        // Handle different Excel number formats
        if (format.includes('#,##0')) {
          // Format with thousand separators
          const decimalPlaces = (format.match(/\.0+/) || [''])[0].length - 1;
          const formatted = value.toFixed(decimalPlaces >= 0 ? decimalPlaces : 0);
          
          const parts = formatted.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          return parts.join('.');
        } else if (format.includes('0.00')) {
          // Format with fixed decimal places
          const decimalPlaces = (format.match(/\.0+/) || [''])[0].length - 1;
          return value.toFixed(decimalPlaces >= 0 ? decimalPlaces : 0);
        } else if (format.includes('0%')) {
          // Percentage format
          const percentValue = value * 100;
          const decimalPlaces = (format.match(/\.0+/) || [''])[0].length - 1;
          return percentValue.toFixed(decimalPlaces >= 0 ? decimalPlaces : 0) + '%';
        } else if (format.includes('$')) {
          // Currency format
          const decimalPlaces = (format.match(/\.0+/) || [''])[0].length - 1;
          const formatted = value.toFixed(decimalPlaces >= 0 ? decimalPlaces : 2);
          
          const parts = formatted.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          return '$' + parts.join('.');
        }
      } else if (value instanceof Date || (typeof value === 'string' && !isNaN(new Date(value).getTime()))) {
        // Date formatting
        const dateObj = value instanceof Date ? value : new Date(value);
        
        // Map Excel date formats to our format strings
        if (format.includes('mm/dd/yyyy')) {
          return get().formatDateValue(dateObj, 'MM/dd/yyyy');
        } else if (format.includes('yyyy-mm-dd')) {
          return get().formatDateValue(dateObj, 'yyyy-MM-dd');
        } else if (format.includes('dd/mm/yyyy')) {
          return get().formatDateValue(dateObj, 'dd/MM/yyyy');
        } else if (format.includes('mm/dd/yy')) {
          const formatted = get().formatDateValue(dateObj, 'MM/dd/yy');
          return formatted.replace(/yyyy/g, formatted.substr(2, 2));
        }
      }
      
      // If no specific format matched, return value as string
      return value.toString();
    } catch (error) {
      console.error('Error formatting Excel-style value:', error);
      return value.toString();
    }
  },

  registerCustomFormatter: (name, formatter) => {
    set(state => ({
      customFormatters: {
        ...state.customFormatters,
        [name]: formatter
      }
    }));
  },

  getRegisteredCustomFormatters: () => {
    return get().customFormatters || {};
  }
});