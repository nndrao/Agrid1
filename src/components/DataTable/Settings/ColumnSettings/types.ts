import { ColDef } from 'ag-grid-community';

export interface ColumnSettingsProps {
  column: ColDef;
  onColumnChange: (column: ColDef) => void;
}

export interface FormattingSettings {
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  text?: {
    case?: 'upper' | 'lower' | 'title';
    maxLength?: number;
    trim?: boolean;
  };
  number?: {
    decimalPlaces?: number;
    thousandSeparator?: boolean;
  };
  date?: {
    format?: string;
  };
  boolean?: {
    display?: 'true/false' | 'yes/no' | '✓/✗';
  };
  currency?: {
    symbol?: string;
    decimalPlaces?: number;
    thousandSeparator?: boolean;
  };
  percentage?: {
    decimalPlaces?: number;
  };
}

export interface StyleSettings {
  header?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
  };
  cell?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
}

export interface FilterSettings {
  enabled: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean';
  options?: {
    caseSensitive?: boolean;
    includeBlanks?: boolean;
    filterType?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
  };
}

export interface ComponentSettings {
  cellRenderer?: string;
  cellEditor?: string;
  headerComponent?: string;
  filterComponent?: string;
} 