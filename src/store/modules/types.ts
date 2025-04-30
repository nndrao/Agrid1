// Type definitions shared across store modules

// Type definitions for grid profiles
export interface GridProfile {
  id: string;
  name: string;
  font: {
    name: string;
    value: string;
  };
  fontSize: number;
  density: number;
  isDefault?: boolean;
  // Grid state properties
  columnsState?: Array<Record<string, unknown>>;
  filterState?: Array<Record<string, unknown>>;
  sortState?: Array<Record<string, unknown>>;
  rowGroupState?: Array<Record<string, unknown>>;
  pivotState?: {
    pivotColumns: string[];
    valueColumns: string[];
    groupKeys?: string[];
  };
  chartState?: {
    chartType: 'line' | 'bar' | 'pie' | 'scatter';
    chartTheme?: string;
    data?: unknown[];
    options?: Record<string, unknown>;
  };

  // Column settings profiles
  columnSettingsProfiles?: Record<string, any>;

  // Theme
  themeMode?: 'light' | 'dark' | 'system';

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// Type definitions for column profiles
export interface ColumnProfile {
  id: string;
  name: string;
  description?: string;
  headerStyle?: StyleDefinition;
  cellStyle?: StyleDefinition;
  filter?: FilterDefinition;
  formatter?: FormatterOptions;
  editor?: EditorDefinition;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

// Type definitions for column formatters
export interface FormatterSettings {
  formatterType: 'None' | 'Number' | 'Currency' | 'Percent' | 'Date' | 'Custom';
  decimalPlaces?: number;
  useThousandsSeparator?: boolean;
  currencySymbol?: string;
  symbolPosition?: 'before' | 'after';
  formatPreset?: string;
  customFormat?: string;
}

// Expanded formatter options
export interface FormatterOptions {
  formatterType: 'None' | 'Number' | 'Currency' | 'Percent' | 'Date' | 'Custom' | 'Excel';
  format?: string;
  customFormat?: string;
  precision?: number;
  currencySymbol?: string;
  dateFormat?: string;
  useThousandSeparator?: boolean;
  applyToValues?: boolean;
  percentDecimals?: number;
  numberFormat?: string;
  decimalPlaces?: number;
}

// Style definition
export interface StyleDefinition {
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignH?: 'left' | 'center' | 'right';
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  borderWidth?: number;
  borderSides?: 'All' | 'Top' | 'Right' | 'Bottom' | 'Left' | 'TopBottom' | 'LeftRight';
}

// Filter definition
export interface FilterDefinition {
  enabled: boolean;
  type: 'text' | 'number' | 'date' | 'set';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string | number | Date;
  values?: Array<string | number | Date>;
}

// Editor definition
export interface EditorDefinition {
  type: 'default' | 'text' | 'select' | 'richSelect' | 'date' | 'numeric' | 'largeText';
  options?: string[];
  source?: string;
  validation?: {
    required?: boolean;
    minValue?: number | null;
    maxValue?: number | null;
    pattern?: string;
    customValidator?: string;
  };
}

// Type definitions for column settings
export interface ColumnSettings {
  general?: {
    headerName?: string;
    width?: string;
    sortable?: boolean;
    resizable?: boolean;
    editable?: boolean;
    filter?: string;
    hidden?: boolean;
    pinnedPosition?: string;
    columnType?: string;
    filterType?: string;
  };
  header?: {
    applyStyles?: boolean;
    applyTextColor?: boolean;
    applyBackgroundColor?: boolean;
    applyBorder?: boolean;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    borderStyle?: string;
    borderWidth?: number;
    borderColor?: string;
    borderSides?: string;
    alignH?: string;
    alignV?: string;
  };
  cell?: {
    applyStyles?: boolean;
    applyTextColor?: boolean;
    applyBackgroundColor?: boolean;
    applyBorder?: boolean;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    borderStyle?: string;
    borderWidth?: number;
    borderColor?: string;
    borderSides?: string;
    alignH?: string;
    alignV?: string;
  };
  formatter?: FormatterSettings;
}

// Column state model
export interface ColumnStateModel {
  [columnId: string]: ColumnState;
}

// Column state
export interface ColumnState {
  profileId: string;
  filter: FilterDefinition;
  headerStyle: StyleDefinition;
  cellStyle: StyleDefinition;
  applyTextColor: boolean;
  applyBackgroundColor: boolean;
  applyBorder: boolean;
  formatter: FormatterOptions;
  editor: EditorDefinition;
  valueGetter: string;
  isHidden: boolean;
  width: number;
  wrapText: boolean;
  sortable: boolean;
  resizable: boolean;
  pinned: string | null;
  lockPosition: boolean;
}

// Settings interface
export interface GridSettings {
  // Visual settings
  font: {
    name: string;
    value: string;
  };
  fontSize: number;
  density: number;

  // Grid state
  columnsState: any;
  filterState: any;
  sortState: any;
  rowGroupState: any;
  pivotState: any;
  chartState: any;

  // Column settings
  columnSettingsProfiles: Record<string, any>;

  // Theme
  themeMode: 'light' | 'dark' | 'system';
}

// Style Settings interfaces
export interface StyleBatch {
  pendingHeaderStyles: Record<string, any>;
  pendingCellStyles: Record<string, any>;
  styleFlushScheduled: boolean;
  appliedHeaderStyles?: string;
  appliedCellStyles?: string;
}

// Event handler types
export interface GridEventHandlers {
  onCellClicked?: (event: any) => void;
  onCellDoubleClicked?: (event: any) => void;
  onRowClicked?: (event: any) => void;
  onRowDoubleClicked?: (event: any) => void;
  onColumnResized?: (event: any) => void;
  onColumnMoved?: (event: any) => void;
  onColumnVisible?: (event: any) => void;
  onSelectionChanged?: (event: any) => void;
  onCellValueChanged?: (event: any) => void;
  onGridReady?: (api: any) => void;
}

// Store state interface - shared across modules
export interface GridStoreState {
  // Profiles
  profiles: GridProfile[];
  activeProfileId: string;

  // Column profiles
  columnProfiles: ColumnProfile[];

  // Column states
  columnStates: Record<string, ColumnState>;

  // Current Settings (from active profile or modified)
  settings: GridSettings;
  isDirty: boolean;
  justSaved: boolean; // Flag to indicate if settings were just saved
  suppressGridRefresh: boolean; // Prevent grid refresh during profile save
  skipNextGridRefresh: number; // Counter to skip grid refresh after profile save
  gridApi: any | null;

  // Event handlers
  onCellClicked?: (event: any) => void;
  onCellDoubleClicked?: (event: any) => void;
  onRowClicked?: (event: any) => void;
  onRowDoubleClicked?: (event: any) => void;
  onColumnResized?: (event: any) => void;
  onColumnMoved?: (event: any) => void;
  onColumnVisible?: (event: any) => void;
  onSelectionChanged?: (event: any) => void;
  onCellValueChanged?: (event: any) => void;
  onGridReady?: (api: any) => void;
  
  // Internal state for style batching (moved from closure to state)
  styleBatch: StyleBatch;
  
  // Custom formatters
  customFormatters: Record<string, (value: any) => string>;
}