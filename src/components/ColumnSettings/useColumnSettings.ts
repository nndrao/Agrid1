import { useState, useEffect, useCallback } from 'react';
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
export const borderStyles = ['Solid', 'Dashed', 'Dotted', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset'];
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
        return savedProfiles[profileName];
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

  const [state, setState] = useState<ColumnSettingsState>(() => getInitialState(initialColumn));

  // Log state changes
  useEffect(() => {
    console.log('useColumnSettings state updated:', state);
  }, [state]);

  // Update a specific section of state
  const updateSection = useCallback(<K extends keyof ColumnSettingsState>(
    section: K,
    updates: Partial<ColumnSettingsState[K]>
  ) => {
    console.log(`Updating ${section} section with:`, updates);
    setState(prev => {
      // Create a deep copy of the previous state to avoid reference issues
      const prevCopy = JSON.parse(JSON.stringify(prev));

      // Check if there are actual changes
      const hasChanges = Object.entries(updates).some(([key, value]) => {
        const typedKey = key as keyof ColumnSettingsState[K];
        return prevCopy[section][typedKey] !== value;
      });

      if (!hasChanges) {
        console.log(`No changes detected for ${section}, returning previous state`);
        return prevCopy;
      }

      const newState = {
        ...prevCopy,
        [section]: {
          ...prevCopy[section],
          ...updates
        }
      };
      console.log(`New state for ${section}:`, newState[section]);
      return newState;
    });
  }, []);

  // Update general settings
  const updateGeneral = useCallback((updates: Partial<ColumnSettingsState['general']>) => {
    console.log('updateGeneral called with:', updates);
    setState(prev => {
      // Create a deep copy of the previous state to avoid reference issues
      const prevCopy = JSON.parse(JSON.stringify(prev));

      // Only update state if there are actual changes
      const hasChanges = Object.entries(updates).some(([key, value]) => {
        return prevCopy.general[key as keyof ColumnSettingsState['general']] !== value;
      });

      if (!hasChanges) {
        console.log('No changes detected, returning previous state');
        return prevCopy; // Return previous state if no changes
      }

      const newSettings = {
        ...prevCopy,
        general: {
          ...prevCopy.general,
          ...updates
        }
      };
      console.log('Updated general settings:', newSettings.general);
      return newSettings;
    });
  }, []);

  // Update header settings
  const updateHeader = useCallback((updates: Partial<ColumnSettingsState['header']>) => {
    updateSection('header', updates);
  }, [updateSection]);

  // Update cell settings
  const updateCell = useCallback((updates: Partial<ColumnSettingsState['cell']>) => {
    updateSection('cell', updates);
  }, [updateSection]);

  // Reset state for a new column
  const resetForColumn = useCallback((columnName: string) => {
    // Get initial state for the selected column
    setState(getInitialState(columnName));
  }, [getInitialState]);

  // Apply column settings to the grid - Updated for AG Grid 33+
  const applySettingsToGrid = useCallback((columnField: string) => {
    console.log('Applying settings to grid for column:', columnField);
    console.log('Grid API available:', !!gridApi);
    if (!gridApi) {
      console.error('Grid API not available');
      return false;
    }

    try {
      // Get the column from the grid - AG Grid 33+ approach
      console.log('Grid API methods:', Object.keys(gridApi).filter(key => typeof gridApi[key] === 'function'));
      console.log('Column API available:', !!gridApi.columnApi);
      if (gridApi.columnApi) {
        console.log('Column API methods:', Object.keys(gridApi.columnApi).filter(key => typeof gridApi.columnApi[key] === 'function'));
      }

      const column = gridApi.getColumn ? gridApi.getColumn(columnField) : null;

      if (column) {
        console.log('Column found:', columnField);
        console.log('Column methods:', Object.keys(column).filter(key => typeof column[key] === 'function'));
      }

      if (!column) {
        console.error(`Column ${columnField} not found or getColumn method not available`);

        // Try an alternative approach if the API has changed
        if (gridApi.columnModel && typeof gridApi.columnModel.getColumn === 'function') {
          const altColumn = gridApi.columnModel.getColumn(columnField);
          if (altColumn) {
            console.log('Found column using alternative API');
            // We can't use 'this' in a callback function
            // Let's implement the alternative approach inline
            try {
              const altColDef = altColumn.getColDef ? altColumn.getColDef() : {};
              const { general, header, cell } = state;

              // Update properties
              altColDef.headerName = general.headerName;
              altColDef.width = parseInt(general.width, 10) || undefined;
              altColDef.sortable = general.sortable;
              altColDef.resizable = general.resizable;
              altColDef.filter = general.filter === 'Enabled' ? true : false;
              altColDef.editable = general.editable;

              // Apply header styles only if enabled
              if (header.applyStyles) {
                // Apply header styles using the same approach
                altColDef.headerClass = `custom-header-${columnField}`;

                // Create header styles
                let headerStyle = '';
                if (header.fontFamily) headerStyle += `font-family: ${header.fontFamily}; `;
                if (header.fontSize) headerStyle += `font-size: ${header.fontSize}; `;
                if (header.bold) headerStyle += 'font-weight: bold; ';
                if (header.italic) headerStyle += 'font-style: italic; ';
                if (header.underline) headerStyle += 'text-decoration: underline; ';
                if (header.textColor) headerStyle += `color: ${header.textColor}; `;
                if (header.backgroundColor) headerStyle += `background-color: ${header.backgroundColor}; `;
                if (header.alignH) headerStyle += `text-align: ${header.alignH}; `;

                // Apply the CSS to the document
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
                // Remove any existing styles if not enabled
                const styleElement = document.getElementById(`header-style-${columnField}`);
                if (styleElement) {
                  styleElement.remove();
                }
              }

              // Apply cell styles only if enabled
              if (cell.applyStyles) {
                // Apply cell styles
                altColDef.cellClass = `custom-cell-${columnField}`;

                // Create cell styles
                let cellStyle = '';
                if (cell.fontFamily) cellStyle += `font-family: ${cell.fontFamily}; `;
                if (cell.fontSize) cellStyle += `font-size: ${cell.fontSize}; `;
                if (cell.bold) cellStyle += 'font-weight: bold; ';
                if (cell.italic) cellStyle += 'font-style: italic; ';
                if (cell.underline) cellStyle += 'text-decoration: underline; ';
                if (cell.textColor) cellStyle += `color: ${cell.textColor}; `;
                if (cell.backgroundColor) cellStyle += `background-color: ${cell.backgroundColor}; `;
                if (cell.alignH) cellStyle += `text-align: ${cell.alignH}; `;

                // Apply the CSS to the document
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
                // Remove any existing styles if not enabled
                const styleElement = document.getElementById(`cell-style-${columnField}`);
                if (styleElement) {
                  styleElement.remove();
                }
              }

              // Refresh the grid
              if (gridApi.refreshHeader) gridApi.refreshHeader();
              if (gridApi.redrawRows) gridApi.redrawRows();

              return true;
            } catch (altError) {
              console.error('Error using alternative API:', altError);
              return false;
            }
          }
        }

        return false;
      }

      // Get the current state
      const { general, header, cell } = state;

      // Get the column definition directly from the column
      // In AG-Grid 33+, we update the column definition directly
      const colDef = column.getColDef ? column.getColDef() : {};

      console.log('Column definition:', colDef);

      // Check if we have a valid column definition
      if (!colDef) {
        console.error('Failed to get column definition');
        return false;
      }

      // Update the column definition properties
      colDef.headerName = general.headerName;
      colDef.width = parseInt(general.width, 10) || undefined;
      colDef.sortable = general.sortable;
      colDef.resizable = general.resizable;
      colDef.filter = general.filter === 'Enabled' ? true : false;
      colDef.editable = general.editable;

      // Handle column type
      if (general.columnType === 'Number') {
        colDef.type = 'customNumeric';
        colDef.filter = 'agNumberColumnFilter';
      } else if (general.columnType === 'Date') {
        colDef.type = 'customDate';
        colDef.filter = 'agDateColumnFilter';
      } else if (general.columnType === 'String') {
        colDef.type = undefined;
        colDef.filter = 'agTextColumnFilter';
      }

      // Update filter type if filter is enabled
      if (general.filter === 'Enabled' && general.filterType !== 'Auto') {
        if (general.filterType === 'Text') colDef.filter = 'agTextColumnFilter';
        if (general.filterType === 'Number') colDef.filter = 'agNumberColumnFilter';
        if (general.filterType === 'Date') colDef.filter = 'agDateColumnFilter';
      }

      // Apply header styles only if enabled
      console.log('Header styles enabled:', header.applyStyles);

      if (header.applyStyles) {
        console.log('Applying header styles:', header);

        // Create a headerClass function to apply custom styles
        colDef.headerClass = (params: any) => {
          // Return a unique class name for this column
          return `custom-header-${columnField}`;
        };

        // Create a CSS style string for the header
        let headerStyle = '';
        if (header.fontFamily) headerStyle += `font-family: ${header.fontFamily}; `;
        if (header.fontSize) headerStyle += `font-size: ${header.fontSize}; `;
        if (header.bold) headerStyle += 'font-weight: bold; ';
        if (header.italic) headerStyle += 'font-style: italic; ';
        if (header.underline) headerStyle += 'text-decoration: underline; ';
        if (header.textColor) headerStyle += `color: ${header.textColor}; `;
        if (header.backgroundColor) headerStyle += `background-color: ${header.backgroundColor}; `;
        if (header.alignH) headerStyle += `text-align: ${header.alignH}; `;

        // Apply border styles if specified
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

        // Apply the CSS to the document
        if (headerStyle) {
          // Create or update a style element for this column's header
          let styleElement = document.getElementById(`header-style-${columnField}`);
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = `header-style-${columnField}`;
            document.head.appendChild(styleElement);
          }

          styleElement.textContent = `.ag-header-cell.custom-header-${columnField}, .ag-header-cell[col-id="${columnField}"] { ${headerStyle} }`;
        }
      } else {
        // Remove any existing styles if not enabled
        const styleElement = document.getElementById(`header-style-${columnField}`);
        if (styleElement) {
          styleElement.remove();
        }

        // Remove the headerClass if it was previously set
        if (colDef.headerClass) {
          colDef.headerClass = undefined;
        }
      }

      // Apply cell styles only if enabled
      console.log('Cell styles enabled:', cell.applyStyles);

      if (cell.applyStyles) {
        console.log('Applying cell styles:', cell);

        // Create a cellClass function to apply custom styles
        colDef.cellClass = (params: any) => {
          // Return a unique class name for this column's cells
          return `custom-cell-${columnField}`;
        };

        // Create a CSS style string for the cells
        let cellStyle = '';
        if (cell.fontFamily) cellStyle += `font-family: ${cell.fontFamily}; `;
        if (cell.fontSize) cellStyle += `font-size: ${cell.fontSize}; `;
        if (cell.bold) cellStyle += 'font-weight: bold; ';
        if (cell.italic) cellStyle += 'font-style: italic; ';
        if (cell.underline) cellStyle += 'text-decoration: underline; ';
        if (cell.textColor) cellStyle += `color: ${cell.textColor}; `;
        if (cell.backgroundColor) cellStyle += `background-color: ${cell.backgroundColor}; `;
        if (cell.alignH) cellStyle += `text-align: ${cell.alignH}; `;

        // Apply border styles if specified
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

        // Apply the CSS to the document
        if (cellStyle) {
          // Create or update a style element for this column's cells
          let styleElement = document.getElementById(`cell-style-${columnField}`);
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = `cell-style-${columnField}`;
            document.head.appendChild(styleElement);
          }

          styleElement.textContent = `.ag-cell.custom-cell-${columnField}, .ag-cell[col-id="${columnField}"] { ${cellStyle} }`;
        }
      } else {
        // Remove any existing styles if not enabled
        const styleElement = document.getElementById(`cell-style-${columnField}`);
        if (styleElement) {
          styleElement.remove();
        }

        // Remove the cellClass if it was previously set
        if (colDef.cellClass) {
          colDef.cellClass = undefined;
        }
      }

      // Set column visibility - AG Grid 33+ API
      if (typeof column.setVisible === 'function') {
        column.setVisible(!general.hidden);
      }

      // Set column pinned state - AG Grid 33+ API
      if (typeof column.setPinned === 'function') {
        let pinnedState = null;
        if (general.pinnedPosition === 'Left') pinnedState = 'left';
        if (general.pinnedPosition === 'Right') pinnedState = 'right';
        column.setPinned(pinnedState);
      }

      // Refresh the grid to ensure all changes take effect - AG Grid 33+ API
      if (typeof gridApi.refreshHeader === 'function') {
        gridApi.refreshHeader();
      }

      // Refresh the cells in this column
      if (typeof gridApi.refreshCells === 'function') {
        gridApi.refreshCells({ force: true, columns: [columnField] });
      } else if (typeof gridApi.redrawRows === 'function') {
        // Fallback to redrawRows if refreshCells is not available
        gridApi.redrawRows();
      }

      return true;
    } catch (error) {
      console.error('Error applying column settings:', error);

      // Final fallback: try using the columnApi directly if available
      try {
        if (gridApi.columnApi) {
          console.log('Attempting to use columnApi directly');
          const { general, header, cell } = state;

          // Try to update the column using columnApi methods
          if (typeof gridApi.columnApi.setColumnWidth === 'function') {
            gridApi.columnApi.setColumnWidth(columnField, parseInt(general.width, 10) || 120);
          }

          if (typeof gridApi.columnApi.setColumnVisible === 'function') {
            gridApi.columnApi.setColumnVisible(columnField, !general.hidden);
          }

          if (typeof gridApi.columnApi.setColumnPinned === 'function') {
            let pinnedState = null;
            if (general.pinnedPosition === 'Left') pinnedState = 'left';
            if (general.pinnedPosition === 'Right') pinnedState = 'right';
            gridApi.columnApi.setColumnPinned(columnField, pinnedState);
          }

          // Apply header styles only if enabled
          if (header.applyStyles) {
            // Apply header styles using CSS
            let headerStyle = '';
            if (header.fontFamily) headerStyle += `font-family: ${header.fontFamily}; `;
            if (header.fontSize) headerStyle += `font-size: ${header.fontSize}; `;
            if (header.bold) headerStyle += 'font-weight: bold; ';
            if (header.italic) headerStyle += 'font-style: italic; ';
            if (header.underline) headerStyle += 'text-decoration: underline; ';
            if (header.textColor) headerStyle += `color: ${header.textColor}; `;
            if (header.backgroundColor) headerStyle += `background-color: ${header.backgroundColor}; `;
            if (header.alignH) headerStyle += `text-align: ${header.alignH}; `;

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
          if (cell.applyStyles) {
            // Apply cell styles using CSS
            let cellStyle = '';
            if (cell.fontFamily) cellStyle += `font-family: ${cell.fontFamily}; `;
            if (cell.fontSize) cellStyle += `font-size: ${cell.fontSize}; `;
            if (cell.bold) cellStyle += 'font-weight: bold; ';
            if (cell.italic) cellStyle += 'font-style: italic; ';
            if (cell.underline) cellStyle += 'text-decoration: underline; ';
            if (cell.textColor) cellStyle += `color: ${cell.textColor}; `;
            if (cell.backgroundColor) cellStyle += `background-color: ${cell.backgroundColor}; `;
            if (cell.alignH) cellStyle += `text-align: ${cell.alignH}; `;

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

      // Create a deep copy of the state to avoid reference issues
      const stateCopy = JSON.parse(JSON.stringify(state));

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

      // Create a deep copy of the profile to avoid reference issues
      const profileCopy = JSON.parse(JSON.stringify(profiles[profileName]));

      // Always update the state with the profile, even if it seems identical
      // This ensures that the state is properly updated

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
