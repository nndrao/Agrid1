import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { ColumnList } from './ColumnList';
import { GeneralTab } from './tabs/GeneralTab';
import { HeaderTab } from './tabs/HeaderTab';
import { CellTab } from './tabs/CellTab';
import { FilterTab } from './tabs/FilterTab';
import { FormattersTab } from './tabs/FormattersTab';
import { EditorsTab } from './tabs/EditorsTab';

// Import grid store instead of local state management
import { useGridStore } from '@/store/gridStore';
import { ColumnSettingsState } from './useColumnSettings';

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnList: string[];
  selectedColumn: string;
  onSelectColumn: (col: string) => void;
}

export const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  open,
  onOpenChange,
  columnList,
  selectedColumn,
  onSelectColumn
}) => {
  // Use grid store for state management instead of local hook
  const gridStore = useGridStore();
  
  // Local state to use while editing
  const [state, setState] = useState<ColumnSettingsState | null>(null);

  // Load column settings from grid store when dialog opens or column changes
  useEffect(() => {
    if (open && selectedColumn) {
      // Get column settings from store
      const settings = gridStore.getColumnSettings(selectedColumn);
      
      if (settings) {
        console.log(`Loaded settings for column ${selectedColumn} from grid store`);
        setState(settings);
      } else {
        // If no settings, create default state with explicit boolean values
        console.log(`No settings found for column ${selectedColumn}, using defaults`);
        setState({
          general: {
            headerName: selectedColumn,
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
            // CRITICAL: Ensure this is an explicit boolean
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
            borderSides: 'All',
          },
          cell: {
            // CRITICAL: Ensure this is an explicit boolean
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
            borderSides: 'All',
          }
        });
      }
    }
  }, [open, selectedColumn, gridStore]);

  // Update section handlers
  const updateGeneral = (updates: Partial<ColumnSettingsState['general']>) => {
    if (!state) return;
    setState({
      ...state,
      general: {
        ...state.general,
        ...updates
      }
    });
  };

  const updateHeader = (updates: Partial<ColumnSettingsState['header']>) => {
    if (!state) return;
    setState({
      ...state,
      header: {
        ...state.header,
        ...updates
      }
    });
  };

  const updateCell = (updates: Partial<ColumnSettingsState['cell']>) => {
    if (!state) return;
    setState({
      ...state,
      cell: {
        ...state.cell,
        ...updates
      }
    });
  };

  // Handle apply changes with direct column API access
  const handleApplyChanges = () => {
    if (!state || !selectedColumn) return;
    
    console.log('Applying changes to grid for column:', selectedColumn);
    
    try {
      // Create a clean copy of state and ensure all boolean values are explicit
      const sanitizedState = JSON.parse(JSON.stringify(state));
      
      // Ensure style flags are explicit booleans
      sanitizedState.header.applyStyles = sanitizedState.header.applyStyles === true;
      sanitizedState.cell.applyStyles = sanitizedState.cell.applyStyles === true;
      
      console.log('Sanitized state before saving:', {
        headerApplyStyles: sanitizedState.header.applyStyles,
        headerApplyStylesType: typeof sanitizedState.header.applyStyles,
        cellApplyStyles: sanitizedState.cell.applyStyles,
        cellApplyStylesType: typeof sanitizedState.cell.applyStyles
      });
      
      // Save settings to grid store
      console.log(`Saving sanitized settings for column ${selectedColumn} to store`, sanitizedState);
      const saveResult = gridStore.saveColumnSettings(selectedColumn, sanitizedState);
      console.log(`Column settings saved to store: ${saveResult ? 'SUCCESS' : 'FAILED'}`);
      
      // Direct application of styles using window.__gridApi
      const directlyApplySettings = () => {
        console.log('Attempting to directly apply settings using window.__gridApi');
        
        if (typeof window !== 'undefined' && (window as any).__gridApi) {
          const api = (window as any).__gridApi;
          
          try {
            // Get the column directly from the window API reference
            const column = api.getColumn(selectedColumn);
            
            if (column) {
              console.log('✅ Successfully found column using direct API reference:', selectedColumn);
              
              // Get column definition
              const colDef = column.getColDef();
              
              // ---------- APPLY GENERAL SETTINGS ----------
              if (sanitizedState.general) {
                console.log('Applying general settings directly');
                
                // Set header name
                if (sanitizedState.general.headerName) {
                  colDef.headerName = sanitizedState.general.headerName;
                }
                
                // Set width
                if (sanitizedState.general.width) {
                  const width = parseInt(sanitizedState.general.width, 10);
                  if (!isNaN(width) && width > 0) {
                    colDef.width = width;
                  }
                }
                
                // Set boolean properties
                colDef.sortable = sanitizedState.general.sortable === true;
                colDef.resizable = sanitizedState.general.resizable === true;
                colDef.editable = sanitizedState.general.editable === true;
                colDef.filter = sanitizedState.general.filter === 'Enabled';
                
                // Apply visibility with fallbacks
                const visible = !sanitizedState.general.hidden;
                console.log(`Setting column visibility to ${visible ? 'visible' : 'hidden'}`);
                
                try {
                  if (typeof column.setVisible === 'function') {
                    // Preferred method
                    column.setVisible(visible);
                  } else if (api.columnModel && typeof api.columnModel.setColumnVisible === 'function') {
                    // Some versions use columnModel
                    api.columnModel.setColumnVisible(column.getColId(), visible);
                  } else if (api.columnController && typeof api.columnController.setColumnVisible === 'function') {
                    // Some versions use columnController
                    api.columnController.setColumnVisible(column.getColId(), visible);
                  } else if (typeof api.setColumnVisible === 'function') {
                    // Direct API method
                    api.setColumnVisible(column.getColId(), visible);
                  } else if (typeof api.applyColumnState === 'function') {
                    // Generic fallback
                    api.applyColumnState({
                      state: [{ colId: column.getColId(), hide: !visible }]
                    });
                  } else {
                    console.warn('No method available to set column visibility');
                  }
                } catch (err) {
                  console.error('Error setting column visibility:', err);
                }
                
                // Apply pinned state - implementing the most direct and reliable approach first
                const colId = column.getColId();
                console.log(`Setting pinned state for column '${colId}'`);
                
                let pinnedState = null;
                if (sanitizedState.general.pinnedPosition === 'Left') pinnedState = 'left';
                if (sanitizedState.general.pinnedPosition === 'Right') pinnedState = 'right';
                
                console.log(`Desired pinned state: ${pinnedState || 'not pinned'}`);
                
                // MOST RELIABLE METHOD: Use applyColumnState - works across all modern AG-Grid versions
                try {
                  if (typeof api.applyColumnState === 'function') {
                    console.log('Using most reliable method: applyColumnState');
                    
                    const state = [{
                      colId: colId,
                      pinned: pinnedState
                    }];
                    
                    api.applyColumnState({ 
                      state: state,
                      defaultState: { pinned: null }
                    });
                    
                    console.log('Successfully applied pinned state via applyColumnState');
                    return; // Exit early on success
                  }
                } catch (err) {
                  console.error('Error using applyColumnState:', err);
                }
                
                // OPTION 1: Try using direct column API method
                try {
                  if (typeof column.setPinned === 'function') {
                    console.log('Using column.setPinned method');
                    column.setPinned(pinnedState);
                    console.log('Successfully applied pinned state via column.setPinned');
                    return; // Exit early on success
                  }
                } catch (err) {
                  console.error('Error using column.setPinned:', err);
                }
                
                // OPTION 2: Try new direct API method (AG-Grid 27+)
                try {
                  if (typeof api.setColumnPinned === 'function') {
                    console.log('Using api.setColumnPinned method');
                    api.setColumnPinned(colId, pinnedState);
                    console.log('Successfully applied pinned state via api.setColumnPinned');
                    return; // Exit early on success
                  }
                } catch (err) {
                  console.error('Error using api.setColumnPinned:', err);
                }
                
                // OPTION 3: Try column model (internal AG-Grid structure)
                try {
                  if (api.columnModel && typeof api.columnModel.setColumnPinned === 'function') {
                    console.log('Using columnModel.setColumnPinned method');
                    api.columnModel.setColumnPinned(colId, pinnedState);
                    console.log('Successfully applied pinned state via columnModel');
                    return; // Exit early on success
                  }
                } catch (err) {
                  console.error('Error using columnModel:', err);
                }
                
                // OPTION 4: Try column controller (older AG-Grid versions)
                try {
                  if (api.columnController && typeof api.columnController.setColumnPinned === 'function') {
                    console.log('Using columnController.setColumnPinned method');
                    api.columnController.setColumnPinned(colId, pinnedState);
                    console.log('Successfully applied pinned state via columnController');
                    return; // Exit early on success
                  }
                } catch (err) {
                  console.error('Error using columnController:', err);
                }
                
                // OPTION 5: Last resort - direct DOM manipulation (only for pinned="left" or pinned="right")
                try {
                  // Do a brute-force approach by accessing the API's internal DOM functions
                  console.log('Attempting direct DOM manipulation for pinning');
                  
                  // Force grid refresh first
                  if (typeof api.refreshCells === 'function') {
                    api.refreshCells({ force: true });
                  }
                  
                  // Use a timeout to allow the refresh to complete
                  setTimeout(() => {
                    try {
                      // Look for the column element and check for pinnable
                      const headerCell = document.querySelector(`.ag-header-cell[col-id="${colId}"]`);
                      
                      if (headerCell) {
                        console.log(`Found header cell for column ${colId}, attempting direct pinning`);
                        
                        // Try triggering a pin action using the API
                        if (typeof api.moveColumn === 'function') {
                          if (pinnedState === 'left') {
                            api.moveColumn(colId, 0, "toIndex");
                            console.log('Moved column to index 0 (left side)');
                          } else if (pinnedState === 'right') {
                            // Move to the rightmost position
                            const columns = api.getAllGridColumns();
                            if (columns && columns.length > 0) {
                              const lastIndex = columns.length - 1;
                              api.moveColumn(colId, lastIndex, "toIndex");
                              console.log(`Moved column to index ${lastIndex} (right side)`);
                            }
                          }
                        }
                      } else {
                        console.log(`Could not find header cell for column ${colId}`);
                      }
                    } catch (domErr) {
                      console.error('Error in direct DOM pinning manipulation:', domErr);
                    }
                  }, 100);
                } catch (err) {
                  console.error('Error in pinning last resort approach:', err);
                }
                
                console.warn('All pinning methods attempted but column may not be pinned correctly');
                
                // If we reach here, all methods have failed - log a warning
                console.error(`FAILED TO PIN COLUMN ${colId} - Please check the AG-Grid API version and documentation`);
              
              }
              
              // ---------- APPLY HEADER STYLES ----------
              try {
                if (sanitizedState.header && sanitizedState.header.applyStyles === true) {
                  console.log('Applying header styles directly');
                  
                  // Add custom class to header
                  try {
                    colDef.headerClass = `custom-header-${selectedColumn}`;
                  } catch (err) {
                    console.warn('Could not set headerClass, will use CSS only', err);
                  }
                  
                  // Create CSS string
                  let headerStyle = '';
                  const header = sanitizedState.header;
                  
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
                    
                    console.log(`Applying header border style: ${borderStyle}`);
                    
                    // Apply based on specified sides
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
                  
                  // Apply CSS to document
                  if (headerStyle) {
                    try {
                      let styleElement = document.getElementById(`header-style-${selectedColumn}`);
                      if (!styleElement) {
                        styleElement = document.createElement('style');
                        styleElement.id = `header-style-${selectedColumn}`;
                        document.head.appendChild(styleElement);
                      }
                      
                      // Set the CSS content - use extra selector variations for better targeting
                      styleElement.textContent = `
                        /* Basic theme selectors */
                        .ag-theme-quartz .ag-header-cell[col-id="${selectedColumn}"],
                        .ag-theme-quartz-dark .ag-header-cell[col-id="${selectedColumn}"],
                        
                        /* Class-based selector (when headerClass works) */
                        .ag-theme-quartz .ag-header-cell.custom-header-${selectedColumn},
                        .ag-theme-quartz-dark .ag-header-cell.custom-header-${selectedColumn},
                        
                        /* Alternative attribute format */
                        .ag-theme-quartz [col-id="${selectedColumn}"].ag-header-cell,
                        .ag-theme-quartz-dark [col-id="${selectedColumn}"].ag-header-cell,
                        
                        /* Brute force selectors */
                        div.ag-header .ag-header-cell[col-id="${selectedColumn}"],
                        [col-id="${selectedColumn}"].ag-header-cell,
                        .ag-header-cell-${selectedColumn} { 
                          ${headerStyle} !important; 
                        }
                        
                        /* Target header alignment - more selectors */
                        .ag-theme-quartz .ag-header-cell[col-id="${selectedColumn}"] .ag-header-cell-label,
                        .ag-theme-quartz-dark .ag-header-cell[col-id="${selectedColumn}"] .ag-header-cell-label,
                        .ag-theme-quartz .ag-header-cell.custom-header-${selectedColumn} .ag-header-cell-label,
                        .ag-theme-quartz-dark .ag-header-cell.custom-header-${selectedColumn} .ag-header-cell-label,
                        div.ag-header .ag-header-cell[col-id="${selectedColumn}"] .ag-header-cell-label,
                        [col-id="${selectedColumn}"] .ag-header-cell-label {
                          justify-content: ${header.alignH === 'left' ? 'flex-start' : 
                                           header.alignH === 'center' ? 'center' : 'flex-end'} !important;
                        }`;
                      
                      console.log('Successfully applied header CSS');
                    } catch (cssError) {
                      console.error('Error applying header CSS:', cssError);
                    }
                  }
                } else if (sanitizedState.header) {
                  // Remove header styles if disabled
                  console.log('Header styles disabled, removing any existing styles');
                  try {
                    // Remove all possible style elements
                    const styleIds = [
                      `header-style-${selectedColumn}`,
                      `emergency-header-style-${selectedColumn}`,
                      `direct-header-style-${selectedColumn}`
                    ];
                    
                    // Remove each style element
                    styleIds.forEach(id => {
                      const styleElement = document.getElementById(id);
                      if (styleElement) {
                        console.log(`Removing header style element: ${id}`);
                        styleElement.remove();
                      }
                    });
                    
                    // Reset headerClass
                    if (colDef.headerClass !== undefined) {
                      console.log('Removing headerClass from colDef');
                      colDef.headerClass = undefined;
                    }
                    
                    // Try to directly reset header element styles
                    setTimeout(() => {
                      try {
                        const headerElements = document.querySelectorAll(`.ag-header-cell[col-id="${selectedColumn}"]`);
                        console.log(`Found ${headerElements.length} header elements to reset styles for`);
                        
                        headerElements.forEach(el => {
                          console.log('Removing inline styles from header element');
                          el.removeAttribute('style');
                          
                          // Also find and reset the header label for alignment
                          const label = el.querySelector('.ag-header-cell-label');
                          if (label) {
                            label.removeAttribute('style');
                          }
                        });
                      } catch (e) {
                        console.warn('Error resetting header DOM styles:', e);
                      }
                    }, 100);
                  } catch (err) {
                    console.warn('Error removing header styles:', err);
                  }
                }
              } catch (headerStyleError) {
                console.error('Error in header style application:', headerStyleError);
              }
              
              // ---------- APPLY CELL STYLES ----------
              try {
                if (sanitizedState.cell && sanitizedState.cell.applyStyles === true) {
                  console.log('Applying cell styles directly');
                  
                  // Add custom class to cells
                  try {
                    colDef.cellClass = `custom-cell-${selectedColumn}`;
                  } catch (err) {
                    console.warn('Could not set cellClass, will use CSS only', err);
                  }
                  
                  // Create CSS string
                  let cellStyle = '';
                  const cell = sanitizedState.cell;
                  
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
                    
                    console.log(`Applying cell border style: ${borderStyle}`);
                    
                    // Apply based on specified sides
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
                  
                  // Apply CSS to document
                  if (cellStyle) {
                    try {
                      let styleElement = document.getElementById(`cell-style-${selectedColumn}`);
                      if (!styleElement) {
                        styleElement = document.createElement('style');
                        styleElement.id = `cell-style-${selectedColumn}`;
                        document.head.appendChild(styleElement);
                      }
                      
                      // Set the CSS content with multiple selector formats for better targeting
                      styleElement.textContent = `
                        /* Direct attribute selector */
                        .ag-theme-quartz .ag-cell[col-id="${selectedColumn}"],
                        .ag-theme-quartz-dark .ag-cell[col-id="${selectedColumn}"],
                        
                        /* Nested in row selector */
                        .ag-theme-quartz .ag-row .ag-cell[col-id="${selectedColumn}"],
                        .ag-theme-quartz-dark .ag-row .ag-cell[col-id="${selectedColumn}"],
                        
                        /* Class-based selector (when cellClass works) */
                        .ag-theme-quartz .ag-cell.custom-cell-${selectedColumn},
                        .ag-theme-quartz-dark .ag-cell.custom-cell-${selectedColumn},
                        
                        /* Deep nested selector with row */
                        div.ag-theme-quartz .ag-center-cols-container .ag-row .ag-cell[col-id="${selectedColumn}"],
                        div.ag-theme-quartz-dark .ag-center-cols-container .ag-row .ag-cell[col-id="${selectedColumn}"],
                        
                        /* Brute force selectors that should work in any case */
                        div.ag-center-cols-container .ag-cell[col-id="${selectedColumn}"],
                        [col-id="${selectedColumn}"].ag-cell,
                        .ag-row [col-id="${selectedColumn}"],
                        .ag-center-cols-clipper .ag-center-cols-viewport .ag-center-cols-container .ag-row .ag-cell[col-id="${selectedColumn}"] { 
                          ${cellStyle} !important; 
                        }`;
                      
                      console.log('Successfully applied cell CSS');
                    } catch (cssError) {
                      console.error('Error applying cell CSS:', cssError);
                    }
                  }
                  
                  // Additional DOM-based styling approach with multiple delayed attempts
                  const applyDirectDOMStyles = () => {
                    try {
                      const cellElements = document.querySelectorAll(`.ag-cell[col-id="${selectedColumn}"]`);
                      console.log(`Found ${cellElements.length} cell elements to style directly`);
                      
                      if (cellElements.length > 0) {
                        cellElements.forEach(element => {
                          // Use setAttribute for maximum compatibility and to ensure !important is used
                          const styleString = `
                            ${cell.fontFamily ? `font-family: ${cell.fontFamily} !important;` : ''}
                            ${cell.fontSize ? `font-size: ${cell.fontSize} !important;` : ''}
                            ${cell.bold ? `font-weight: bold !important;` : ''}
                            ${cell.italic ? `font-style: italic !important;` : ''}
                            ${cell.underline ? `text-decoration: underline !important;` : ''}
                            ${cell.textColor ? `color: ${cell.textColor} !important;` : ''}
                            ${cell.backgroundColor ? `background-color: ${cell.backgroundColor} !important;` : ''}
                            ${cell.alignH ? `text-align: ${cell.alignH} !important;` : ''}
                            ${(cell.borderStyle && cell.borderWidth && cell.borderColor) ? 
                              cell.borderSides === 'All' ? 
                                `border: ${cell.borderWidth}px ${cell.borderStyle.toLowerCase()} ${cell.borderColor} !important;` : 
                              cell.borderSides === 'Top' ?
                                `border-top: ${cell.borderWidth}px ${cell.borderStyle.toLowerCase()} ${cell.borderColor} !important;` :
                              cell.borderSides === 'Right' ?
                                `border-right: ${cell.borderWidth}px ${cell.borderStyle.toLowerCase()} ${cell.borderColor} !important;` :
                              cell.borderSides === 'Bottom' ?
                                `border-bottom: ${cell.borderWidth}px ${cell.borderStyle.toLowerCase()} ${cell.borderColor} !important;` :
                              cell.borderSides === 'Left' ?
                                `border-left: ${cell.borderWidth}px ${cell.borderStyle.toLowerCase()} ${cell.borderColor} !important;` : ''
                              : ''}
                          `;
                          
                          element.setAttribute('style', styleString);
                          console.log('Applied direct styling with setAttribute to cell');
                        });
                      } else {
                        console.warn('No cell elements found to style directly - will retry');
                      }
                    } catch (domError) {
                      console.warn('DOM style application failed:', domError);
                    }
                  };
                  
                  // Try immediately
                  applyDirectDOMStyles();
                  
                  // Also try after a short delay
                  setTimeout(applyDirectDOMStyles, 200);
                  
                  // And try one more time after a longer delay
                  setTimeout(applyDirectDOMStyles, 500);
                } else if (sanitizedState.cell) {
                  // Remove cell styles if disabled
                  console.log('Cell styles disabled, removing any existing styles');
                  try {
                    // Remove all possible style elements
                    const styleIds = [
                      `cell-style-${selectedColumn}`,
                      `emergency-cell-style-${selectedColumn}`,
                      `direct-cell-style-${selectedColumn}`
                    ];
                    
                    // Remove each style element
                    styleIds.forEach(id => {
                      const styleElement = document.getElementById(id);
                      if (styleElement) {
                        console.log(`Removing cell style element: ${id}`);
                        styleElement.remove();
                      }
                    });
                    
                    // Reset cellClass
                    if (colDef.cellClass !== undefined) {
                      console.log('Removing cellClass from colDef');
                      colDef.cellClass = undefined;
                    }
                    
                    // Try to directly reset cell element styles
                    const resetCellStyles = () => {
                      try {
                        // Use multiple selector formats to ensure we find all instances
                        const selectors = [
                          `.ag-cell[col-id="${selectedColumn}"]`,
                          `[col-id="${selectedColumn}"].ag-cell`,
                          `.ag-row .ag-cell[col-id="${selectedColumn}"]`
                        ];
                        
                        // Try each selector
                        selectors.forEach(selector => {
                          const elements = document.querySelectorAll(selector);
                          console.log(`Found ${elements.length} cell elements with selector "${selector}" to reset styles`);
                          
                          elements.forEach(element => {
                            console.log('Removing inline styles from cell element');
                            element.removeAttribute('style');
                          });
                        });
                      } catch (err) {
                        console.warn('Error resetting cell DOM styles:', err);
                      }
                    };
                    
                    // Execute multiple times with increasing delays to catch any cells that might be created after initial reset
                    resetCellStyles(); // Immediate
                    setTimeout(resetCellStyles, 100); // Short delay
                    setTimeout(resetCellStyles, 300); // Longer delay
                  } catch (err) {
                    console.warn('Error removing cell styles:', err);
                  }
                }
              } catch (cellStyleError) {
                console.error('Error in cell style application:', cellStyleError);
              }
              
              // ---------- REFRESH THE GRID ----------
              // Refresh header
              if (typeof api.refreshHeader === 'function') {
                api.refreshHeader();
              }
              
              // Refresh cells
              if (typeof api.refreshCells === 'function') {
                api.refreshCells({ 
                  force: true, 
                  columns: [selectedColumn] 
                });
              }
              
              console.log('✅ Successfully applied all column settings directly');
              return true;
            } else {
              console.error('❌ Column not found using direct API reference:', selectedColumn);
            }
          } catch (error) {
            console.error('❌ Error applying settings directly:', error);
          }
        } else {
          console.error('❌ No window.__gridApi available for direct application');
        }
        
        return false;
      };
      
      // Try to apply settings directly first
      const directlyApplied = directlyApplySettings();
      
      // If direct application failed, try the store method with improved fallback
      if (!directlyApplied) {
        console.log('Direct application failed, trying store method with gridApi backup...');
        
        // Try to use the gridApi from gridStore first
        const storeGridApi = gridStore.gridApi;
        
        // If store's API isn't available, use emergency backup from window
        if (!storeGridApi && typeof window !== 'undefined' && (window as any).__gridApi) {
          console.log('Using emergency window.__gridApi backup');
          // Temporarily set the gridApi in the store
          gridStore.setGridApi((window as any).__gridApi);
          
          // Short delay to ensure the API is registered
          setTimeout(() => {
            console.log('Applying column settings with emergency API');
            gridStore.applyColumnSettings(selectedColumn);
          }, 50);
        } else {
          // Regular approach if store's API exists
          gridStore.applyColumnSettings(selectedColumn);
        }
      }
      
      // Force a refresh of the grid before closing the dialog
      if (typeof window !== 'undefined' && (window as any).__gridApi) {
        try {
          console.log('Force refreshing grid before closing dialog');
          const api = (window as any).__gridApi;
          
          // Update column properties
          if (typeof api.refreshHeader === 'function') {
            api.refreshHeader();
          }
          
          // Refresh cells with force=true
          if (typeof api.refreshCells === 'function') {
            api.refreshCells({ force: true });
          }
          
          // Also try to redraw rows
          if (typeof api.redrawRows === 'function') {
            api.redrawRows();
          }
          
          // Try to apply settings one more time with a different approach
          console.log('Attempting final brute-force style application');
          
          // Try to style using direct CSS for maximum impact
          setTimeout(() => {
            try {
              // Get all grid styles
              const allStyleElements = document.head.querySelectorAll('style');
              
              console.log(`Found ${allStyleElements.length} style elements to check`);
              let foundHeaderStyle = false;
              let foundCellStyle = false;
              
              // Look for our custom style elements
              allStyleElements.forEach(el => {
                if (el.id === `header-style-${selectedColumn}`) {
                  foundHeaderStyle = true;
                  console.log('Found header style element, ensuring it is applied');
                  // Force re-application by removing and re-adding
                  const content = el.textContent;
                  document.head.removeChild(el);
                  setTimeout(() => {
                    const newEl = document.createElement('style');
                    newEl.id = `header-style-${selectedColumn}`;
                    newEl.textContent = content;
                    document.head.appendChild(newEl);
                  }, 10);
                }
                
                if (el.id === `cell-style-${selectedColumn}`) {
                  foundCellStyle = true;
                  console.log('Found cell style element, ensuring it is applied');
                  // Force re-application by removing and re-adding
                  const content = el.textContent;
                  document.head.removeChild(el);
                  setTimeout(() => {
                    const newEl = document.createElement('style');
                    newEl.id = `cell-style-${selectedColumn}`;
                    newEl.textContent = content;
                    document.head.appendChild(newEl);
                  }, 10);
                }
              });
              
              // Create if not found
              if (!foundHeaderStyle && sanitizedState.header.applyStyles) {
                console.log('Header style not found, creating emergency style');
                const styleEl = document.createElement('style');
                styleEl.id = `emergency-header-style-${selectedColumn}`;
                styleEl.textContent = `
                  [col-id="${selectedColumn}"].ag-header-cell,
                  .ag-header-cell[col-id="${selectedColumn}"] {
                    color: ${sanitizedState.header.textColor || 'inherit'} !important;
                    background-color: ${sanitizedState.header.backgroundColor || 'inherit'} !important;
                    font-weight: ${sanitizedState.header.bold ? 'bold' : 'normal'} !important;
                    font-style: ${sanitizedState.header.italic ? 'italic' : 'normal'} !important;
                    text-decoration: ${sanitizedState.header.underline ? 'underline' : 'none'} !important;
                    font-size: ${sanitizedState.header.fontSize || 'inherit'} !important;
                    font-family: ${sanitizedState.header.fontFamily || 'inherit'} !important;
                    text-align: ${sanitizedState.header.alignH || 'inherit'} !important;
                    ${sanitizedState.header.borderStyle && sanitizedState.header.borderWidth && sanitizedState.header.borderColor ? 
                      `border: ${sanitizedState.header.borderWidth}px ${sanitizedState.header.borderStyle.toLowerCase()} ${sanitizedState.header.borderColor} !important;` : ''}
                  }
                  
                  [col-id="${selectedColumn}"] .ag-header-cell-label,
                  .ag-header-cell[col-id="${selectedColumn}"] .ag-header-cell-label {
                    justify-content: ${sanitizedState.header.alignH === 'left' ? 'flex-start' : 
                                    sanitizedState.header.alignH === 'center' ? 'center' : 'flex-end'} !important;
                  }
                `;
                document.head.appendChild(styleEl);
              }
              
              if (!foundCellStyle && sanitizedState.cell.applyStyles) {
                console.log('Cell style not found, creating emergency style');
                const styleEl = document.createElement('style');
                styleEl.id = `emergency-cell-style-${selectedColumn}`;
                styleEl.textContent = `
                  [col-id="${selectedColumn}"].ag-cell,
                  .ag-cell[col-id="${selectedColumn}"] {
                    color: ${sanitizedState.cell.textColor || 'inherit'} !important;
                    background-color: ${sanitizedState.cell.backgroundColor || 'inherit'} !important;
                    font-weight: ${sanitizedState.cell.bold ? 'bold' : 'normal'} !important;
                    font-style: ${sanitizedState.cell.italic ? 'italic' : 'normal'} !important;
                    text-decoration: ${sanitizedState.cell.underline ? 'underline' : 'none'} !important;
                    font-size: ${sanitizedState.cell.fontSize || 'inherit'} !important;
                    font-family: ${sanitizedState.cell.fontFamily || 'inherit'} !important;
                    text-align: ${sanitizedState.cell.alignH || 'inherit'} !important;
                    ${sanitizedState.cell.borderStyle && sanitizedState.cell.borderWidth && sanitizedState.cell.borderColor ? 
                      `border: ${sanitizedState.cell.borderWidth}px ${sanitizedState.cell.borderStyle.toLowerCase()} ${sanitizedState.cell.borderColor} !important;` : ''}
                  }
                `;
                document.head.appendChild(styleEl);
              }
            } catch (finalError) {
              console.error('Error during final brute-force styling:', finalError);
            }
          }, 300);
        } catch (refreshError) {
          console.error('Error during final grid refresh:', refreshError);
        }
      }
      
      // Add a small delay before closing dialog to ensure changes are applied
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    } catch (error) {
      console.error('Error when applying column settings:', error);
      onOpenChange(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    // Reset to original loaded settings or defaults
    if (open && selectedColumn) {
      const settings = gridStore.getColumnSettings(selectedColumn);
      
      if (settings) {
        setState(settings);
      } else {
        setState({
          general: {
            headerName: selectedColumn,
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
            borderSides: 'All',
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
            borderSides: 'All',
          }
        });
      }
    }
  };

  // Don't render anything if state is not initialized yet
  if (!state) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-4 sm:p-5 bg-background rounded-xl shadow-lg border border-border/80"
        style={{ width: 800, minWidth: 800, maxWidth: 800, height: 840, maxHeight: 940, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-[20px] font-semibold text-foreground flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-primary"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h10M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Column Settings
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground mt-1">
            Configure display and behavior for this column
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-row min-h-0 flex-1">
          {/* Sidebar */}
          <ColumnList 
            columns={columnList}
            selectedColumn={selectedColumn}
            onSelectColumn={onSelectColumn}
          />
          
          {/* Main Content */}
          <div className="flex-1 pl-6 overflow-y-hidden" style={{ maxHeight: 740 }}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-2 gap-1 bg-card border border-border/80 rounded-lg p-1 h-9">
                <TabsTrigger value="general" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">General</TabsTrigger>
                <TabsTrigger value="header" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Header</TabsTrigger>
                <TabsTrigger value="cell" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Cell</TabsTrigger>
                <TabsTrigger value="filter" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Filter</TabsTrigger>
                <TabsTrigger value="formatters" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Formatters</TabsTrigger>
                <TabsTrigger value="editors" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Editors</TabsTrigger>
              </TabsList>
              
              {/* Tab Contents */}
              <TabsContent value="general" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <GeneralTab 
                  settings={state.general}
                  onUpdate={updateGeneral}
                />
              </TabsContent>
              
              <TabsContent value="header" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <HeaderTab 
                  settings={state.header}
                  onUpdate={updateHeader}
                />
              </TabsContent>
              
              <TabsContent value="cell" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <CellTab 
                  settings={state.cell}
                  onUpdate={updateCell}
                />
              </TabsContent>
              
              <TabsContent value="filter" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <FilterTab />
              </TabsContent>
              
              <TabsContent value="formatters" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <FormattersTab />
              </TabsContent>
              
              <TabsContent value="editors" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <EditorsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Footer: match Expression Editor dialog */}
        <div className="flex justify-between border-t border-border/80" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
          <Button 
            variant="outline" 
            className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              className="h-8 px-5 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              onClick={handleApplyChanges}
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};