import { useState, useEffect, useCallback, useRef } from 'react';
import { useGridStore } from '@/store/gridStore';
import { ColDef, ColumnState } from 'ag-grid-community';

// Constants
export const columnTypes = ['Default', 'Number', 'String', 'Date'];
export const pinnedPositions = ['Not pinned', 'Left', 'Right'];
export const filterOptions = ['Enabled', 'Disabled'];
export const filterTypes = ['Auto', 'Text', 'Number', 'Date'];
export const fontFamilies = ['Arial', 'Calibri', 'Helvetica', 'Times New Roman'];
export const fontSizes = ['12px', '14px', '16px', '18px', '20px'];
export const fontWeights = ['Normal', 'Bold', 'Italic', 'Bold Italic'];
export const borderStyles = ['None', 'Solid', 'Dashed', 'Dotted', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset'];
export const borderSides = ['All', 'Top', 'Right', 'Bottom', 'Left'];

export interface ColumnSettingsState {
  // General settings
  general: {
    headerName: string;
    width: string;
    columnType: string;
    pinnedPosition: string;
    filter: string;
    filterType: string;
    sortable: boolean;
    resizable: boolean;
    hidden: boolean;
    editable: boolean;
  };

  // Header styling
  header: {
    applyStyles: boolean; // Flag to enable/disable header styling (deprecated, kept for backward compatibility)
    applyTextColor?: boolean; // Flag to apply text color
    applyBackgroundColor?: boolean; // Flag to apply background color
    applyBorder?: boolean; // Flag to apply border styles
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    textColor: string;
    backgroundColor: string;
    alignH: string;
    borderStyle: string;
    borderWidth: number;
    borderColor: string;
    borderSides: string;
  };

  // Cell styling
  cell: {
    applyStyles: boolean; // Flag to enable/disable cell styling (deprecated, kept for backward compatibility)
    applyTextColor?: boolean; // Flag to apply text color
    applyBackgroundColor?: boolean; // Flag to apply background color
    applyBorder?: boolean; // Flag to apply border styles
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    textColor: string;
    backgroundColor: string;
    alignH: string;
    borderStyle: string;
    borderWidth: number;
    borderColor: string;
    borderSides: string;
  };

  // Additional settings can be added for other tabs
}

export const useColumnSettings = (initialColumn: string) => {
  const { gridApi } = useGridStore();

  // Cache for profiles to avoid repeated localStorage access
  const profilesCache = useRef<Record<string, any> | null>(null);

  // Function to get profiles from cache or localStorage
  const getProfiles = useCallback(() => {
    // Return cached profiles if available
    if (profilesCache.current !== null) {
      return profilesCache.current;
    }

    try {
      // Get profiles from localStorage
      const profilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const profiles = JSON.parse(profilesJson);

      // Cache the profiles
      profilesCache.current = profiles;

      return profiles;
    } catch (error) {
      console.error('Error getting profiles:', error);
      return {};
    }
  }, []);

  // Get initial state based on the column definition from the grid
  const getInitialState = useCallback((columnField: string): ColumnSettingsState => {
    // Check if there's a saved profile for this column
    try {
      // Get profiles from cache or localStorage
      const savedProfiles = getProfiles();

      // Look for a profile with the column name
      const profileName = `${columnField}_settings`;

      if (savedProfiles[profileName]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Found saved profile for column ${columnField}:`, savedProfiles[profileName]);
        }

        // Create a clean copy to avoid circular references
        const profile = savedProfiles[profileName];
        return {
          general: { ...profile.general },
          header: { ...profile.header },
          cell: { ...profile.cell }
        };
      }
    } catch (error) {
      console.error('Error checking for saved profile:', error);
    }
    // Default state
    const defaultState: ColumnSettingsState = {
      general: {
        headerName: columnField,
        width: '120',
        columnType: 'Default',
        pinnedPosition: 'Not pinned',
        filter: 'Enabled',
        filterType: 'Auto',
        sortable: true,
        resizable: true,
        hidden: false,
        editable: true,
      },
      header: {
        applyStyles: false, // Default to not applying styles
        applyTextColor: false,
        applyBackgroundColor: false,
        applyBorder: false,
        fontFamily: 'Arial',
        fontSize: '14px',
        fontWeight: 'Normal',
        bold: false,
        italic: false,
        underline: false,
        textColor: '#000000',
        backgroundColor: '#FFFFFF',
        alignH: 'left',
        borderStyle: 'Solid',
        borderWidth: 1,
        borderColor: '#000000',
        borderSides: 'All',
      },
      cell: {
        applyStyles: false, // Default to not applying styles
        applyTextColor: false,
        applyBackgroundColor: false,
        applyBorder: false,
        fontFamily: 'Arial',
        fontSize: '14px',
        fontWeight: 'Normal',
        bold: false,
        italic: false,
        underline: false,
        textColor: '#000000',
        backgroundColor: '#FFFFFF',
        alignH: 'left',
        borderStyle: 'Solid',
        borderWidth: 1,
        borderColor: '#000000',
        borderSides: 'All',
      }
    };

    // If grid API is not available, return default state
    if (!gridApi) return defaultState;

    try {
      // Find the column - AG Grid 33+ API uses getColumnState and getColumn
      const column = gridApi.getColumn(columnField);
      if (!column) return defaultState;

      // Get column definition
      const colDef = column.getColDef();
      if (!colDef) return defaultState;

      // Get column state - AG Grid 33+ API uses getColumnState
      const columnState = gridApi.getColumnState().find((col: ColumnState) => col.colId === columnField);

      // Update default state with current column settings
      return {
        ...defaultState,
        general: {
          ...defaultState.general,
          headerName: colDef.headerName || columnField,
          width: colDef.width?.toString() || (columnState?.width?.toString() || '120'),
          columnType: getColumnType(colDef),
          pinnedPosition: columnState?.pinned ? (columnState.pinned === 'left' ? 'Left' : 'Right') : 'Not pinned',
          filter: colDef.filter === false ? 'Disabled' : 'Enabled',
          filterType: getFilterType(colDef),
          sortable: colDef.sortable !== false,
          resizable: colDef.resizable !== false,
          hidden: columnState?.hide || false,
          editable: colDef.editable !== false
        },
        // We could also extract header and cell styling if available in column definition
      };
    } catch (error) {
      console.error('Error getting column settings:', error);
      return defaultState;
    }
  }, [gridApi]);

  // Helper to determine column type
  const getColumnType = (colDef: ColDef): string => {
    if (!colDef.type) return 'Default';
    if (colDef.type === 'numericColumn' || colDef.type === 'customNumeric') return 'Number';
    if (colDef.type === 'customDate') return 'Date';
    return 'String';
  };

  // Helper to determine filter type
  const getFilterType = (colDef: ColDef): string => {
    if (!colDef.filter || colDef.filter === true) return 'Auto';
    if (colDef.filter === 'agNumberColumnFilter') return 'Number';
    if (colDef.filter === 'agDateColumnFilter') return 'Date';
    if (colDef.filter === 'agTextColumnFilter') return 'Text';
    return 'Auto';
  };

  // Use a ref to track the current column name to avoid unnecessary state updates
  const currentColumnRef = useRef<string>(initialColumn);

  // Track whether we've initialized the state for a given column to avoid redundant resets
  const hasInitializedRef = useRef<Record<string, boolean>>({});

  // Track whether the state update was triggered internally to avoid circular updates
  const internalUpdateRef = useRef<boolean>(false);

  const [state, setState] = useState<ColumnSettingsState>(() => {
    // Mark initialColumn as initialized
    hasInitializedRef.current[initialColumn] = true;
    return getInitialState(initialColumn);
  });

  // Update a specific section of state with improved circular dependency prevention
  const updateSection = useCallback(<K extends keyof ColumnSettingsState>(
    section: K,
    updates: Partial<ColumnSettingsState[K]>
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Updating ${section} section with:`, updates);
    }

    // Skip if we're in the middle of an internal reset operation
    if (internalUpdateRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping update during column reset');
      }
      return;
    }

    // Use a function to update state to ensure we're working with the latest state
    setState(prev => {
      // Check if the updates are actually different from current state
      let hasChanges = false;
      const currentSectionState = prev[section];

      // Check each property in updates to see if it's different
      for (const key in updates) {
        if (updates[key] !== currentSectionState[key]) {
          hasChanges = true;
          break;
        }
      }

      // If nothing changed, return the previous state to avoid re-renders
      if (!hasChanges) {
        return prev;
      }

      // Create a new state object with the updates
      const result = {
        ...prev,
        [section]: {
          ...prev[section],
          ...updates
        }
      };

      // Special handling for headerName updates to keep column tracking in sync
      if (section === 'general' && 'headerName' in updates && updates.headerName) {
        // Update our ref to match the new headerName to avoid circular rendering
        if (updates.headerName !== currentColumnRef.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Updating internal column reference to: ${updates.headerName}`);
          }
          currentColumnRef.current = updates.headerName as string;
        }
      }

      return result;
    });
  }, []);

  // Update general settings
  const updateGeneral = useCallback((updates: Partial<ColumnSettingsState['general']>) => {
    console.log('updateGeneral called with:', updates);

    // Directly use the updateSection function to maintain consistency
    updateSection('general', updates);
  }, [updateSection]);

  // Update header settings
  const updateHeader = useCallback((updates: Partial<ColumnSettingsState['header']>) => {
    updateSection('header', updates);
  }, [updateSection]);

  // Update cell settings
  const updateCell = useCallback((updates: Partial<ColumnSettingsState['cell']>) => {
    updateSection('cell', updates);
  }, [updateSection]);

  // Reset state for a new column - completely rewritten to avoid circular dependencies
  const resetForColumn = useCallback((columnName: string) => {
    // Skip if column name is empty
    if (!columnName) {
      console.log('Empty column name, skipping reset');
      return;
    }

    // Get current column from the ref
    const currentColumn = currentColumnRef.current;

    // Skip if trying to reset to the same column that's already loaded
    if (currentColumn === columnName) {
      console.log('Column already selected, skipping reset:', columnName);
      return;
    }

    // Check if we've already initialized this column before
    if (hasInitializedRef.current[columnName]) {
      console.log(`Column ${columnName} was previously initialized, using cached state`);
      // We'll still reset, but we know this shouldn't cause a circular update
    }

    console.log(`Resetting column from ${currentColumn} to ${columnName}`);

    // Set the flag to indicate we're doing an internal update
    internalUpdateRef.current = true;

    // Update the ref FIRST before any state changes
    currentColumnRef.current = columnName;

    // Mark this column as initialized
    hasInitializedRef.current[columnName] = true;

    try {
      // Get fresh initial state for the column
      const newState = getInitialState(columnName);

      // Set state with the new initial state
      setState(newState);
    } catch (error) {
      console.error('Error getting initial state for column:', error);

      // Fallback to a basic default state
      setState({
        general: {
          headerName: columnName,
          width: '120',
          columnType: 'Default',
          pinnedPosition: 'Not pinned',
          filter: 'Enabled',
          filterType: 'Auto',
          sortable: true,
          resizable: true,
          hidden: false,
          editable: true
        },
        header: {
          applyStyles: false,
          fontFamily: 'Arial',
          fontSize: '14px',
          fontWeight: 'Normal',
          bold: false,
          italic: false,
          underline: false,
          textColor: '#000000',
          backgroundColor: '#FFFFFF',
          alignH: 'left',
          borderStyle: 'Solid',
          borderWidth: 1,
          borderColor: '#000000',
          borderSides: 'All'
        },
        cell: {
          applyStyles: false,
          fontFamily: 'Arial',
          fontSize: '14px',
          fontWeight: 'Normal',
          bold: false,
          italic: false,
          underline: false,
          textColor: '#000000',
          backgroundColor: '#FFFFFF',
          alignH: 'left',
          borderStyle: 'Solid',
          borderWidth: 1,
          borderColor: '#000000',
          borderSides: 'All'
        }
      });
    } finally {
      // Reset the flag after the state update is queued
      setTimeout(() => {
        internalUpdateRef.current = false;
      }, 0);
    }
  }, [getInitialState]);

  // Delegate to the store's applyColumnSettings function
  const applySettingsToGrid = useCallback((columnField: string, preserveCurrentWidth: boolean = true) => {
    // Get the grid store state
    const gridStore = useGridStore.getState();
    const { gridApi } = gridStore;

    // Capture the current column width from the grid before saving
    if (preserveCurrentWidth && gridApi && typeof gridApi.getColumn === 'function') {
      try {
        const column = gridApi.getColumn(columnField);
        if (column) {
          // Get the current width from the column state
          const columnState = gridApi.getColumnState().find((col: any) => col.colId === columnField);
          if (columnState && columnState.width) {
            // Update the width in the state before saving
            setState(prev => ({
              ...prev,
              general: {
                ...prev.general,
                width: columnState.width.toString()
              }
            }));

            if (process.env.NODE_ENV === 'development') {
              console.log(`Captured current width for column ${columnField}: ${columnState.width}px`);
            }
          }
        }
      } catch (error) {
        console.error('Error capturing column width:', error);
      }
    }

    // Save the column settings with the updated width
    saveProfile(`${columnField}_settings`);

    // RULE 1: When saving settings, don't apply them back to the grid
    // The grid already has these settings since we just captured them
    if (process.env.NODE_ENV === 'development') {
      console.log(`Settings saved for column ${columnField} - no need to apply settings back to grid`);
    }

    // Only apply settings if explicitly requested (e.g., when loading a profile)
    if (preserveCurrentWidth === false) {
      // RULE 3: When switching profiles, apply the column settings from the new profile
      return gridStore.applyColumnSettings(columnField, false);
    }

    return true;
  }, []);

  // Save current settings to a profile
  const saveProfile = useCallback((profileName: string) => {
    try {
      // Get all existing profiles from cache
      const profiles = getProfiles();

      // Create a safe copy of the state - using spread to avoid circular references
      const stateCopy = {
        general: {...state.general},
        header: {...state.header},
        cell: {...state.cell}
      };

      // If this is a column profile, try to get the current width from the grid
      if (profileName.endsWith('_settings')) {
        const columnField = profileName.replace('_settings', '');
        const gridStore = useGridStore.getState();
        const { gridApi } = gridStore;

        if (gridApi && typeof gridApi.getColumn === 'function') {
          try {
            const column = gridApi.getColumn(columnField);
            if (column) {
              // Get the current width from the column state
              const columnState = gridApi.getColumnState().find((col: any) => col.colId === columnField);
              if (columnState && columnState.width) {
                // Update the width in the state copy
                stateCopy.general.width = columnState.width.toString();

                if (process.env.NODE_ENV === 'development') {
                  console.log(`Updated width in profile for column ${columnField}: ${columnState.width}px`);
                }
              }
            }
          } catch (error) {
            console.error('Error getting column width for profile:', error);
          }
        }
      }

      // Add or update the profile
      profiles[profileName] = stateCopy;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Saved profile '${profileName}':`, stateCopy);
      }

      // Update the cache
      profilesCache.current = profiles;

      // Save back to localStorage
      localStorage.setItem('columnSettingsProfiles', JSON.stringify(profiles));

      // Also save to store
      if (profileName.endsWith('_settings')) {
        const columnField = profileName.replace('_settings', '');
        useGridStore.getState().saveColumnSettings(columnField, stateCopy);
      }

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  }, [state, getProfiles]);

  // Load settings from a profile
  const loadProfile = useCallback((profileName: string) => {
    try {
      // Get all existing profiles from cache
      const profiles = getProfiles();

      // Check if profile exists
      if (!profiles[profileName]) {
        console.error(`Profile '${profileName}' not found`);
        return false;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Loading profile '${profileName}':`, profiles[profileName]);
      }

      // Create a safe copy to avoid reference issues
      const profile = profiles[profileName];
      const profileCopy = {
        general: {...profile.general},
        header: {...profile.header},
        cell: {...profile.cell}
      };

      // Set internal update flag to prevent circular updates
      internalUpdateRef.current = true;

      // Update state with the profile
      setState(profileCopy);

      // Reset the flag after a short delay
      setTimeout(() => {
        internalUpdateRef.current = false;
      }, 0);

      return true;
    } catch (error) {
      console.error('Error loading profile:', error);
      return false;
    }
  }, [getProfiles]);

  // Get all available profile keys
  const getProfileKeys = useCallback(() => {
    try {
      // Get all existing profiles from cache
      const profiles = getProfiles();

      const profileKeys = Object.keys(profiles);
      if (process.env.NODE_ENV === 'development') {
        console.log('Available profiles:', profileKeys);
      }
      return profileKeys;
    } catch (error) {
      console.error('Error getting profile keys:', error);
      return [];
    }
  }, [getProfiles]);

  // Delete a profile
  const deleteProfile = useCallback((profileName: string) => {
    try {
      // Get all existing profiles from cache
      const profiles = getProfiles();

      // Delete the profile
      delete profiles[profileName];

      // Update the cache
      profilesCache.current = profiles;

      // Save back to localStorage
      localStorage.setItem('columnSettingsProfiles', JSON.stringify(profiles));

      // Also delete from store if applicable
      if (profileName.endsWith('_settings')) {
        const columnField = profileName.replace('_settings', '');
        useGridStore.getState().deleteColumnSettingsProfile(profileName);
      }

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }, [getProfiles]);

  return {
    state,
    updateGeneral,
    updateHeader,
    updateCell,
    resetForColumn,
    applySettingsToGrid,
    saveProfile,
    loadProfile,
    getProfiles: getProfileKeys,
    deleteProfile
  };
};