// Event handling module for the grid store
import { StateCreator } from 'zustand';
import { GridStoreState } from './types';

// Event handling slice creator
export const createEventHandlersSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    handleCellClicked: (event: any) => void;
    handleCellDoubleClicked: (event: any) => void;
    handleRowClicked: (event: any) => void;
    handleRowDoubleClicked: (event: any) => void;
    handleColumnResized: (event: any) => void;
    handleColumnMoved: (event: any) => void;
    handleColumnVisible: (event: any) => void;
    handleSelectionChanged: (event: any) => void;
    handleCellValueChanged: (event: any) => void;
  }
> = (set, get) => ({
  handleCellClicked: (event) => {
    // Call cell click handler if provided
    const onCellClicked = get().onCellClicked;
    if (onCellClicked) {
      onCellClicked(event);
    }
  },

  handleCellDoubleClicked: (event) => {
    // Call cell double click handler if provided
    const onCellDoubleClicked = get().onCellDoubleClicked;
    if (onCellDoubleClicked) {
      onCellDoubleClicked(event);
    }
  },

  handleRowClicked: (event) => {
    // Call row click handler if provided
    const onRowClicked = get().onRowClicked;
    if (onRowClicked) {
      onRowClicked(event);
    }
  },

  handleRowDoubleClicked: (event) => {
    // Call row double click handler if provided
    const onRowDoubleClicked = get().onRowDoubleClicked;
    if (onRowDoubleClicked) {
      onRowDoubleClicked(event);
    }
  },

  handleColumnResized: (event) => {
    // Skip finished=false events (during resize)
    if (!event.finished) {
      return;
    }
    
    const colId = event.column.getColId();
    const width = event.column.getActualWidth();
    
    // Update column width in state
    get().updateColumnProperty(colId, 'width', width);
    
    // Call column resized handler if provided
    const onColumnResized = get().onColumnResized;
    if (onColumnResized) {
      onColumnResized(event);
    }
  },

  handleColumnMoved: (event) => {
    // Call column moved handler if provided
    const onColumnMoved = get().onColumnMoved;
    if (onColumnMoved) {
      onColumnMoved(event);
    }
  },

  handleColumnVisible: (event) => {
    const columns = event.columns;
    const visible = event.visible;
    
    columns.forEach(column => {
      const colId = column.getColId();
      
      // Update column visibility in state
      get().updateColumnProperty(colId, 'isHidden', !visible);
    });
    
    // Call column visible handler if provided
    const onColumnVisible = get().onColumnVisible;
    if (onColumnVisible) {
      onColumnVisible(event);
    }
  },

  handleSelectionChanged: (event) => {
    // Call selection changed handler if provided
    const onSelectionChanged = get().onSelectionChanged;
    if (onSelectionChanged) {
      onSelectionChanged(event);
    }
  },

  handleCellValueChanged: (event) => {
    // Call cell value changed handler if provided
    const onCellValueChanged = get().onCellValueChanged;
    if (onCellValueChanged) {
      onCellValueChanged(event);
    }
  }
});