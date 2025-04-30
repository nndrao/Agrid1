import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateCellColor } from '@/utils/formatterUtils';
import type { StyleBatch } from './modules/types';

// Type definitions
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
  columnsState?: {
    columnId: string;
    width?: number;
    hide?: boolean;
    pinned?: 'left' | 'right' | null;
    sort?: 'asc' | 'desc' | null;
  }[];
  filterState?: {
    columnId: string;
    filterType: string;
    filter: string | number | boolean;
    filterTo?: string | number;
    operator?: 'AND' | 'OR';
  }[];
  sortState?: {
    columnId: string;
    sort: 'asc' | 'desc';
    sortIndex: number;
  }[];
  rowGroupState?: {
    columnId: string;
    groupIndex: number;
    expanded?: boolean;
  }[];
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
    textColor?: string;
    applyBackgroundColor?: boolean;
    backgroundColor?: string;
    applyBorder?: boolean;
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
    textColor?: string;
    applyBackgroundColor?: boolean;
    backgroundColor?: string;
    applyBorder?: boolean;
    borderStyle?: string;
    borderWidth?: number;
    borderColor?: string;
    borderSides?: string;
    alignH?: string;
    alignV?: string;
  };
  formatter?: FormatterSettings;
}

interface GridSettings {
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

// Default values
const defaultFont = { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" };
const defaultFontSize = 13;
const defaultDensity = 2;

// Default profile
const defaultProfile: GridProfile = {
  id: 'default',
  name: 'Default',
  font: defaultFont,
  fontSize: defaultFontSize,
  density: defaultDensity,
  isDefault: true,
  columnsState: [],
  filterState: [],
  sortState: [],
  rowGroupState: [],
  pivotState: { pivotColumns: [], valueColumns: [] },
  chartState: { chartType: 'bar' },
  columnSettingsProfiles: {},
  themeMode: 'system',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Store interface
interface GridStore {
  // Profiles
  profiles: GridProfile[];
  activeProfileId: string;

  // Current Settings (from active profile or modified)
  settings: GridSettings;
  isDirty: boolean;
  gridApi: any | null;

  // Actions
  initializeStore: () => void;
  setGridApi: (api: any) => void;

  // Profile management
  getActiveProfile: () => GridProfile;
  selectProfile: (profileId: string) => void;
  createProfile: (profile: Omit<GridProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (profileId: string, updates: Partial<GridProfile>) => void;
  deleteProfile: (profileId: string) => void;
  exportProfile: (profileId: string) => string;
  importProfile: (profileJson: string) => boolean;
  duplicateProfile: (profileId: string, newName?: string) => void;
  debugColumnVisibility: () => void;
  forceApplyColumnVisibility: () => void;
  testSaveLoadColumnVisibility: () => void;

  // Settings management
  updateSettings: (settings: Partial<GridSettings>) => void;
  saveSettingsToProfile: () => void;
  extractGridState: () => void;
  applySettingsToGrid: () => void;
  resetSettingsToProfile: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;

  // Column settings management
  getColumnSettings: (columnField: string) => any;
  saveColumnSettings: (columnField: string, settings: any) => void;
  applyColumnSettings: (columnField: string) => boolean;
  applyAllColumnProfiles: () => boolean; // Add function to apply all column profiles
  getColumnSettingsProfiles: () => string[];
  deleteColumnSettingsProfile: (profileName: string) => void;

  // Utility functions
  getGridColumnState: () => any;
  getGridFilterState: () => any;
  getGridSortState: () => any;
  getGridRowGroupState: () => any;
  getGridPivotState: () => any;
  getGridChartState: () => any;

  // Style batching functions
  batchApplyHeaderStyles: (columnField: string, styles: any) => void;
  batchApplyCellStyles: (columnField: string, styles: any) => void;
  flushBatchedStyles: () => void;
  removeCellStyles: (columnField: string) => void;

  // Style batching (for declarative CSS injection)
  styleBatch: StyleBatch;
}

// Helper function to format dates according to a format string
// Used by the formatter feature
function formatDate(date: Date, format: string): string {
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

// Helper function to apply standard Excel formatting to a value
// Import the new Excel formatter
import { formatExcelValue } from '@/utils/formatters';

// Function to apply Excel formatting using the new formatter module
const applyExcelFormat = (params: { value: any }, formatter: FormatterSettings): string => {
  // Get the custom format
  const customFormat = formatter.customFormat || '';

  // Skip formatting for null/undefined values
  if (params.value === null || params.value === undefined) {
    return '';
  }

  try {
    // Use the new Excel formatter module
    const result = formatExcelValue(params, customFormat);

    // Return the formatted text
    return result.text;
  } catch (error) {
    console.error('Error applying Excel format:', error);
    return String(params.value);
  }
};

// Initial/default styleBatch for the store
const initialStyleBatch: StyleBatch = {
  pendingHeaderStyles: {},
  pendingCellStyles: {},
  styleFlushScheduled: false,
  appliedHeaderStyles: '',
  appliedCellStyles: ''
};

// Create the store
export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => {
      // Internal state for style batching
      let pendingHeaderStyles: Record<string, any> = {};
      let pendingCellStyles: Record<string, any> = {};
      let styleFlushScheduled = false;

      // Return store with all functions and state
      return {
        // Initial state
        profiles: [defaultProfile],
        activeProfileId: defaultProfile.id,

        settings: {
          font: defaultFont,
          fontSize: defaultFontSize,
          density: defaultDensity,
          columnsState: null,
          filterState: null,
          sortState: null,
          rowGroupState: null,
          pivotState: null,
          chartState: null,
          columnSettingsProfiles: {},
          themeMode: 'system'
        },

        isDirty: false,
        gridApi: null,

        styleBatch: initialStyleBatch,

        // Initialize store with default values
        initializeStore: () => {
          const { profiles, activeProfileId } = get();

          // Ensure there is always a default profile
          if (!profiles || profiles.length === 0 || !profiles.some(p => p.isDefault)) {
            set(state => ({
              profiles: [defaultProfile, ...(state.profiles || []).filter(p => !p.isDefault)]
            }));
          }

          const activeProfile = profiles?.find(p => p.id === activeProfileId) || defaultProfile;

          // RULE 2: When the app is refreshed, load the column settings from the active profile
          // Make a deep copy of column settings profiles to avoid reference issues
          let columnSettingsProfiles = {};
          if (activeProfile.columnSettingsProfiles) {
            try {
              // Deep clone the column settings profiles
              columnSettingsProfiles = JSON.parse(JSON.stringify(activeProfile.columnSettingsProfiles));

              if (process.env.NODE_ENV === 'development') {
                console.log('Loaded column settings profiles from active profile:', Object.keys(columnSettingsProfiles));

                // Log column widths for debugging
                Object.keys(columnSettingsProfiles).forEach(profileName => {
                  if (profileName.endsWith('_settings')) {
                    const columnField = profileName.replace('_settings', '');
                    const width = columnSettingsProfiles[profileName]?.general?.width;
                    if (width) {
                      console.log(`Column ${columnField} has saved width: ${width}px`);
                    }
                  }
                });
              }
            } catch (error) {
              console.error('Error cloning column settings profiles:', error);
              columnSettingsProfiles = {};
            }
          }

          // Reset settings from active profile with fallbacks to defaults
          set({
            activeProfileId: activeProfile.id, // Ensure we have a valid profile ID
            settings: {
              font: activeProfile.font || defaultFont,
              fontSize: activeProfile.fontSize || defaultFontSize,
              density: activeProfile.density || defaultDensity,
              columnsState: activeProfile.columnsState || null,
              filterState: activeProfile.filterState || null,
              sortState: activeProfile.sortState || null,
              rowGroupState: activeProfile.rowGroupState || null,
              pivotState: activeProfile.pivotState || null,
              chartState: activeProfile.chartState || null,
              columnSettingsProfiles: columnSettingsProfiles,
              themeMode: activeProfile.themeMode || 'system'
            },
            isDirty: false
          });

          if (process.env.NODE_ENV === 'development') {
            console.log('Store initialized with active profile:', activeProfile.name);
          }
        },

        // Set grid API with improved persistence
        setGridApi: (api) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Setting grid API in store:', api ? 'Valid API object' : 'Null API');

            // Log available methods for debugging
            if (api) {
              console.log('Available API methods:',
                Object.keys(api).filter(key => typeof api[key] === 'function'));

              // Check for columnApi
              if (api.columnApi) {
                console.log('ColumnAPI available with methods:',
                  Object.keys(api.columnApi).filter(key => typeof api.columnApi[key] === 'function'));
              }
            }
          }

          // If we have a valid API, store it
          if (api) {
            // Store in a way that persists across renders
            set({ gridApi: api });

            // Additional safety check - ensure the API actually has methods we need
            const hasGetColumn = typeof api.getColumn === 'function';
            const hasColumnApi = api.columnApi && typeof api.columnApi.getColumn === 'function';

            if (!hasGetColumn && !hasColumnApi && process.env.NODE_ENV === 'development') {
              console.warn('Grid API missing essential methods - may be incomplete');
            }

            // Apply settings to grid after API is set
            try {
              get().applySettingsToGrid();

              // Add a small delay to ensure column visibility is applied correctly
              setTimeout(() => {
                try {
                  // Force apply column visibility as a backup
                  get().forceApplyColumnVisibility();
                } catch (error) {
                  console.error('Error force applying column visibility after grid initialization:', error);
                }
              }, 500);
            } catch (error) {
              console.error('Error applying settings after grid API initialization:', error);
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('Attempted to set null/undefined grid API');
          }
        },

        // Profile management
        getActiveProfile: () => {
          const { profiles, activeProfileId } = get();

          // Make sure we have profiles and at least one is marked as default
          if (!profiles || profiles.length === 0 || !profiles.some(p => p.isDefault)) {
            get().initializeStore();
            return defaultProfile;
          }

          // Find the active profile, fallback to default if not found
          const activeProfile = profiles.find(p => p.id === activeProfileId);
          if (!activeProfile) {
            // Active profile not found, get default profile
            const defaultProfileItem = profiles.find(p => p.isDefault) || defaultProfile;

            // Switch to default profile immediately (no setTimeout)
            // This is safe because getActiveProfile is only called in render contexts
            // and we're returning the default profile immediately anyway
            try {
              get().selectProfile(defaultProfileItem.id);
            } catch (error) {
              console.error('Error selecting default profile in getActiveProfile:', error);
            }

            return defaultProfileItem;
          }

          return activeProfile;
        },

        selectProfile: (profileId) => {
          try {
            console.log(`Selecting profile with ID: ${profileId}`);
            const { profiles, gridApi } = get();

            // Validate profiles exists
            if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
              console.error('No profiles available for selection');
              get().initializeStore(); // Reinitialize with defaults
              return;
            }

            // Find the profile or use default
            const profile = profiles.find(p => p.id === profileId);

            if (!profile) {
              console.error(`Profile with ID ${profileId} not found`);
              // Get default profile instead
              const defaultProfileItem = profiles.find(p => p.isDefault) || defaultProfile;

              if (!defaultProfileItem) {
                console.error('No default profile available');
                get().initializeStore();
                return;
              }

              console.log('Using default profile instead');

              // Use default profile - create a deep copy to avoid reference issues
              const defaultSettings = {
                font: defaultProfileItem.font || defaultFont,
                fontSize: defaultProfileItem.fontSize || defaultFontSize,
                density: defaultProfileItem.density || defaultDensity,
                columnsState: defaultProfileItem.columnsState ? JSON.parse(JSON.stringify(defaultProfileItem.columnsState)) : null,
                filterState: defaultProfileItem.filterState ? JSON.parse(JSON.stringify(defaultProfileItem.filterState)) : null,
                sortState: defaultProfileItem.sortState ? JSON.parse(JSON.stringify(defaultProfileItem.sortState)) : null,
                rowGroupState: defaultProfileItem.rowGroupState ? JSON.parse(JSON.stringify(defaultProfileItem.rowGroupState)) : null,
                pivotState: defaultProfileItem.pivotState ? JSON.parse(JSON.stringify(defaultProfileItem.pivotState)) : null,
                chartState: defaultProfileItem.chartState ? JSON.parse(JSON.stringify(defaultProfileItem.chartState)) : null,
                columnSettingsProfiles: defaultProfileItem.columnSettingsProfiles ?
                  JSON.parse(JSON.stringify(defaultProfileItem.columnSettingsProfiles)) : {},
                themeMode: defaultProfileItem.themeMode || 'system'
              };

              // Set the state with the deep copied default profile
              set({
                activeProfileId: defaultProfileItem.id,
                settings: defaultSettings,
                isDirty: false
              });

              // Apply settings only if grid API is available
              if (gridApi && typeof gridApi.getColumn === 'function') {
                try {
                  console.log('Applying default profile settings to grid - batch operation');

                  // Track if we need CSS updates
                  let needsCssUpdate = false;

                  // Apply font family CSS directly - this doesn't need grid refresh
                  if (defaultSettings.font && defaultSettings.font.value) {
                    set({ settings: { ...get().settings, font: defaultSettings.font } });
                    needsCssUpdate = true;
                  }

                  // Apply font size CSS directly
                  if (defaultSettings.fontSize) {
                    set({ settings: { ...get().settings, fontSize: defaultSettings.fontSize } });
                    needsCssUpdate = true;
                  }

                  // Apply density CSS directly
                  if (defaultSettings.density) {
                    set({ settings: { ...get().settings, density: defaultSettings.density } });
                    needsCssUpdate = true;
                  }

                  // Apply grid state settings in a single batch operation
                  let needsGridRefresh = false;

                  // Apply column state if available
                  if (defaultSettings.columnsState && Array.isArray(defaultSettings.columnsState) &&
                      defaultSettings.columnsState.length > 0 && typeof gridApi.applyColumnState === 'function') {
                    try {
                      gridApi.applyColumnState({
                        state: defaultSettings.columnsState,
                        applyOrder: true
                      });
                      needsGridRefresh = true;
                    } catch (error) {
                      console.warn('Error applying column state:', error);
                    }
                  }

                  // Apply filter state if available
                  if (typeof gridApi.setFilterModel === 'function') {
                    try {
                      gridApi.setFilterModel(defaultSettings.filterState);
                      needsGridRefresh = true;
                    } catch (error) {
                      console.warn('Error applying filter state:', error);
                    }
                  }

                  // Apply sort state if available
                  if (defaultSettings.sortState && Array.isArray(defaultSettings.sortState) &&
                      defaultSettings.sortState.length > 0 && typeof gridApi.setSortModel === 'function') {
                    try {
                      gridApi.setSortModel(defaultSettings.sortState);
                      needsGridRefresh = true;
                    } catch (error) {
                      console.warn('Error applying sort state:', error);
                    }
                  }

                  // Apply column profiles if available - synchronously
                  if (defaultSettings.columnSettingsProfiles &&
                      Object.keys(defaultSettings.columnSettingsProfiles).length > 0) {
                    try {
                      get().applyAllColumnProfiles();
                      needsGridRefresh = true;
                    } catch (e) {
                      console.warn('Error applying column profiles:', e);
                    }
                  }

                  // Single grid refresh at the end if needed
                  if (needsGridRefresh) {
                    try {
                      console.log('Performing single refresh after applying all profile settings');
                      if (typeof gridApi.refreshCells === 'function') {
                        gridApi.refreshCells({ force: true });
                      }
                    } catch (error) {
                      console.warn('Error refreshing grid:', error);
                    }
                  }
                } catch (error) {
                  console.error('Error applying default profile settings:', error);
                }
              } else {
                console.warn('Grid API not available, settings will be applied when grid is ready');
              }

              return;
            }

            // Ensure profile has all required properties with fallbacks - use deep copy
            const safeProfile = {
              ...profile,
              font: profile.font || defaultFont,
              fontSize: profile.fontSize || defaultFontSize,
              density: profile.density || defaultDensity,
              columnsState: profile.columnsState ? JSON.parse(JSON.stringify(profile.columnsState)) : null,
              filterState: profile.filterState ? JSON.parse(JSON.stringify(profile.filterState)) : null,
              sortState: profile.sortState ? JSON.parse(JSON.stringify(profile.sortState)) : null,
              rowGroupState: profile.rowGroupState ? JSON.parse(JSON.stringify(profile.rowGroupState)) : null,
              pivotState: profile.pivotState ? JSON.parse(JSON.stringify(profile.pivotState)) : null,
              chartState: profile.chartState ? JSON.parse(JSON.stringify(profile.chartState)) : null,
              columnSettingsProfiles: profile.columnSettingsProfiles ?
                JSON.parse(JSON.stringify(profile.columnSettingsProfiles)) : {},
              themeMode: profile.themeMode || 'system'
            };

            console.log('Applying profile with settings:', {
              columnsStateCount: safeProfile.columnsState ? safeProfile.columnsState.length : 0,
              hasColumnSettings: !!safeProfile.columnSettingsProfiles,
              columnSettingsCount: Object.keys(safeProfile.columnSettingsProfiles || {}).length
            });

            // Prepare settings object with deep copies
            const newSettings = {
              font: safeProfile.font,
              fontSize: safeProfile.fontSize,
              density: safeProfile.density,
              columnsState: safeProfile.columnsState,
              filterState: safeProfile.filterState,
              sortState: safeProfile.sortState,
              rowGroupState: safeProfile.rowGroupState,
              pivotState: safeProfile.pivotState,
              chartState: safeProfile.chartState,
              columnSettingsProfiles: safeProfile.columnSettingsProfiles,
              themeMode: safeProfile.themeMode
            };

            // Update state with new settings
            set({
              activeProfileId: profileId,
              settings: newSettings,
              isDirty: false
            });

            // Apply settings to grid immediately if API exists
            if (gridApi && typeof gridApi.getColumn === 'function') {
              try {
                console.log('Applying profile settings to grid - batch operation');

                // First, clean up any existing styles from previous profile
                console.log('Cleaning up styles from previous profile');

                // 1. Clean up all column-specific style elements
                const cleanupStyles = () => {
                  try {
                    // Find all style elements in head
                    const allStyles = document.head.querySelectorAll('style');

                    // Style element IDs to preserve (these are global styles)
                    const preserveIds = [
                      'batched-header-styles',
                      'batched-cell-styles',
                      'batched-header-styles-all',
                      'batched-cell-styles-all'
                    ];

                    // Check each style element
                    allStyles.forEach(style => {
                      const id = style.id || '';

                      // If it's a column-specific style, remove it
                      if (
                        id.startsWith('header-style-') ||
                        id.startsWith('cell-style-') ||
                        id.startsWith('direct-header-style-') ||
                        id.startsWith('direct-cell-style-') ||
                        id.startsWith('emergency-header-style-') ||
                        id.startsWith('emergency-cell-style-')
                      ) {
                        console.log(`Removing style element: ${id}`);
                        style.remove();
                      }
                      // If it's a batch style container, clear its contents
                      else if (preserveIds.includes(id)) {
                        console.log(`Clearing batch style container: ${id}`);
                        style.textContent = '';
                      }
                    });

                    // Also reset the batched styles collections
                    pendingHeaderStyles = {};
                    pendingCellStyles = {};
                    styleFlushScheduled = false;
                  } catch (error) {
                    console.error('Error cleaning up style elements:', error);
                  }
                };

                // Clean up styles
                cleanupStyles();

                // 2. Reset column properties to defaults on all columns
                if (gridApi.getColumns && typeof gridApi.getColumns === 'function') {
                  try {
                    const allColumns = gridApi.getColumns();
                    if (allColumns && allColumns.length > 0) {
                      console.log(`Resetting properties for ${allColumns.length} columns`);

                      allColumns.forEach(column => {
                        try {
                          if (column && column.getColDef) {
                            const colDef = column.getColDef();
                            // Reset custom classes
                            colDef.headerClass = undefined;
                            colDef.cellClass = undefined;
                          }
                        } catch (colError) {
                          console.warn(`Error resetting column ${column.getColId?.() || 'unknown'}:`, colError);
                        }
                      });
                    }
                  } catch (colsError) {
                    console.warn('Error getting columns for reset:', colsError);
                  }
                }

                // Track if we need CSS updates
                let needsCssUpdate = false;

                // Apply font family CSS directly - this doesn't need grid refresh
                if (newSettings.font && newSettings.font.value) {
                  set({ settings: { ...get().settings, font: newSettings.font } });
                  needsCssUpdate = true;
                }

                // Apply font size CSS directly
                if (newSettings.fontSize) {
                  set({ settings: { ...get().settings, fontSize: newSettings.fontSize } });
                  needsCssUpdate = true;
                }

                // Apply density CSS directly
                if (newSettings.density) {
                  set({ settings: { ...get().settings, density: newSettings.density } });
                  needsCssUpdate = true;
                }

                // Apply grid state settings in a single batch operation
                let needsGridRefresh = false;

                // Apply column state if available
                if (newSettings.columnsState && Array.isArray(newSettings.columnsState) &&
                    newSettings.columnsState.length > 0 && typeof gridApi.applyColumnState === 'function') {
                  try {
                    // Log column visibility state before applying
                    if (process.env.NODE_ENV === 'development') {
                      const visibleCols = newSettings.columnsState.filter((col: any) => !col.hide).map((col: any) => col.colId);
                      const hiddenCols = newSettings.columnsState.filter((col: any) => col.hide).map((col: any) => col.colId);
                      console.log(`Selecting profile - applying column state - visible columns (${visibleCols.length}):`, visibleCols);
                      console.log(`Selecting profile - applying column state - hidden columns (${hiddenCols.length}):`, hiddenCols);
                    }

                    // First, ensure all columns are visible to reset state
                    const allColumns = gridApi.getColumns();
                    const resetState = allColumns.map(col => ({
                      colId: col.getColId(),
                      hide: false
                    }));

                    gridApi.applyColumnState({
                      state: resetState,
                      defaultState: {
                        hide: false
                      }
                    });

                    // Now apply the saved state
                    gridApi.applyColumnState({
                      state: newSettings.columnsState,
                      applyOrder: true,
                      defaultState: {
                        // Reset all properties to defaults
                        width: undefined,
                        flex: undefined,
                        pinned: null,
                        sort: null,
                        hide: false
                      }
                    });

                    // Verify column visibility was applied correctly
                    if (process.env.NODE_ENV === 'development') {
                      const currentState = gridApi.getColumnState();
                      const visibleCols = currentState.filter(col => !col.hide).map(col => col.colId);
                      const hiddenCols = currentState.filter(col => col.hide).map(col => col.colId);
                      console.log(`After selecting profile - visible columns (${visibleCols.length}):`, visibleCols);
                      console.log(`After selecting profile - hidden columns (${hiddenCols.length}):`, hiddenCols);
                    }

                    needsGridRefresh = true;
                  } catch (error) {
                    console.warn('Error applying column state:', error);
                  }
                }

                // Apply filter state if available
                if (typeof gridApi.setFilterModel === 'function') {
                  try {
                    // Always set filter model, even if null/empty to clear existing filters
                    gridApi.setFilterModel(newSettings.filterState);
                    needsGridRefresh = true;
                  } catch (error) {
                    console.warn('Error applying filter state:', error);
                  }
                }

                // Apply sort state if available
                if (newSettings.sortState && Array.isArray(newSettings.sortState) &&
                    newSettings.sortState.length > 0 && typeof gridApi.setSortModel === 'function') {
                  try {
                    gridApi.setSortModel(
                      (newSettings.sortState && Array.isArray(newSettings.sortState) &&
                      newSettings.sortState.length > 0) ? newSettings.sortState : null
                    );
                    needsGridRefresh = true;
                  } catch (error) {
                    console.warn('Error applying sort state:', error);
                  }
                }

                // RULE 3: When switching profiles, apply the column settings from the new profile
                if (newSettings.columnSettingsProfiles &&
                    Object.keys(newSettings.columnSettingsProfiles).length > 0) {
                  try {
                    // Apply all column profiles in a single batch
                    // This ensures that when switching profiles, the column settings are applied
                    get().applyAllColumnProfiles();
                    needsGridRefresh = true;

                    if (process.env.NODE_ENV === 'development') {
                      console.log('Applied column profiles from newly selected profile');
                    }
                  } catch (e) {
                    console.warn('Error applying column profiles:', e);
                  }
                }

                // Single grid refresh at the end if needed
                if (needsGridRefresh) {
                  try {
                    console.log('Performing single refresh after applying all profile settings');
                    if (typeof gridApi.refreshHeader === 'function') {
                      gridApi.refreshHeader();
                    }
                    if (typeof gridApi.refreshCells === 'function') {
                      gridApi.refreshCells({ force: true });
                    }
                  } catch (e) {
                    console.warn('Error refreshing grid:', e);
                  }
                }
              } catch (error) {
                console.error('Error applying profile settings:', error);
              }
            } else {
              console.warn('Grid API not available, settings will be applied when grid is ready');
            }
          } catch (error) {
            console.error('Error selecting profile:', error);
            get().initializeStore(); // Reinitialize with defaults
          }
        },

        createProfile: (profile) => {
          const id = `profile-${Date.now()}`;
          const timestamp = Date.now();

          const newProfile: GridProfile = {
            ...profile,
            id,
            createdAt: timestamp,
            updatedAt: timestamp
          };

          set(state => ({
            profiles: [...state.profiles, newProfile],
            activeProfileId: id,
            isDirty: false
          }));

          // Select the new profile to apply settings immediately (no setTimeout)
          try {
            get().selectProfile(id);
          } catch (error) {
            console.error('Error selecting new profile:', error);
          }
        },

        updateProfile: (profileId, updates) => {
          // Cannot update default profile if isDefault is being changed
          if (updates.isDefault === false) {
            const profile = get().profiles.find(p => p.id === profileId);
            if (profile?.isDefault) {
              return; // Cannot remove default status
            }
          }

          set(state => ({
            profiles: state.profiles.map(p =>
              p.id === profileId ? {
                ...p,
                ...updates,
                updatedAt: Date.now()
              } : p
            ),
            // Only update isDirty flag, don't update the settings object
            // This prevents the grid from refreshing
            isDirty: state.activeProfileId === profileId ? false : state.isDirty
          }));
        },

        deleteProfile: (profileId) => {
          const { profiles, activeProfileId } = get();

          // Cannot delete default profile
          const profileToDelete = profiles.find(p => p.id === profileId);
          if (profileToDelete?.isDefault) return;

          const newProfiles = profiles.filter(p => p.id !== profileId);

          // If deleting active profile, switch to default
          const newActiveId = activeProfileId === profileId
            ? (newProfiles.find(p => p.isDefault)?.id || newProfiles[0]?.id)
            : activeProfileId;

          set({
            profiles: newProfiles,
            activeProfileId: newActiveId
          });

          // If active profile changed, update settings
          if (newActiveId !== activeProfileId) {
            get().selectProfile(newActiveId);
          }
        },

        exportProfile: (profileId) => {
          const { activeProfileId, profiles } = get();

          // Get the profile to export
          let profileToExport = profiles.find(p => p.id === profileId);

          // If exporting active profile, we need to get the latest grid state
          if (profileId === activeProfileId && profileToExport) {
            // Get the current grid state without applying it back to the grid
            const { gridApi } = get();
            if (gridApi) {
              // Extract grid state directly without using saveSettingsToProfile to avoid grid refresh
              let columnsState = null;
              let filterState = null;
              let sortState = null;
              let rowGroupState = null;
              let pivotState = null;
              let chartState = null;
              // Keep existing column settings profiles
              const columnSettingsProfiles = get().settings.columnSettingsProfiles;

              try {
                // Use the current column state directly from the grid API
                // This ensures we get the exact current state including any width changes
                const currentColumnState = gridApi.getColumnState();
                columnsState = JSON.parse(JSON.stringify(currentColumnState));
                console.log('Using direct column state from grid API for export');
              }
              catch (e) {
                console.warn('Failed to use direct column state, falling back to getGridColumnState', e);
                try {
                  columnsState = get().getGridColumnState();
                } catch (e2) {
                  console.warn('Failed to get column state for export', e2);
                }
              }

              try { filterState = get().getGridFilterState(); }
              catch (e) { console.warn('Failed to get filter state for export', e); }

              try { sortState = get().getGridSortState(); }
              catch (e) { console.warn('Failed to get sort state for export', e); }

              try { rowGroupState = get().getGridRowGroupState(); }
              catch (e) { console.warn('Failed to get row group state for export', e); }

              try { pivotState = get().getGridPivotState(); }
              catch (e) { console.warn('Failed to get pivot state for export', e); }

              try { chartState = get().getGridChartState(); }
              catch (e) { console.warn('Failed to get chart state for export', e); }

              // Create a copy of the profile with the latest grid state
              profileToExport = {
                ...profileToExport,
                columnsState: columnsState || profileToExport.columnsState,
                filterState: filterState || profileToExport.filterState,
                sortState: sortState || profileToExport.sortState,
                rowGroupState: rowGroupState || profileToExport.rowGroupState,
                pivotState: pivotState || profileToExport.pivotState,
                chartState: chartState || profileToExport.chartState,
                columnSettingsProfiles: columnSettingsProfiles || profileToExport.columnSettingsProfiles
              };

              // Save the current column state to a variable before exporting
              // This will be used to restore the column state after the export
              const columnStateToRestore = columnsState;

              // Restore the column state to prevent the grid from resetting column widths
              if (columnStateToRestore && gridApi) {
                try {
                  console.log('Restoring column state after profile export to prevent width reset');
                  // Use a small timeout to ensure the export is complete
                  setTimeout(() => {
                    gridApi.applyColumnState({
                      state: columnStateToRestore,
                      applyOrder: true
                    });
                  }, 0);
                } catch (error) {
                  console.warn('Failed to restore column state after profile export:', error);
                }
              }
            }
          }

          if (!profileToExport) return '';

          // Create export-friendly version of the profile
          const exportData = {
            name: profileToExport.name,
            font: profileToExport.font,
            fontSize: profileToExport.fontSize,
            density: profileToExport.density,
            columnsState: profileToExport.columnsState,
            filterState: profileToExport.filterState,
            sortState: profileToExport.sortState,
            rowGroupState: profileToExport.rowGroupState,
            pivotState: profileToExport.pivotState,
            chartState: profileToExport.chartState,
            columnSettingsProfiles: profileToExport.columnSettingsProfiles,
            themeMode: profileToExport.themeMode,
            exportedAt: Date.now()
          };

          return JSON.stringify(exportData, null, 2);
        },

        importProfile: (profileJson) => {
          try {
            // Parse the JSON
            const importedData = JSON.parse(profileJson);

            // Validate required fields
            if (!importedData.name || !importedData.font) {
              console.error('Import failed: Missing required fields');
              return false;
            }

            // Generate new ID and timestamps
            const timestamp = Date.now();

            // Create a properly structured profile
            const newProfile: GridProfile = {
              id: `profile-${timestamp}`,
              name: importedData.name,
              font: importedData.font,
              fontSize: importedData.fontSize || defaultFontSize,
              density: importedData.density || defaultDensity,
              isDefault: false, // Never import as default

              // Grid state
              columnsState: importedData.columnsState || null,
              filterState: importedData.filterState || null,
              sortState: importedData.sortState || null,
              rowGroupState: importedData.rowGroupState || null,
              pivotState: importedData.pivotState || null,
              chartState: importedData.chartState || null,

              // Column settings
              columnSettingsProfiles: importedData.columnSettingsProfiles || {},

              // Theme
              themeMode: importedData.themeMode || 'system',

              // Timestamps
              createdAt: timestamp,
              updatedAt: timestamp
            };

            // Add to profiles
            set(state => ({
              profiles: [...state.profiles, newProfile]
            }));

            return true;
          } catch (error) {
            console.error('Import failed:', error);
            return false;
          }
        },

        duplicateProfile: (profileId, newName) => {
          const { profiles } = get();
          const profileToDuplicate = profiles.find(p => p.id === profileId);

          if (!profileToDuplicate) return;

          const timestamp = Date.now();
          const duplicatedProfile: GridProfile = {
            ...profileToDuplicate,
            id: `profile-${timestamp}`,
            name: newName || `${profileToDuplicate.name} (Copy)`,
            isDefault: false, // Never duplicate as default
            createdAt: timestamp,
            updatedAt: timestamp
          };

          set(state => ({
            profiles: [...state.profiles, duplicatedProfile]
          }));
        },

        // Settings management with batched updates
        updateSettings: (partialSettings: Partial<GridSettings>) => {
          // Update the settings in state without triggering a grid refresh
          set(state => {
            // Create a new settings object with the updates
            const newSettings = {
              ...state.settings,
              ...partialSettings
            };

            return {
              settings: newSettings,
              isDirty: true
            };
          });

          // Don't automatically apply settings after a state change
          // This prevents cascading refreshes and lets components control when to apply changes
        },

        saveSettingsToProfile: () => {
          const { activeProfileId, settings, profiles } = get();
          const activeProfile = profiles.find(p => p.id === activeProfileId);

          // Get the current grid state without applying it back to the grid
          const { gridApi } = get();
          if (!gridApi) {
            console.warn('Cannot extract grid state: gridApi is null');
            return;
          }

          // Store the current column state for comparison
          const currentColumnState = gridApi.getColumnState();

          if (process.env.NODE_ENV === 'development') {
            console.log('Current column state when saving profile:', currentColumnState);

            // Log visibility state of columns
            const visibleColumns = currentColumnState.filter((col: any) => !col.hide).map((col: any) => col.colId);
            const hiddenColumns = currentColumnState.filter((col: any) => col.hide).map((col: any) => col.colId);
            console.log(`Visible columns (${visibleColumns.length}):`, visibleColumns);
            console.log(`Hidden columns (${hiddenColumns.length}):`, hiddenColumns);
          }

          // Extract grid state directly without using extractGridState to avoid grid refresh
          let columnsState = null;
          let filterState = null;
          let sortState = null;
          let rowGroupState = null;
          let pivotState = null;
          let chartState = null;
          // Keep column settings profiles from current settings
          const columnSettingsProfiles = { ...settings.columnSettingsProfiles } || {};

          // Update column settings profiles with current column widths and visibility
          if (gridApi && typeof gridApi.getColumnState === 'function') {
            try {
              const columnState = gridApi.getColumnState();

              // For each column with settings, update the width and visibility
              Object.keys(columnSettingsProfiles).forEach(profileName => {
                if (profileName.endsWith('_settings')) {
                  const columnField = profileName.replace('_settings', '');
                  const columnInfo = columnState.find((col: any) => col.colId === columnField);

                  if (columnInfo && columnSettingsProfiles[profileName]) {
                    // Create updated settings with current width and visibility
                    const updatedGeneralSettings = {
                      ...columnSettingsProfiles[profileName].general
                    };

                    // Update width if available
                    if (columnInfo.width) {
                      updatedGeneralSettings.width = columnInfo.width.toString();

                      if (process.env.NODE_ENV === 'development') {
                        console.log(`Updated width in profile for column ${columnField}: ${columnInfo.width}px`);
                      }
                    }

                    // Update visibility state
                    if (columnInfo.hide !== undefined) {
                      updatedGeneralSettings.hidden = columnInfo.hide;

                      if (process.env.NODE_ENV === 'development') {
                        console.log(`Updated visibility in profile for column ${columnField}: ${columnInfo.hide ? 'hidden' : 'visible'}`);
                      }
                    }

                    // Update the column settings with new general settings
                    columnSettingsProfiles[profileName] = {
                      ...columnSettingsProfiles[profileName],
                      general: updatedGeneralSettings
                    };
                  }
                }
              });
            } catch (error) {
              console.error('Error updating column settings in profiles:', error);
            }
          }

          try {
            // Use the current column state directly from the grid API
            // This ensures we get the exact current state including any width changes and visibility
            columnsState = JSON.parse(JSON.stringify(currentColumnState));

            // Verify column visibility state is captured
            if (process.env.NODE_ENV === 'development') {
              const visibleCols = columnsState.filter((col: any) => !col.hide).map((col: any) => col.colId);
              const hiddenCols = columnsState.filter((col: any) => col.hide).map((col: any) => col.colId);
              console.log(`Captured column state - visible columns (${visibleCols.length}):`, visibleCols);
              console.log(`Captured column state - hidden columns (${hiddenCols.length}):`, hiddenCols);

              // Verify against current grid state
              const gridVisibleCols = currentColumnState.filter(col => !col.hide).map(col => col.colId);
              const gridHiddenCols = currentColumnState.filter(col => col.hide).map(col => col.colId);

              const visibleMatch = visibleCols.length === gridVisibleCols.length;
              const hiddenMatch = hiddenCols.length === gridHiddenCols.length;

              console.log(`Column visibility state matches grid state: ${visibleMatch && hiddenMatch}`);

              if (!visibleMatch || !hiddenMatch) {
                console.warn('Column visibility state does not match grid state!');
                console.log('Grid visible columns:', gridVisibleCols);
                console.log('Grid hidden columns:', gridHiddenCols);
              }
            }
          }
          catch (e) {
            console.warn('Failed to use direct column state, falling back to getGridColumnState', e);
            try {
              columnsState = get().getGridColumnState();
            } catch (e2) {
              console.warn('Failed to get column state', e2);
            }
          }

          try { filterState = get().getGridFilterState(); }
          catch (e) { console.warn('Failed to get filter state', e); }

          try { sortState = get().getGridSortState(); }
          catch (e) { console.warn('Failed to get sort state', e); }

          try { rowGroupState = get().getGridRowGroupState(); }
          catch (e) { console.warn('Failed to get row group state', e); }

          try { pivotState = get().getGridPivotState(); }
          catch (e) { console.warn('Failed to get pivot state', e); }

          try { chartState = get().getGridChartState(); }
          catch (e) { console.warn('Failed to get chart state', e); }

          // Create updated settings without changing the current settings object
          const updatedSettings = { ...settings };

          // Only update properties that were successfully retrieved
          if (columnsState !== null) updatedSettings.columnsState = columnsState;
          if (filterState !== null) updatedSettings.filterState = filterState;
          if (sortState !== null) updatedSettings.sortState = sortState;
          if (rowGroupState !== null) updatedSettings.rowGroupState = rowGroupState;
          if (pivotState !== null) updatedSettings.pivotState = pivotState;
          if (chartState !== null) updatedSettings.chartState = chartState;
          // Always include column settings profiles
          updatedSettings.columnSettingsProfiles = columnSettingsProfiles;

          if (activeProfile && !activeProfile.isDefault) {
            // We used to save and restore column state here, but now we avoid refreshing the grid
            // when saving a profile to prevent flickering

            set(state => {
              return {
                profiles: state.profiles.map(p =>
                  p.id === activeProfileId
                    ? {
                        ...p,
                        font: updatedSettings.font,
                        fontSize: updatedSettings.fontSize,
                        density: updatedSettings.density,
                        columnsState: updatedSettings.columnsState,
                        filterState: updatedSettings.filterState,
                        sortState: updatedSettings.sortState,
                        rowGroupState: updatedSettings.rowGroupState,
                        pivotState: updatedSettings.pivotState,
                        chartState: updatedSettings.chartState,
                        columnSettingsProfiles: updatedSettings.columnSettingsProfiles,
                        themeMode: updatedSettings.themeMode,
                        updatedAt: Date.now()
                      }
                    : p
                ),
                // Only update isDirty flag, don't update the settings object
                // This prevents the grid from refreshing
                isDirty: false
              };
            });

            // RULE 1: When saving settings, don't update the grid after the save
            // The grid already has these settings since we just captured them

            // Show a toast notification
            if (typeof window !== 'undefined') {
              // Import toast dynamically to avoid circular dependencies
              import('@/hooks/use-toast').then(({ toast }) => {
                toast({
                  title: 'Profile Saved',
                  description: `Settings saved to profile: ${activeProfile.name}`,
                  variant: 'default',
                });
              }).catch(error => {
                console.error('Error showing toast notification:', error);
              });
            }
          } else {
            console.log('Profile not updated: either not found or is default profile');
          }
        },

        extractGridState: () => {
          const { gridApi } = get();
          if (!gridApi) {
            console.warn('Cannot extract grid state: gridApi is null');
            return;
          }

          try {
            console.log('Extracting grid state');

            // Get all available states, with error handling for each one
            let columnsState = null;
            let filterState = null;
            let sortState = null;
            let rowGroupState = null;
            let pivotState = null;
            let chartState = null;
            // Keep existing column settings profiles
            const columnSettingsProfiles = get().settings.columnSettingsProfiles;

            try {
              columnsState = get().getGridColumnState();
            }
            catch (e) { console.warn('Failed to get column state', e); }

            try {
              filterState = get().getGridFilterState();
            }
            catch (e) { console.warn('Failed to get filter state', e); }

            try {
              sortState = get().getGridSortState();
            }
            catch (e) { console.warn('Failed to get sort state', e); }

            try {
              rowGroupState = get().getGridRowGroupState();
            }
            catch (e) { console.warn('Failed to get row group state', e); }

            try {
              pivotState = get().getGridPivotState();
            }
            catch (e) { console.warn('Failed to get pivot state', e); }

            try {
              chartState = get().getGridChartState();
            }
            catch (e) { console.warn('Failed to get chart state', e); }

            // Update settings with current grid state, but only for states we could successfully get
            set(state => {
              const newSettings = { ...state.settings };

              // Only update properties that were successfully retrieved
              if (columnsState !== null) newSettings.columnsState = columnsState;
              if (filterState !== null) newSettings.filterState = filterState;
              if (sortState !== null) newSettings.sortState = sortState;
              if (rowGroupState !== null) newSettings.rowGroupState = rowGroupState;
              if (pivotState !== null) newSettings.pivotState = pivotState;
              if (chartState !== null) newSettings.chartState = chartState;
              // Always include column settings profiles
              newSettings.columnSettingsProfiles = columnSettingsProfiles;

              return {
                settings: newSettings,
                isDirty: true
              };
            });

            console.log('Grid state extracted successfully');
          } catch (error) {
            console.error('Error extracting grid state:', error);
          }
        },

        applySettingsToGrid: () => {
          const { gridApi, settings } = get();
          if (!gridApi) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Cannot apply settings: gridApi not available');
            }
            return;
          }

          // Check if settings object is complete before proceeding
          if (!settings || !settings.font) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Cannot apply settings: settings or font is undefined');
            }
            return;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('Applying settings to grid');
          }

          // Handle the visual settings separately - doesn't need a timeout
          try {
            // Apply only font family setting - fontSize and density are handled directly in the toolbar
            if (settings.font && settings.font.value) {
              set({ settings: { ...get().settings, font: settings.font } });
            }

            // Apply font size CSS directly
            if (settings.fontSize) {
              set({ settings: { ...get().settings, fontSize: settings.fontSize } });
            }

            // Apply density CSS directly
            if (settings.density) {
              set({ settings: { ...get().settings, density: settings.density } });
            }
          } catch (error) {
            console.error('Error applying visual settings:', error);
          }

          // Track which grid operations we perform
          let needsRefresh = false;

          // Apply grid state without setTimeout - all at once synchronously
          try {
            // Get the active profile to use its column state directly
            const { activeProfileId, profiles } = get();
            const activeProfile = profiles.find(p => p.id === activeProfileId);

            if (!activeProfile) {
              console.warn('Cannot apply settings: active profile not found');
              return;
            }

            // IMPORTANT: Use the column state from the active profile, not from settings
            // This ensures we're using the most recently saved state
            const columnsState = activeProfile.columnsState;

            // Log the active profile for debugging
            if (process.env.NODE_ENV === 'development') {
              console.log('Active profile when applying settings:', {
                id: activeProfile.id,
                name: activeProfile.name,
                updatedAt: new Date(activeProfile.updatedAt).toLocaleString()
              });
            }

            // Apply column state if available
            if (columnsState && Array.isArray(columnsState) && columnsState.length > 0) {
              try {
                // Ensure column state is in the correct format
                const formattedColumnState = columnsState.map((col: any) => {
                  // Make sure each column state has a colId
                  if (!col.colId && col.columnId) {
                    return { ...col, colId: col.columnId };
                  }
                  return col;
                });

                // Get current column widths to preserve them
                const currentWidths = {};
                try {
                  if (typeof gridApi.getColumnState === 'function') {
                    const columnState = gridApi.getColumnState();
                    columnState.forEach(col => {
                      if (col.colId && col.width) {
                        currentWidths[col.colId] = col.width;
                      }
                    });
                  }
                } catch (error) {
                  console.error('Error getting current column widths:', error);
                }

                // Extract visibility information
                const visibleCols = formattedColumnState.filter(col => !col.hide).map(col => col.colId);
                const hiddenCols = formattedColumnState.filter(col => col.hide).map(col => col.colId);

                // Log column visibility state before applying
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Applying column state from active profile - visible columns (${visibleCols.length}):`, visibleCols);
                  console.log(`Applying column state from active profile - hidden columns (${hiddenCols.length}):`, hiddenCols);
                }

                // APPROACH 1: Try using setColumnsVisible if available (most direct approach)
                if (typeof gridApi.setColumnsVisible === 'function') {
                  console.log('Using gridApi.setColumnsVisible method');

                  // First hide all columns
                  const allColumnIds = [...visibleCols, ...hiddenCols];
                  gridApi.setColumnsVisible(allColumnIds, false);

                  // Then make visible columns visible
                  if (visibleCols.length > 0) {
                    gridApi.setColumnsVisible(visibleCols, true);
                  }
                }
                // APPROACH 2: Try using columnApi if available
                else if (gridApi.columnApi && typeof gridApi.columnApi.setColumnsVisible === 'function') {
                  console.log('Using columnApi.setColumnsVisible method');

                  // First hide all columns
                  const allColumnIds = [...visibleCols, ...hiddenCols];
                  gridApi.columnApi.setColumnsVisible(allColumnIds, false);

                  // Then make visible columns visible
                  if (visibleCols.length > 0) {
                    gridApi.columnApi.setColumnsVisible(visibleCols, true);
                  }
                }
                // APPROACH 3: Try using applyColumnState if available
                else if (typeof gridApi.applyColumnState === 'function') {
                  console.log('Using applyColumnState to apply column visibility');

                  // First, ensure all columns are visible to reset state
                  if (typeof gridApi.getColumns === 'function') {
                    const allColumns = gridApi.getColumns();
                    const resetState = allColumns.map(col => ({
                      colId: col.getColId(),
                      hide: false
                    }));

                    gridApi.applyColumnState({
                      state: resetState,
                      defaultState: { hide: false }
                    });
                  }

                  // Then apply the saved state
                  gridApi.applyColumnState({
                    state: formattedColumnState,
                    applyOrder: true
                  });
                }
                // APPROACH 4: Try using individual column API
                else if (typeof gridApi.getColumn === 'function') {
                  console.log('Using individual column API to apply column visibility');

                  // Process all columns in the state
                  formattedColumnState.forEach(colState => {
                    const column = gridApi.getColumn(colState.colId);
                    if (column && typeof column.setVisible === 'function') {
                      column.setVisible(!colState.hide);
                    }
                  });
                }
                else {
                  console.error('No suitable method found to apply column visibility');
                }

                // Verify column visibility was applied correctly
                if (process.env.NODE_ENV === 'development' && typeof gridApi.getColumnState === 'function') {
                  const currentState = gridApi.getColumnState();
                  const currentVisibleCols = currentState.filter(col => !col.hide).map(col => col.colId);
                  const currentHiddenCols = currentState.filter(col => col.hide).map(col => col.colId);

                  console.log(`After applying column state - visible columns (${currentVisibleCols.length}):`, currentVisibleCols);
                  console.log(`After applying column state - hidden columns (${currentHiddenCols.length}):`, currentHiddenCols);

                  // Compare with expected state
                  const expectedHiddenCols = formattedColumnState.filter(col => col.hide).map(col => col.colId);
                  const actualHiddenCols = currentState.filter(col => col.hide).map(col => col.colId);

                  // Check if all expected hidden columns are actually hidden
                  const allHiddenCorrectly = expectedHiddenCols.every(colId =>
                    actualHiddenCols.includes(colId)
                  );

                  console.log(`All expected hidden columns are hidden: ${allHiddenCorrectly}`);

                  if (!allHiddenCorrectly) {
                    console.warn('Some columns were not hidden correctly!');
                    console.log('Expected hidden columns:', expectedHiddenCols);
                    console.log('Actual hidden columns:', actualHiddenCols);

                    // Try one more time with our force apply function
                    console.log('Trying force apply function to fix visibility...');
                    get().forceApplyColumnVisibility();
                  }
                }

                needsRefresh = true;
              } catch (error) {
                console.warn('Failed to apply column state:', error);
              }
            }

            // Apply filter state if available
            if (typeof gridApi.setFilterModel === 'function') {
              try {
                // Always set filter model, even if null/empty to clear existing filters
                gridApi.setFilterModel(settings.filterState);
                needsRefresh = true;
              } catch (error) {
                console.warn('Error applying filter state:', error);
              }
            }

            // Apply sort state if available
            if (settings.sortState && Array.isArray(settings.sortState) && settings.sortState.length > 0) {
              // Check if setSortModel exists
              if (typeof gridApi.setSortModel === 'function') {
                try {
                  gridApi.setSortModel(settings.sortState);
                  needsRefresh = true;
                } catch (error) {
                  console.warn('Error applying sort state:', error);
                }
              }
              // Alternative approach using applyColumnState
              else if (typeof gridApi.applyColumnState === 'function') {
                try {
                  // Transform sort state into column state format
                  const columnSortState = settings.sortState.map((sort: any) => ({
                    colId: sort.colId || sort.columnId,
                    sort: sort.sort,
                    sortIndex: sort.sortIndex
                  }));

                  // Only apply sort to columns mentioned in the sort state
                  gridApi.applyColumnState({
                    state: columnSortState,
                    defaultState: { sort: null }
                  });
                  needsRefresh = true;
                } catch (error) {
                  console.warn('Error applying column sort state:', error);
                }
              }
            }

            // Apply row group state if available
            if (settings.rowGroupState) {
              if (typeof gridApi.setRowGroupColumns === 'function') {
                try {
                  gridApi.setRowGroupColumns(settings.rowGroupState);
                  needsRefresh = true;
                } catch (error) {
                  console.warn('Error applying row group state:', error);
                }
              }
            }

            // Apply pivot state if available
            if (settings.pivotState) {
              if (typeof gridApi.setPivotColumns === 'function') {
                try {
                  gridApi.setPivotColumns(settings.pivotState);
                  needsRefresh = true;
                } catch (error) {
                  console.warn('Error applying pivot state:', error);
                }
              }
            }

            // Apply chart state if available
            if (settings.chartState) {
              if (typeof gridApi.restoreChartModels === 'function') {
                try {
                  gridApi.restoreChartModels(settings.chartState);
                  needsRefresh = true;
                } catch (error) {
                  console.warn('Error applying chart state:', error);
                }
              }
            }

            // Single refresh at the end ONLY if we performed an operation that needs it
            if (needsRefresh) {
              try {
                if (typeof gridApi.refreshCells === 'function') {
                  console.log('Performing single grid refresh after applying settings');
                  gridApi.refreshCells({ force: true });
                }
              } catch (error) {
                console.warn('Failed to refresh cells:', error);
              }
            }
          } catch (error) {
            console.error('Error applying settings to grid:', error);
          }
        },

        // Reset settings to match active profile
        resetSettingsToProfile: () => {
          const { profiles, activeProfileId, gridApi } = get();
          const activeProfile = profiles.find(p => p.id === activeProfileId) || defaultProfile;

          // Create a deep copy of profile settings to avoid reference issues
          const safeSettings = {
            font: activeProfile.font,
            fontSize: activeProfile.fontSize,
            density: activeProfile.density,
            columnsState: activeProfile.columnsState ? JSON.parse(JSON.stringify(activeProfile.columnsState)) : null,
            filterState: activeProfile.filterState ? JSON.parse(JSON.stringify(activeProfile.filterState)) : null,
            sortState: activeProfile.sortState ? JSON.parse(JSON.stringify(activeProfile.sortState)) : null,
            rowGroupState: activeProfile.rowGroupState ? JSON.parse(JSON.stringify(activeProfile.rowGroupState)) : null,
            pivotState: activeProfile.pivotState ? JSON.parse(JSON.stringify(activeProfile.pivotState)) : null,
            chartState: activeProfile.chartState ? JSON.parse(JSON.stringify(activeProfile.chartState)) : null,
            columnSettingsProfiles: activeProfile.columnSettingsProfiles ?
              JSON.parse(JSON.stringify(activeProfile.columnSettingsProfiles)) : {},
            themeMode: activeProfile.themeMode || 'system'
          };

          // Log column visibility state for debugging
          if (process.env.NODE_ENV === 'development' && safeSettings.columnsState) {
            const visibleCols = safeSettings.columnsState.filter((col: any) => !col.hide).map((col: any) => col.colId);
            const hiddenCols = safeSettings.columnsState.filter((col: any) => col.hide).map((col: any) => col.colId);
            console.log(`Reset settings - visible columns (${visibleCols.length}):`, visibleCols);
            console.log(`Reset settings - hidden columns (${hiddenCols.length}):`, hiddenCols);
          }

          // Update settings in store
          set({
            settings: safeSettings,
            isDirty: false
          });

          // Apply settings immediately if grid API exists (no setTimeout)
          if (gridApi && typeof gridApi.getColumn === 'function') {
            try {
              console.log('Applying reset profile settings to grid');
              get().applySettingsToGrid();
            } catch (error) {
              console.error('Error applying settings after reset:', error);
            }
          }
        },

        // Update theme mode
        setThemeMode: (mode) => {
          set(state => ({
            settings: {
              ...state.settings,
              themeMode: mode
            },
            isDirty: true
          }));
        },

        // Column settings management
        getColumnSettings: (columnField) => {
          const { settings } = get();
          if (!settings.columnSettingsProfiles) {
            return null;
          }

          const profileName = `${columnField}_settings`;
          return settings.columnSettingsProfiles[profileName] || null;
        },

        // Debug function to test column visibility
        debugColumnVisibility: () => {
          const { gridApi } = get();
          if (!gridApi) {
            console.warn('Cannot debug column visibility: gridApi is null');
            return;
          }

          try {
            console.log('=== DEBUGGING COLUMN VISIBILITY ===');

            // Check if required methods exist
            if (typeof gridApi.getColumnState !== 'function') {
              console.error('gridApi.getColumnState is not a function. API methods available:',
                Object.keys(gridApi).filter(key => typeof gridApi[key] === 'function'));
              console.log('=== END DEBUGGING (API METHODS MISSING) ===');
              return;
            }

            if (typeof gridApi.applyColumnState !== 'function') {
              console.error('gridApi.applyColumnState is not a function');
              console.log('=== END DEBUGGING (API METHODS MISSING) ===');
              return;
            }

            // Get current column state
            const columnState = gridApi.getColumnState();

            // Log visibility state
            const visibleColumns = columnState.filter(col => !col.hide).map(col => col.colId);
            const hiddenColumns = columnState.filter(col => col.hide).map(col => col.colId);

            console.log(`Current visible columns (${visibleColumns.length}):`, visibleColumns);
            console.log(`Current hidden columns (${hiddenColumns.length}):`, hiddenColumns);

            // Test hiding a column
            if (visibleColumns.length > 0) {
              const testColumn = visibleColumns[0];
              console.log(`Testing hiding column: ${testColumn}`);

              // Hide the column
              gridApi.applyColumnState({
                state: [{ colId: testColumn, hide: true }]
              });

              // Verify it was hidden
              const newState = gridApi.getColumnState();
              const isHidden = newState.find(col => col.colId === testColumn)?.hide;
              console.log(`Column ${testColumn} is now hidden: ${isHidden}`);

              // Save the current state to the active profile
              get().saveSettingsToProfile();

              console.log('Saved profile with hidden column');

              // Get the active profile and check if the column is hidden in the saved state
              const activeProfile = get().getActiveProfile();
              const savedColumnsState = activeProfile.columnsState;

              if (savedColumnsState) {
                const savedColumnState = savedColumnsState.find((col: any) => col.colId === testColumn);
                console.log(`Column ${testColumn} in saved state:`, savedColumnState);
              } else {
                console.log('No columnsState found in active profile');
              }
            }

            console.log('=== END DEBUGGING ===');
          } catch (error) {
            console.error('Error debugging column visibility:', error);
          }
        },

        // Force apply column visibility from active profile
        forceApplyColumnVisibility: () => {
          const { gridApi, activeProfileId, profiles } = get();
          if (!gridApi) {
            console.warn('Cannot apply column visibility: gridApi is null');
            return;
          }

          try {
            console.log('Force applying column visibility from active profile');

            // Get the active profile
            const activeProfile = profiles.find(p => p.id === activeProfileId);
            if (!activeProfile || !activeProfile.columnsState) {
              console.warn('Cannot apply column visibility: active profile or columnsState not found');
              return;
            }

            // DIRECT APPROACH: Use setColumnsVisible which is more reliable
            // This is the most direct way to control column visibility in AG-Grid

            // Get visible and hidden columns from profile
            const allColumnsState = activeProfile.columnsState || [];
            const visibleColumns = allColumnsState
              .filter((col: any) => !col.hide)
              .map((col: any) => col.colId);

            const hiddenColumns = allColumnsState
              .filter((col: any) => col.hide)
              .map((col: any) => col.colId);

            console.log(`Profile has ${visibleColumns.length} visible columns and ${hiddenColumns.length} hidden columns`);
            console.log('Visible columns:', visibleColumns);
            console.log('Hidden columns:', hiddenColumns);

            // Try multiple approaches to ensure it works

            // APPROACH 1: Use setColumnsVisible if available
            if (typeof gridApi.setColumnsVisible === 'function') {
              console.log('Using gridApi.setColumnsVisible method');

              // First hide all columns
              const allColumnIds = [...visibleColumns, ...hiddenColumns];
              gridApi.setColumnsVisible(allColumnIds, false);

              // Then make visible columns visible
              if (visibleColumns.length > 0) {
                gridApi.setColumnsVisible(visibleColumns, true);
              }
            }
            // APPROACH 2: Use columnApi if available
            else if (gridApi.columnApi && typeof gridApi.columnApi.setColumnsVisible === 'function') {
              console.log('Using columnApi.setColumnsVisible method');

              // First hide all columns
              const allColumnIds = [...visibleColumns, ...hiddenColumns];
              gridApi.columnApi.setColumnsVisible(allColumnIds, false);

              // Then make visible columns visible
              if (visibleColumns.length > 0) {
                gridApi.columnApi.setColumnsVisible(visibleColumns, true);
              }
            }
            // APPROACH 3: Use individual column API
            else if (typeof gridApi.getColumn === 'function') {
              console.log('Using individual column visibility API');

              // Process all columns in the state
              allColumnsState.forEach((colState: any) => {
                const column = gridApi.getColumn(colState.colId);
                if (column && typeof column.setVisible === 'function') {
                  column.setVisible(!colState.hide);
                  console.log(`Set column ${colState.colId} visibility to ${!colState.hide}`);
                }
              });
            }
            // APPROACH 4: Use applyColumnState if available
            else if (typeof gridApi.applyColumnState === 'function') {
              console.log('Using applyColumnState method');

              // Apply the full column state from the profile
              gridApi.applyColumnState({
                state: allColumnsState,
                applyOrder: true
              });
            }
            else {
              console.error('No suitable method found to apply column visibility');
            }

            // Verify the result if possible
            if (typeof gridApi.getColumnState === 'function') {
              const currentState = gridApi.getColumnState();
              const currentVisibleColumns = currentState
                .filter(col => !col.hide)
                .map(col => col.colId);

              const currentHiddenColumns = currentState
                .filter(col => col.hide)
                .map(col => col.colId);

              console.log(`After force applying, ${currentVisibleColumns.length} columns are visible:`, currentVisibleColumns);
              console.log(`After force applying, ${currentHiddenColumns.length} columns are hidden:`, currentHiddenColumns);

              // Check if visibility matches expected state
              const visibilityMatches =
                visibleColumns.every(colId => currentVisibleColumns.includes(colId)) &&
                hiddenColumns.every(colId => currentHiddenColumns.includes(colId));

              console.log(`Column visibility matches expected state: ${visibilityMatches}`);
            }

            // Refresh the grid
            if (typeof gridApi.refreshCells === 'function') {
              gridApi.refreshCells({ force: true });
            }

            // Final refresh of the grid UI
            if (typeof gridApi.redrawRows === 'function') {
              gridApi.redrawRows();
            }
          } catch (error) {
            console.error('Error force applying column visibility:', error);
          }
        },

        // Test function to save and load column visibility
        testSaveLoadColumnVisibility: () => {
          const { gridApi } = get();
          if (!gridApi) {
            console.warn('Cannot test column visibility: gridApi is null');
            return;
          }

          try {
            console.log('=== TESTING COLUMN VISIBILITY SAVE/LOAD ===');

            // Get current column state using the most reliable method available
            let initialState;
            let visibleColumns;
            let hiddenColumns;

            // Try different approaches to get column state
            if (typeof gridApi.getColumnState === 'function') {
              initialState = gridApi.getColumnState();
              visibleColumns = initialState.filter(col => !col.hide).map(col => col.colId);
              hiddenColumns = initialState.filter(col => col.hide).map(col => col.colId);
            }
            else if (gridApi.columnApi && typeof gridApi.columnApi.getColumnState === 'function') {
              initialState = gridApi.columnApi.getColumnState();
              visibleColumns = initialState.filter(col => !col.hide).map(col => col.colId);
              hiddenColumns = initialState.filter(col => col.hide).map(col => col.colId);
            }
            else if (typeof gridApi.getColumns === 'function') {
              // Fallback to getting columns directly
              const allColumns = gridApi.getColumns();
              visibleColumns = allColumns.filter(col => col.isVisible()).map(col => col.getColId());
              hiddenColumns = allColumns.filter(col => !col.isVisible()).map(col => col.getColId());

              // Create a synthetic state object
              initialState = allColumns.map(col => ({
                colId: col.getColId(),
                hide: !col.isVisible()
              }));
            }
            else {
              console.error('No suitable method found to get column state');
              console.log('Available API methods:', Object.keys(gridApi).filter(key => typeof gridApi[key] === 'function'));
              console.log('=== END TESTING (API METHODS MISSING) ===');
              return;
            }

            console.log(`Initial visible columns (${visibleColumns.length}):`, visibleColumns);
            console.log(`Initial hidden columns (${hiddenColumns.length}):`, hiddenColumns);

            // Step 2: Toggle visibility of some columns
            if (visibleColumns.length > 0) {
              // Hide first visible column
              const columnToHide = visibleColumns[0];
              console.log(`Testing hiding column: ${columnToHide}`);

              // Show first hidden column if any
              let columnToShow = null;
              if (hiddenColumns.length > 0) {
                columnToShow = hiddenColumns[0];
                console.log(`Testing showing column: ${columnToShow}`);
              }

              // Apply changes using the most reliable method available
              if (typeof gridApi.setColumnsVisible === 'function') {
                console.log('Using setColumnsVisible to change column visibility');
                gridApi.setColumnsVisible([columnToHide], false);
                if (columnToShow) {
                  gridApi.setColumnsVisible([columnToShow], true);
                }
              }
              else if (gridApi.columnApi && typeof gridApi.columnApi.setColumnsVisible === 'function') {
                console.log('Using columnApi.setColumnsVisible to change column visibility');
                gridApi.columnApi.setColumnsVisible([columnToHide], false);
                if (columnToShow) {
                  gridApi.columnApi.setColumnsVisible([columnToShow], true);
                }
              }
              else if (typeof gridApi.applyColumnState === 'function') {
                console.log('Using applyColumnState to change column visibility');
                const stateChanges = [
                  { colId: columnToHide, hide: true }
                ];

                if (columnToShow) {
                  stateChanges.push({ colId: columnToShow, hide: false });
                }

                gridApi.applyColumnState({
                  state: stateChanges
                });
              }
              else if (typeof gridApi.getColumn === 'function') {
                console.log('Using individual column API to change column visibility');
                const column = gridApi.getColumn(columnToHide);
                if (column && typeof column.setVisible === 'function') {
                  column.setVisible(false);
                }

                if (columnToShow) {
                  const showColumn = gridApi.getColumn(columnToShow);
                  if (showColumn && typeof showColumn.setVisible === 'function') {
                    showColumn.setVisible(true);
                  }
                }
              }
              else {
                console.error('No suitable method found to change column visibility');
                console.log('=== END TESTING (API METHODS MISSING) ===');
                return;
              }

              // Verify changes
              let isHidden = false;
              let isShown = false;

              if (typeof gridApi.getColumnState === 'function') {
                const updatedState = gridApi.getColumnState();
                isHidden = updatedState.find(col => col.colId === columnToHide)?.hide;
                if (columnToShow) {
                  isShown = !updatedState.find(col => col.colId === columnToShow)?.hide;
                }
              }
              else if (typeof gridApi.getColumn === 'function') {
                const column = gridApi.getColumn(columnToHide);
                if (column && typeof column.isVisible === 'function') {
                  isHidden = !column.isVisible();
                }

                if (columnToShow) {
                  const showColumn = gridApi.getColumn(columnToShow);
                  if (showColumn && typeof showColumn.isVisible === 'function') {
                    isShown = showColumn.isVisible();
                  }
                }
              }

              console.log(`Column ${columnToHide} is now hidden: ${isHidden}`);
              if (columnToShow) {
                console.log(`Column ${columnToShow} is now visible: ${isShown}`);
              }

              // Step 3: Save to profile
              console.log('Saving column state to profile...');
              get().saveSettingsToProfile();

              // Step 4: Verify saved state
              const activeProfile = get().getActiveProfile();
              const savedColumnsState = activeProfile.columnsState;

              if (savedColumnsState) {
                const savedHiddenState = savedColumnsState.find((col: any) => col.colId === columnToHide)?.hide;
                console.log(`Column ${columnToHide} is hidden in saved state: ${savedHiddenState}`);

                if (columnToShow) {
                  const savedShownState = savedColumnsState.find((col: any) => col.colId === columnToShow)?.hide;
                  console.log(`Column ${columnToShow} is hidden in saved state: ${savedShownState}`);
                }
              } else {
                console.log('No columnsState found in active profile');
              }

              // Step 5: Reset column state to initial
              console.log('Resetting column state to all visible...');

              // Make all columns visible using the most reliable method
              if (typeof gridApi.setColumnsVisible === 'function') {
                const allColumnIds = [...visibleColumns, ...hiddenColumns];
                gridApi.setColumnsVisible(allColumnIds, true);
              }
              else if (gridApi.columnApi && typeof gridApi.columnApi.setColumnsVisible === 'function') {
                const allColumnIds = [...visibleColumns, ...hiddenColumns];
                gridApi.columnApi.setColumnsVisible(allColumnIds, true);
              }
              else if (typeof gridApi.applyColumnState === 'function') {
                const resetState = initialState.map(col => ({
                  colId: col.colId,
                  hide: false
                }));

                gridApi.applyColumnState({
                  state: resetState
                });
              }
              else if (typeof gridApi.getColumn === 'function') {
                [...visibleColumns, ...hiddenColumns].forEach(colId => {
                  const column = gridApi.getColumn(colId);
                  if (column && typeof column.setVisible === 'function') {
                    column.setVisible(true);
                  }
                });
              }

              // Verify reset
              let allVisibleAfterReset = true;

              if (typeof gridApi.getColumnState === 'function') {
                const resetVerifyState = gridApi.getColumnState();
                allVisibleAfterReset = resetVerifyState.every(col => !col.hide);
              }
              else if (typeof gridApi.getColumns === 'function') {
                const allColumns = gridApi.getColumns();
                allVisibleAfterReset = allColumns.every(col => col.isVisible());
              }

              console.log(`All columns visible after reset: ${allVisibleAfterReset}`);

              // Step 6: Load from profile using our improved method
              console.log('Loading column state from profile using forceApplyColumnVisibility...');
              get().forceApplyColumnVisibility();

              // Step 7: Verify loaded state
              let finalHiddenState = false;
              let finalShownState = false;

              if (typeof gridApi.getColumnState === 'function') {
                const finalState = gridApi.getColumnState();
                finalHiddenState = finalState.find(col => col.colId === columnToHide)?.hide;
                if (columnToShow) {
                  finalShownState = !finalState.find(col => col.colId === columnToShow)?.hide;
                }
              }
              else if (typeof gridApi.getColumn === 'function') {
                const column = gridApi.getColumn(columnToHide);
                if (column && typeof column.isVisible === 'function') {
                  finalHiddenState = !column.isVisible();
                }

                if (columnToShow) {
                  const showColumn = gridApi.getColumn(columnToShow);
                  if (showColumn && typeof showColumn.isVisible === 'function') {
                    finalShownState = showColumn.isVisible();
                  }
                }
              }

              console.log(`Column ${columnToHide} is hidden after loading profile: ${finalHiddenState}`);
              if (columnToShow) {
                console.log(`Column ${columnToShow} is visible after loading profile: ${finalShownState}`);
              }

              // Compare with saved state
              if (savedColumnsState) {
                const savedHiddenState = savedColumnsState.find((col: any) => col.colId === columnToHide)?.hide;
                console.log(`Column visibility matches saved state: ${savedHiddenState === finalHiddenState}`);

                if (columnToShow) {
                  const savedShownState = !savedColumnsState.find((col: any) => col.colId === columnToShow)?.hide;
                  console.log(`Column visibility matches saved state: ${savedShownState === finalShownState}`);
                }
              }
            } else {
              console.log('No visible columns to test with');
            }

            console.log('=== END TESTING ===');
          } catch (error) {
            console.error('Error testing column visibility save/load:', error);
          }
        },

        saveColumnSettings: (columnField, columnSettings) => {
          const { settings, gridApi } = get();

          // Get the current column width from the grid if available
          let updatedSettings = { ...columnSettings };

          if (gridApi && typeof gridApi.getColumn === 'function') {
            try {
              const column = gridApi.getColumn(columnField);
              if (column) {
                // Get the current width from the column state
                const columnState = gridApi.getColumnState();
                const columnInfo = columnState.find((col: any) => col.colId === columnField);
                if (columnInfo && columnInfo.width) {
                  // Update the width in the settings
                  updatedSettings.general = {
                    ...updatedSettings.general,
                    width: columnInfo.width.toString()
                  };

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Captured current width for column ${columnField}: ${columnInfo.width}px`);
                  }
                }
              }
            } catch (error) {
              console.error('Error capturing column width:', error);
            }
          }

          const profileName = `${columnField}_settings`;
          const updatedProfiles = {
            ...settings.columnSettingsProfiles,
            [profileName]: updatedSettings
          };

          // Update settings with new column profiles
          set(state => ({
            settings: {
              ...state.settings,
              columnSettingsProfiles: updatedProfiles
            },
            isDirty: true
          }));

          // RULE 1: Don't update the grid after saving settings
          // The grid already has these settings since we just captured them

          // Show a toast notification
          if (typeof window !== 'undefined') {
            // Import toast dynamically to avoid circular dependencies
            import('@/hooks/use-toast').then(({ toast }) => {
              toast({
                title: 'Column Settings Saved',
                description: `Settings for column "${columnField}" have been saved`,
                variant: 'default',
              });
            }).catch(error => {
              console.error('Error showing toast notification:', error);
            });
          }
          return true;
        },

        // Style batch operations
        batchApplyHeaderStyles: (columnField, styles) => {
          console.log(`Applying header styles for column ${columnField}:`, styles);

          // Create a deep copy of the styles to avoid reference issues
          pendingHeaderStyles[columnField] = JSON.parse(JSON.stringify(styles));

          // Create a direct style element for this specific column to ensure it applies
          const styleId = `direct-header-style-${columnField}`;
          let styleElement = document.getElementById(styleId);
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
          }

          // Generate column-specific CSS with maximum specificity
          let directStyles = '';
          const style = styles;

          if (style) {
            // Build style string with individual properties - only include defined properties
            let cssProps = '';

            // Always apply these styles regardless of any flag
            if (style.fontFamily) cssProps += `font-family: ${style.fontFamily} !important; `;
            if (style.fontSize) cssProps += `font-size: ${style.fontSize} !important; `;
            if (style.bold) cssProps += 'font-weight: bold !important; ';
            if (style.italic) cssProps += 'font-style: italic !important; ';
            if (style.underline) cssProps += 'text-decoration: underline !important; ';
            if (style.alignH) cssProps += `text-align: ${style.alignH} !important; `;

            // Only include text color if it's explicitly defined and controlled by applyTextColor
            if (style.textColor !== undefined) cssProps += `color: ${style.textColor} !important; `;

            // Only include background color if it's explicitly defined and controlled by applyBackgroundColor
            if (style.backgroundColor !== undefined) cssProps += `background-color: ${style.backgroundColor} !important; `;

            // Add border styles if all required properties are explicitly defined and controlled by applyBorder
            if (style.borderStyle !== undefined &&
                style.borderWidth !== undefined &&
                style.borderColor !== undefined &&
                style.borderSides !== undefined) {
              const borderStyle = `${style.borderWidth}px ${style.borderStyle.toLowerCase()} ${style.borderColor}`;
              const borderProperty = style.borderSides === 'All' ? 'border' : `border-${style.borderSides.toLowerCase()}`;

              cssProps += `${borderProperty}: ${borderStyle} !important; `;
            }

            // Apply to all possible header selectors with high specificity
            if (cssProps) {
              directStyles += `
                /* Direct attribute selectors with high specificity */
                div.ag-theme-quartz .ag-header-cell[col-id="${columnField}"],
                div.ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"],
                html body div.ag-theme-quartz .ag-header-cell[col-id="${columnField}"],
                html body div.ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"],
                div.ag-theme-quartz div.ag-header-container div.ag-header-row div.ag-header-cell[col-id="${columnField}"],
                .ag-theme-quartz .ag-header-cell.custom-header-${columnField},
                .ag-theme-quartz-dark .ag-header-cell.custom-header-${columnField} {
                  ${cssProps}
                }
              `;

              // Special handling for text alignment
              if (style.alignH) {
                directStyles += `
                  /* Direct label alignment with high specificity */
                  div.ag-theme-quartz .ag-header-cell[col-id="${columnField}"] .ag-header-cell-label,
                  div.ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"] .ag-header-cell-label,
                  div.ag-theme-quartz div.ag-header-cell[col-id="${columnField}"] div.ag-header-cell-label,
                  div.ag-theme-quartz-dark div.ag-header-cell[col-id="${columnField}"] div.ag-header-cell-label,
                  html body div.ag-theme-quartz div.ag-header-cell[col-id="${columnField}"] div.ag-header-cell-label,
                  html body div.ag-theme-quartz-dark div.ag-header-cell[col-id="${columnField}"] div.ag-header-cell-label {
                    justify-content: ${style.alignH === 'left' ? 'flex-start' :
                                      style.alignH === 'center' ? 'center' : 'flex-end'} !important;
                  }
                `;
              }
            }
          }

          // Apply the direct styles immediately
          if (styleElement && directStyles) {
            styleElement.textContent = directStyles;
            console.log(`Applied direct header styles for column ${columnField}`);
          }

          // Also schedule a general flush to ensure all styles are applied together
          if (!styleFlushScheduled) {
            styleFlushScheduled = true;
            // Immediately flush the styles
            if (get().flushBatchedStyles) {
              get().flushBatchedStyles();
            }
          }
        },

        batchApplyCellStyles: (columnField, styles) => {
          console.log(`Applying cell styles for column ${columnField}:`, styles);

          // Create a deep copy of the styles to avoid reference issues
          pendingCellStyles[columnField] = JSON.parse(JSON.stringify(styles));

          // Create a direct style element for this specific column to ensure it applies
          const styleId = `direct-cell-style-${columnField}`;
          let styleElement = document.getElementById(styleId);
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
          }

          // Generate column-specific CSS with maximum specificity
          let directStyles = '';
          const style = styles;

          if (style) {
            // Build style string with individual properties - only include defined properties
            let cssProps = '';

            // Always apply these styles regardless of any flag
            if (style.fontFamily) cssProps += `font-family: ${style.fontFamily} !important; `;
            if (style.fontSize) cssProps += `font-size: ${style.fontSize} !important; `;
            if (style.bold) cssProps += 'font-weight: bold !important; ';
            if (style.italic) cssProps += 'font-style: italic !important; ';
            if (style.underline) cssProps += 'text-decoration: underline !important; ';
            if (style.alignH) cssProps += `text-align: ${style.alignH} !important; `;

            // Only include text color if it's explicitly defined and controlled by applyTextColor
            if (style.textColor !== undefined) cssProps += `color: ${style.textColor} !important; `;

            // Only include background color if it's explicitly defined and controlled by applyBackgroundColor
            if (style.backgroundColor !== undefined) cssProps += `background-color: ${style.backgroundColor} !important; `;

            // Add border styles if all required properties are explicitly defined and controlled by applyBorder
            if (style.borderStyle !== undefined &&
                style.borderWidth !== undefined &&
                style.borderColor !== undefined &&
                style.borderSides !== undefined) {
              const borderStyle = `${style.borderWidth}px ${style.borderStyle.toLowerCase()} ${style.borderColor}`;
              const borderProperty = style.borderSides === 'All' ? 'border' : `border-${style.borderSides.toLowerCase()}`;

              cssProps += `${borderProperty}: ${borderStyle} !important; `;
            }

            // Apply to all possible cell selectors with high specificity
            if (cssProps) {
              directStyles += `
                /* Direct attribute selectors with high specificity */
                html body div.ag-theme-quartz div.ag-cell[col-id="${columnField}"],
                html body div.ag-theme-quartz-dark div.ag-cell[col-id="${columnField}"],
                div.ag-theme-quartz div.ag-center-cols-container div.ag-row div.ag-cell[col-id="${columnField}"],
                div.ag-theme-quartz-dark div.ag-center-cols-container div.ag-row div.ag-cell[col-id="${columnField}"],
                div.ag-theme-quartz .ag-cell[col-id="${columnField}"],
                div.ag-theme-quartz-dark .ag-cell[col-id="${columnField}"],
                .ag-row-even .ag-cell[col-id="${columnField}"],
                .ag-row-odd .ag-cell[col-id="${columnField}"],
                div.ag-theme-quartz .ag-cell.custom-cell-${columnField},
                div.ag-theme-quartz-dark .ag-cell.custom-cell-${columnField} {
                  ${cssProps} !important;
                }
              `;
            }
          }

          // Apply the direct styles immediately
          if (styleElement && directStyles) {
            styleElement.textContent = directStyles;
            console.log(`Applied direct cell styles for column ${columnField}`);
          }

          // Also schedule a general flush to ensure all styles are applied together
          if (!styleFlushScheduled) {
            styleFlushScheduled = true;
            // Immediately flush the styles
            if (get().flushBatchedStyles) {
              get().flushBatchedStyles();
            }
          }
        },

        flushBatchedStyles: () => {
          styleFlushScheduled = false;

          // Use requestAnimationFrame to batch style updates with browser rendering
          requestAnimationFrame(() => {
            // Apply all batched styles at once
            const headerColumns = Object.keys(pendingHeaderStyles);
            const cellColumns = Object.keys(pendingCellStyles);

            if (headerColumns.length === 0 && cellColumns.length === 0) {
              return;
            }

            if (process.env.NODE_ENV === 'development') {
              console.log(`Flushing batched styles - ${headerColumns.length} header styles, ${cellColumns.length} cell styles`);
            }

            // Apply all header styles in a single batch
            if (headerColumns.length > 0) {
              // Create a single stylesheet for all header styles
              let allHeaderStyles = '';

              headerColumns.forEach(columnField => {
                const styles = pendingHeaderStyles[columnField];
                if (!styles) return;

                // Convert styles object to CSS - simplified selectors for better performance
                let columnStyle = '';

                // Always apply these styles regardless of any flags
                if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
                if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
                if (styles.bold) columnStyle += 'font-weight: bold; ';
                if (styles.italic) columnStyle += 'font-style: italic; ';
                if (styles.underline) columnStyle += 'text-decoration: underline; ';
                if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

                // Only include text color if explicitly defined
                if (styles.textColor !== undefined) columnStyle += `color: ${styles.textColor}; `;

                // Only include background color if explicitly defined
                if (styles.backgroundColor !== undefined) columnStyle += `background-color: ${styles.backgroundColor}; `;

                if (columnStyle) {
                  allHeaderStyles += `
                    .ag-theme-quartz .ag-header-cell[col-id="${columnField}"],
                    .ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"] {
                      ${columnStyle} !important;
                    }
                  `;

                  // Special handling for text alignment - simplified
                  if (styles.alignH) {
                    allHeaderStyles += `
                      .ag-theme-quartz .ag-header-cell[col-id="${columnField}"] .ag-header-cell-label,
                      .ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"] .ag-header-cell-label {
                        justify-content: ${styles.alignH === 'left' ? 'flex-start' :
                                        styles.alignH === 'center' ? 'center' : 'flex-end'} !important;
                      }
                    `;
                  }
                }

                // Add border styles if specified
                if (styles.borderStyle !== undefined &&
                    styles.borderWidth !== undefined &&
                    styles.borderColor !== undefined &&
                    styles.borderSides !== undefined) {
                  const borderStyle = `${styles.borderWidth}px ${styles.borderStyle.toLowerCase()} ${styles.borderColor}`;
                  const borderProperty = styles.borderSides === 'All' ? 'border' : `border-${styles.borderSides.toLowerCase()}`;

                  allHeaderStyles += `
                    .ag-theme-quartz .ag-header-cell[col-id="${columnField}"],
                    .ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"] {
                      ${borderProperty}: ${borderStyle} !important;
                    }
                  `;
                }
              });

              // Apply all header styles at once
              if (allHeaderStyles) {
                let styleElement = document.getElementById('batched-header-styles');
                if (!styleElement) {
                  styleElement = document.createElement('style');
                  styleElement.id = 'batched-header-styles';
                  document.head.appendChild(styleElement);
                }

                // Simplified theme styles for better performance
                styleElement.textContent = allHeaderStyles;
              }

              // Clear pending header styles
              pendingHeaderStyles = {};
            }

            // Apply all cell styles in a single batch
            if (cellColumns.length > 0) {
              // Create a single stylesheet for all cell styles
              let allCellStyles = '';

              cellColumns.forEach(columnField => {
                const styles = pendingCellStyles[columnField];
                if (!styles) return;

                // Convert styles object to CSS - simplified for better performance
                let columnStyle = '';

                // Always apply these styles regardless of any flags
                if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
                if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
                if (styles.bold) columnStyle += 'font-weight: bold; ';
                if (styles.italic) columnStyle += 'font-style: italic; ';
                if (styles.underline) columnStyle += 'text-decoration: underline; ';
                if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

                // Only apply these styles if they're explicitly defined
                if (styles.textColor) columnStyle += `color: ${styles.textColor}; `;
                if (styles.backgroundColor) columnStyle += `background-color: ${styles.backgroundColor}; `;

                if (columnStyle) {
                  allCellStyles += `
                    .ag-theme-quartz .ag-cell[col-id="${columnField}"],
                    .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
                      ${columnStyle} !important;
                    }
                  `;
                }

                // Add border styles if specified
                if (styles.borderStyle !== undefined &&
                    styles.borderWidth !== undefined &&
                    styles.borderColor !== undefined &&
                    styles.borderSides !== undefined) {
                  const borderStyle = `${styles.borderWidth}px ${styles.borderStyle.toLowerCase()} ${styles.borderColor}`;
                  const borderProperty = styles.borderSides === 'All' ? 'border' : `border-${styles.borderSides.toLowerCase()}`;

                  allCellStyles += `
                    .ag-theme-quartz .ag-cell[col-id="${columnField}"],
                    .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
                      ${borderProperty}: ${borderStyle} !important;
                    }
                  `;
                }
              });

              // Apply all cell styles at once
              if (allCellStyles) {
                let styleElement = document.getElementById('batched-cell-styles');
                if (!styleElement) {
                  styleElement = document.createElement('style');
                  styleElement.id = 'batched-cell-styles';
                  document.head.appendChild(styleElement);
                }

                // Simplified theme styles for better performance
                styleElement.textContent = allCellStyles;
              }

              // Clear pending cell styles
              pendingCellStyles = {};
            }
          });

          // Use a short debounce for grid refresh to avoid multiple refreshes
          const { gridApi } = get();
          if (gridApi) {
            try {
              // Debounce the refresh to avoid multiple refreshes in quick succession
              if (typeof gridApi.refreshHeader === 'function') {
                gridApi.refreshHeader();
              }

              if (typeof gridApi.refreshCells === 'function') {
                gridApi.refreshCells({ force: true });
              }
            } catch (error) {
              console.error('Error refreshing grid after applying styles:', error);
            }
          }
        },

        applyColumnSettings: (columnField, preserveCurrentWidth = false) => {
          // Get fresh references to ensure we have the latest state
          const storeState = get();
          const gridApi = storeState.gridApi;
          const settings = storeState.settings;

          // Try multiple fallback approaches to ensure we have a valid Grid API
          let effectiveGridApi = gridApi;

          // If no gridApi in store, try emergency window backup
          if (!effectiveGridApi && typeof window !== 'undefined') {
            if ((window as any).__gridApi) {
              console.log('Using emergency window.__gridApi backup for applying column settings');
              effectiveGridApi = (window as any).__gridApi;

              // Update the store's gridApi reference for future use
              set({ gridApi: effectiveGridApi });
            }
          }

          // If we still don't have a grid API, create a delayed retry with window backup check
          if (!effectiveGridApi) {
            console.error('Grid API not available for applying column settings - using delay and retry');

            // Try to refresh the API using the emergency refresh function
            if (typeof window !== 'undefined' && typeof (window as any).__refreshGridApi === 'function') {
              console.log('Attempting emergency grid API refresh');
              try {
                (window as any).__refreshGridApi();
              } catch (err) {
                console.warn('Emergency refresh failed:', err);
              }
            }

            // Create a delayed retry mechanism
            setTimeout(() => {
              // Check store first
              let retryGridApi = get().gridApi;

              // Then try window backup
              if (!retryGridApi && typeof window !== 'undefined' && (window as any).__gridApi) {
                console.log('Using window.__gridApi on retry');
                retryGridApi = (window as any).__gridApi;

                // Update store
                set({ gridApi: retryGridApi });
              }

              if (retryGridApi) {
                console.log('Grid API now available on retry - applying settings');
                get().applyColumnSettings(columnField);
              } else {
                console.error('Grid API still not available after retry');
              }
            }, 500);

            return false;
          }

          // Use the effective Grid API for operations
          const operationalGridApi = effectiveGridApi;

          const profileName = `${columnField}_settings`;
          const columnSettings = settings.columnSettingsProfiles[profileName];

          if (!columnSettings) {
            console.error(`No settings found for column ${columnField}`);
            return false;
          }

          try {
            // Get the column from grid using our operational API
            // In AG-Grid 33+, we need to use getAllGridColumns() instead of getColumn()
            const column = operationalGridApi.getAllGridColumns?.().find((col: any) => col.getColId() === columnField);
            if (!column) {
              console.error(`Column ${columnField} not found in grid`);
              return false;
            }

            // Get column definition
            const colDef = column.getColDef();

            // Apply general settings with careful validation and logging
            if (columnSettings.general) {
              console.log('Applying general settings for column:', columnField);

              // Set header name - ensure it's a string
              if (columnSettings.general.headerName) {
                colDef.headerName = String(columnSettings.general.headerName);
              }

              // If preserveCurrentWidth is true, get the current width from the grid
              let currentWidth = null;
              let hasCurrentWidth = false;

              if (preserveCurrentWidth) {
                try {
                  // Get the current width from the column state
                  const columnState = operationalGridApi.getColumnState().find((col: any) => col.colId === columnField);
                  if (columnState && columnState.width) {
                    currentWidth = columnState.width;
                    hasCurrentWidth = true;
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`Preserving current width for column ${columnField}: ${currentWidth}px`);
                    }
                  }
                } catch (error) {
                  console.error('Error getting current column width:', error);
                }
              }

              // RULE 2 & 3: When applying settings from a profile, always use the saved width
              // This ensures consistent behavior when refreshing or switching profiles
              if (columnSettings.general.width) {
                const width = parseInt(columnSettings.general.width, 10);
                if (!isNaN(width) && width > 0) {
                  colDef.width = width;
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Applied saved width for column ${columnField}: ${width}px`);
                  }
                }
              }

              // If we're preserving the current width (e.g., during manual resize),
              // update the saved width in the profile for future use
              if (preserveCurrentWidth && hasCurrentWidth) {
                // Update the saved width in the profile for future use
                if (columnSettings.general) {
                  columnSettings.general.width = currentWidth.toString();

                  // Update the profile in the store
                  const updatedProfiles = { ...settings.columnSettingsProfiles };
                  updatedProfiles[profileName] = columnSettings;

                  // Schedule an update to avoid immediate state changes during rendering
                  setTimeout(() => {
                    set(state => ({
                      settings: {
                        ...state.settings,
                        columnSettingsProfiles: updatedProfiles
                      }
                    }));
                  }, 0);

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Updated saved width for column ${columnField}: ${currentWidth}px`);
                  }
                }
              }

              // Set boolean properties with explicit conversion
              colDef.sortable = columnSettings.general.sortable === true;
              colDef.resizable = columnSettings.general.resizable === true;
              colDef.editable = columnSettings.general.editable === true;
              colDef.filter = columnSettings.general.filter === 'Enabled' ? true : false;

              // Handle column type with explicit case handling
              if (columnSettings.general.columnType) {
                switch (columnSettings.general.columnType) {
                  case 'Number': {
                    // Format as number
                    colDef.type = 'customNumeric';
                    colDef.filter = 'agNumberColumnFilter';
                    break;
                  }
                  case 'Date': {
                    // Format as date
                    colDef.type = 'customDate';
                    colDef.filter = 'agDateColumnFilter';
                    break;
                  }
                  case 'String':
                    colDef.type = undefined;
                    colDef.filter = 'agTextColumnFilter';
                    break;
                }
              }

              // Handle filter type with proper validation
              if (columnSettings.general.filter === 'Enabled' && columnSettings.general.filterType) {
                switch (columnSettings.general.filterType) {
                  case 'Text':
                    colDef.filter = 'agTextColumnFilter';
                    break;
                  case 'Number':
                    colDef.filter = 'agNumberColumnFilter';
                    break;
                  case 'Date':
                    colDef.filter = 'agDateColumnFilter';
                    break;
                }
              }

              // Apply column visibility and pinning via applyColumnState API
              // This is the recommended approach for AG-Grid 33+
              if (typeof operationalGridApi.applyColumnState === 'function') {
                const colId = column.getColId();
                let pinnedState = null;

                if (columnSettings.general.pinnedPosition === 'Left') {
                  pinnedState = 'left';
                } else if (columnSettings.general.pinnedPosition === 'Right') {
                  pinnedState = 'right';
                }

                // Log visibility state before applying
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Applying column settings for ${colId} - visibility: ${columnSettings.general.hidden === true ? 'hidden' : 'visible'}, pinned: ${pinnedState || 'none'}`);
                }

                // Get current state to verify changes
                const beforeState = operationalGridApi.getColumnState();
                const beforeColumnState = beforeState.find(col => col.colId === colId);

                if (process.env.NODE_ENV === 'development' && beforeColumnState) {
                  console.log(`Before applying settings - column ${colId} state:`, beforeColumnState);
                }

                // Apply both visibility and pinning in a single call
                // Force the visibility state by explicitly setting it
                operationalGridApi.applyColumnState({
                  state: [{
                    colId,
                    pinned: pinnedState,
                    hide: columnSettings.general.hidden === true
                  }],
                  defaultState: {
                    pinned: null,
                    hide: false
                  }
                });

                // Verify column visibility was applied correctly
                if (process.env.NODE_ENV === 'development') {
                  const currentState = operationalGridApi.getColumnState();
                  const columnState = currentState.find(col => col.colId === colId);
                  if (columnState) {
                    console.log(`After applying column settings for ${colId} - visibility: ${columnState.hide ? 'hidden' : 'visible'}, pinned: ${columnState.pinned || 'none'}`);

                    // Check if the visibility state was applied correctly
                    const expectedHidden = columnSettings.general.hidden === true;
                    const actualHidden = columnState.hide === true;

                    if (expectedHidden !== actualHidden) {
                      console.warn(`Column visibility not applied correctly for ${colId}! Expected: ${expectedHidden ? 'hidden' : 'visible'}, Actual: ${actualHidden ? 'hidden' : 'visible'}`);

                      // Try again with a direct column visibility call
                      console.log(`Trying direct setVisible call for column ${colId}`);
                      column.setVisible(!expectedHidden);
                    }
                  }
                }
              }
            }

            // Apply header styles using batched operations
            if (columnSettings.header) {
              // Create a styles object applying only properties that should be controlled by apply checkboxes
              const headerStyles = { ...columnSettings.header };

              // Remove text color if not applied
              if (!headerStyles.applyTextColor) {
                headerStyles.textColor = undefined;
              }

              // Remove background color if not applied
              if (!headerStyles.applyBackgroundColor) {
                headerStyles.backgroundColor = undefined;
              }

              // Remove border properties if not applied
              if (!headerStyles.applyBorder) {
                headerStyles.borderStyle = undefined;
                headerStyles.borderWidth = undefined;
                headerStyles.borderColor = undefined;
                headerStyles.borderSides = undefined;
              }

              // Set header class for all cases when any styling should be applied
              // Always apply non-conditional styles regardless of applyStyles flag
              colDef.headerClass = `custom-header-${columnField}`;

              // Create a complete style object that includes all non-conditional styles
              const completeHeaderStyles = { ...columnSettings.header };
              // Only apply conditional styles based on their respective flags
              if (!completeHeaderStyles.applyTextColor) {
                completeHeaderStyles.textColor = undefined;
              }
              if (!completeHeaderStyles.applyBackgroundColor) {
                completeHeaderStyles.backgroundColor = undefined;
              }
              if (!completeHeaderStyles.applyBorder) {
                completeHeaderStyles.borderStyle = undefined;
                completeHeaderStyles.borderWidth = undefined;
                completeHeaderStyles.borderColor = undefined;
                completeHeaderStyles.borderSides = undefined;
              }

              // Batch header styles through the store
              get().batchApplyHeaderStyles(columnField, completeHeaderStyles);
            } else {
              // Remove header class but keep any other classes that might be there
              if (typeof colDef.headerClass === 'string') {
                // Remove only our custom class
                const classes = colDef.headerClass.split(' ').filter(c => c !== `custom-header-${columnField}`);
                colDef.headerClass = classes.length > 0 ? classes.join(' ') : undefined;
              }

              // Clear any existing header styles for this column
              ['header-style-', 'direct-header-style-', 'emergency-header-style-'].forEach(prefix => {
                const styleElement = document.getElementById(`${prefix}${columnField}`);
                if (styleElement) {
                  console.log(`Removing header style element: ${prefix}${columnField}`);
                  styleElement.remove();
                }
              });
            }

            // Apply cell styles using batched operations
            if (columnSettings.cell) {
              // Create a styles object applying only properties that should be controlled by apply checkboxes
              const cellStyles = { ...columnSettings.cell };

              // Remove text color if not applied
              if (!cellStyles.applyTextColor) {
                cellStyles.textColor = undefined;
              }

              // Remove background color if not applied
              if (!cellStyles.applyBackgroundColor) {
                cellStyles.backgroundColor = undefined;
              }

              // Remove border properties if not applied
              if (!cellStyles.applyBorder) {
                cellStyles.borderStyle = undefined;
                cellStyles.borderWidth = undefined;
                cellStyles.borderColor = undefined;
                cellStyles.borderSides = undefined;
              }

              // Set cell class for all cases when any styling should be applied
              // Always apply non-conditional styles regardless of applyStyles flag
              colDef.cellClass = `custom-cell-${columnField}`;

              // Create a complete style object that includes all non-conditional styles
              const completeCellStyles = { ...columnSettings.cell };
              // Only apply conditional styles based on their respective flags
              if (!completeCellStyles.applyTextColor) {
                completeCellStyles.textColor = undefined;
              }
              if (!completeCellStyles.applyBackgroundColor) {
                completeCellStyles.backgroundColor = undefined;
              }
              if (!completeCellStyles.applyBorder) {
                completeCellStyles.borderStyle = undefined;
                completeCellStyles.borderWidth = undefined;
                completeCellStyles.borderColor = undefined;
                completeCellStyles.borderSides = undefined;
              }

              // Batch cell styles through the store
              get().batchApplyCellStyles(columnField, completeCellStyles);
            } else {
              // Remove cell class but keep any other classes that might be there
              if (typeof colDef.cellClass === 'string') {
                // Remove only our custom class
                const classes = colDef.cellClass.split(' ').filter(c => c !== `custom-cell-${columnField}`);
                colDef.cellClass = classes.length > 0 ? classes.join(' ') : undefined;
              }

              // Reset cell styles
              get().removeCellStyles(columnField);
            }

            // Apply formatter settings
            if (columnSettings.formatter) {
              // Only apply formatter if type is not None
              if (columnSettings.formatter.formatterType !== 'None') {
                // Create valueFormatter function based on formatter type
                colDef.valueFormatter = (params: { value: any }) => {
                  if (params.value === null || params.value === undefined) {
                    return '';
                  }

                  try {
                    const formatter = columnSettings.formatter as FormatterSettings;

                    switch (formatter.formatterType) {
                      case 'Number': {
                        // Format as number
                        const value = Number(params.value);
                        if (isNaN(value)) return String(params.value);

                        // Create number formatter options
                        const options: Intl.NumberFormatOptions = {
                          minimumFractionDigits: formatter.decimalPlaces ?? 0,
                          maximumFractionDigits: formatter.decimalPlaces ?? 0,
                          useGrouping: formatter.useThousandsSeparator === true
                        };

                        return new Intl.NumberFormat(undefined, options).format(value);
                      }

                      case 'Currency': {
                        // Format as currency
                        const value = Number(params.value);
                        if (isNaN(value)) return String(params.value);

                        // Create currency formatter options
                        const options: Intl.NumberFormatOptions = {
                          minimumFractionDigits: formatter.decimalPlaces ?? 2,
                          maximumFractionDigits: formatter.decimalPlaces ?? 2,
                          useGrouping: true
                        };

                        const formattedValue = new Intl.NumberFormat(undefined, options).format(value);

                        // Apply currency symbol based on position
                        const symbol = formatter.currencySymbol || '$';
                        return formatter.symbolPosition === 'before'
                          ? `${symbol}${formattedValue}`
                          : `${formattedValue}${symbol}`;
                      }

                      case 'Percent': {
                        // Format as percentage
                        const value = Number(params.value);
                        if (isNaN(value)) return String(params.value);

                        // Create percentage formatter options
                        const options: Intl.NumberFormatOptions = {
                          minimumFractionDigits: formatter.decimalPlaces ?? 0,
                          maximumFractionDigits: formatter.decimalPlaces ?? 0,
                          style: 'percent'
                        };

                        return new Intl.NumberFormat(undefined, options).format(value / 100);
                      }

                      case 'Date': {
                        // Format as date
                        let date: Date;

                        // Try to parse the date value
                        if (params.value instanceof Date) {
                          date = params.value;
                        } else if (typeof params.value === 'string' || typeof params.value === 'number') {
                          date = new Date(params.value);
                        } else {
                          return String(params.value);
                        }

                        if (isNaN(date.getTime())) return String(params.value);

                        // Get format from preset or use default
                        const format = formatter.formatPreset || 'MM/DD/YYYY';

                        // Apply date format
                        return formatDate(date, format);
                      }

                      case 'Custom': {
                        // For custom format, use Excel-like formatting
                        const customFormat = formatter.customFormat || '';

                        if (!customFormat) return String(params.value);

                        try {
                          // Create a safe copy of params with clean colDef to avoid circular references
                          const safeParams = {
                            ...params,
                            colDef: {
                              ...params.colDef,
                              // Remove any existing formatter-related properties to avoid stale values
                              __cellColor: undefined,
                              __useColor: undefined,
                              __conditionMet: undefined,
                              __useCondition: undefined,
                              __conditionOperator: undefined,
                              __conditionValue: undefined,
                              __switchCaseValue: undefined,
                              __matchedCase: undefined,
                              __useSwitchCase: undefined
                            }
                          };

                          // Use the helper function to apply Excel formatting with clean params
                          return applyExcelFormat(safeParams, formatter);
                        } catch (error) {
                          console.error('Error applying custom format:', error);
                          return String(params.value);
                        }
                      }

                      default:
                        return String(params.value);
                    }
                  } catch (error) {
                    console.error('Error formatting cell value:', error);
                    return String(params.value);
                  }
                };

                // Add cellStyle function to handle color formatting from Excel
                colDef.cellStyle = (params: any) => {
                  try {
                    // Use our utility function to determine cell color from format
                    if (columnSettings?.formatter?.formatterType === 'Custom' &&
                        columnSettings?.formatter?.customFormat) {

                      const customFormat = columnSettings.formatter.customFormat;
                      const value = params.value;

                      // Skip formatting for null/undefined values
                      if (value === null || value === undefined) {
                        return {};
                      }

                      // Use the new Excel formatter module
                      const result = formatExcelValue({ value }, customFormat);

                      // Return styles if specified
                      const styles: Record<string, string> = {};

                      if (result.color) {
                        styles.color = result.color;
                      }

                      if (result.backgroundColor) {
                        styles.backgroundColor = result.backgroundColor;
                      }

                      return styles;
                    }
                  } catch (error) {
                    console.error('Error applying cell color in cellStyle:', error);
                  }

                  // Return empty object if no style is needed
                  return {};
                };
              } else {
                // If formatter type is None, remove valueFormatter and cellStyle
                colDef.valueFormatter = undefined;
                colDef.cellStyle = undefined;
              }
            }

            // Force a refresh just for this column
            try {
              if (typeof operationalGridApi.refreshCells === 'function') {
                operationalGridApi.refreshCells({
                  force: true,
                  columns: [columnField]
                });
              }

              if (typeof operationalGridApi.refreshHeader === 'function') {
                operationalGridApi.refreshHeader();
              }
            } catch (error) {
              console.warn('Error refreshing column:', error);
            }

            console.log(`Successfully applied settings to column ${columnField}`);
            return true;
          } catch (error) {
            console.error('Error applying column settings:', error);
            return false;
          }
        },

        getColumnSettingsProfiles: () => {
          const { settings } = get();
          if (!settings.columnSettingsProfiles) {
            return [];
          }

          return Object.keys(settings.columnSettingsProfiles);
        },

        deleteColumnSettingsProfile: (profileName) => {
          const { settings } = get();
          if (!settings.columnSettingsProfiles || !settings.columnSettingsProfiles[profileName]) {
            return;
          }

          // Create a copy without the profile to delete
          const updatedProfiles = { ...settings.columnSettingsProfiles };
          delete updatedProfiles[profileName];

          // Update settings
          set(state => ({
            settings: {
              ...state.settings,
              columnSettingsProfiles: updatedProfiles
            },
            isDirty: true
          }));
        },

        // Apply all column profiles in a batch - includes cleanup of previous styles
        applyAllColumnProfiles: () => {
          // First remove all column-specific styles from previous profile
          try {
            // Find all style elements in head
            const allStyles = document.head.querySelectorAll('style');

            // Check each style element
            allStyles.forEach(style => {
              const id = style.id || '';

              // If it's a column-specific style, remove it
              if (
                id.startsWith('header-style-') ||
                id.startsWith('cell-style-') ||
                id.startsWith('direct-header-style-') ||
                id.startsWith('direct-cell-style-') ||
                id.startsWith('emergency-header-style-') ||
                id.startsWith('emergency-cell-style-')
              ) {
                console.log(`Removing style element when applying all profiles: ${id}`);
                style.remove();
              }
            });

            // Also clear batch style containers
            ['batched-header-styles', 'batched-cell-styles'].forEach(id => {
              const element = document.getElementById(id);
              if (element) {
                element.textContent = '';
              }
            });
          } catch (error) {
            console.error('Error cleaning up styles in applyAllColumnProfiles:', error);
          }
          const { gridApi, settings } = get();

          if (!gridApi || !settings.columnSettingsProfiles) {
            console.warn('Cannot apply column profiles: gridApi not available or no profiles exist');
            return false;
          }

          try {
            // Get all column profile names
            const profileNames = Object.keys(settings.columnSettingsProfiles);
            if (profileNames.length === 0) {
              console.log('No column profiles to apply');
              return true;
            }

            console.log(`Applying ${profileNames.length} column profiles in batch`);

            // Collect columns needing styling
            const columnsToProcess: string[] = [];

            // First pass: identify all column profiles
            profileNames.forEach(profileName => {
              if (profileName.endsWith('_settings')) {
                const columnField = profileName.replace('_settings', '');
                columnsToProcess.push(columnField);
              }
            });

            if (columnsToProcess.length === 0) {
              console.log('No valid column profiles found');
              return true;
            }

            console.log(`Processing ${columnsToProcess.length} columns: ${columnsToProcess.join(', ')}`);

            // Batch all header and cell styles first
            const pendingHeaderStyles: Record<string, any> = {};
            const pendingCellStyles: Record<string, any> = {};

            // First collect all styles
            columnsToProcess.forEach(columnField => {
              try {
                const profileName = `${columnField}_settings`;
                const columnSettings = settings.columnSettingsProfiles[profileName];

                if (!columnSettings) return;

                // Collect header styles - check individual toggles or legacy global toggle
                if (columnSettings.header && (
                    columnSettings.header.applyStyles === true ||
                    columnSettings.header.applyTextColor === true ||
                    columnSettings.header.applyBackgroundColor === true ||
                    columnSettings.header.applyBorder === true
                  )) {

                  // Create a copy of the styles with only enabled properties
                  const headerStyles = { ...columnSettings.header };

                  // Apply only enabled text color
                  if (!headerStyles.applyTextColor) {
                    headerStyles.textColor = undefined;
                  }

                  // Apply only enabled background color
                  if (!headerStyles.applyBackgroundColor) {
                    headerStyles.backgroundColor = undefined;
                  }

                  // Apply only enabled border styles
                  if (!headerStyles.applyBorder) {
                    headerStyles.borderStyle = undefined;
                    headerStyles.borderWidth = undefined;
                    headerStyles.borderColor = undefined;
                    headerStyles.borderSides = undefined;
                  }

                  pendingHeaderStyles[columnField] = JSON.parse(JSON.stringify(headerStyles));
                }

                // Collect cell styles - check individual toggles or legacy global toggle
                if (columnSettings.cell && (
                    columnSettings.cell.applyStyles === true ||
                    columnSettings.cell.applyTextColor === true ||
                    columnSettings.cell.applyBackgroundColor === true ||
                    columnSettings.cell.applyBorder === true
                  )) {

                  // Create a copy of the styles with only enabled properties
                  const cellStyles = { ...columnSettings.cell };

                  // Apply only enabled text color
                  if (!cellStyles.applyTextColor) {
                    cellStyles.textColor = undefined;
                  }

                  // Apply only enabled background color
                  if (!cellStyles.applyBackgroundColor) {
                    cellStyles.backgroundColor = undefined;
                  }

                  // Apply only enabled border styles
                  if (!cellStyles.applyBorder) {
                    cellStyles.borderStyle = undefined;
                    cellStyles.borderWidth = undefined;
                    cellStyles.borderColor = undefined;
                    cellStyles.borderSides = undefined;
                  }

                  pendingCellStyles[columnField] = JSON.parse(JSON.stringify(cellStyles));
                }
              } catch (error) {
                console.error(`Error collecting styles for column ${columnField}:`, error);
              }
            });

            // Create a single style element for all header styles
            const headerStyleElementId = 'batched-header-styles-all';
            let headerStyleElement = document.getElementById(headerStyleElementId);
            if (!headerStyleElement) {
              headerStyleElement = document.createElement('style');
              headerStyleElement.id = headerStyleElementId;
              document.head.appendChild(headerStyleElement);
            }

            // Create a single style element for all cell styles
            const cellStyleElementId = 'batched-cell-styles-all';
            let cellStyleElement = document.getElementById(cellStyleElementId);
            if (!cellStyleElement) {
              cellStyleElement = document.createElement('style');
              cellStyleElement.id = cellStyleElementId;
              document.head.appendChild(cellStyleElement);
            }

            // Generate consolidated CSS for headers
            let allHeaderStyles = '';
            Object.keys(pendingHeaderStyles).forEach(columnField => {
              const styles = pendingHeaderStyles[columnField];
              if (!styles) return;

              // Convert styles object to CSS - simplified for better performance
              let columnStyle = '';
              if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
              if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
              if (styles.bold) columnStyle += 'font-weight: bold; ';
              if (styles.italic) columnStyle += 'font-style: italic; ';
              if (styles.underline) columnStyle += 'text-decoration: underline; ';
              if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

              // Only include text color if explicitly defined
              if (styles.textColor !== undefined) columnStyle += `color: ${styles.textColor}; `;
              if (styles.backgroundColor !== undefined) columnStyle += `background-color: ${styles.backgroundColor}; `;

              if (columnStyle) {
                allHeaderStyles += `
                  .ag-header-cell[col-id="${columnField}"],
                  .ag-header-cell.custom-header-${columnField} {
                    ${columnStyle} !important;
                  }
                `;

                // Special handling for text alignment - simplified
                if (styles.alignH) {
                  allHeaderStyles += `
                    .ag-header-cell[col-id="${columnField}"] .ag-header-cell-label,
                    .ag-header-cell.custom-header-${columnField} .ag-header-cell-label {
                      justify-content: ${styles.alignH === 'left' ? 'flex-start' :
                                       styles.alignH === 'center' ? 'center' : 'flex-end'} !important;
                    }
                  `;
                }
              }

              // Add border styles if specified
              if (styles.borderStyle !== undefined &&
                  styles.borderWidth !== undefined &&
                  styles.borderColor !== undefined &&
                  styles.borderSides !== undefined) {
                const borderStyle = `${styles.borderWidth}px ${styles.borderStyle.toLowerCase()} ${styles.borderColor}`;
                const borderProperty = styles.borderSides === 'All' ? 'border' : `border-${styles.borderSides.toLowerCase()}`;

                allHeaderStyles += `
                  .ag-header-cell[col-id="${columnField}"],
                  .ag-header-cell.custom-header-${columnField} {
                    ${borderProperty}: ${borderStyle} !important;
                  }
                `;
              }

              // Add border styles if specified
              if (styles.borderStyle !== undefined &&
                  styles.borderWidth !== undefined &&
                  styles.borderColor !== undefined &&
                  styles.borderSides !== undefined) {
                const borderStyle = `${styles.borderWidth}px ${styles.borderStyle.toLowerCase()} ${styles.borderColor}`;
                const borderProperty = styles.borderSides === 'All' ? 'border' : `border-${styles.borderSides.toLowerCase()}`;

                allCellStyles += `
                  .ag-cell[col-id="${columnField}"],
                  .ag-cell.custom-cell-${columnField} {
                    ${borderProperty}: ${borderStyle} !important;
                  }
                `;
              }
            });

            // Generate consolidated CSS for cells
            let allCellStyles = '';
            Object.keys(pendingCellStyles).forEach(columnField => {
              const styles = pendingCellStyles[columnField];
              if (!styles) return;

              // Convert styles object to CSS
              let columnStyle = '';
              if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
              if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
              if (styles.bold) columnStyle += 'font-weight: bold; ';
              if (styles.italic) columnStyle += 'font-style: italic; ';
              if (styles.underline) columnStyle += 'text-decoration: underline; ';
              if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

              // Only apply these styles if they're explicitly defined
              if (styles.textColor) columnStyle += `color: ${styles.textColor}; `;
              if (styles.backgroundColor) columnStyle += `background-color: ${styles.backgroundColor}; `;

              if (columnStyle) {
                allCellStyles += `
                  .ag-theme-quartz .ag-cell[col-id="${columnField}"],
                  .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
                    ${columnStyle} !important;
                  }
                `;
              }

              // Add border styles if specified
              if (styles.borderStyle !== undefined &&
                  styles.borderWidth !== undefined &&
                  styles.borderColor !== undefined &&
                  styles.borderSides !== undefined) {
                const borderStyle = `${styles.borderWidth}px ${styles.borderStyle.toLowerCase()} ${styles.borderColor}`;
                const borderProperty = styles.borderSides === 'All' ? 'border' : `border-${styles.borderSides.toLowerCase()}`;

                allCellStyles += `
                  .ag-theme-quartz .ag-cell[col-id="${columnField}"],
                  .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
                    ${borderProperty}: ${borderStyle} !important;
                  }
                `;
              }
            });

            // Apply all styles at once
            if (headerStyleElement) {
              headerStyleElement.textContent = allHeaderStyles;
            }

            if (cellStyleElement) {
              cellStyleElement.textContent = allCellStyles;
            }

            // Now apply non-style settings to columns (without triggering refreshes for each)
            let needsRefresh = false;

            columnsToProcess.forEach(columnField => {
              try {
                const profileName = `${columnField}_settings`;
                const columnSettings = settings.columnSettingsProfiles[profileName];

                if (!columnSettings) return;

                const column = gridApi.getColumn(columnField);
                if (!column) return;

                const colDef = column.getColDef();

                // Apply general settings
                if (columnSettings.general) {
                  // Set header name - ensure it's a string
                  if (columnSettings.general.headerName) {
                    colDef.headerName = String(columnSettings.general.headerName);
                  }

                  // Set boolean properties with explicit conversion
                  colDef.sortable = columnSettings.general.sortable === true;
                  colDef.resizable = columnSettings.general.resizable === true;
                  colDef.editable = columnSettings.general.editable === true;
                  colDef.filter = columnSettings.general.filter === 'Enabled' ? true : false;

                  // Apply column visibility via API
                  if (typeof column.setVisible === 'function') {
                    const visible = !columnSettings.general.hidden;
                    column.setVisible(visible);
                  }

                  // Apply column pinned state with API
                  if (typeof gridApi.applyColumnState === 'function') {
                    const colId = column.getColId();
                    let pinnedState = null;

                    if (columnSettings.general.pinnedPosition === 'Left') {
                      pinnedState = 'left';
                    } else if (columnSettings.general.pinnedPosition === 'Right') {
                      pinnedState = 'right';
                    }

                    gridApi.applyColumnState({
                      state: [{ colId, pinned: pinnedState }],
                      defaultState: { pinned: null }
                    });
                  }
                }

                // Set header and cell classes (but don't apply styles - we did that in batch)
                if (columnSettings.header && columnSettings.header.applyStyles === true) {
                  colDef.headerClass = `custom-header-${columnField}`;
                  needsRefresh = true;
                }

                if (columnSettings.cell && columnSettings.cell.applyStyles === true) {
                  colDef.cellClass = `custom-cell-${columnField}`;
                  needsRefresh = true;
                }
              } catch (error) {
                console.error(`Error applying non-style settings for column ${columnField}:`, error);
              }
            });

            // Apply column pinning in a separate batch to avoid race conditions
            if (gridApi && typeof gridApi.applyColumnState === 'function') {
              const pinnedColumnsState = columnsToProcess
                .map(columnField => {
                  const profileName = `${columnField}_settings`;
                  const columnSettings = settings.columnSettingsProfiles[profileName];

                  if (!columnSettings?.general?.pinnedPosition) return null;

                  let pinnedState = null;
                  if (columnSettings.general.pinnedPosition === 'Left') {
                    pinnedState = 'left';
                  } else if (columnSettings.general.pinnedPosition === 'Right') {
                    pinnedState = 'right';
                  }

                  return {
                    colId: columnField,
                    pinned: pinnedState
                  };
                })
                .filter(state => state !== null);

              if (pinnedColumnsState.length > 0) {
                try {
                  gridApi.applyColumnState({
                    state: pinnedColumnsState,
                    defaultState: { pinned: null }
                  });
                  needsRefresh = true;
                } catch (error) {
                  console.error('Error applying column pinned states:', error);
                }
              }
            }

            // RULE 2 & 3: When applying settings from a profile, always use the saved width
            // This ensures consistent behavior when refreshing or switching profiles
            if (gridApi && typeof gridApi.applyColumnState === 'function') {
              const widthColumnsState = columnsToProcess
                .map(columnField => {
                  const profileName = `${columnField}_settings`;
                  const columnSettings = settings.columnSettingsProfiles[profileName];

                  if (!columnSettings?.general?.width) return null;

                  const width = parseInt(columnSettings.general.width, 10);
                  if (isNaN(width) || width <= 0) return null;

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Applying saved width for column ${columnField}: ${width}px`);
                  }

                  return {
                    colId: columnField,
                    width: width
                  };
                })
                .filter(state => state !== null);

              if (widthColumnsState.length > 0) {
                try {
                  // Apply column widths with higher priority
                  gridApi.applyColumnState({
                    state: widthColumnsState,
                    applyOrder: true, // Ensure the order is respected
                    defaultState: { width: null } // Clear any default width
                  });
                  needsRefresh = true;

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Applied ${widthColumnsState.length} column widths from profiles`);
                  }
                } catch (error) {
                  console.error('Error applying column width states:', error);
                }
              }
            }

            // Single refresh at the end if needed
            if (needsRefresh) {
              // Use synchronous operation instead of setTimeout
              try {
                if (gridApi) {
                  console.log('Performing single batch refresh after applying all column profiles');

                  if (typeof gridApi.refreshHeader === 'function') {
                    gridApi.refreshHeader();
                  }

                  if (typeof gridApi.refreshCells === 'function') {
                    gridApi.refreshCells({ force: true });
                  }
                }
              } catch (error) {
                console.error('Error during final grid refresh:', error);
              }
            }

            return true;
          } catch (error) {
            console.error('Error applying all column profiles:', error);
            return false;
          }
        },

        // Utility functions for getting grid state
        getGridColumnState: () => {
          const { gridApi } = get();
          if (!gridApi) return null;

          try {
            // Get column state directly from the grid API
            const columnState = gridApi.getColumnState();

            // Make a deep copy to avoid any reference issues
            const columnStateCopy = JSON.parse(JSON.stringify(columnState));

            // Log column visibility state for debugging
            if (process.env.NODE_ENV === 'development') {
              const visibleCols = columnStateCopy.filter(col => !col.hide).map(col => col.colId);
              const hiddenCols = columnStateCopy.filter(col => col.hide).map(col => col.colId);
              console.log(`getGridColumnState - visible columns (${visibleCols.length}):`, visibleCols);
              console.log(`getGridColumnState - hidden columns (${hiddenCols.length}):`, hiddenCols);
            }

            // Ensure each column has a colId property (AG-Grid expects colId, not columnId)
            if (Array.isArray(columnStateCopy)) {
              const formattedState = columnStateCopy.map(col => {
                // If the column has columnId but not colId, add colId
                if (!col.colId && col.columnId) {
                  return { ...col, colId: col.columnId };
                }
                return col;
              });

              return formattedState;
            }

            return columnStateCopy;
          } catch (error) {
            console.error('Failed to get column state:', error);
            return null;
          }
        },

        getGridFilterState: () => {
          const { gridApi } = get();
          if (!gridApi) return null;

          try {
            return gridApi.getFilterModel();
          } catch (error) {
            console.error('Failed to get filter state:', error);
            return null;
          }
        },

        getGridSortState: () => {
          const { gridApi } = get();
          if (!gridApi) return null;

          try {
            // Check if getSortModel exists
            if (typeof gridApi.getSortModel === 'function') {
              return gridApi.getSortModel();
            } else if (typeof gridApi.getColumnState === 'function') {
              // Extract sort info from column state
              const columnState = gridApi.getColumnState();
              // Filter to only columns that have sort info
              return columnState
                .filter((col: any) => col.sort)
                .map((col: any) => ({
                  colId: col.colId,
                  sort: col.sort
                }));
            }
            return null;
          } catch (error) {
            console.error('Failed to get sort state:', error);
            return null;
          }
        },

        getGridRowGroupState: () => {
          const { gridApi } = get();
          if (!gridApi) return null;

          try {
            return gridApi.getRowGroupColumns?.() || null;
          } catch {
            // Silently fail and return null
            return null;
          }
        },

        getGridPivotState: () => {
          const { gridApi } = get();
          if (!gridApi) return null;

          try {
            return gridApi.getPivotColumns?.() || null;
          } catch {
            // Silently fail and return null
            return null;
          }
        },

        getGridChartState: () => {
          const { gridApi } = get();
          if (!gridApi) return null;

          try {
            // First check if the Charts module is registered
            if (typeof gridApi.getChartModels === 'function' &&
                gridApi._modulesManager?.isRegistered?.('integratedCharts')) {
              return gridApi.getChartModels();
            }
            return null;
          } catch {
            // Catch and silence the error about missing Charts module
            return null;
          }
        },
        removeCellStyles: (columnField) => {
          // Clear any existing cell styles for this column
          ['cell-style-', 'direct-cell-style-', 'emergency-cell-style-'].forEach(prefix => {
            const styleElement = document.getElementById(`${prefix}${columnField}`);
            if (styleElement) {
              console.log(`Removing cell style element: ${prefix}${columnField}`);
              styleElement.remove();
            }
          });
        },
      }; // Close the return object
      },
      {
        name: 'grid-store',
        partialize: (state) => ({
          profiles: state.profiles,
          activeProfileId: state.activeProfileId,
          settings: state.settings,
          isDirty: state.isDirty,
          gridApi: state.gridApi
        })
      }
    )
  );