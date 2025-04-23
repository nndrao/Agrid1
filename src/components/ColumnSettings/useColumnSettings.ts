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
    applyStyles: boolean; // Flag to enable/disable header styling
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
    applyStyles: boolean; // Flag to enable/disable cell styling
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

  // Get initial state based on the column definition from the grid
  const getInitialState = useCallback((columnField: string): ColumnSettingsState => {
    // Check if there's a saved profile for this column
    try {
      const savedProfilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const savedProfiles = JSON.parse(savedProfilesJson);

      // Look for a profile with the column name
      const profileName = `${columnField}_settings`;

      if (savedProfiles[profileName]) {
        console.log(`Found saved profile for column ${columnField}:`, savedProfiles[profileName]);
        
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
    console.log(`Updating ${section} section with:`, updates);
    
    // Skip if we're in the middle of an internal reset operation
    if (internalUpdateRef.current) {
      console.log('Skipping update during column reset');
      return;
    }
    
    // Simplify the update logic to avoid deep comparisons
    setState(prev => {
      // Always create a new reference to avoid circular updates
      const result = {
        ...prev,
        [section]: {
          ...prev[section],
          ...updates
        }
      };
      
      // Special handling for headerName updates to keep column tracking in sync
      if (section === 'general' && 'headerName' in updates && updates.headerName) {
        // This is critical - update our ref to match the new headerName
        // to avoid circular rendering with resetForColumn
        if (updates.headerName !== currentColumnRef.current) {
          console.log(`Updating internal column reference to: ${updates.headerName}`);
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

  // Apply column settings to the grid - completely rewritten for reliability
  const applySettingsToGrid = useCallback((columnField: string) => {
    console.log('Applying settings to grid for column:', columnField);
    
    // Early returns for invalid input
    if (!gridApi) {
      console.error('Grid API not available for applying settings');
      return false;
    }
    
    if (!columnField) {
      console.error('No column field provided');
      return false;
    }

    try {
      // Log useful debugging info
      console.log('Current state being applied:', {
        general: state.general.headerName, 
        header: state.header.applyStyles,
        cell: state.cell.applyStyles
      });
      
      // Create stable copies of all settings
      const generalSettings = {...state.general};
      const headerSettings = {...state.header};
      const cellSettings = {...state.cell};
      
      // Get the column by ID - try multiple methods
      let column = null;
      let colDef = null;
      
      // Method 1: Direct getColumn
      if (gridApi.getColumn && typeof gridApi.getColumn === 'function') {
        column = gridApi.getColumn(columnField);
      }
      
      // Method 2: Search in all columns
      if (!column && gridApi.getColumns && typeof gridApi.getColumns === 'function') {
        const allColumns = gridApi.getColumns();
        column = allColumns.find(c => c.getColId() === columnField);
      }
      
      // If we found a column, get its definition
      if (column) {
        console.log('Column found:', columnField);
        if (column.getColDef && typeof column.getColDef === 'function') {
          colDef = column.getColDef();
        }
      } else {
        console.error('Column not found in grid:', columnField);
        return false;
      }
      
      // Ensure we have a valid column definition
      if (!colDef) {
        console.error('Failed to get column definition');
        return false;
      }
      
      // Apply general settings
      console.log('Applying general settings to column');
      colDef.headerName = generalSettings.headerName;
      colDef.width = parseInt(generalSettings.width, 10) || undefined;
      colDef.sortable = generalSettings.sortable;
      colDef.resizable = generalSettings.resizable;
      colDef.filter = generalSettings.filter === 'Enabled' ? true : false;
      colDef.editable = generalSettings.editable;

      // Handle column type
      if (generalSettings.columnType === 'Number') {
        colDef.type = 'customNumeric';
        colDef.filter = 'agNumberColumnFilter';
      } else if (generalSettings.columnType === 'Date') {
        colDef.type = 'customDate';
        colDef.filter = 'agDateColumnFilter';
      } else if (generalSettings.columnType === 'String') {
        colDef.type = undefined;
        colDef.filter = 'agTextColumnFilter';
      }

      // Update filter type if filter is enabled
      if (generalSettings.filter === 'Enabled' && generalSettings.filterType !== 'Auto') {
        if (generalSettings.filterType === 'Text') colDef.filter = 'agTextColumnFilter';
        if (generalSettings.filterType === 'Number') colDef.filter = 'agNumberColumnFilter';
        if (generalSettings.filterType === 'Date') colDef.filter = 'agDateColumnFilter';
      }

      // Apply header styles
      if (headerSettings.applyStyles) {
        console.log('Applying header styles');
        
        // Set header class
        colDef.headerClass = `custom-header-${columnField}`;

        // Create CSS for header
        let headerStyle = '';
        if (headerSettings.fontFamily) headerStyle += `font-family: ${headerSettings.fontFamily}; `;
        if (headerSettings.fontSize) headerStyle += `font-size: ${headerSettings.fontSize}; `;
        if (headerSettings.bold) headerStyle += 'font-weight: bold; ';
        if (headerSettings.italic) headerStyle += 'font-style: italic; ';
        if (headerSettings.underline) headerStyle += 'text-decoration: underline; ';
        if (headerSettings.textColor) headerStyle += `color: ${headerSettings.textColor}; `;
        if (headerSettings.backgroundColor) headerStyle += `background-color: ${headerSettings.backgroundColor}; `;
        if (headerSettings.alignH) headerStyle += `text-align: ${headerSettings.alignH}; `;

        // Add border styles if specified
        if (headerSettings.borderStyle && headerSettings.borderWidth && headerSettings.borderColor) {
          const borderStyle = `${headerSettings.borderWidth}px ${headerSettings.borderStyle.toLowerCase()} ${headerSettings.borderColor}`;

          if (headerSettings.borderSides === 'All') {
            headerStyle += `border: ${borderStyle}; `;
          } else if (headerSettings.borderSides === 'Top') {
            headerStyle += `border-top: ${borderStyle}; `;
          } else if (headerSettings.borderSides === 'Right') {
            headerStyle += `border-right: ${borderStyle}; `;
          } else if (headerSettings.borderSides === 'Bottom') {
            headerStyle += `border-bottom: ${borderStyle}; `;
          } else if (headerSettings.borderSides === 'Left') {
            headerStyle += `border-left: ${borderStyle}; `;
          }
        }

        // Apply the CSS
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
        // Remove styles if disabled
        const styleElement = document.getElementById(`header-style-${columnField}`);
        if (styleElement) styleElement.remove();
        
        // Clear the header class
        if (colDef.headerClass) colDef.headerClass = undefined;
      }

      // Apply cell styles
      if (cellSettings.applyStyles) {
        console.log('Applying cell styles');
        
        // Set cell class
        colDef.cellClass = `custom-cell-${columnField}`;

        // Create CSS for cells
        let cellStyle = '';
        if (cellSettings.fontFamily) cellStyle += `font-family: ${cellSettings.fontFamily}; `;
        if (cellSettings.fontSize) cellStyle += `font-size: ${cellSettings.fontSize}; `;
        if (cellSettings.bold) cellStyle += 'font-weight: bold; ';
        if (cellSettings.italic) cellStyle += 'font-style: italic; ';
        if (cellSettings.underline) cellStyle += 'text-decoration: underline; ';
        if (cellSettings.textColor) cellStyle += `color: ${cellSettings.textColor}; `;
        if (cellSettings.backgroundColor) cellStyle += `background-color: ${cellSettings.backgroundColor}; `;
        if (cellSettings.alignH) cellStyle += `text-align: ${cellSettings.alignH}; `;

        // Add border styles if specified
        if (cellSettings.borderStyle && cellSettings.borderWidth && cellSettings.borderColor) {
          const borderStyle = `${cellSettings.borderWidth}px ${cellSettings.borderStyle.toLowerCase()} ${cellSettings.borderColor}`;

          if (cellSettings.borderSides === 'All') {
            cellStyle += `border: ${borderStyle}; `;
          } else if (cellSettings.borderSides === 'Top') {
            cellStyle += `border-top: ${borderStyle}; `;
          } else if (cellSettings.borderSides === 'Right') {
            cellStyle += `border-right: ${borderStyle}; `;
          } else if (cellSettings.borderSides === 'Bottom') {
            cellStyle += `border-bottom: ${borderStyle}; `;
          } else if (cellSettings.borderSides === 'Left') {
            cellStyle += `border-left: ${borderStyle}; `;
          }
        }

        // Apply the CSS
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
        // Remove styles if disabled
        const styleElement = document.getElementById(`cell-style-${columnField}`);
        if (styleElement) styleElement.remove();
        
        // Clear the cell class
        if (colDef.cellClass) colDef.cellClass = undefined;
      }

      // Apply column visibility
      if (typeof column.setVisible === 'function') {
        console.log(`Setting column visibility: ${!generalSettings.hidden}`);
        column.setVisible(!generalSettings.hidden);
      }

      // Apply column pinned state
      if (typeof column.setPinned === 'function') {
        let pinnedState = null;
        if (generalSettings.pinnedPosition === 'Left') pinnedState = 'left';
        if (generalSettings.pinnedPosition === 'Right') pinnedState = 'right';
        console.log(`Setting column pinned state: ${pinnedState}`);
        column.setPinned(pinnedState);
      }
      
      // Refresh the grid
      console.log('Refreshing grid after applying settings');
      
      // Refresh cells
      if (typeof gridApi.refreshCells === 'function') {
        gridApi.refreshCells({ 
          force: true, 
          columns: [columnField] 
        });
      }
      
      // Refresh header
      if (typeof gridApi.refreshHeader === 'function') {
        gridApi.refreshHeader();
      }
      
      // Redraw rows if needed
      if (typeof gridApi.redrawRows === 'function') {
        gridApi.redrawRows();
      }

      return true;
    } catch (error) {
      console.error('Error applying column settings:', error);

      // Final fallback: try using the columnApi directly if available
      try {
        if (gridApi.columnApi) {
          console.log('Attempting to use columnApi directly');
          const generalSettings = {...state.general};

          // Try to update the column using columnApi methods
          if (typeof gridApi.columnApi.setColumnWidth === 'function') {
            gridApi.columnApi.setColumnWidth(columnField, parseInt(generalSettings.width, 10) || 120);
          }

          if (typeof gridApi.columnApi.setColumnVisible === 'function') {
            gridApi.columnApi.setColumnVisible(columnField, !generalSettings.hidden);
          }

          if (typeof gridApi.columnApi.setColumnPinned === 'function') {
            let pinnedState = null;
            if (generalSettings.pinnedPosition === 'Left') pinnedState = 'left';
            if (generalSettings.pinnedPosition === 'Right') pinnedState = 'right';
            gridApi.columnApi.setColumnPinned(columnField, pinnedState);
          }

          // Apply header styles only if enabled
          if (state.header.applyStyles) {
            // Apply header styles using CSS
            let headerStyle = '';
            if (state.header.fontFamily) headerStyle += `font-family: ${state.header.fontFamily}; `;
            if (state.header.fontSize) headerStyle += `font-size: ${state.header.fontSize}; `;
            if (state.header.bold) headerStyle += 'font-weight: bold; ';
            if (state.header.italic) headerStyle += 'font-style: italic; ';
            if (state.header.underline) headerStyle += 'text-decoration: underline; ';
            if (state.header.textColor) headerStyle += `color: ${state.header.textColor}; `;
            if (state.header.backgroundColor) headerStyle += `background-color: ${state.header.backgroundColor}; `;
            if (state.header.alignH) headerStyle += `text-align: ${state.header.alignH}; `;

            // Apply the CSS to the document
            if (headerStyle) {
              let styleElement = document.getElementById(`header-style-${columnField}`);
              if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = `header-style-${columnField}`;
                document.head.appendChild(styleElement);
              }
              styleElement.textContent = `.ag-header-cell[col-id="${columnField}"] { ${headerStyle} }`;
            }
          } else {
            // Remove any existing styles if not enabled
            const styleElement = document.getElementById(`header-style-${columnField}`);
            if (styleElement) {
              styleElement.remove();
            }
          }

          // Apply cell styles only if enabled
          if (state.cell.applyStyles) {
            // Apply cell styles using CSS
            let cellStyle = '';
            if (state.cell.fontFamily) cellStyle += `font-family: ${state.cell.fontFamily}; `;
            if (state.cell.fontSize) cellStyle += `font-size: ${state.cell.fontSize}; `;
            if (state.cell.bold) cellStyle += 'font-weight: bold; ';
            if (state.cell.italic) cellStyle += 'font-style: italic; ';
            if (state.cell.underline) cellStyle += 'text-decoration: underline; ';
            if (state.cell.textColor) cellStyle += `color: ${state.cell.textColor}; `;
            if (state.cell.backgroundColor) cellStyle += `background-color: ${state.cell.backgroundColor}; `;
            if (state.cell.alignH) cellStyle += `text-align: ${state.cell.alignH}; `;

            // Apply the CSS to the document
            if (cellStyle) {
              let styleElement = document.getElementById(`cell-style-${columnField}`);
              if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = `cell-style-${columnField}`;
                document.head.appendChild(styleElement);
              }
              styleElement.textContent = `.ag-cell[col-id="${columnField}"] { ${cellStyle} }`;
            }
          } else {
            // Remove any existing styles if not enabled
            const styleElement = document.getElementById(`cell-style-${columnField}`);
            if (styleElement) {
              styleElement.remove();
            }
          }

          // Refresh the grid
          if (typeof gridApi.refreshHeader === 'function') {
            gridApi.refreshHeader();
          }

          return true;
        }
      } catch (fallbackError) {
        console.error('Error using columnApi fallback:', fallbackError);
      }

      return false;
    }
  }, [gridApi, state]);

  // Save current settings to a profile
  const saveProfile = useCallback((profileName: string) => {
    try {
      // Get all existing profiles
      const profilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const profiles = JSON.parse(profilesJson);

      // Create a safe copy of the state - using spread to avoid circular references
      const stateCopy = {
        general: {...state.general},
        header: {...state.header},
        cell: {...state.cell}
      };

      // Add or update the profile
      profiles[profileName] = stateCopy;

      console.log(`Saved profile '${profileName}':`, stateCopy);

      // Save back to localStorage
      localStorage.setItem('columnSettingsProfiles', JSON.stringify(profiles));

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  }, [state]);

  // Load settings from a profile
  const loadProfile = useCallback((profileName: string) => {
    try {
      // Get all existing profiles
      const profilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const profiles = JSON.parse(profilesJson);

      // Check if profile exists
      if (!profiles[profileName]) {
        console.error(`Profile '${profileName}' not found`);
        return false;
      }

      // Load the profile
      console.log(`Loading profile '${profileName}':`, profiles[profileName]);

      // Create a safe copy to avoid reference issues
      const profile = profiles[profileName];
      const profileCopy = {
        general: {...profile.general},
        header: {...profile.header},
        cell: {...profile.cell}
      };

      console.log('Setting state to profile:', profileCopy);
      setState(profileCopy);

      return true;
    } catch (error) {
      console.error('Error loading profile:', error);
      return false;
    }
  }, []);

  // Get all available profiles
  const getProfiles = useCallback(() => {
    try {
      // Get all existing profiles
      const profilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const profiles = JSON.parse(profilesJson);

      const profileKeys = Object.keys(profiles);
      console.log('Available profiles:', profileKeys);
      return profileKeys;
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }, []);

  // Delete a profile
  const deleteProfile = useCallback((profileName: string) => {
    try {
      // Get all existing profiles
      const profilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const profiles = JSON.parse(profilesJson);

      // Delete the profile
      delete profiles[profileName];

      // Save back to localStorage
      localStorage.setItem('columnSettingsProfiles', JSON.stringify(profiles));

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }, []);

  return {
    state,
    updateGeneral,
    updateHeader,
    updateCell,
    resetForColumn,
    applySettingsToGrid,
    saveProfile,
    loadProfile,
    getProfiles,
    deleteProfile
  };
};
