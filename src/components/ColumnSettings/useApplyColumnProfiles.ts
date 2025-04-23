import { useEffect, useCallback } from 'react';
import { useGridStore } from '@/store/gridStore';

/**
 * Hook to apply all saved column profiles to the grid on initialization
 * @param gridApi The AG-Grid API
 * @returns An object with functions to apply profiles
 */
export const useApplyColumnProfiles = (gridApi: any) => {
  // Get grid store for accessing column settings
  const gridStore = useGridStore();
  
  // Apply all saved profiles to the grid
  const applyAllProfiles = useCallback(() => {
    if (!gridApi) {
      console.warn('Grid API not available in applyAllProfiles - skipping profile application');
      return false;
    }
    
    // Additional check for grid API methods
    if (!gridApi.getColumn || typeof gridApi.getColumn !== 'function') {
      console.warn('Grid API missing getColumn method - may not be fully initialized');
      return false;
    }

    try {
      // Get all saved profiles from grid store
      const profileNames = gridStore.getColumnSettingsProfiles();
      
      console.log('Applying column settings profiles from grid store:', profileNames);

      // Loop through all profile names
      profileNames.forEach(profileName => {
        // Check if this is a column settings profile
        if (profileName.endsWith('_settings')) {
          const columnField = profileName.replace('_settings', '');
          
          try {
            console.log(`Applying settings for column ${columnField} from profile`);
            // Use the grid store's apply method
            const success = gridStore.applyColumnSettings(columnField);
            
            if (success) {
              console.log(`Successfully applied settings for column ${columnField}`);
            } else {
              console.warn(`Failed to apply settings for column ${columnField}`);
              
              // Try direct application as fallback
              console.log(`Attempting direct application fallback for ${columnField}`);
              if (gridApi && typeof gridApi.getColumn === 'function') {
                const column = gridApi.getColumn(columnField);
                if (column) {
                  const columnSettings = gridStore.getColumnSettings(columnField);
                  if (columnSettings) {
                    console.log(`Found settings for direct application to ${columnField}:`, columnSettings);
                    
                    // Apply some basic settings directly
                    const colDef = column.getColDef();
                    if (columnSettings.general) {
                      if (columnSettings.general.headerName) {
                        colDef.headerName = columnSettings.general.headerName;
                        console.log(`Set headerName to ${colDef.headerName}`);
                      }
                      
                      if (columnSettings.general.width) {
                        const width = parseInt(columnSettings.general.width, 10);
                        if (!isNaN(width) && width > 0) {
                          colDef.width = width;
                          console.log(`Set width to ${width}px`);
                        }
                      }
                    }
                    
                    // Force a column update
                    if (typeof gridApi.refreshHeader === 'function') {
                      gridApi.refreshHeader();
                    }
                    
                    console.log('Direct fallback application completed');
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error applying settings for column ${columnField}:`, error);
          }
        }
      });

      // Enhanced grid refresh to ensure styles are properly applied
      console.log('Performing comprehensive grid refresh after applying all column profiles');
      
      // First refresh header
      if (typeof gridApi.refreshHeader === 'function') {
        console.log('Refreshing grid headers');
        gridApi.refreshHeader();
      }
      
      // Then refresh all cells
      if (typeof gridApi.refreshCells === 'function') {
        console.log('Refreshing all grid cells');
        gridApi.refreshCells({ force: true });
      }
      
      // Force a complete redraw of the grid for maximum style application
      setTimeout(() => {
        try {
          if (gridApi) {
            // Try multiple refresh methods for maximum effect
            console.log('Performing deep grid refresh');
            
            if (typeof gridApi.redrawRows === 'function') {
              console.log('Redrawing all rows');
              gridApi.redrawRows();
            }
            
            if (typeof gridApi.refreshView === 'function') {
              console.log('Refreshing entire grid view');
              gridApi.refreshView();
            }
          }
        } catch (error) {
          console.warn('Error during comprehensive grid refresh:', error);
        }
      }, 100);

      return true;
    } catch (error) {
      console.error('Error applying column profiles:', error);
      return false;
    }
  }, [gridApi, gridStore]);

  // Apply profiles when the grid is initialized
  useEffect(() => {
    if (gridApi && gridApi.getColumn && typeof gridApi.getColumn === 'function') {
      // Wait for the grid to be fully initialized with a longer delay
      // and perform additional checks to ensure API is ready
      const timeoutId = setTimeout(() => {
        console.log('Applying all column profiles on grid initialization');
        
        // Only proceed if the API is still valid
        if (gridApi && gridApi.getColumn) {
          const success = applyAllProfiles();
          console.log('Applied all column profiles:', success);
        } else {
          console.warn('Grid API became invalid before applying profiles');
        }
      }, 800);
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
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