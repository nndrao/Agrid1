import { StateCreator } from 'zustand';
import { GridStoreState, GridSettings } from './types';

/**
 * gridCore.ts
 * Slice for core grid logic: gridApi, settings, and core grid actions.
 */

export const createGridCoreSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    setGridApi: (api: any) => void;
    updateSettings: (settings: Partial<GridSettings>) => void;
    saveSettingsToProfile: () => void;
    extractGridState: () => void;
    applySettingsToGrid: () => void;
    getColumnSettings: (columnField: string) => any;
    saveColumnSettings: (columnField: string, columnSettings: any) => void;
    // ...add other core grid actions as needed
  }
> = (set, get) => ({
  setGridApi: (api) => set({ gridApi: api }),

  updateSettings: (settings) => set(state => ({
    settings: {
      ...state.settings,
      ...settings
    },
    isDirty: true
  })),

  saveSettingsToProfile: () => {
    // Implementation should call getActiveProfile and update its fields with current settings
    // (This is a stub; actual logic should be moved here from gridStore.ts)
  },

  extractGridState: () => {
    // Implementation should extract current grid state from gridApi
    // (This is a stub; actual logic should be moved here from gridStore.ts)
  },

  applySettingsToGrid: () => {
    // Implementation should apply settings from state.settings to gridApi
    // (This is a stub; actual logic should be moved here from gridStore.ts)
  },

  getColumnSettings: (columnField) => {
    const { settings } = get();
    if (!settings.columnSettingsProfiles) {
      return null;
    }
    const profileName = `${columnField}_settings`;
    return settings.columnSettingsProfiles[profileName] || null;
  },

  saveColumnSettings: (columnField, columnSettings) => {
    set(state => {
      const profileName = `${columnField}_settings`;
      return {
        settings: {
          ...state.settings,
          columnSettingsProfiles: {
            ...state.settings.columnSettingsProfiles,
            [profileName]: columnSettings
          }
        },
        isDirty: true
      };
    });
  }
});
