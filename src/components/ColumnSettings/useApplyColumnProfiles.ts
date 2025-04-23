import { useCallback } from 'react';
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

      // Collect all columns that need styling
      const columnsToStyle = [];
      
      // First pass: collect all columns to apply settings to
      profileNames.forEach(profileName => {
        // Check if this is a column settings profile
        if (profileName.endsWith('_settings')) {
          const columnField = profileName.replace('_settings', '');
          columnsToStyle.push(columnField);
        }
      });
      
      // Apply settings to all columns in a batch
      if (columnsToStyle.length > 0) {
        console.log(`Applying settings to ${columnsToStyle.length} columns in batch`);
        
        // Apply settings to each column
        columnsToStyle.forEach(columnField => {
          try {
            gridStore.applyColumnSettings(columnField);
          } catch (error) {
            console.error(`Error applying settings for column ${columnField}:`, error);
          }
        });
        
        // Perform a single grid refresh after applying all settings
        console.log('Performing single refresh after applying all column settings');
        
        // Refresh headers once
        if (typeof gridApi.refreshHeader === 'function') {
          gridApi.refreshHeader();
        }
        
        // Refresh cells once
        if (typeof gridApi.refreshCells === 'function') {
          gridApi.refreshCells({ force: true });
        }
      }

      return true;
    } catch (error) {
      console.error('Error applying column profiles:', error);
      return false;
    }
  }, [gridApi, gridStore]);

  return {
    applyAllProfiles
  };
};