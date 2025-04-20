import { useEffect, useCallback } from 'react';

/**
 * Hook to apply all saved column profiles to the grid on initialization
 * @param gridApi The AG-Grid API
 * @returns An object with functions to apply profiles
 */
export const useApplyColumnProfiles = (gridApi: any) => {
  // Apply all saved profiles to the grid
  const applyAllProfiles = useCallback(() => {
    if (!gridApi) {
      console.error('Grid API not available');
      return false;
    }

    try {
      // Get all saved profiles
      const profilesJson = localStorage.getItem('columnSettingsProfiles') || '{}';
      const profiles = JSON.parse(profilesJson);

      console.log('Applying all saved column profiles:', Object.keys(profiles));

      // Loop through all profiles
      Object.entries(profiles).forEach(([profileName, profileSettings]: [string, any]) => {
        // Check if this is a column settings profile
        if (profileName.endsWith('_settings')) {
          const columnField = profileName.replace('_settings', '');

          // Get the column from the grid
          const column = gridApi.getColumn ? gridApi.getColumn(columnField) : null;

          if (column) {
            console.log(`Applying saved profile for column ${columnField}`);

            // Get the column definition
            const colDef = column.getColDef ? column.getColDef() : {};

            if (!colDef) {
              console.error(`Failed to get column definition for ${columnField}`);
              return;
            }

            // Apply general settings
            const general = profileSettings.general;
            if (general) {
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

              // Set column visibility
              if (typeof column.setVisible === 'function') {
                column.setVisible(!general.hidden);
              }

              // Set column pinned state
              if (typeof column.setPinned === 'function') {
                let pinnedState = null;
                if (general.pinnedPosition === 'Left') pinnedState = 'left';
                if (general.pinnedPosition === 'Right') pinnedState = 'right';
                column.setPinned(pinnedState);
              }
            }

            // Apply header styles
            const header = profileSettings.header;
            if (header && header.applyStyles) {
              // Create a headerClass function to apply custom styles
              colDef.headerClass = `custom-header-${columnField}`;

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
            }

            // Apply cell styles
            const cell = profileSettings.cell;
            if (cell && cell.applyStyles) {
              // Create a cellClass function to apply custom styles
              colDef.cellClass = `custom-cell-${columnField}`;

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
            }
          }
        }
      });

      // Refresh the grid
      if (typeof gridApi.refreshHeader === 'function') {
        gridApi.refreshHeader();
      }

      if (typeof gridApi.redrawRows === 'function') {
        gridApi.redrawRows();
      }

      return true;
    } catch (error) {
      console.error('Error applying column profiles:', error);
      return false;
    }
  }, [gridApi]);

  // Apply profiles when the grid is initialized
  useEffect(() => {
    if (gridApi) {
      // Wait for the grid to be fully initialized
      setTimeout(() => {
        console.log('Applying all column profiles on grid initialization');
        const success = applyAllProfiles();
        console.log('Applied all column profiles:', success);
      }, 500);
    }
  }, [gridApi, applyAllProfiles]);

  // Listen for storage events to apply profiles when they change
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'columnSettingsProfiles' && gridApi) {
        console.log('Column profiles changed in storage, reapplying');
        setTimeout(() => {
          applyAllProfiles();
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [gridApi, applyAllProfiles]);

  return {
    applyAllProfiles
  };
};
