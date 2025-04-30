/**
 * Types for the Excel Formatter module
 */

// Format section types
export type FormatConditionOperator = '>' | '>=' | '<' | '<=' | '=' | '<>' | undefined;

export interface FormatCondition {
  operator: FormatConditionOperator;
  value: number;
}

export interface FormatColor {
  color: string; // Named color or hex color
  isHex: boolean;
}

export interface FormatSection {
  condition?: FormatCondition;
  color?: FormatColor;
  prefix?: string;
  suffix?: string;
  format: string; // The actual number format
  isDefault?: boolean; // Whether this is the default section (no condition)
}

export interface ParsedExcelFormat {
  sections: FormatSection[];
}

// Formatter options
export interface ExcelFormatterOptions {
  locale?: string;
  currency?: string;
  defaultDecimalPlaces?: number;
}

// Format value params
export interface FormatValueParams {
  value: any;
  row?: any;
  column?: any;
  field?: string;
  [key: string]: any;
}

// Formatter result
export interface FormatterResult {
  text: string;
  color?: string;
  backgroundColor?: string;
  styles?: Record<string, string>;
}
