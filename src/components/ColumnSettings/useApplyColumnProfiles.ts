import { useCallback } from 'react';
import { useGridStore } from '@/store/gridStore';
import { GridApi } from 'ag-grid-community';

export const useApplyColumnProfiles = (gridApi: GridApi | null) => {
  // Get store actions and state
  const { 
    getActiveProfile, 
    getColumnSettings,
    applyColumnSettings
  } = useGridStore();
  
  // Apply a single column's profile settings
  const applyProfiles = useCallback(() => {
    const activeProfile = getActiveProfile();
    if (!activeProfile || !activeProfile.columnSettingsProfiles) {
      console.warn('No active profile or column settings profiles found');
      return;
    }
    
    if (!gridApi) {
      console.warn('No grid API available to apply profiles');
      return;
    }
    
    console.log('Applying column profiles for active profile:', activeProfile.name);
    
    // The profile is already loaded in the store, so we just need to apply it
    // This triggers the real implementation in the store
    try {
      // Get all columns from the grid
      const columns = gridApi.getColumns();
      if (!columns || columns.length === 0) {
        console.warn('No columns found in grid');
        return false;
      }
      
      // Apply settings for each column
      let appliedCount = 0;
      columns.forEach(column => {
        const colId = column.getColId();
        if (colId) {
          const settings = getColumnSettings(colId);
          if (settings) {
            applyColumnSettings(colId);
            appliedCount++;
          }
        }
      });
      
      console.log(`Successfully applied profile settings to ${appliedCount} columns`);
      return true;
    } catch (error) {
      console.error('Error applying column profiles:', error);
      return false;
    }
  }, [getActiveProfile, getColumnSettings, applyColumnSettings, gridApi]);

  // Apply all profiles settings
  const applyAllProfiles = useCallback(() => {
    if (!gridApi) {
      console.warn('No grid API available to apply profiles');
      return false;
    }
    
    const activeProfile = getActiveProfile();
    if (!activeProfile) {
      console.warn('No active profile found to apply settings');
      return false;
    }
    
    console.log('Applying all column profiles for profile:', activeProfile.name);
    
    try {
      // Get all columns from the grid
      const columns = gridApi.getColumns();
      if (!columns || columns.length === 0) {
        console.warn('No columns found in grid');
        return false;
      }
      
      // Apply settings for each column
      let appliedCount = 0;
      columns.forEach(column => {
        const colId = column.getColId();
        if (colId) {
          const settings = getColumnSettings(colId);
          if (settings) {
            applyColumnSettings(colId);
            appliedCount++;
          }
        }
      });
      
      console.log(`Successfully applied all profile settings to ${appliedCount} columns`);
      return true;
    } catch (error) {
      console.error('Error applying all column profiles:', error);
      return false;
    }
  }, [gridApi, getActiveProfile, getColumnSettings, applyColumnSettings]);
  
  return { applyProfiles, applyAllProfiles };
};