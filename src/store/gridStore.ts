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
  
  // Dialog settings
  expressionEditorState?: any;
  columnSettingsState?: any;
  
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
  
  // Dialog settings
  expressionEditorState: any;
  columnSettingsState: any;
  
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
  columnsState: null,
  filterState: null,
  sortState: null,
  rowGroupState: null,
  pivotState: null,
  chartState: null,
  expressionEditorState: null,
  columnSettingsState: null,
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
  
  // Dialog settings
  updateExpressionEditorState: (state: any) => void;
  updateColumnSettingsState: (state: any) => void;
  
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
        expressionEditorState: null,
        columnSettingsState: null,
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
            expressionEditorState: activeProfile.expressionEditorState || null,
            columnSettingsState: activeProfile.columnSettingsState || null,
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
                expressionEditorState: defaultProfileItem.expressionEditorState || null,
                columnSettingsState: defaultProfileItem.columnSettingsState || null,
                themeMode: defaultProfileItem.themeMode || 'system'
              },
              isDirty: false
            });
            return;
          }
          
          // Ensure profile has all required properties with fallbacks
          const safeProfile = {
            ...profile,
            font: profile.font || defaultFont,
            fontSize: profile.fontSize || defaultFontSize,
            density: profile.density || defaultDensity,
            themeMode: profile.themeMode || 'system'
          };
          
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
              expressionEditorState: safeProfile.expressionEditorState || null,
              columnSettingsState: safeProfile.columnSettingsState || null,
              themeMode: safeProfile.themeMode
            },
            isDirty: false
          });
          
          // If grid API exists, apply settings immediately
          if (get().gridApi) {
            setTimeout(() => {
              try {
                get().applySettingsToGrid();
              } catch (error) {
                console.error('Error applying settings to grid:', error);
              }
            }, 0);
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
        const { profiles, activeProfileId } = get();
        
        // If exporting active profile, save current settings first
        if (profileId === activeProfileId) {
          get().saveSettingsToProfile();
        }
        
        // Get updated profile list
        const updatedProfiles = get().profiles;
        const profileToExport = updatedProfiles.find(p => p.id === profileId);
        
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
          expressionEditorState: profileToExport.expressionEditorState,
          columnSettingsState: profileToExport.columnSettingsState,
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
            
            // Dialog settings
            expressionEditorState: importedData.expressionEditorState || null,
            columnSettingsState: importedData.columnSettingsState || null,
            
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
      updateSettings: (partialSettings) => {
        // First, update the settings in the store
        set(state => ({
          settings: { ...state.settings, ...partialSettings },
          isDirty: true
        }));
        
        // Apply CSS changes directly if it's just font/density updates
        if ('fontSize' in partialSettings || 'density' in partialSettings) {
          const { settings } = get();
          
          // Update font size if provided
          if ('fontSize' in partialSettings && partialSettings.fontSize) {
            document.documentElement.style.setProperty('--ag-font-size', `${partialSettings.fontSize}px`);
          }
          
          // Update density if provided
          if ('density' in partialSettings && typeof partialSettings.density === 'number') {
            const density = partialSettings.density;
            const spacingValue = 4 + (density - 1) * 4;
            document.documentElement.style.setProperty('--ag-grid-size', `${spacingValue}px`);
            document.documentElement.style.setProperty('--ag-list-item-height', `${spacingValue * 6}px`);
            document.documentElement.style.setProperty('--ag-row-height', `${spacingValue * 6}px`);
            document.documentElement.style.setProperty('--ag-header-height', `${spacingValue * 7}px`);
            document.documentElement.style.setProperty('--ag-cell-horizontal-padding', `${spacingValue * 1.5}px`);
          }
        }
        // For other changes that need grid API updates, apply the full settings
        else if ('font' in partialSettings || 'columnsState' in partialSettings || 
                'filterState' in partialSettings || 'sortState' in partialSettings) {
          // Use setTimeout to wait for state update to complete
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
        
        // Extract the latest grid state before saving
        get().extractGridState();
        const updatedSettings = get().settings;
        
        if (activeProfile && !activeProfile.isDefault) {
          set(state => ({
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
                    expressionEditorState: updatedSettings.expressionEditorState,
                    columnSettingsState: updatedSettings.columnSettingsState,
                    themeMode: updatedSettings.themeMode,
                    updatedAt: Date.now()
                  }
                : p
            ),
            isDirty: false
          }));
        }
      },
      
      extractGridState: () => {
        const { gridApi } = get();
        if (!gridApi) return;
        
        try {
          console.log('Extracting grid state');
          
          // Get all available states, with error handling for each one
          let columnsState = null;
          let filterState = null;
          let sortState = null;
          let rowGroupState = null;
          let pivotState = null;
          let chartState = null;
          
          try { columnsState = get().getGridColumnState(); } 
          catch (e) { console.warn('Failed to get column state', e); }
          
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
        if (!gridApi) return;
        
        // Check if settings object is complete before proceeding
        if (!settings || !settings.font) {
          console.error('Cannot apply settings: settings or font is undefined');
          return;
        }
        
        try {
          // Apply visual settings with safety checks
          const fontValue = settings.font.value || defaultFont.value;
          const fontSize = settings.fontSize || defaultFontSize;
          const density = typeof settings.density === 'number' ? settings.density : defaultDensity;
          
          // Debug info
          console.log('Applying visual settings:', {
            font: fontValue,
            fontSize,
            density
          });
          
          // Apply font settings
          document.documentElement.style.setProperty('--ag-font-family', fontValue);
          document.documentElement.style.setProperty('--ag-font-size', `${fontSize}px`);
          
          // Apply density (convert density value to spacing pixels)
          const spacingValue = 4 + (density - 1) * 4;
          document.documentElement.style.setProperty('--ag-grid-size', `${spacingValue}px`);
          document.documentElement.style.setProperty('--ag-list-item-height', `${spacingValue * 6}px`);
          document.documentElement.style.setProperty('--ag-row-height', `${spacingValue * 6}px`);
          document.documentElement.style.setProperty('--ag-header-height', `${spacingValue * 7}px`);
          document.documentElement.style.setProperty('--ag-cell-horizontal-padding', `${spacingValue * 1.5}px`);
          
          // No cell refresh needed for CSS-only changes
        } catch (error) {
          console.error('Error applying visual settings:', error);
        }
        
        try {
          // Apply column state if available
          if (settings.columnsState) {
            if (typeof gridApi.applyColumnState === 'function') {
              try {
                gridApi.applyColumnState({
                  state: settings.columnsState,
                  applyOrder: true
                });
                console.log('Applied column state successfully');
              } catch (error) {
                console.warn('Failed to apply column state:', error);
              }
            } else {
              console.warn('Unable to apply column state: applyColumnState not available');
            }
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
          if (settings.sortState) {
            // Check if setSortModel exists
            if (typeof gridApi.setSortModel === 'function') {
              gridApi.setSortModel(settings.sortState);
            } 
            // Alternative approach using applyColumnState
            else if (typeof gridApi.applyColumnState === 'function' && Array.isArray(settings.sortState)) {
              try {
                // Transform sort state into column state format
                const columnSortState = settings.sortState.map(sort => ({
                  colId: sort.colId,
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
            expressionEditorState: activeProfile.expressionEditorState || null,
            columnSettingsState: activeProfile.columnSettingsState || null,
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
      
      // Dialog settings updates
      updateExpressionEditorState: (state) => {
        set(prevState => ({
          settings: {
            ...prevState.settings,
            expressionEditorState: state
          },
          isDirty: true
        }));
      },
      
      updateColumnSettingsState: (state) => {
        set(prevState => ({
          settings: {
            ...prevState.settings,
            columnSettingsState: state
          },
          isDirty: true
        }));
      },
      
      // Utility functions for getting grid state
      getGridColumnState: () => {
        const { gridApi } = get();
        if (!gridApi) return null;
        
        try {
          return gridApi.getColumnState();
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
            return columnState.filter(col => col.sort).map(col => ({
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
        } catch (error) {
          return null;
        }
      },
      
      getGridPivotState: () => {
        const { gridApi } = get();
        if (!gridApi) return null;
        
        try {
          return gridApi.getPivotColumns?.() || null;
        } catch (error) {
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
        } catch (error) {
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
        activeProfileId: state.activeProfileId
      })
    }
  )
);
