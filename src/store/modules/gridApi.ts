// Grid API Management module for the grid store
import { StateCreator } from 'zustand';
import { GridStoreState, ColumnState } from './types';
import { deepClone } from './utils';

// Grid API management slice creator
export const createGridApiSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    setGridApi: (api: any) => void;
    getGridApi: () => any;
    refreshGridData: () => void;
    refreshGridCells: (force?: boolean) => void;
    refreshGridHeader: () => void;
    resizeColumnsToFit: () => void;
    autoSizeAllColumns: () => void;
    autoSizeColumn: (colId: string) => void;
    resetGridState: () => void;
    exportCsvData: () => void;
    exportExcelData: () => void;
    selectAllRows: () => void;
    deselectAllRows: () => void;
    selectRows: (ids: any[]) => void;
    getSelectedRows: () => any[];
    getSelectedRowIds: () => any[];
    getColumnWidths: () => Record<string, number>;
    setColumnWidths: (widths: Record<string, number>) => void;
    saveGridState: () => any;
    loadGridState: (state: any) => void;
    updateGridFromColumnStates: () => void;
    getVisibleColumns: () => string[];
    setColumnOrder: (colIds: string[]) => void;
    getColumnOrder: () => string[];
    sortColumn: (colId: string, sort: 'asc' | 'desc' | null) => void;
    getGridColumnState: () => any;
    setGridColumnState: (state: any) => void;
    filterColumn: (colId: string, filterModel: any) => void;
    clearColumnFilter: (colId: string) => void;
    clearAllFilters: () => void;
    getFilterModel: () => any;
    setFilterModel: (filterModel: any) => void;
    addEventListeners: () => void;
    removeEventListeners: () => void;
    handleGridReady: (api: any) => void;
    exportDataToJsonFile: () => void;
    importColumnStatesFromJson: (jsonData: string) => void;
    exportColumnStatesToJson: () => string;
  }
> = (set, get) => ({
  setGridApi: (api) => {
    if (!api) {
      console.warn('Attempted to set null or undefined grid API');
      return;
    }
    
    set({ gridApi: api });
    get().addEventListeners();
    
    // Initialize the grid with current column states
    requestAnimationFrame(() => {
      get().updateGridFromColumnStates();
    });
  },

  getGridApi: () => {
    return get().gridApi;
  },

  refreshGridData: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to refresh data');
      return;
    }
    
    try {
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error refreshing grid data:', error);
    }
  },

  refreshGridCells: (force = false) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to refresh cells');
      return;
    }
    
    try {
      gridApi.refreshCells({ force });
    } catch (error) {
      console.error('Error refreshing grid cells:', error);
    }
  },

  refreshGridHeader: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to refresh header');
      return;
    }
    
    try {
      gridApi.refreshHeader();
    } catch (error) {
      console.error('Error refreshing grid header:', error);
    }
  },

  resizeColumnsToFit: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to resize columns');
      return;
    }
    
    try {
      gridApi.sizeColumnsToFit();
    } catch (error) {
      console.error('Error resizing columns to fit:', error);
    }
  },

  autoSizeAllColumns: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to auto-size columns');
      return;
    }
    
    try {
      // In AG Grid 33+, column API methods are directly on the grid API
      const allColumnIds = gridApi.getColumns().map(column => column.getColId());
      gridApi.autoSizeColumns(allColumnIds);
    } catch (error) {
      console.error('Error auto-sizing all columns:', error);
    }
  },

  autoSizeColumn: (colId) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to auto-size column');
      return;
    }
    
    try {
      // In AG Grid 33+, column API methods are directly on the grid API
      gridApi.autoSizeColumn(colId);
      
      // Update column width in state
      const column = gridApi.getColumn(colId);
      if (column) {
        const width = column.getActualWidth();
        get().updateColumnProperty(colId, 'width', width);
      }
    } catch (error) {
      console.error(`Error auto-sizing column ${colId}:`, error);
    }
  },

  resetGridState: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to reset grid state');
      return;
    }
    
    try {
      // Reset column states
      const defaultState = gridApi.getColumnDefs().map(col => ({
        colId: col.field,
        width: 200,
        hide: false,
        pinned: null
      }));
      
      gridApi.applyColumnState({
        state: defaultState,
        defaultState: {
          width: 200,
          hide: false,
          pinned: null
        }
      });
      
      // Reset sort model
      gridApi.setSortModel(null);
      
      // Reset filter model
      gridApi.setFilterModel(null);
      
      // Reset column states in store
      const columnStates = {};
      gridApi.getAllColumns().forEach(column => {
        const colId = column.getColId();
        get().initializeColumnState(colId);
      });
      
      // Refresh the grid
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error resetting grid state:', error);
    }
  },

  exportCsvData: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to export CSV data');
      return;
    }
    
    try {
      const params = {
        fileName: 'grid-export.csv',
        processCellCallback: (params) => {
          // Apply formatters to cell values
          const colId = params.column.getColId();
          const columnState = get().getColumnState(colId);
          
          if (columnState && columnState.formatter && columnState.formatter.formatterType !== 'None') {
            const formatter = get().getColumnFormatter(colId);
            if (formatter && params.value !== null && params.value !== undefined) {
              return formatter(params.value);
            }
          }
          
          return params.value;
        }
      };
      
      gridApi.exportDataAsCsv(params);
    } catch (error) {
      console.error('Error exporting CSV data:', error);
    }
  },

  exportExcelData: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to export Excel data');
      return;
    }
    
    try {
      const params = {
        fileName: 'grid-export.xlsx',
        processCellCallback: (params) => {
          // Apply formatters to cell values
          const colId = params.column.getColId();
          const columnState = get().getColumnState(colId);
          
          if (columnState && columnState.formatter && columnState.formatter.formatterType !== 'None') {
            const formatter = get().getColumnFormatter(colId);
            if (formatter && params.value !== null && params.value !== undefined) {
              return formatter(params.value);
            }
          }
          
          return params.value;
        },
        addImageToCell: (rowIndex, col, value) => {
          // Add images to cells if needed
          return null;
        }
      };
      
      gridApi.exportDataAsExcel(params);
    } catch (error) {
      console.error('Error exporting Excel data:', error);
    }
  },

  selectAllRows: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to select all rows');
      return;
    }
    
    try {
      gridApi.selectAll();
    } catch (error) {
      console.error('Error selecting all rows:', error);
    }
  },

  deselectAllRows: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to deselect all rows');
      return;
    }
    
    try {
      gridApi.deselectAll();
    } catch (error) {
      console.error('Error deselecting all rows:', error);
    }
  },

  selectRows: (ids) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to select rows');
      return;
    }
    
    try {
      // Clear current selection
      gridApi.deselectAll();
      
      // Select specified rows
      gridApi.forEachNode(node => {
        if (ids.includes(node.data.id)) {
          node.setSelected(true);
        }
      });
    } catch (error) {
      console.error('Error selecting rows:', error);
    }
  },

  getSelectedRows: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get selected rows');
      return [];
    }
    
    try {
      return gridApi.getSelectedRows();
    } catch (error) {
      console.error('Error getting selected rows:', error);
      return [];
    }
  },

  getSelectedRowIds: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get selected row IDs');
      return [];
    }
    
    try {
      const selectedRows = gridApi.getSelectedRows();
      return selectedRows.map(row => row.id);
    } catch (error) {
      console.error('Error getting selected row IDs:', error);
      return [];
    }
  },

  getColumnWidths: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get column widths');
      return {};
    }
    
    try {
      // In AG Grid 33+, column API methods are directly on the grid API
      const columns = gridApi.getColumns();
      
      const widths = {};
      columns.forEach(column => {
        const colId = column.getColId();
        widths[colId] = column.getActualWidth();
      });
      
      return widths;
    } catch (error) {
      console.error('Error getting column widths:', error);
      return {};
    }
  },

  setColumnWidths: (widths) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to set column widths');
      return;
    }
    
    try {
      // Update column widths
      Object.entries(widths).forEach(([colId, width]) => {
        // Update AG Grid column
        gridApi.setColumnWidth(colId, width);
        
        // Update store state
        get().updateColumnProperty(colId, 'width', width);
      });
    } catch (error) {
      console.error('Error setting column widths:', error);
    }
  },

  saveGridState: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to save grid state');
      return null;
    }
    
    try {
      // Save column state from AG Grid
      const columnState = gridApi.getColumnState();
      
      // Save sort model
      const sortModel = gridApi.getSortModel();
      
      // Save filter model
      const filterModel = gridApi.getFilterModel();
      
      // Save column states from store
      const storeColumnStates = deepClone(get().columnStates);
      
      // Combine all state information
      const gridState = {
        columnState,
        sortModel,
        filterModel,
        storeColumnStates
      };
      
      return gridState;
    } catch (error) {
      console.error('Error saving grid state:', error);
      return null;
    }
  },

  loadGridState: (state) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to load grid state');
      return;
    }
    
    if (!state) {
      console.warn('No state provided to load grid state');
      return;
    }
    
    try {
      // Load column states into our store
      if (state.storeColumnStates) {
        set({ columnStates: state.storeColumnStates });
      }
      
      // Apply column state to AG Grid
      if (state.columnState) {
        gridApi.applyColumnState({
          state: state.columnState,
          applyOrder: true
        });
      }
      
      // Apply sort model
      if (state.sortModel) {
        gridApi.setSortModel(state.sortModel);
      }
      
      // Apply filter model
      if (state.filterModel) {
        gridApi.setFilterModel(state.filterModel);
      }
      
      // Update grid from our store's column states
      get().updateGridFromColumnStates();
      
      // Refresh the grid
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error loading grid state:', error);
    }
  },

  updateGridFromColumnStates: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to update grid from column states');
      return;
    }
    
    try {
      const columnStates = get().columnStates;
      // In AG Grid 33+, we need to use a different method to get columns
      const columnDefs = gridApi.getColumnDefs();
      
      // Update each column's definition from our store state
      if (columnDefs && Array.isArray(columnDefs)) {
        columnDefs.forEach(colDef => {
          if (colDef.field) {
            const colId = colDef.field;
            
            // Initialize column state if it doesn't exist
            if (!columnStates[colId]) {
              get().initializeColumnState(colId);
            }
            
            // Update column definition from state
            get().updateColumnDefinitionFromState(colId);
            
            // Apply column settings (styles, etc.)
            get().applyColumnSettings(colId, false);
          }
        });
      } else {
        // Fallback approach using displayed columns
        const displayedColumns = gridApi.getDisplayedColumns();
        if (displayedColumns) {
          displayedColumns.forEach(column => {
            const colId = column.getColId();
            
            // Initialize column state if it doesn't exist
            if (!columnStates[colId]) {
              get().initializeColumnState(colId);
            }
            
            // Update column definition from state
            get().updateColumnDefinitionFromState(colId);
            
            // Apply column settings (styles, etc.)
            get().applyColumnSettings(colId, false);
          });
        }
      }
      
      // Flush any batched styles
      get().flushBatchedStyles();
      
      // Refresh the grid
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
    } catch (error) {
      console.error('Error updating grid from column states:', error);
    }
  },

  getVisibleColumns: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get visible columns');
      return [];
    }
    
    try {
      // In AG Grid 33+, column API methods are directly on the grid API
      return gridApi.getAllDisplayedColumns().map(column => column.getColId());
    } catch (error) {
      console.error('Error getting visible columns:', error);
      return [];
    }
  },

  setColumnOrder: (colIds) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to set column order');
      return;
    }
    
    try {
      const currentState = gridApi.getColumnState();
      
      // Create new column state based on the provided order
      const newState = colIds.map(colId => {
        const currentColState = currentState.find(s => s.colId === colId) || {};
        return {
          colId,
          width: currentColState.width,
          hide: currentColState.hide,
          pinned: currentColState.pinned
        };
      });
      
      // Apply the new column state
      gridApi.applyColumnState({
        state: newState,
        applyOrder: true
      });
    } catch (error) {
      console.error('Error setting column order:', error);
    }
  },

  getColumnOrder: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get column order');
      return [];
    }
    
    try {
      // In AG Grid 33+, column API methods are directly on the grid API
      return gridApi.getColumns().map(column => column.getColId());
    } catch (error) {
      console.error('Error getting column order:', error);
      return [];
    }
  },

  sortColumn: (colId, sort) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to sort column');
      return;
    }
    
    try {
      let sortModel = null;
      
      if (sort) {
        sortModel = [{
          colId,
          sort
        }];
      }
      
      gridApi.setSortModel(sortModel);
    } catch (error) {
      console.error(`Error sorting column ${colId}:`, error);
    }
  },

  getGridColumnState: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get grid column state');
      return null;
    }
    
    try {
      return gridApi.getColumnState();
    } catch (error) {
      console.error('Error getting grid column state:', error);
      return null;
    }
  },

  setGridColumnState: (state) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to set grid column state');
      return;
    }
    
    try {
      gridApi.applyColumnState({
        state,
        applyOrder: true
      });
    } catch (error) {
      console.error('Error setting grid column state:', error);
    }
  },

  filterColumn: (colId, filterModel) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to filter column');
      return;
    }
    
    try {
      const currentFilterModel = gridApi.getFilterModel() || {};
      
      // Update the filter model with the new filter
      const newFilterModel = {
        ...currentFilterModel,
        [colId]: filterModel
      };
      
      gridApi.setFilterModel(newFilterModel);
      
      // Update column state filter info
      get().updateColumnProperty(colId, 'filter.enabled', true);
      get().updateColumnProperty(colId, 'filter.value', filterModel.filter || '');
      get().updateColumnProperty(colId, 'filter.operator', filterModel.type || 'contains');
    } catch (error) {
      console.error(`Error filtering column ${colId}:`, error);
    }
  },

  clearColumnFilter: (colId) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to clear column filter');
      return;
    }
    
    try {
      const currentFilterModel = gridApi.getFilterModel() || {};
      
      // Remove the filter for this column
      const newFilterModel = { ...currentFilterModel };
      delete newFilterModel[colId];
      
      gridApi.setFilterModel(newFilterModel);
      
      // Update column state filter info
      get().updateColumnProperty(colId, 'filter.enabled', false);
      get().updateColumnProperty(colId, 'filter.value', '');
    } catch (error) {
      console.error(`Error clearing filter for column ${colId}:`, error);
    }
  },

  clearAllFilters: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to clear all filters');
      return;
    }
    
    try {
      gridApi.setFilterModel(null);
      
      // Update all column states
      const columnStates = get().columnStates;
      Object.keys(columnStates).forEach(colId => {
        get().updateColumnProperty(colId, 'filter.enabled', false);
        get().updateColumnProperty(colId, 'filter.value', '');
      });
    } catch (error) {
      console.error('Error clearing all filters:', error);
    }
  },

  getFilterModel: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to get filter model');
      return null;
    }
    
    try {
      return gridApi.getFilterModel();
    } catch (error) {
      console.error('Error getting filter model:', error);
      return null;
    }
  },

  setFilterModel: (filterModel) => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to set filter model');
      return;
    }
    
    try {
      gridApi.setFilterModel(filterModel);
      
      // Update column states with filter info
      const columnStates = get().columnStates;
      
      // Reset all filters
      Object.keys(columnStates).forEach(colId => {
        get().updateColumnProperty(colId, 'filter.enabled', false);
        get().updateColumnProperty(colId, 'filter.value', '');
      });
      
      // Set filters from model
      if (filterModel) {
        Object.entries(filterModel).forEach(([colId, model]) => {
          get().updateColumnProperty(colId, 'filter.enabled', true);
          get().updateColumnProperty(colId, 'filter.value', model.filter || '');
          get().updateColumnProperty(colId, 'filter.operator', model.type || 'contains');
        });
      }
    } catch (error) {
      console.error('Error setting filter model:', error);
    }
  },

  addEventListeners: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to add event listeners');
      return;
    }

    // Safe function to add event listener only if handler exists
    const safeAddListener = (eventName, handlerName) => {
      const handler = get()[handlerName];
      if (typeof handler === 'function') {
        try {
          gridApi.addEventListener(eventName, handler);
        } catch (err) {
          console.warn(`Failed to add listener for ${eventName}:`, err);
        }
      }
    };
    
    try {
      // Cell events
      safeAddListener('cellClicked', 'onCellClicked');
      safeAddListener('cellDoubleClicked', 'onCellDoubleClicked');
      safeAddListener('cellValueChanged', 'onCellValueChanged');
      
      // Row events
      safeAddListener('rowClicked', 'onRowClicked');
      safeAddListener('rowDoubleClicked', 'onRowDoubleClicked');
      safeAddListener('selectionChanged', 'onSelectionChanged');
      
      // Column events
      safeAddListener('columnResized', 'onColumnResized');
      safeAddListener('columnMoved', 'onColumnMoved');
      safeAddListener('columnVisible', 'onColumnVisible');
    } catch (error) {
      console.error('Error adding event listeners:', error);
    }
  },

  removeEventListeners: () => {
    const gridApi = get().gridApi;
    if (!gridApi) {
      console.warn('Grid API not available to remove event listeners');
      return;
    }

    // Safe function to remove event listener only if handler exists
    const safeRemoveListener = (eventName, handlerName) => {
      const handler = get()[handlerName];
      if (typeof handler === 'function') {
        try {
          gridApi.removeEventListener(eventName, handler);
        } catch (err) {
          console.warn(`Failed to remove listener for ${eventName}:`, err);
        }
      }
    };
    
    try {
      // Cell events
      safeRemoveListener('cellClicked', 'onCellClicked');
      safeRemoveListener('cellDoubleClicked', 'onCellDoubleClicked');
      safeRemoveListener('cellValueChanged', 'onCellValueChanged');
      
      // Row events
      safeRemoveListener('rowClicked', 'onRowClicked');
      safeRemoveListener('rowDoubleClicked', 'onRowDoubleClicked');
      safeRemoveListener('selectionChanged', 'onSelectionChanged');
      
      // Column events
      safeRemoveListener('columnResized', 'onColumnResized');
      safeRemoveListener('columnMoved', 'onColumnMoved');
      safeRemoveListener('columnVisible', 'onColumnVisible');
    } catch (error) {
      console.error('Error removing event listeners:', error);
    }
  },

  handleGridReady: (api) => {
    // Set the grid API
    get().setGridApi(api);
    
    // Call grid ready handler if provided
    const onGridReady = get().onGridReady;
    if (onGridReady) {
      onGridReady(api);
    }
  },

  exportDataToJsonFile: () => {
    try {
      // Export column states and profiles
      const data = {
        columnStates: deepClone(get().columnStates),
        columnProfiles: deepClone(get().columnProfiles)
      };
      
      // Convert to JSON string
      const jsonStr = JSON.stringify(data, null, 2);
      
      // Create a temporary element to trigger download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr));
      element.setAttribute('download', 'grid-export.json');
      
      element.style.display = 'none';
      document.body.appendChild(element);
      
      element.click();
      
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error exporting data to JSON file:', error);
    }
  },

  importColumnStatesFromJson: (jsonData) => {
    try {
      // Parse the JSON data
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Import column states
      if (data.columnStates) {
        set({ columnStates: data.columnStates });
      }
      
      // Import column profiles
      if (data.columnProfiles) {
        set({ columnProfiles: data.columnProfiles });
      }
      
      // Update the grid
      if (get().gridApi) {
        get().updateGridFromColumnStates();
      }
    } catch (error) {
      console.error('Error importing column states from JSON:', error);
    }
  },

  exportColumnStatesToJson: () => {
    try {
      // Export column states and profiles
      const data = {
        columnStates: deepClone(get().columnStates),
        columnProfiles: deepClone(get().columnProfiles)
      };
      
      // Convert to JSON string
      const jsonStr = JSON.stringify(data, null, 2);
      
      return jsonStr;
    } catch (error) {
      console.error('Error exporting column states to JSON:', error);
      return '{}';
    }
  }
});