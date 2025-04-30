// Column State Management module for the grid store
import { StateCreator } from 'zustand';
import { GridStoreState, ColumnState, ColumnStateModel, ColumnProfile } from './types';
import { deepClone } from './utils';

// Column state management slice creator
export const createColumnStateManagerSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    getAllColumnStates: () => Record<string, ColumnState>;
    getColumnState: (colId: string) => ColumnState;
    setColumnState: (colId: string, state: Partial<ColumnState>) => void;
    initializeColumnState: (colId: string, defaultProfile?: string) => void;
    updateColumnProperty: (colId: string, property: string, value: any) => void;
    getColumnDefinition: (colId: string, includeFormatters?: boolean) => any;
    getColumnFilterStates: (colId: string) => any;
    getColumnHeaderStyle: (colId: string) => any;
    getColumnCellStyle: (colId: string) => any;
    getColumnFormatter: (colId: string) => any;
    resetColumnState: (colId: string) => void;
    getColumnCellRenderer: (colId: string) => any;
    getColumnCellEditor: (colId: string) => any;
    getColumnValueGetter: (colId: string) => any;
    setAllColumnStates: (states: Record<string, ColumnState>) => void;
    removeColumnState: (colId: string) => void;
    columnHasFilter: (colId: string) => boolean;
    columnHasStyle: (colId: string) => boolean;
    columnHasFormatter: (colId: string) => boolean;
    columnHasCustomEditor: (colId: string) => boolean;
    applyColumnSettings: (colId: string, refresh?: boolean) => void;
    updateAllColumnDefinitions: () => void;
    updateColumnDefinitionFromState: (colId: string) => void;
    getColumnStateByProfileId: (profileId: string) => Record<string, ColumnState>;
    applyProfileToColumn: (colId: string, profile: any) => void;
    updateAllColumnDefinitionsFromProfiles: () => void;
    // Shared methods that depend on multiple slices
    getCurrentColumnProfileName: (colId: string) => string;
    getCurrentProfileIdForColumn: (colId: string) => string;
  }
> = (set, get) => ({
  getAllColumnStates: () => {
    return get().columnStates;
  },

  getColumnState: (colId) => {
    const columnStates = get().columnStates;
    if (!columnStates[colId]) {
      // Initialize it if it doesn't exist
      get().initializeColumnState(colId);
    }
    return get().columnStates[colId] || {};
  },

  setColumnState: (colId, state) => {
    const currentState = get().getColumnState(colId);
    const mergedState = { ...currentState, ...state };
    
    set(state => ({
      columnStates: {
        ...state.columnStates,
        [colId]: mergedState
      }
    }));

    // Update column definition if we have a grid API
    if (get().gridApi) {
      get().updateColumnDefinitionFromState(colId);
      // Apply any style changes immediately
      if ('cellStyle' in state || 'headerStyle' in state) {
        get().applyColumnSettings(colId);
      }
    }
  },

  initializeColumnState: (colId, defaultProfile) => {
    const columnStates = get().columnStates;
    
    // Skip if this column already has state
    if (columnStates[colId]) {
      return;
    }

    const initialState: ColumnState = {
      profileId: defaultProfile || 'default',
      filter: {
        enabled: false,
        type: 'text',
        operator: 'contains',
        value: '',
        values: []
      },
      headerStyle: {
        textColor: '',
        backgroundColor: '',
        fontFamily: '',
        fontSize: '',
        bold: false,
        italic: false,
        underline: false,
        alignH: 'left',
        borderColor: '',
        borderStyle: 'solid',
        borderWidth: 1,
        borderSides: 'All'
      },
      cellStyle: {
        textColor: '',
        backgroundColor: '',
        fontFamily: '',
        fontSize: '',
        bold: false,
        italic: false,
        underline: false,
        alignH: 'left',
        borderColor: '',
        borderStyle: 'solid',
        borderWidth: 1,
        borderSides: 'All'
      },
      applyTextColor: false,
      applyBackgroundColor: false,
      applyBorder: false,
      formatter: {
        formatterType: 'None',
        format: '',
        customFormat: '',
        precision: 2,
        currencySymbol: '$',
        dateFormat: 'MM/dd/yyyy',
        useThousandSeparator: true,
        applyToValues: false,
        percentDecimals: 2,
        numberFormat: '#,##0.00',
        decimalPlaces: 2
      },
      editor: {
        type: 'default',
        options: [],
        source: '',
        validation: {
          required: false,
          minValue: null,
          maxValue: null,
          pattern: '',
          customValidator: ''
        }
      },
      valueGetter: '',
      isHidden: false,
      width: 200,
      wrapText: false,
      sortable: true,
      resizable: true,
      pinned: null,
      lockPosition: false
    };

    set(state => ({
      columnStates: {
        ...state.columnStates,
        [colId]: initialState
      }
    }));
  },

  updateColumnProperty: (colId, property, value) => {
    // Using a path notation like 'cellStyle.textColor' to update nested properties
    const pathParts = property.split('.');
    const columnState = get().getColumnState(colId);
    
    let newState = { ...columnState };
    let current = newState;
    
    // Navigate to the nested object
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current[part] = { ...current[part] };
      current = current[part];
    }
    
    // Update the final property
    current[pathParts[pathParts.length - 1]] = value;
    
    // Update the state
    set(state => ({
      columnStates: {
        ...state.columnStates,
        [colId]: newState
      }
    }));
    
    // Update column definition
    if (get().gridApi) {
      get().updateColumnDefinitionFromState(colId);
    }
  },

  getColumnDefinition: (colId, includeFormatters = true) => {
    const columnState = get().getColumnState(colId);
    const gridApi = get().gridApi;
    
    if (!gridApi) {
      console.warn('Grid API not available to get column definition');
      return null;
    }
    
    try {
      // In AG Grid 33+, column methods are directly on the grid API
      const column = gridApi.getColumn(colId);
      
      if (!column) {
        console.warn(`Column ${colId} not found in grid`);
        return null;
      }
      
      // Start with current column definition
      const colDef = { ...column.getColDef() };
      
      // Apply saved state properties
      if (columnState.isHidden !== undefined) {
        colDef.hide = columnState.isHidden;
      }
      
      if (columnState.width !== undefined) {
        colDef.width = columnState.width;
      }
      
      if (columnState.wrapText !== undefined) {
        colDef.wrapText = columnState.wrapText;
      }
      
      if (columnState.sortable !== undefined) {
        colDef.sortable = columnState.sortable;
      }
      
      if (columnState.resizable !== undefined) {
        colDef.resizable = columnState.resizable;
      }
      
      if (columnState.pinned !== undefined) {
        colDef.pinned = columnState.pinned;
      }
      
      if (columnState.lockPosition !== undefined) {
        colDef.lockPosition = columnState.lockPosition;
      }
      
      // Add filter if enabled
      if (columnState.filter?.enabled) {
        colDef.filter = columnState.filter.type || 'agTextColumnFilter';
        
        // Add filter params based on type
        if (columnState.filter.type === 'number') {
          colDef.filterParams = {
            filterOptions: ['equals', 'greaterThan', 'lessThan'],
            defaultOption: columnState.filter.operator || 'equals'
          };
        } else if (columnState.filter.type === 'date') {
          colDef.filterParams = {
            filterOptions: ['equals', 'greaterThan', 'lessThan'],
            defaultOption: columnState.filter.operator || 'equals',
            comparator: (filterLocalDateAtMidnight, cellValue) => {
              const dateAsString = cellValue;
              if (dateAsString == null) return -1;
              
              // Parse the filter date in the format specified in the filter configuration
              const filterDate = new Date(filterLocalDateAtMidnight);
              
              // Parse the cell value as a date
              const cellDate = new Date(dateAsString);
              
              // Now compare the dates
              if (cellDate < filterDate) return -1;
              if (cellDate > filterDate) return 1;
              return 0;
            }
          };
        } else {
          // Text filter
          colDef.filterParams = {
            filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
            defaultOption: columnState.filter.operator || 'contains'
          };
        }
      }
      
      // Apply value getter if specified
      if (columnState.valueGetter) {
        colDef.valueGetter = (params) => {
          try {
            // Safely evaluate the value getter expression
            return new Function('params', `return ${columnState.valueGetter}`)(params);
          } catch (error) {
            console.error(`Error in valueGetter for column ${colId}:`, error);
            return params.data ? params.data[colId] : null;
          }
        };
      }
      
      // Add cell renderer if needed (for formatting)
      if (includeFormatters && columnState.formatter && columnState.formatter.formatterType !== 'None') {
        const formatter = get().getColumnFormatter(colId);
        
        if (formatter) {
          colDef.cellRenderer = (params) => {
            if (params.value === null || params.value === undefined || params.value === '') {
              return '';
            }
            
            try {
              return formatter(params.value);
            } catch (error) {
              console.error(`Error formatting cell value for ${colId}:`, error);
              return params.value;
            }
          };
        }
      }
      
      // Add cell editor if specified
      const editorInfo = get().getColumnCellEditor(colId);
      if (editorInfo && editorInfo.editor) {
        colDef.cellEditor = editorInfo.editor;
        if (editorInfo.params) {
          colDef.cellEditorParams = editorInfo.params;
        }
      }
      
      // Add style handlers
      if (columnState.cellStyle) {
        colDef.cellStyle = (params) => {
          try {
            const styles = {};
            const cellStyle = columnState.cellStyle;
            
            // Apply base font styling
            if (cellStyle.fontFamily) styles.fontFamily = cellStyle.fontFamily;
            if (cellStyle.fontSize) styles.fontSize = `${cellStyle.fontSize}px`;
            if (cellStyle.bold) styles.fontWeight = 'bold';
            if (cellStyle.italic) styles.fontStyle = 'italic';
            if (cellStyle.underline) styles.textDecoration = 'underline';
            if (cellStyle.alignH) styles.textAlign = cellStyle.alignH;
            
            // Apply colors only if the flags are set
            if (columnState.applyTextColor && cellStyle.textColor) {
              styles.color = cellStyle.textColor;
            }
            
            if (columnState.applyBackgroundColor && cellStyle.backgroundColor) {
              styles.backgroundColor = cellStyle.backgroundColor;
            }
            
            // Apply border if the flag is set
            if (columnState.applyBorder && 
                cellStyle.borderColor && 
                cellStyle.borderStyle && 
                cellStyle.borderWidth) {
              const borderStyle = `${cellStyle.borderWidth}px ${cellStyle.borderStyle} ${cellStyle.borderColor}`;
              
              if (cellStyle.borderSides === 'All') {
                styles.border = borderStyle;
              } else {
                styles[`border-${cellStyle.borderSides.toLowerCase()}`] = borderStyle;
              }
            }
            
            // Special handling for Excel or custom formatters
            if (columnState.formatter?.formatterType === 'Custom' &&
                columnState.formatter?.customFormat) {
              // Handle Excel/custom formatting if needed
              // This would apply conditional formatting based on the value
              // Example: red for negative numbers, green for positive
            }
            
            return styles;
          } catch (error) {
            console.error(`Error applying cell style for ${colId}:`, error);
            return {};
          }
        };
      }
      
      return colDef;
    } catch (error) {
      console.error(`Error getting column definition for ${colId}:`, error);
      return null;
    }
  },

  getColumnFilterStates: (colId) => {
    const columnState = get().getColumnState(colId);
    return columnState.filter || {
      enabled: false,
      type: 'text',
      operator: 'contains',
      value: '',
      values: []
    };
  },

  getColumnHeaderStyle: (colId) => {
    const columnState = get().getColumnState(colId);
    return columnState.headerStyle || {};
  },

  getColumnCellStyle: (colId) => {
    const columnState = get().getColumnState(colId);
    return columnState.cellStyle || {};
  },

  getColumnFormatter: (colId) => {
    const columnState = get().getColumnState(colId);
    if (!columnState.formatter || columnState.formatter.formatterType === 'None') {
      return null;
    }
    
    // Get the formatter factory from the formatting manager
    const getFormatterFunction = get().createFormatterFunction;
    if (!getFormatterFunction) {
      console.warn('Formatter factory not available');
      return null;
    }
    
    return getFormatterFunction(colId, columnState.formatter);
  },

  resetColumnState: (colId) => {
    // Re-initialize the column state
    get().initializeColumnState(colId);
    
    // Update column definition
    if (get().gridApi) {
      get().updateColumnDefinitionFromState(colId);
      get().applyColumnSettings(colId);
    }
  },

  getColumnCellRenderer: (colId) => {
    const columnState = get().getColumnState(colId);
    
    // Custom cell renderer based on formatter
    if (columnState.formatter && columnState.formatter.formatterType !== 'None') {
      const formatter = get().getColumnFormatter(colId);
      
      if (formatter) {
        return (params) => {
          if (params.value === null || params.value === undefined || params.value === '') {
            return '';
          }
          
          try {
            return formatter(params.value);
          } catch (error) {
            console.error(`Error formatting cell value for ${colId}:`, error);
            return params.value;
          }
        };
      }
    }
    
    return null;
  },

  getColumnCellEditor: (colId) => {
    const columnState = get().getColumnState(colId);
    if (!columnState.editor || columnState.editor.type === 'default') {
      return null;
    }
    
    // Map editor type to AG Grid editor component
    const editorType = columnState.editor.type;
    let editor = null;
    let params = {};
    
    switch (editorType) {
      case 'select':
        editor = 'agSelectCellEditor';
        params = {
          values: columnState.editor.options || []
        };
        break;
      case 'richSelect':
        editor = 'agRichSelectCellEditor';
        params = {
          values: columnState.editor.options || []
        };
        break;
      case 'date':
        editor = 'agDateCellEditor';
        // No additional params needed for date editor
        break;
      case 'numeric':
        editor = 'agNumberCellEditor';
        params = {
          precision: 2 // Default precision
        };
        break;
      case 'largeText':
        editor = 'agLargeTextCellEditor';
        params = {
          maxLength: 100, // Default max length
          rows: 10,
          cols: 50
        };
        break;
      default:
        editor = 'agTextCellEditor';
        break;
    }
    
    return { editor, params };
  },

  getColumnValueGetter: (colId) => {
    const columnState = get().getColumnState(colId);
    if (!columnState.valueGetter) {
      return null;
    }
    
    return (params) => {
      try {
        // Safely evaluate the value getter expression
        return new Function('params', `return ${columnState.valueGetter}`)(params);
      } catch (error) {
        console.error(`Error in valueGetter for column ${colId}:`, error);
        return params.data ? params.data[colId] : null;
      }
    };
  },

  setAllColumnStates: (states) => {
    set({ columnStates: states });
    
    // Update column definitions
    if (get().gridApi) {
      get().updateAllColumnDefinitions();
    }
  },

  removeColumnState: (colId) => {
    set(state => {
      const newColumnStates = { ...state.columnStates };
      delete newColumnStates[colId];
      return { columnStates: newColumnStates };
    });
  },

  columnHasFilter: (colId) => {
    const columnState = get().getColumnState(colId);
    return Boolean(columnState.filter?.enabled);
  },

  columnHasStyle: (colId) => {
    const columnState = get().getColumnState(colId);
    if (!columnState) return false;
    
    const cellStyle = columnState.cellStyle;
    const headerStyle = columnState.headerStyle;
    
    // Check for applied text color
    if (columnState.applyTextColor && 
        ((cellStyle && cellStyle.textColor) || 
         (headerStyle && headerStyle.textColor))) {
      return true;
    }
    
    // Check for applied background color
    if (columnState.applyBackgroundColor && 
        ((cellStyle && cellStyle.backgroundColor) || 
         (headerStyle && headerStyle.backgroundColor))) {
      return true;
    }
    
    // Check for applied border
    if (columnState.applyBorder && 
        ((cellStyle && cellStyle.borderColor) || 
         (headerStyle && headerStyle.borderColor))) {
      return true;
    }
    
    // Check for font styles
    if ((cellStyle && (cellStyle.bold || cellStyle.italic || cellStyle.underline)) || 
        (headerStyle && (headerStyle.bold || headerStyle.italic || headerStyle.underline))) {
      return true;
    }
    
    return false;
  },

  columnHasFormatter: (colId) => {
    const columnState = get().getColumnState(colId);
    return Boolean(columnState.formatter && columnState.formatter.formatterType !== 'None');
  },

  columnHasCustomEditor: (colId) => {
    const columnState = get().getColumnState(colId);
    return Boolean(columnState.editor && columnState.editor.type !== 'default');
  },

  applyColumnSettings: (colId, refresh = true) => {
    const columnState = get().getColumnState(colId);
    
    // Apply header styles
    if (columnState.headerStyle) {
      get().batchApplyHeaderStyles(colId, columnState.headerStyle);
    }
    
    // Apply cell styles
    if (columnState.cellStyle) {
      get().batchApplyCellStyles(colId, columnState.cellStyle);
    }
    
    // Update column definition
    if (refresh && get().gridApi) {
      get().updateColumnDefinitionFromState(colId);
    }
  },

  updateAllColumnDefinitions: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to update column definitions');
      return;
    }
    
    try {
      // In AG Grid 33+, column methods are directly on the grid API
      const columns = gridApi.getColumns();
      
      // Update each column's definition
      columns.forEach(column => {
        const colId = column.getColId();
        get().updateColumnDefinitionFromState(colId);
      });
      
      // Apply all column settings
      Object.keys(get().columnStates).forEach(colId => {
        get().applyColumnSettings(colId, false);
      });
      
      // Refresh the grid
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error updating all column definitions:', error);
    }
  },

  updateColumnDefinitionFromState: (colId) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to update column definition');
      return;
    }
    
    try {
      // In AG Grid 33+, column methods are directly on the grid API
      const column = gridApi.getColumn(colId);
      
      if (!column) {
        console.warn(`Column ${colId} not found in grid`);
        return;
      }
      
      // Get updated column definition
      const colDef = get().getColumnDefinition(colId);
      
      if (!colDef) {
        console.warn(`Could not get column definition for ${colId}`);
        return;
      }
      
      // Update the column definition
      column.setColDef(colDef);
      
      // Refresh the column
      gridApi.refreshHeader();
      gridApi.refreshCells({ 
        force: true,
        columns: [colId]
      });
    } catch (error) {
      console.error(`Error updating column definition for ${colId}:`, error);
    }
  },

  getColumnStateByProfileId: (profileId) => {
    const result = {};
    const columnStates = get().columnStates;
    
    Object.keys(columnStates).forEach(colId => {
      if (columnStates[colId].profileId === profileId) {
        result[colId] = deepClone(columnStates[colId]);
      }
    });
    
    return result;
  },

  // Apply profile settings to a column
  applyProfileToColumn: (colId, profile) => {
    // Get current column state
    const columnState = get().getColumnState(colId);
    
    // Check if profile has column settings for this column
    if (profile.columnSettingsProfiles) {
      const columnSettings = profile.columnSettingsProfiles[`${colId}_settings`];
      
      if (columnSettings) {
        // Apply header settings if available
        if (columnSettings.header) {
          const headerSettings = columnSettings.header;
          
          // Update column state with header settings
          const headerStyle = { ...columnState.headerStyle };
          
          // Apply text styling
          if (headerSettings.fontFamily) headerStyle.fontFamily = headerSettings.fontFamily;
          if (headerSettings.fontSize) headerStyle.fontSize = headerSettings.fontSize;
          if (headerSettings.bold !== undefined) headerStyle.bold = headerSettings.bold;
          if (headerSettings.italic !== undefined) headerStyle.italic = headerSettings.italic;
          if (headerSettings.underline !== undefined) headerStyle.underline = headerSettings.underline;
          if (headerSettings.alignH) headerStyle.alignH = headerSettings.alignH;
          
          // Apply colors
          if (headerSettings.textColor) headerStyle.textColor = headerSettings.textColor;
          if (headerSettings.backgroundColor) headerStyle.backgroundColor = headerSettings.backgroundColor;
          
          // Apply border
          if (headerSettings.borderStyle) headerStyle.borderStyle = headerSettings.borderStyle;
          if (headerSettings.borderWidth) headerStyle.borderWidth = headerSettings.borderWidth;
          if (headerSettings.borderColor) headerStyle.borderColor = headerSettings.borderColor;
          if (headerSettings.borderSides) headerStyle.borderSides = headerSettings.borderSides;
          
          // Update column state with new header style
          get().setColumnState(colId, { headerStyle });
          
          // Apply flags for selective styling
          if (headerSettings.applyTextColor !== undefined) {
            get().setColumnState(colId, { applyTextColor: headerSettings.applyTextColor });
          }
          
          if (headerSettings.applyBackgroundColor !== undefined) {
            get().setColumnState(colId, { applyBackgroundColor: headerSettings.applyBackgroundColor });
          }
          
          if (headerSettings.applyBorder !== undefined) {
            get().setColumnState(colId, { applyBorder: headerSettings.applyBorder });
          }
        }
        
        // Apply cell settings if available
        if (columnSettings.cell) {
          const cellSettings = columnSettings.cell;
          
          // Update column state with cell settings
          const cellStyle = { ...columnState.cellStyle };
          
          // Apply text styling
          if (cellSettings.fontFamily) cellStyle.fontFamily = cellSettings.fontFamily;
          if (cellSettings.fontSize) cellStyle.fontSize = cellSettings.fontSize;
          if (cellSettings.bold !== undefined) cellStyle.bold = cellSettings.bold;
          if (cellSettings.italic !== undefined) cellStyle.italic = cellSettings.italic;
          if (cellSettings.underline !== undefined) cellStyle.underline = cellSettings.underline;
          if (cellSettings.alignH) cellStyle.alignH = cellSettings.alignH;
          
          // Apply colors
          if (cellSettings.textColor) cellStyle.textColor = cellSettings.textColor;
          if (cellSettings.backgroundColor) cellStyle.backgroundColor = cellSettings.backgroundColor;
          
          // Apply border
          if (cellSettings.borderStyle) cellStyle.borderStyle = cellSettings.borderStyle;
          if (cellSettings.borderWidth) cellStyle.borderWidth = cellSettings.borderWidth;
          if (cellSettings.borderColor) cellStyle.borderColor = cellSettings.borderColor;
          if (cellSettings.borderSides) cellStyle.borderSides = cellSettings.borderSides;
          
          // Update column state with new cell style
          get().setColumnState(colId, { cellStyle });
        }
        
        // Apply formatter settings if available
        if (columnSettings.formatter) {
          get().setColumnState(colId, { 
            formatter: {
              ...columnState.formatter,
              ...columnSettings.formatter
            }
          });
        }
      }
    }
    
    // Apply the settings to the grid
    get().applyColumnSettings(colId, true);
  },

  updateAllColumnDefinitionsFromProfiles: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to update column definitions from profiles');
      return;
    }
    
    try {
      // Update column states from profiles
      // In AG Grid 33+, column methods are directly on the grid API
      const columns = gridApi.getColumns();
      
      // Apply profile settings to each column
      columns.forEach(column => {
        const colId = column.getColId();
        const columnState = get().getColumnState(colId);
        const profileId = columnState.profileId;
        
        if (profileId) {
          const profile = get().getProfileById(profileId);
          if (profile) {
            // Apply profile settings to this column
            get().applyProfileToColumn(colId, profile);
          }
        }
      });
      
      // Update all column definitions
      get().updateAllColumnDefinitions();
    } catch (error) {
      console.error('Error updating column definitions from profiles:', error);
    }
  },

  // Shared methods that depend on profileManager
  getCurrentColumnProfileName: (colId) => {
    const columnState = get().getColumnState(colId);
    const profileId = columnState.profileId;
    
    if (!profileId) return 'Default';
    
    const profile = get().getProfileById(profileId);
    return profile ? profile.name : 'Default';
  },

  getCurrentProfileIdForColumn: (colId) => {
    const columnState = get().getColumnState(colId);
    return columnState.profileId || 'default';
  }
});