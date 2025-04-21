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

  // Grid API reference for operations
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
  getColumnSettingsProfiles: () => string[];
  deleteColumnSettingsProfile: (profileName: string) => void;

  // Utility functions
  getGridColumnState: () => any;
  getGridFilterState: () => any;
  getGridSortState: () => any;
  getGridRowGroupState: () => any;
  getGridPivotState: () => any;
  getGridChartState: () => any;
}

// Create the store
export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => {
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
            columnSettingsProfiles: activeProfile.columnSettingsProfiles || {},
            themeMode: activeProfile.themeMode || 'system'
          },
          isDirty: false
        });
      },

      // Set grid API
      setGridApi: (api) => {
        set({ gridApi: api });
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
          // Active profile not found, switch to default
          const defaultProfileItem = profiles.find(p => p.isDefault) || defaultProfile;
          setTimeout(() => get().selectProfile(defaultProfileItem.id), 0);
          return defaultProfileItem;
        }

        return activeProfile;
      },

      selectProfile: (profileId) => {
        try {
          console.log(`Selecting profile with ID: ${profileId}`);
          const { profiles } = get();

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

            // Use default profile
            set({
              activeProfileId: defaultProfileItem.id,
              settings: {
                font: defaultProfileItem.font || defaultFont,
                fontSize: defaultProfileItem.fontSize || defaultFontSize,
                density: defaultProfileItem.density || defaultDensity,
                columnsState: defaultProfileItem.columnsState || null,
                filterState: defaultProfileItem.filterState || null,
                sortState: defaultProfileItem.sortState || null,
                rowGroupState: defaultProfileItem.rowGroupState || null,
                pivotState: defaultProfileItem.pivotState || null,
                chartState: defaultProfileItem.chartState || null,
                columnSettingsProfiles: defaultProfileItem.columnSettingsProfiles || {},
                themeMode: defaultProfileItem.themeMode || 'system'
              },
              isDirty: false
            });

            // Apply settings after a short delay
            setTimeout(() => {
              if (get().gridApi) {
                get().applySettingsToGrid();
              }
            }, 100);

            return;
          }

          // Ensure profile has all required properties with fallbacks
          const safeProfile = {
            ...profile,
            font: profile.font || defaultFont,
            fontSize: profile.fontSize || defaultFontSize,
            density: profile.density || defaultDensity,
            columnSettingsProfiles: profile.columnSettingsProfiles || {},
            themeMode: profile.themeMode || 'system'
          };

          console.log('Selected profile:', {
            id: safeProfile.id,
            name: safeProfile.name,
            hasColumnsState: !!safeProfile.columnsState,
            columnsStateLength: safeProfile.columnsState ? safeProfile.columnsState.length : 0,
            hasSortState: !!safeProfile.sortState,
            hasFilterState: !!safeProfile.filterState,
            hasColumnSettings: !!safeProfile.columnSettingsProfiles,
            columnSettingsCount: safeProfile.columnSettingsProfiles ? Object.keys(safeProfile.columnSettingsProfiles).length : 0
          });

          // Flush and repopulate settings from the profile
          set({
            activeProfileId: profileId,
            settings: {
              font: safeProfile.font,
              fontSize: safeProfile.fontSize,
              density: safeProfile.density,
              columnsState: safeProfile.columnsState || null,
              filterState: safeProfile.filterState || null,
              sortState: safeProfile.sortState || null,
              rowGroupState: safeProfile.rowGroupState || null,
              pivotState: safeProfile.pivotState || null,
              chartState: safeProfile.chartState || null,
              columnSettingsProfiles: safeProfile.columnSettingsProfiles || {},
              themeMode: safeProfile.themeMode
            },
            isDirty: false
          });

          // If grid API exists, apply settings after a short delay to ensure state is updated
          if (get().gridApi) {
            setTimeout(() => {
              try {
                console.log('Applying settings after profile selection');
                get().applySettingsToGrid();
              } catch (error) {
                console.error('Error applying settings to grid:', error);
              }
            }, 100); // Increased delay to ensure state is updated
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

        // Select the new profile to apply settings
        setTimeout(() => get().selectProfile(id), 0);
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
            let columnSettingsProfiles = get().settings.columnSettingsProfiles;

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

      // Settings management
      updateSettings: (partialSettings: Partial<GridSettings>) => {
        // Update the settings in state
        set(state => ({
          settings: {
            ...state.settings,
            ...partialSettings
          },
          isDirty: true
        }));

        // Only apply grid API updates for non-CSS properties
        // Exclude fontSize and density as they're handled via CSS directly in the toolbar
        if ('font' in partialSettings ||
            'columnsState' in partialSettings ||
            'filterState' in partialSettings ||
            'sortState' in partialSettings ||
            'rowGroupState' in partialSettings ||
            'pivotState' in partialSettings ||
            'chartState' in partialSettings ||
            'columnSettingsProfiles' in partialSettings) {
          setTimeout(() => {
            const { gridApi } = get();
            if (gridApi) {
              get().applySettingsToGrid();
            }
          }, 0);
        }
      },

      saveSettingsToProfile: () => {
        const { activeProfileId, settings, profiles } = get();
        const activeProfile = profiles.find(p => p.id === activeProfileId);

        console.log('Saving settings to profile:', {
          activeProfileId,
          profileExists: !!activeProfile,
          isDefault: activeProfile?.isDefault,
          currentSettings: settings
        });

        // Get the current grid state without applying it back to the grid
        const { gridApi } = get();
        if (!gridApi) {
          console.warn('Cannot extract grid state: gridApi is null');
          return;
        }

        // Store the current column state for comparison
        const currentColumnState = gridApi.getColumnState();
        console.log('Current column state from grid API:', currentColumnState);

        // Extract grid state directly without using extractGridState to avoid grid refresh
        let columnsState = null;
        let filterState = null;
        let sortState = null;
        let rowGroupState = null;
        let pivotState = null;
        let chartState = null;
        // Keep column settings profiles from current settings
        const columnSettingsProfiles = settings.columnSettingsProfiles || {};

        try {
          // Use the current column state directly from the grid API
          // This ensures we get the exact current state including any width changes
          columnsState = JSON.parse(JSON.stringify(currentColumnState));
          console.log('Using direct column state from grid API');
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

        console.log('Updated settings for profile save:', {
          columnsState: updatedSettings.columnsState,
          filterState: updatedSettings.filterState,
          sortState: updatedSettings.sortState,
          columnSettingsProfiles: Object.keys(updatedSettings.columnSettingsProfiles).length
        });

        if (activeProfile && !activeProfile.isDefault) {
          // We used to save and restore column state here, but now we avoid refreshing the grid
          // when saving a profile to prevent flickering

          set(state => {
            console.log('Updating profile in state');
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

          // We need to preserve the current column state to prevent auto-sizing
          // Apply only the column state back to the grid without triggering a full refresh
          if (columnsState && gridApi) {
            try {
              console.log('Preserving column widths after profile save');
              // Use a small timeout to ensure the store update is complete
              setTimeout(() => {
                // Only apply column state to preserve widths, without triggering other refreshes
                gridApi.applyColumnState({
                  state: columnsState,
                  applyOrder: true
                });
                console.log('Column widths preserved successfully');
              }, 0);
            } catch (error) {
              console.warn('Failed to preserve column widths after profile save:', error);
            }
          }

          console.log('Profile saved successfully without full grid refresh');
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
            console.log('Column state extracted:', columnsState);
          }
          catch (e) { console.warn('Failed to get column state', e); }

          try {
            filterState = get().getGridFilterState();
            console.log('Filter state extracted:', filterState);
          }
          catch (e) { console.warn('Failed to get filter state', e); }

          try {
            sortState = get().getGridSortState();
            console.log('Sort state extracted:', sortState);
          }
          catch (e) { console.warn('Failed to get sort state', e); }

          try {
            rowGroupState = get().getGridRowGroupState();
            console.log('Row group state extracted:', rowGroupState);
          }
          catch (e) { console.warn('Failed to get row group state', e); }

          try {
            pivotState = get().getGridPivotState();
            console.log('Pivot state extracted:', pivotState);
          }
          catch (e) { console.warn('Failed to get pivot state', e); }

          try {
            chartState = get().getGridChartState();
            console.log('Chart state extracted:', chartState);
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

            console.log('Updating settings with extracted grid state:', {
              hasColumnsState: columnsState !== null,
              hasFilterState: filterState !== null,
              hasSortState: sortState !== null,
              hasRowGroupState: rowGroupState !== null,
              hasPivotState: pivotState !== null,
              hasChartState: chartState !== null,
              columnSettingsProfilesCount: Object.keys(columnSettingsProfiles).length
            });

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
          console.warn('Cannot apply settings: gridApi is not available');
          return;
        }

        // Check if settings object is complete before proceeding
        if (!settings || !settings.font) {
          console.error('Cannot apply settings: settings or font is undefined');
          return;
        }

        console.log('Applying settings to grid:', {
          hasColumnsState: !!settings.columnsState,
          columnsStateLength: settings.columnsState ? settings.columnsState.length : 0,
          hasFilterState: !!settings.filterState,
          hasSortState: !!settings.sortState,
          hasColumnSettingsProfiles: !!settings.columnSettingsProfiles,
          columnSettingsProfilesCount: settings.columnSettingsProfiles ? Object.keys(settings.columnSettingsProfiles).length : 0,
          activeProfileId: get().activeProfileId
        });

        try {
          // Apply only font family setting - fontSize and density are handled directly in the toolbar
          const fontValue = settings.font.value || defaultFont.value;

          // Debug info
          console.log('Applying font family setting:', {
            font: fontValue
          });

          // Apply only font family setting
          document.documentElement.style.setProperty('--ag-font-family', fontValue);

          // Note: We're intentionally NOT applying fontSize and density CSS here
          // as they are handled directly in the toolbar component with direct DOM manipulation
          // This prevents unnecessary grid refreshes when changing these values
        } catch (error) {
          console.error('Error applying visual settings:', error);
        }

        // Delay applying column state to ensure grid is ready
        setTimeout(() => {
          try {
            // Apply column state if available
            if (settings.columnsState && Array.isArray(settings.columnsState) && settings.columnsState.length > 0) {
              if (typeof gridApi.applyColumnState === 'function') {
                try {
                  console.log('Applying column state:', settings.columnsState);

                  // Ensure column state is in the correct format
                  const formattedColumnState = settings.columnsState.map((col: any) => {
                    // Make sure each column state has a colId
                    if (!col.colId && col.columnId) {
                      return { ...col, colId: col.columnId };
                    }
                    return col;
                  });

                  gridApi.applyColumnState({
                    state: formattedColumnState,
                    applyOrder: true
                  });
                  console.log('Applied column state successfully');
                } catch (error) {
                  console.warn('Failed to apply column state:', error);
                }
              } else {
                console.warn('Unable to apply column state: applyColumnState not available');
              }
            } else {
              console.log('No column state to apply or invalid format');
            }

            // Apply filter state if available
            if (settings.filterState) {
              if (typeof gridApi.setFilterModel === 'function') {
                try {
                  gridApi.setFilterModel(settings.filterState);
                  console.log('Applied filter state successfully');
                } catch (error) {
                  console.warn('Failed to apply filter state:', error);
                }
              } else {
                console.warn('Unable to apply filter state: setFilterModel not available');
              }
            }

            // Apply sort state if available
            if (settings.sortState && Array.isArray(settings.sortState) && settings.sortState.length > 0) {
              // Check if setSortModel exists
              if (typeof gridApi.setSortModel === 'function') {
                try {
                  console.log('Applying sort state:', settings.sortState);
                  gridApi.setSortModel(settings.sortState);
                  console.log('Applied sort state successfully');
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

                  console.log('Applied sort state using applyColumnState');
                } catch (error) {
                  console.warn('Failed to apply column sort state:', error);
                }
              } else {
                console.warn('Unable to apply sort state: No compatible API method available');
              }
            }

            // Apply row group state if available
            if (settings.rowGroupState) {
              if (typeof gridApi.setRowGroupColumns === 'function') {
                try {
                  gridApi.setRowGroupColumns(settings.rowGroupState);
                  console.log('Applied row group state successfully');
                } catch (error) {
                  console.warn('Failed to apply row group state:', error);
                }
              } else {
                console.warn('Unable to apply row group state: setRowGroupColumns not available');
              }
            }

            // Apply pivot state if available
            if (settings.pivotState) {
              if (typeof gridApi.setPivotColumns === 'function') {
                try {
                  gridApi.setPivotColumns(settings.pivotState);
                  console.log('Applied pivot state successfully');
                } catch (error) {
                  console.warn('Failed to apply pivot state:', error);
                }
              } else {
                console.warn('Unable to apply pivot state: setPivotColumns not available');
              }
            }

            // Apply chart state if available
            if (settings.chartState) {
              if (typeof gridApi.restoreChartModels === 'function') {
                try {
                  gridApi.restoreChartModels(settings.chartState);
                  console.log('Applied chart state successfully');
                } catch (error) {
                  console.warn('Failed to apply chart state:', error);
                }
              } else {
                console.warn('Unable to apply chart state: restoreChartModels not available');
              }
            }

            // Ensure grid refreshes after applying all settings
            try {
              if (typeof gridApi.refreshCells === 'function') {
                gridApi.refreshCells({ force: true });
              }
            } catch (error) {
              console.warn('Failed to refresh cells:', error);
            }
          } catch (error) {
            console.error('Error applying settings to grid:', error);
          }
        }, 100); // Add a small delay to ensure grid is ready
      },

      // Reset settings to match active profile
      resetSettingsToProfile: () => {
        const { profiles, activeProfileId } = get();
        const activeProfile = profiles.find(p => p.id === activeProfileId) || defaultProfile;

        set({
          settings: {
            font: activeProfile.font,
            fontSize: activeProfile.fontSize,
            density: activeProfile.density,
            columnsState: activeProfile.columnsState || null,
            filterState: activeProfile.filterState || null,
            sortState: activeProfile.sortState || null,
            rowGroupState: activeProfile.rowGroupState || null,
            pivotState: activeProfile.pivotState || null,
            chartState: activeProfile.chartState || null,
            columnSettingsProfiles: activeProfile.columnSettingsProfiles || {},
            themeMode: activeProfile.themeMode || 'system'
          },
          isDirty: false
        });

        // Apply settings to grid if API exists
        if (get().gridApi) {
          setTimeout(() => get().applySettingsToGrid(), 0);
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
        const { settings } = get();
        
        const profileName = `${columnField}_settings`;
        const updatedProfiles = {
          ...settings.columnSettingsProfiles,
          [profileName]: columnSettings
        };
        
        // Update settings with new column profiles
        set(state => ({
          settings: {
            ...state.settings,
            columnSettingsProfiles: updatedProfiles
          },
          isDirty: true
        }));
        
        // Save to active profile
        get().saveSettingsToProfile();
        
        console.log(`Saved column settings for ${columnField}`);
        return true;
      },

      applyColumnSettings: (columnField) => {
        const { gridApi, settings } = get();
        
        if (!gridApi) {
          console.error('Grid API not available for applying column settings');
          return false;
        }
        
        const profileName = `${columnField}_settings`;
        const columnSettings = settings.columnSettingsProfiles[profileName];
        
        if (!columnSettings) {
          console.error(`No settings found for column ${columnField}`);
          return false;
        }
        
        try {
          // Get the column from grid
          const column = gridApi.getColumn(columnField);
          if (!column) {
            console.error(`Column ${columnField} not found in grid`);
            return false;
          }
          
          // Get column definition
          const colDef = column.getColDef();
          
          // Apply general settings
          if (columnSettings.general) {
            colDef.headerName = columnSettings.general.headerName;
            colDef.width = parseInt(columnSettings.general.width, 10) || undefined;
            colDef.sortable = columnSettings.general.sortable;
            colDef.resizable = columnSettings.general.resizable;
            colDef.filter = columnSettings.general.filter === 'Enabled' ? true : false;
            colDef.editable = columnSettings.general.editable;
            
            // Handle column type
            if (columnSettings.general.columnType === 'Number') {
              colDef.type = 'customNumeric';
              colDef.filter = 'agNumberColumnFilter';
            } else if (columnSettings.general.columnType === 'Date') {
              colDef.type = 'customDate';
              colDef.filter = 'agDateColumnFilter';
            } else if (columnSettings.general.columnType === 'String') {
              colDef.type = undefined;
              colDef.filter = 'agTextColumnFilter';
            }
            
            // Handle filter type
            if (columnSettings.general.filter === 'Enabled' && columnSettings.general.filterType !== 'Auto') {
              if (columnSettings.general.filterType === 'Text') colDef.filter = 'agTextColumnFilter';
              if (columnSettings.general.filterType === 'Number') colDef.filter = 'agNumberColumnFilter';
              if (columnSettings.general.filterType === 'Date') colDef.filter = 'agDateColumnFilter';
            }
            
            // Apply column visibility
            if (typeof column.setVisible === 'function') {
              column.setVisible(!columnSettings.general.hidden);
            }
            
            // Apply column pinned state
            if (typeof column.setPinned === 'function') {
              let pinnedState = null;
              if (columnSettings.general.pinnedPosition === 'Left') pinnedState = 'left';
              if (columnSettings.general.pinnedPosition === 'Right') pinnedState = 'right';
              column.setPinned(pinnedState);
            }
          }
          
          // Apply header styles
          if (columnSettings.header && columnSettings.header.applyStyles) {
            colDef.headerClass = `custom-header-${columnField}`;
            
            // Create CSS for the header
            let headerStyle = '';
            const header = columnSettings.header;
            
            if (header.fontFamily) headerStyle += `font-family: ${header.fontFamily}; `;
            if (header.fontSize) headerStyle += `font-size: ${header.fontSize}; `;
            if (header.bold) headerStyle += 'font-weight: bold; ';
            if (header.italic) headerStyle += 'font-style: italic; ';
            if (header.underline) headerStyle += 'text-decoration: underline; ';
            if (header.textColor) headerStyle += `color: ${header.textColor}; `;
            if (header.backgroundColor) headerStyle += `background-color: ${header.backgroundColor}; `;
            if (header.alignH) headerStyle += `text-align: ${header.alignH}; `;
            
            // Add border styles
            if (header.borderStyle && header.borderWidth && header.borderColor) {
              const borderStyle = `${header.borderWidth}px ${header.borderStyle.toLowerCase()} ${header.borderColor}`;
              
              if (header.borderSides === 'All') {
                headerStyle += `border: ${borderStyle}; `;
              } else if (header.borderSides === 'Top') {
                headerStyle += `border-top: ${borderStyle}; `;
              } else if (header.borderSides === 'Right') {
                headerStyle += `border-right: ${borderStyle}; `;
              } else if (header.borderSides === 'Bottom') {
                headerStyle += `border-bottom: ${borderStyle}; `;
              } else if (header.borderSides === 'Left') {
                headerStyle += `border-left: ${borderStyle}; `;
              }
            }
            
            // Apply the header CSS
            if (headerStyle) {
              let styleElement = document.getElementById(`header-style-${columnField}`);
              if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = `header-style-${columnField}`;
                document.head.appendChild(styleElement);
              }
              styleElement.textContent = `.ag-header-cell.custom-header-${columnField}, .ag-header-cell[col-id="${columnField}"] { ${headerStyle} }`;
            }
          } else {
            // Remove any existing header styles
            const styleElement = document.getElementById(`header-style-${columnField}`);
            if (styleElement) styleElement.remove();
            
            if (colDef.headerClass) colDef.headerClass = undefined;
          }
          
          // Apply cell styles
          if (columnSettings.cell && columnSettings.cell.applyStyles) {
            colDef.cellClass = `custom-cell-${columnField}`;
            
            // Create CSS for the cells
            let cellStyle = '';
            const cell = columnSettings.cell;
            
            if (cell.fontFamily) cellStyle += `font-family: ${cell.fontFamily}; `;
            if (cell.fontSize) cellStyle += `font-size: ${cell.fontSize}; `;
            if (cell.bold) cellStyle += 'font-weight: bold; ';
            if (cell.italic) cellStyle += 'font-style: italic; ';
            if (cell.underline) cellStyle += 'text-decoration: underline; ';
            if (cell.textColor) cellStyle += `color: ${cell.textColor}; `;
            if (cell.backgroundColor) cellStyle += `background-color: ${cell.backgroundColor}; `;
            if (cell.alignH) cellStyle += `text-align: ${cell.alignH}; `;
            
            // Add border styles
            if (cell.borderStyle && cell.borderWidth && cell.borderColor) {
              const borderStyle = `${cell.borderWidth}px ${cell.borderStyle.toLowerCase()} ${cell.borderColor}`;
              
              if (cell.borderSides === 'All') {
                cellStyle += `border: ${borderStyle}; `;
              } else if (cell.borderSides === 'Top') {
                cellStyle += `border-top: ${borderStyle}; `;
              } else if (cell.borderSides === 'Right') {
                cellStyle += `border-right: ${borderStyle}; `;
              } else if (cell.borderSides === 'Bottom') {
                cellStyle += `border-bottom: ${borderStyle}; `;
              } else if (cell.borderSides === 'Left') {
                cellStyle += `border-left: ${borderStyle}; `;
              }
            }
            
            // Apply the cell CSS
            if (cellStyle) {
              let styleElement = document.getElementById(`cell-style-${columnField}`);
              if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = `cell-style-${columnField}`;
                document.head.appendChild(styleElement);
              }
              styleElement.textContent = `.ag-cell.custom-cell-${columnField}, .ag-cell[col-id="${columnField}"] { ${cellStyle} }`;
            }
          } else {
            // Remove any existing cell styles
            const styleElement = document.getElementById(`cell-style-${columnField}`);
            if (styleElement) styleElement.remove();
            
            if (colDef.cellClass) colDef.cellClass = undefined;
          }
          
          // Refresh the grid
          if (typeof gridApi.refreshHeader === 'function') {
            gridApi.refreshHeader();
          }
          
          if (typeof gridApi.refreshCells === 'function') {
            gridApi.refreshCells({ 
              force: true, 
              columns: [columnField] 
            });
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
        
        // Save changes to profile
        get().saveSettingsToProfile();
        
        console.log(`Deleted column settings profile ${profileName}`);
      },

      // Utility functions for getting grid state
      getGridColumnState: () => {
        const { gridApi } = get();
        if (!gridApi) return null;

        try {
          // Get column state directly from the grid API
          const columnState = gridApi.getColumnState();
          console.log('Retrieved raw column state from API:', columnState);

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

            console.log('Formatted column state to return:', formattedState);
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
          // AG Grid throws a specific error if getChartModels is called without Charts module
          // We'll check if the method exists AND if the IntegratedChartsModule is registered
          if (typeof gridApi.getChartModels === 'function' &&
              // We can't directly check module registration, so we'll try to use a safer approach
              gridApi._modulesManager?.isRegistered?.('integratedCharts')) {
            return gridApi.getChartModels();
          }
          // If we get here, either the method doesn't exist or Charts module isn't registered
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
        isDirty: state.isDirty
      })
    }
  )
);