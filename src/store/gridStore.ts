import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  justSaved: boolean; // Flag to indicate if settings were just saved
  suppressGridRefresh: boolean; // Prevent grid refresh during profile save
  skipNextGridRefresh: number; // Counter to skip grid refresh after profile save
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
}

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
      justSaved: false, // Flag to indicate if settings were just saved
      suppressGridRefresh: false, // Prevent grid refresh during profile save
      skipNextGridRefresh: 0, // Counter to skip grid refresh after profile save
      gridApi: null,

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
        }

        // If we have a valid API, store it
        if (api) {
          // Store in a way that persists across renders
          set({ gridApi: api });

          // Additional safety check - ensure the API actually has methods we need
          if (typeof api.getColumn !== 'function' && process.env.NODE_ENV === 'development') {
            console.warn('Grid API missing essential methods - may be incomplete');
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
                  document.documentElement.style.setProperty('--ag-font-family', defaultSettings.font.value);
                  needsCssUpdate = true;
                }

                // Apply font size CSS directly
                if (defaultSettings.fontSize) {
                  document.documentElement.style.setProperty('--ag-font-size', `${defaultSettings.fontSize}px`);
                  needsCssUpdate = true;
                }

                // Apply density CSS directly
                if (defaultSettings.density) {
                  const spacingValue = 4 + (defaultSettings.density - 1) * 4;
                  document.documentElement.style.setProperty('--ag-grid-size', `${spacingValue}px`);
                  document.documentElement.style.setProperty('--ag-list-item-height', `${spacingValue * 6}px`);
                  document.documentElement.style.setProperty('--ag-row-height', `${spacingValue * 6}px`);
                  document.documentElement.style.setProperty('--ag-header-height', `${spacingValue * 7}px`);
                  document.documentElement.style.setProperty('--ag-cell-horizontal-padding', `${spacingValue * 1.5}px`);
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
                  } catch (e) {
                    console.warn('Error applying column state:', e);
                  }
                }

                // Apply filter state if available
                if (defaultSettings.filterState && typeof gridApi.setFilterModel === 'function') {
                  try {
                    gridApi.setFilterModel(defaultSettings.filterState);
                    needsGridRefresh = true;
                  } catch (e) {
                    console.warn('Error applying filter state:', e);
                  }
                }

                // Apply sort state if available
                if (defaultSettings.sortState && Array.isArray(defaultSettings.sortState) &&
                    defaultSettings.sortState.length > 0 && typeof gridApi.setSortModel === 'function') {
                  try {
                    gridApi.setSortModel(defaultSettings.sortState);
                    needsGridRefresh = true;
                  } catch (e) {
                    console.warn('Error applying sort state:', e);
                  }
                }

                // Apply column profiles if available - synchronously
                if (defaultSettings.columnSettingsProfiles &&
                    Object.keys(defaultSettings.columnSettingsProfiles).length > 0) {
                  try {
                    // Apply all column profiles in a single batch
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
                  } catch (e) {
                    console.warn('Error refreshing grid:', e);
                  }
                }
              } catch (error) {
                console.error('Error applying default profile settings:', error);
              }
            } else {
              console.warn('Grid API not available for default profile, settings will be applied when grid is ready');
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
                document.documentElement.style.setProperty('--ag-font-family', newSettings.font.value);
                needsCssUpdate = true;
              }

              // Apply font size CSS directly
              if (newSettings.fontSize) {
                document.documentElement.style.setProperty('--ag-font-size', `${newSettings.fontSize}px`);
                needsCssUpdate = true;
              }

              // Apply density CSS directly
              if (newSettings.density) {
                const spacingValue = 4 + (newSettings.density - 1) * 4;
                document.documentElement.style.setProperty('--ag-grid-size', `${spacingValue}px`);
                document.documentElement.style.setProperty('--ag-list-item-height', `${spacingValue * 6}px`);
                document.documentElement.style.setProperty('--ag-row-height', `${spacingValue * 6}px`);
                document.documentElement.style.setProperty('--ag-header-height', `${spacingValue * 7}px`);
                document.documentElement.style.setProperty('--ag-cell-horizontal-padding', `${spacingValue * 1.5}px`);
                needsCssUpdate = true;
              }

              // Apply grid state settings in a single batch operation
              let needsGridRefresh = false;

              // Apply column state if available
              if (newSettings.columnsState && Array.isArray(newSettings.columnsState) &&
                  newSettings.columnsState.length > 0 && typeof gridApi.applyColumnState === 'function') {
                try {
                  // Use a complete state reset to ensure previous settings are cleared
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
                  needsGridRefresh = true;
                } catch (error) {
                  console.warn('Error applying column state:', error);
                }
              }

              // Apply filter state if available
              if (typeof gridApi.setFilterModel === 'function') {
                try {
                  // Always set filter model, even if null/empty to clear existing filters
                  gridApi.setFilterModel(newSettings.filterState || null);
                  needsGridRefresh = true;
                } catch (error) {
                  console.warn('Error applying filter state:', error);
                }
              }

              // Apply sort state if available
              if (typeof gridApi.setSortModel === 'function') {
                try {
                  // Always set sort model, even if null/empty to clear existing sorts
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
            const columnSettingsProfiles = get().settings.columnSettingsProfiles;

            try {
              // Use the current column state directly from the grid API
              // This ensures we get the exact current state including any width changes
              const currentColumnState = gridApi.getColumnState();
              columnsState = JSON.parse(JSON.stringify(currentColumnState));
              console.log('Using direct column state from grid API for export');
            }
            catch (e) {
              console.warn('Failed to use direct column state for export, falling back to getGridColumnState', e);
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
        // Check if we're only updating CSS properties that don't need grid refresh
        const isCssOnlyUpdate =
          Object.keys(partialSettings).length === 1 &&
          (partialSettings.fontSize !== undefined || partialSettings.density !== undefined);

        // Update the settings in state without triggering a grid refresh
        set(state => {
          // Create a new settings object with the updates
          const newSettings = {
            ...state.settings,
            ...partialSettings
          };

          // For CSS-only updates, we don't need to mark as dirty
          // This prevents unnecessary saves to profile
          return {
            settings: newSettings,
            isDirty: !isCssOnlyUpdate
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

        // Extract grid state directly without using extractGridState to avoid grid refresh
        let columnsState = null;
        let filterState = null;
        let sortState = null;
        let rowGroupState = null;
        let pivotState = null;
        let chartState = null;
        // Keep column settings profiles from current settings
        const columnSettingsProfiles = { ...settings.columnSettingsProfiles } || {};

        // Update column settings profiles with current column widths
        if (gridApi && typeof gridApi.getColumnState === 'function') {
          try {
            const columnState = gridApi.getColumnState();

            // For each column with settings, update the width
            Object.keys(columnSettingsProfiles).forEach(profileName => {
              if (profileName.endsWith('_settings')) {
                const columnField = profileName.replace('_settings', '');
                const columnInfo = columnState.find((col: any) => col.colId === columnField);

                if (columnInfo && columnInfo.width && columnSettingsProfiles[profileName]) {
                  // Update the width in the column settings
                  columnSettingsProfiles[profileName] = {
                    ...columnSettingsProfiles[profileName],
                    general: {
                      ...columnSettingsProfiles[profileName].general,
                      width: columnInfo.width.toString()
                    }
                  };

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Updated width in profile for column ${columnField}: ${columnInfo.width}px`);
                  }
                }
              }
            });
          } catch (error) {
            console.error('Error updating column widths in profiles:', error);
          }
        }

        try {
          // Use the current column state directly from the grid API
          // This ensures we get the exact current state including any width changes
          columnsState = JSON.parse(JSON.stringify(currentColumnState));
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

          // Set the justSaved flag to prevent the grid from refreshing
          set({ justSaved: true });

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
          const columnSettingsProfiles = get().settings.columnSettingsProfiles || {};

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
            console.warn('Cannot apply settings: gridApi is not available');
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
          const fontValue = settings.font.value || defaultFont.value;
          document.documentElement.style.setProperty('--ag-font-family', fontValue);
        } catch (error) {
          console.error('Error applying visual settings:', error);
        }

        // Track which grid operations we perform
        let needsRefresh = false;

        // Apply grid state without setTimeout - all at once synchronously
        try {
          // Apply column state if available
          if (settings.columnsState && Array.isArray(settings.columnsState) && settings.columnsState.length > 0) {
            if (typeof gridApi.applyColumnState === 'function') {
              try {
                // Ensure column state is in the correct format
                const formattedColumnState = settings.columnsState.map((col: any) => {
                  // Make sure each column state has a colId
                  if (!col.colId && col.columnId) {
                    return { ...col, colId: col.columnId };
                  }
                  return col;
                });

                // Get current column widths to preserve them
                const currentWidths = {};
                try {
                  const columnState = gridApi.getColumnState();
                  columnState.forEach(col => {
                    if (col.colId && col.width) {
                      currentWidths[col.colId] = col.width;
                    }
                  });
                } catch (error) {
                  console.error('Error getting current column widths:', error);
                }

                // RULE 2: When the app is refreshed, apply the saved column widths
                // Don't preserve current widths during initialization
                gridApi.applyColumnState({
                  state: formattedColumnState,
                  applyOrder: true,
                  defaultState: { width: null } // Clear any default width
                });

                if (process.env.NODE_ENV === 'development') {
                  console.log('Applied column state with saved widths during initialization');
                }
                needsRefresh = true;
              } catch (error) {
                console.warn('Failed to apply column state:', error);
              }
            }
          }

          // Apply filter state if available
          if (settings.filterState) {
            if (typeof gridApi.setFilterModel === 'function') {
              try {
                gridApi.setFilterModel(settings.filterState);
                needsRefresh = true;
              } catch (error) {
                console.warn('Failed to apply filter state:', error);
              }
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
                console.warn('Failed to apply sort state:', error);
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
                console.warn('Failed to apply column sort state:', error);
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
                console.warn('Failed to apply row group state:', error);
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
                console.warn('Failed to apply pivot state:', error);
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
                console.warn('Failed to apply chart state:', error);
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

      saveColumnSettings: (columnField, columnSettings) => {
        const { settings, gridApi } = get();

        // Get the current column width from the grid if available
        let updatedSettings = { ...columnSettings };

        if (gridApi && typeof gridApi.getColumn === 'function') {
          try {
            const column = gridApi.getColumn(columnField);
            if (column) {
              // Get the current width from the column state
              const columnState = gridApi.getColumnState().find((col: any) => col.colId === columnField);
              if (columnState && columnState.width) {
                // Update the width in the settings
                updatedSettings.general = {
                  ...updatedSettings.general,
                  width: columnState.width.toString()
                };

                if (process.env.NODE_ENV === 'development') {
                  console.log(`Captured current width for column ${columnField}: ${columnState.width}px`);
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

        // Set the justSaved flag to prevent the grid from refreshing
        set({ justSaved: true });

        if (process.env.NODE_ENV === 'development') {
          console.log(`Saved column settings for ${columnField} (no grid update needed)`);
        }

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
          if (style.fontFamily) cssProps += `font-family: ${style.fontFamily} !important; `;
          if (style.fontSize) cssProps += `font-size: ${style.fontSize} !important; `;
          if (style.bold) cssProps += 'font-weight: bold !important; ';
          if (style.italic) cssProps += 'font-style: italic !important; ';
          if (style.underline) cssProps += 'text-decoration: underline !important; ';
          
          // Only include text color if it's explicitly defined (not undefined)
          if (style.textColor !== undefined) cssProps += `color: ${style.textColor} !important; `;
          
          // Only include background color if it's explicitly defined (not undefined)
          if (style.backgroundColor !== undefined) cssProps += `background-color: ${style.backgroundColor} !important; `;
          
          if (style.alignH) cssProps += `text-align: ${style.alignH} !important; `;

          // Add border styles if all required properties are explicitly defined
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
              html body div.ag-theme-quartz div.ag-header-cell[col-id="${columnField}"],
              html body div.ag-theme-quartz-dark div.ag-header-cell[col-id="${columnField}"],
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
          if (style.fontFamily) cssProps += `font-family: ${style.fontFamily} !important; `;
          if (style.fontSize) cssProps += `font-size: ${style.fontSize} !important; `;
          if (style.bold) cssProps += 'font-weight: bold !important; ';
          if (style.italic) cssProps += 'font-style: italic !important; ';
          if (style.underline) cssProps += 'text-decoration: underline !important; ';
          
          // Only include text color if it's explicitly defined (not undefined)
          if (style.textColor !== undefined) cssProps += `color: ${style.textColor} !important; `;
          
          // Only include background color if it's explicitly defined (not undefined)
          if (style.backgroundColor !== undefined) cssProps += `background-color: ${style.backgroundColor} !important; `;
          
          if (style.alignH) cssProps += `text-align: ${style.alignH} !important; `;

          // Add border styles if all required properties are explicitly defined
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
                ${cssProps}
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
              if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
              if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
              if (styles.bold) columnStyle += 'font-weight: bold; ';
              if (styles.italic) columnStyle += 'font-style: italic; ';
              if (styles.underline) columnStyle += 'text-decoration: underline; ';
              if (styles.textColor) columnStyle += `color: ${styles.textColor}; `;
              if (styles.backgroundColor) columnStyle += `background-color: ${styles.backgroundColor}; `;
              if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

              if (columnStyle) {
                // Simplified selectors for better performance
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
              if (styles.borderStyle && styles.borderWidth && styles.borderColor && styles.borderSides) {
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
              if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
              if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
              if (styles.bold) columnStyle += 'font-weight: bold; ';
              if (styles.italic) columnStyle += 'font-style: italic; ';
              if (styles.underline) columnStyle += 'text-decoration: underline; ';
              if (styles.textColor) columnStyle += `color: ${styles.textColor}; `;
              if (styles.backgroundColor) columnStyle += `background-color: ${styles.backgroundColor}; `;
              if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

              if (columnStyle) {
                // Simplified selectors for better performance
                allCellStyles += `
                  .ag-theme-quartz .ag-cell[col-id="${columnField}"],
                  .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
                    ${columnStyle} !important;
                  }
                `;
              }

              // Add border styles if specified
              if (styles.borderStyle && styles.borderWidth && styles.borderColor && styles.borderSides) {
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
        });
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
          const column = operationalGridApi.getColumn(columnField);
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
                case 'Number':
                  colDef.type = 'customNumeric';
                  colDef.filter = 'agNumberColumnFilter';
                  break;
                case 'Date':
                  colDef.type = 'customDate';
                  colDef.filter = 'agDateColumnFilter';
                  break;
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

            // Apply column visibility via API
            if (typeof column.setVisible === 'function') {
              const visible = !columnSettings.general.hidden;
              column.setVisible(visible);
            }

            // Apply column pinned state with API
            if (typeof operationalGridApi.applyColumnState === 'function') {
              const colId = column.getColId();
              let pinnedState = null;

              if (columnSettings.general.pinnedPosition === 'Left') {
                pinnedState = 'left';
              } else if (columnSettings.general.pinnedPosition === 'Right') {
                pinnedState = 'right';
              }

              operationalGridApi.applyColumnState({
                state: [{ colId, pinned: pinnedState }],
                defaultState: { pinned: null }
              });
            }
          }

          // Apply header styles using batched operations
          if (columnSettings.header) {
            // Create a styles object containing only the properties that should be applied
            const headerStyles = { ...columnSettings.header };
            
            // Remove text color if not applied
            if (!columnSettings.header.applyTextColor) {
              headerStyles.textColor = undefined;
            }
            
            // Remove background color if not applied
            if (!columnSettings.header.applyBackgroundColor) {
              headerStyles.backgroundColor = undefined;
            }
            
            // Remove border properties if not applied
            if (!columnSettings.header.applyBorder) {
              headerStyles.borderStyle = undefined;
              headerStyles.borderWidth = undefined;
              headerStyles.borderColor = undefined;
              headerStyles.borderSides = undefined;
            }

            // Legacy check for backward compatibility
            const shouldApplyStyles = 
              headerStyles.applyStyles === true || 
              headerStyles.applyTextColor === true || 
              headerStyles.applyBackgroundColor === true || 
              headerStyles.applyBorder === true;
            
            if (shouldApplyStyles) {
              // Set header class with both attribute and function approach for maximum compatibility
              colDef.headerClass = (params) => {
                // Return both the custom class and any existing classes
                const existingClasses = typeof colDef.headerClass === 'string'
                  ? colDef.headerClass.split(' ').filter(c => c !== `custom-header-${columnField}`)
                  : [];
                return [`custom-header-${columnField}`, ...existingClasses].join(' ');
              };
  
              // Batch header styles through the store
              get().batchApplyHeaderStyles(columnField, headerStyles);
            } else {
              // Remove header class but keep any other classes that might be there
              if (typeof colDef.headerClass === 'string') {
                // Remove only our custom class
                const classes = colDef.headerClass.split(' ').filter(c => c !== `custom-header-${columnField}`);
                colDef.headerClass = classes.length > 0 ? classes.join(' ') : undefined;
              } else {
                colDef.headerClass = undefined;
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
          }

          // Apply cell styles using batched operations
          if (columnSettings.cell) {
            // Create a styles object containing only the properties that should be applied
            const cellStyles = { ...columnSettings.cell };
            
            // Remove text color if not applied
            if (!columnSettings.cell.applyTextColor) {
              cellStyles.textColor = undefined;
            }
            
            // Remove background color if not applied
            if (!columnSettings.cell.applyBackgroundColor) {
              cellStyles.backgroundColor = undefined;
            }
            
            // Remove border properties if not applied
            if (!columnSettings.cell.applyBorder) {
              cellStyles.borderStyle = undefined;
              cellStyles.borderWidth = undefined;
              cellStyles.borderColor = undefined;
              cellStyles.borderSides = undefined;
            }

            // Legacy check for backward compatibility
            const shouldApplyStyles = 
              cellStyles.applyStyles === true || 
              cellStyles.applyTextColor === true || 
              cellStyles.applyBackgroundColor === true || 
              cellStyles.applyBorder === true;
            
            if (shouldApplyStyles) {
              // Set cell class with both attribute and function approach for maximum compatibility
              colDef.cellClass = (params) => {
                // Return both the custom class and any existing classes
                const existingClasses = typeof colDef.cellClass === 'string'
                  ? colDef.cellClass.split(' ').filter(c => c !== `custom-cell-${columnField}`)
                  : [];
                return [`custom-cell-${columnField}`, ...existingClasses].join(' ');
              };
  
              // Batch cell styles through the store
              get().batchApplyCellStyles(columnField, cellStyles);
            } else {
              // Remove cell class but keep any other classes that might be there
              if (typeof colDef.cellClass === 'string') {
                // Remove only our custom class
                const classes = colDef.cellClass.split(' ').filter(c => c !== `custom-cell-${columnField}`);
                colDef.cellClass = classes.length > 0 ? classes.join(' ') : undefined;
              } else {
                colDef.cellClass = undefined;
              }
  
              // Clear any existing cell styles for this column
              ['cell-style-', 'direct-cell-style-', 'emergency-cell-style-'].forEach(prefix => {
                const styleElement = document.getElementById(`${prefix}${columnField}`);
                if (styleElement) {
                  console.log(`Removing cell style element: ${prefix}${columnField}`);
                  styleElement.remove();
                }
              });
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
          const columnsToProcess = [];

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

            // Convert styles object to CSS - only include defined properties
            let columnStyle = '';
            if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
            if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
            if (styles.bold) columnStyle += 'font-weight: bold; ';
            if (styles.italic) columnStyle += 'font-style: italic; ';
            if (styles.underline) columnStyle += 'text-decoration: underline; ';
            // Only include text color if explicitly defined
            if (styles.textColor !== undefined) columnStyle += `color: ${styles.textColor}; `;
            // Only include background color if explicitly defined
            if (styles.backgroundColor !== undefined) columnStyle += `background-color: ${styles.backgroundColor}; `;
            if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

            if (columnStyle) {
              allHeaderStyles += `
                .ag-header-cell[col-id="${columnField}"],
                .ag-header-cell.custom-header-${columnField} {
                  ${columnStyle} !important;
                }
              `;

              // Special handling for text alignment
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
            if (styles.borderStyle && styles.borderWidth && styles.borderColor && styles.borderSides) {
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
            if (styles.borderStyle && styles.borderWidth && styles.borderColor && styles.borderSides) {
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
            if (styles.textColor) columnStyle += `color: ${styles.textColor}; `;
            if (styles.backgroundColor) columnStyle += `background-color: ${styles.backgroundColor}; `;
            if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;

            if (columnStyle) {
              allCellStyles += `
                .ag-cell[col-id="${columnField}"],
                .ag-cell.custom-cell-${columnField} {
                  ${columnStyle} !important;
                }
              `;
            }

            // Add border styles if specified
            if (styles.borderStyle && styles.borderWidth && styles.borderColor && styles.borderSides) {
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
                  needsRefresh = true;
                }

                // Set boolean properties with explicit conversion
                colDef.sortable = columnSettings.general.sortable === true;
                colDef.resizable = columnSettings.general.resizable === true;
                colDef.editable = columnSettings.general.editable === true;
                colDef.filter = columnSettings.general.filter === 'Enabled' ? true : false;

                // Apply column visibility if needed
                const visible = !columnSettings.general.hidden;
                if (typeof column.setVisible === 'function') {
                  column.setVisible(visible);
                  needsRefresh = true;
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
          // Check if getSortModel exists, otherwise try getColumnState for sort info
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
      }
    }; // Close the return object
    },
    {
      name: 'grid-store',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        settings: state.settings,
        isDirty: state.isDirty,
        justSaved: state.justSaved,
        suppressGridRefresh: state.suppressGridRefresh,
        skipNextGridRefresh: state.skipNextGridRefresh
      })
    }
  )
);