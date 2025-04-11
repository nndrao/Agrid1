// Column Settings Types

// Border configuration
export interface BorderConfig {
  style: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  width: number;
  color: string;
}

export interface BordersConfig {
  top: BorderConfig;
  right: BorderConfig;
  bottom: BorderConfig;
  left: BorderConfig;
}

// Font configuration
export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'medium' | 'bold';
  style: 'normal' | 'italic';
  color: string;
}

// Alignment options
export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';
export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'custom';

export interface CellAlignment {
  horizontal: HorizontalAlignment;
  vertical: VerticalAlignment;
}

// Formatter options
export interface NumericFormatOptions {
  type: 'number' | 'currency' | 'percent' | 'tick';
  decimalPlaces: number;
  thousandSeparator: boolean;
  currencySymbol?: string;
  showPlusSign?: boolean;
  compact?: boolean;
}

export interface DateFormatOptions {
  format: string; // e.g., 'MM/dd/yyyy', 'yyyy-MM-dd', etc.
  showTime: boolean;
  timeFormat?: '12h' | '24h';
}

export interface TextFormatOptions {
  case?: 'upper' | 'lower' | 'title' | 'none';
  prefix?: string;
  suffix?: string;
  trimWhitespace?: boolean;
}

export type ValueFormatter = 
  | { type: 'numeric', options: NumericFormatOptions }
  | { type: 'date', options: DateFormatOptions }
  | { type: 'text', options: TextFormatOptions }
  | { type: 'custom', format: string }; // Excel-like formula

// Condition for conditional formatting
export interface FormatCondition {
  id: string;
  type: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'empty' | 'notEmpty' | 'custom';
  value1?: any;
  value2?: any; // For 'between' condition
  customExpression?: string; // For 'custom' condition
  styles: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: string;
    fontStyle?: string;
    border?: BorderConfig;
  };
}

// Component configuration
export interface ComponentConfig {
  type: 'default' | 'dropdown' | 'checkbox' | 'date' | 'custom';
  options?: Array<{ value: string; label: string }>; // For dropdowns
  customComponent?: string; // Component name or reference
  editMode?: 'click' | 'doubleClick' | 'disabled';
}

// Filter configuration
export interface FilterConfig {
  enabled: boolean;
  type: 'text' | 'number' | 'date' | 'set' | 'custom';
  defaultValue?: any;
  customFilterComponent?: string;
}

// Main column state
export interface ColumnState {
  field: string;
  headerName: string;
  description?: string;
  
  // Visibility and position
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  lockPosition?: boolean;
  lockVisible?: boolean;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  pivot?: boolean;
  pivotIndex?: number;
  
  // Sorting and filtering
  sortable?: boolean;
  sortIndex?: number;
  sort?: 'asc' | 'desc' | null;
  filter?: boolean;
  floating?: 'left' | 'right' | null;
  
  // Categories for settings
  header?: HeaderSettings;
  formatting?: FormattingSettings;
  filter?: FilterSettings;
  style?: StyleSettings;
  components?: ComponentSettings;
  
  // Editing
  editable?: boolean;
  singleClickEdit?: boolean;
  
  // Advanced
  valueGetter?: string;
  valueSetter?: string;
  valueFormatter?: string;
  cellRenderer?: string;
  cellEditor?: string;
  
  // Value formatting
  valueFormatting?: {
    type: 'number' | 'date' | 'text';
    numberFormat?: {
      type: 'decimal' | 'integer' | 'percent' | 'currency' | 'scientific';
      decimalPlaces?: number;
      useGrouping?: boolean;
      currencySymbol?: string;
      currencyCode?: string;
      currencyDisplay?: 'symbol' | 'code' | 'name';
      notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
    };
    dateFormat?: {
      type: 'short' | 'medium' | 'long' | 'iso' | 'time' | 'datetime' | 'custom';
      locale?: string;
      customFormat?: string;
      timeZone?: string;
    };
    textFormat?: {
      type: 'default' | 'uppercase' | 'lowercase' | 'capitalize' | 'truncate';
      maxLength?: number;
      suffix?: string;
      prefix?: string;
    };
  };
  
  // Header styles
  headerStyles?: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: string;
    fontSize?: number;
    textAlign?: string;
    fontStyle?: string;
  };
  
  // Cell styles
  cellStyles?: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: string;
    fontSize?: number;
    textAlign?: string;
    fontStyle?: string;
    padding?: number;
    borderStyle?: string;
    borderWidth?: number;
    borderColor?: string;
  };
  
  // Conditional formatting
  conditionalFormatting?: ConditionalFormat[];
  
  // Filter settings
  filterSettings?: {
    type?: 'text' | 'number' | 'date' | 'set';
    defaultOption?: string;
    caseSensitive?: boolean;
    clearButton?: boolean;
    applyButton?: boolean;
    debounceMs?: number;
  };
  
  // Cell editor settings
  editorSettings?: {
    type?: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom';
    options?: Array<{ value: string | number; label: string }>;
    min?: number;
    max?: number;
    step?: number;
    dateFormat?: string;
    customEditorName?: string;
  };
  
  // Cell renderer settings
  rendererSettings?: {
    type?: 'text' | 'number' | 'date' | 'boolean' | 'button' | 'progress' | 'icon' | 'image' | 'custom';
    customRendererName?: string;
    trueValue?: string;
    falseValue?: string;
    icon?: string;
    buttonText?: string;
    buttonAction?: string;
  };
}

// Column definition for the tree view
export interface ColumnDefinition {
  id: string;
  field: string;
  headerName?: string;
  children: ColumnDefinition[];
  hidden?: boolean;
}

export interface SettingsSectionProps {
  settings: any;
  onSettingChange: (key: string, value: any) => void;
}

export interface ConditionalFormat {
  id: string;
  name?: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 
    'endsWith' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 
    'between' | 'notBetween' | 'empty' | 'notEmpty' | 'custom';
  value1?: any;
  value2?: any;
  customCondition?: string;
  styles: {
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    border?: string;
    icon?: string;
  };
}

export interface FormatOptions {
  // Number formatting
  decimals?: number;
  useThousandSeparator?: boolean;
  decimalSeparator?: string;
  thousandSeparator?: string;
  
  // Currency formatting
  currencySymbol?: string;
  currencySymbolPosition?: 'prefix' | 'suffix';
  
  // Date formatting
  dateFormat?: string;
  
  // Percentage formatting
  percentageDecimals?: number;
  percentageSymbolPosition?: 'prefix' | 'suffix';
  
  // Custom formatting
  customFormat?: string;
}

export interface CellEditorConfig {
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'custom';
  options?: string[]; // For select type
  customEditorComponent?: string;
}

export const defaultColumnState: ColumnState = {
  field: "",
  headerName: "",
  width: 150,
  minWidth: 50,
  maxWidth: 500,
  resizable: true,
  sortable: true,
  filterable: true,
  editable: false,
  pinned: null,
  hide: false,
  
  dataType: "string",
  formatOptions: {},
  
  headerFont: {
    family: "Arial",
    size: 14,
    weight: "bold",
    style: "normal",
    color: "#000000"
  },
  headerBackgroundColor: "#f9f9f9",
  headerBorders: {
    top: { style: "solid", width: 1, color: "#e0e0e0" },
    right: { style: "solid", width: 1, color: "#e0e0e0" },
    bottom: { style: "solid", width: 1, color: "#e0e0e0" },
    left: { style: "solid", width: 1, color: "#e0e0e0" }
  },
  headerAlignment: "left",
  headerVerticalAlignment: "middle",
  
  cellFont: {
    family: "Arial",
    size: 14,
    weight: "normal",
    style: "normal",
    color: "#000000"
  },
  cellBackgroundColor: "#ffffff",
  cellBorders: {
    top: { style: "solid", width: 1, color: "#e0e0e0" },
    right: { style: "solid", width: 1, color: "#e0e0e0" },
    bottom: { style: "solid", width: 1, color: "#e0e0e0" },
    left: { style: "solid", width: 1, color: "#e0e0e0" }
  },
  cellAlignment: "left",
  cellVerticalAlignment: "middle",
  conditionalFormats: [],
  
  cellRenderer: null,
  cellEditor: {
    type: "text"
  },
  headerComponent: null,
  
  filter: {
    enabled: true,
    type: "text"
  },
  
  valueGetter: null,
  valueSetter: null,
  valueFormatter: null,
  cellClassRules: null
};

export interface FormattingSettings {
  type: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'boolean' | 'custom';
  textOptions?: {
    prefix?: string;
    suffix?: string;
    case?: 'none' | 'upper' | 'lower' | 'title';
    maxLength?: number;
    ellipsis?: boolean;
  };
  numberOptions?: {
    decimalPlaces?: number;
    thousandsSeparator?: boolean;
    prefix?: string;
    suffix?: string;
  };
  currencyOptions?: {
    currency?: string;
    locale?: string;
    decimalPlaces?: number;
    symbol?: string;
    symbolPosition?: 'prefix' | 'suffix';
  };
  percentOptions?: {
    decimalPlaces?: number;
    includeSymbol?: boolean;
  };
  dateOptions?: {
    format?: string;
    locale?: string;
    timezone?: string;
  };
  booleanOptions?: {
    trueValue?: string;
    falseValue?: string;
  };
  customOptions?: {
    formatFunction?: string;
  };
}

export interface HeaderSettings {
  text: string;
  tooltip?: string;
  showTooltip?: boolean;
  style?: { [key: string]: any };
  cellClass?: string;
  componentRenderer?: string;
  componentParams?: { [key: string]: any };
}

export interface FilterSettings {
  enabled: boolean;
  filterType?: 'text' | 'number' | 'date' | 'set' | 'custom';
  defaultFilter?: any;
  filterParams?: { [key: string]: any };
  buttons?: ('apply' | 'reset' | 'cancel' | 'clear')[];
  debounceMs?: number;
}

export interface StyleSettings {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  cellClass?: string;
  cellStyle?: { [key: string]: any };
  cellClassRules?: { [key: string]: string | ((params: any) => boolean) };
  wrapText?: boolean;
  autoHeight?: boolean;
  resizable?: boolean;
  alignContent?: 'left' | 'center' | 'right';
}

export interface ComponentSettings {
  cellRenderer?: string;
  cellEditor?: string;
  cellRendererParams?: { [key: string]: any };
  cellEditorParams?: { [key: string]: any };
  enableCellChangeFlash?: boolean;
  tooltipField?: string;
  tooltipComponent?: string | null;
}

export interface ColumnSettingsProps {
  column: ColumnState;
  onColumnChange: (column: ColumnState) => void;
}