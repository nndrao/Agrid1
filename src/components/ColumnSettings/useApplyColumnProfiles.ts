import { useCallback, useRef } from 'react';
import { useGridStore } from '@/store/gridStore';

/**
 * Hook to apply all saved column profiles to the grid on initialization
 * @param gridApi The AG-Grid API
 * @returns An object with functions to apply profiles
 */
export const useApplyColumnProfiles = (gridApi: any) => {
  // Get grid store for accessing column settings
  const gridStore = useGridStore();

  // Use a ref to track the last time profiles were applied to avoid redundant operations
  const lastAppliedRef = useRef<number>(0);

  // Apply all saved profiles to the grid with debouncing
  const applyAllProfiles = useCallback(() => {
    // Skip if we've applied profiles recently (within 100ms)
    const now = Date.now();
    if (now - lastAppliedRef.current < 100) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping profile application - throttled');
      }
      return true;
    }

    // Update the last applied timestamp
    lastAppliedRef.current = now;

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

      if (process.env.NODE_ENV === 'development') {
        console.log('Applying column settings profiles from grid store:', profileNames);
      }

      // Collect all columns that need styling
      const columnsToStyle: string[] = [];

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
        if (process.env.NODE_ENV === 'development') {
          console.log(`Applying settings to ${columnsToStyle.length} columns in batch`);
        }

        // Use requestAnimationFrame to batch DOM updates
        requestAnimationFrame(() => {
          // RULE 2 & 3: When applying settings from a profile, always use the saved width
          // This ensures consistent behavior when refreshing or switching profiles
          columnsToStyle.forEach(columnField => {
            try {
              // Always use preserveCurrentWidth=false to use the saved width from the profile
              // This ensures consistent behavior when refreshing or switching profiles
              gridStore.applyColumnSettings(columnField, false);

              if (process.env.NODE_ENV === 'development') {
                console.log(`Applied settings for column ${columnField} from profile`);
              }
            } catch (error) {
              console.error(`Error applying settings for column ${columnField}:`, error);
            }
          });

          // Apply column widths explicitly to ensure they're applied correctly
          if (gridApi && typeof gridApi.applyColumnState === 'function') {
            try {
              // Get column widths from profiles
              const widthColumnsState = columnsToStyle
                .map(columnField => {
                  const columnSettings = gridStore.getColumnSettings(columnField);
                  if (!columnSettings?.general?.width) return null;

                  const width = parseInt(columnSettings.general.width, 10);
                  if (isNaN(width) || width <= 0) return null;

                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Explicitly applying saved width for column ${columnField}: ${width}px`);
                  }

                  return {
                    colId: columnField,
                    width: width
                  };
                })
                .filter(state => state !== null);

              if (widthColumnsState.length > 0) {
                // Apply column widths with higher priority
                gridApi.applyColumnState({
                  state: widthColumnsState,
                  applyOrder: true, // Ensure the order is respected
                  defaultState: { width: null } // Clear any default width
                });
              }
            } catch (error) {
              console.error('Error applying column width states:', error);
            }
          }

          // Perform a single grid refresh after applying all settings
          if (process.env.NODE_ENV === 'development') {
            console.log('Performing single refresh after applying all column settings');
          }

          // Use a short timeout to ensure all DOM updates are complete
          setTimeout(() => {
            // Refresh headers once
            if (typeof gridApi.refreshHeader === 'function') {
              gridApi.refreshHeader();
            }

            // Refresh cells once
            if (typeof gridApi.refreshCells === 'function') {
              gridApi.refreshCells({ force: true });
            }
          }, 0);
        });
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