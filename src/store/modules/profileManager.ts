// Profile management module for the grid store
import { StateCreator } from 'zustand';
import { GridStoreState, GridProfile } from './types';

// Default values
const defaultFont = { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" };
const defaultFontSize = 13;
const defaultDensity = 2;

// Default profile
export const defaultProfile: GridProfile = {
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

// Profile management slice creator
export const createProfileManagerSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    initializeStore: () => void;
    getActiveProfile: () => GridProfile;
    getProfileById: (profileId: string) => GridProfile | undefined;
    selectProfile: (profileId: string) => void;
    createProfile: (profile: Omit<GridProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProfile: (profileId: string, updates: Partial<GridProfile>) => void;
    deleteProfile: (profileId: string) => void;
    exportProfile: (profileId: string) => string;
    importProfile: (profileJson: string) => boolean;
    duplicateProfile: (profileId: string, newName?: string) => void;
    resetSettingsToProfile: () => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  }
> = (set, get) => ({
  // Profile management methods
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
  
  getProfileById: (profileId) => {
    const { profiles } = get();
    
    if (!profiles || profiles.length === 0) {
      return undefined;
    }
    
    // Find profile by ID
    const profile = profiles.find(p => p.id === profileId);
    
    // Return the found profile or undefined if not found
    return profile;
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
                gridApi.setSortModel(
                  (defaultSettings.sortState && Array.isArray(defaultSettings.sortState) &&
                  defaultSettings.sortState.length > 0) ? defaultSettings.sortState : null
                );
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
});