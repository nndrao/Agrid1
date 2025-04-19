import { useState } from 'react';

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
  const [state, setState] = useState<ColumnSettingsState>({
    general: {
      headerName: initialColumn,
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
  });

  // Update a specific section of state
  const updateSection = <K extends keyof ColumnSettingsState>(
    section: K,
    updates: Partial<ColumnSettingsState[K]>
  ) => {
    setState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  // Update general settings
  const updateGeneral = (updates: Partial<ColumnSettingsState['general']>) => {
    updateSection('general', updates);
  };

  // Update header settings
  const updateHeader = (updates: Partial<ColumnSettingsState['header']>) => {
    updateSection('header', updates);
  };

  // Update cell settings
  const updateCell = (updates: Partial<ColumnSettingsState['cell']>) => {
    updateSection('cell', updates);
  };

  // Reset state for a new column
  const resetForColumn = (columnName: string) => {
    // Only update the headerName without triggering a full state reset
    updateGeneral({ headerName: columnName });
  };

  return {
    state,
    updateGeneral,
    updateHeader,
    updateCell,
    resetForColumn
  };
};
