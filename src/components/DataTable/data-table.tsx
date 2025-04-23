import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent } from 'ag-grid-community';
import { DataTableToolbar } from './Toolbar/DataTableToolbar';
import { createGridTheme } from './theme/grid-theme';
import { generateColumnDefs } from './utils/column-utils';
import { useApplyColumnProfiles } from '../ColumnSettings/useApplyColumnProfiles';


import { useGridStore } from '@/store/gridStore';

// Register AG Grid Enterprise modules
ModuleRegistry.registerModules([AllEnterpriseModule]);

interface DataTableProps<TData> {
  data: TData[];
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
  // Theme handling
  const { theme: currentTheme } = useTheme();

  // Zustand store
  const {
    settings,
    gridApi,
    setGridApi,
    initializeStore,
    applySettingsToGrid
  } = useGridStore();

  // Local state
  // Default font value
  const defaultFontValue = "'JetBrains Mono', monospace";

  // Initialize with safe access to settings
  const [gridTheme, setGridTheme] = useState(() =>
    createGridTheme(settings?.font?.value || defaultFontValue)
  );


  const gridRef = useRef<AgGridReact>(null);

  // Column definitions
  const columnDefs = useMemo(() => {
    return generateColumnDefs(data);
  }, [data]);

  // Initialize the grid theme when the theme or font changes
  useEffect(() => {
    setDarkMode(currentTheme === 'dark');
    setGridTheme(createGridTheme(settings?.font?.value || defaultFontValue));
  }, [currentTheme, settings?.font, defaultFontValue]);

  // Initialize the store once on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Apply settings only when specific properties change that require grid refresh
  // We exclude fontSize and density as they're handled via CSS directly
  const { font, columnsState, filterState, sortState, rowGroupState, pivotState, chartState } = settings || {};

  // Get applyAllProfiles function from hook - but don't wrap in useMemo to avoid React hook order issues
  const { applyAllProfiles } = useApplyColumnProfiles(gridApi);
  
  // Only apply settings when grid API and essential properties change
  const applySettings = useCallback(() => {
    if (gridApi && gridApi.getColumn && typeof gridApi.getColumn === 'function') {
      console.log('Applying settings due to grid-related property change');
      
      // Apply settings to grid
      applySettingsToGrid();

      // Apply all saved column profiles after a short delay
      const timeoutId = setTimeout(() => {
        console.log('Applying column profiles after settings change');
        if (gridApi && gridApi.getColumn) {
          applyAllProfiles();
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gridApi, applySettingsToGrid, applyAllProfiles]);
  
  // Use effect to call the callback when settings change
  useEffect(() => {
    return applySettings();
  }, [
    // Only include essential dependencies that should trigger a refresh
    font, columnsState, filterState, sortState, rowGroupState, pivotState, chartState,
    applySettings
  ]);

  function setDarkMode(enabled: boolean) {
    document.body.dataset.agThemeMode = enabled ? 'dark' : 'light';
  }

  // Define default column properties - AG Grid 33+ syntax
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    filter: true,
    sortable: true,
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    editable: true,
  }), []);

  // Define column types for the grid - AG Grid 33+ syntax
  const columnTypes = useMemo(() => ({
    customNumeric: {
      filter: 'agNumberColumnFilter',
      headerClass: 'ag-right-aligned-header',
      cellClass: 'ag-right-aligned-cell',
    },
    customDate: {
      filter: 'agDateColumnFilter',
    }
  }), []);

  // Handle grid ready event - AG Grid 33+ approach
  const onGridReady = useCallback((params: GridReadyEvent) => {
    if (!params || !params.api) {
      console.warn('Grid API not available in onGridReady');
      return;
    }

    try {
      console.log('Grid API available in onGridReady');
      
      // Keep a reference in window for emergency access - do this FIRST
      if (typeof window !== 'undefined') {
        console.log('Storing grid API in window.__gridApi for emergency access');
        (window as any).__gridApi = params.api;
        
        // Also store in localStorage for persistence across sessions
        (window as any).__hasGridApi = true;
        
        // Create a function to refresh the grid API (for emergency recovery)
        (window as any).__refreshGridApi = () => {
          console.log('Emergency refreshing grid API reference');
          setGridApi(params.api);
          return 'Grid API refreshed successfully';
        };
      }
      
      // Set up grid API reference in the store
      console.log('Setting grid API reference in store - this should be saved');
      setGridApi(params.api);
      
      // Double-check after a short delay that the gridApi was properly saved
      setTimeout(() => {
        const savedApi = useGridStore.getState().gridApi;
        if (!savedApi) {
          console.warn('Grid API not properly saved in store, attempting emergency save');
          setGridApi(params.api);
        } else {
          console.log('Grid API successfully saved in store');
        }
      }, 100);

      // Apply current settings to grid - using a longer delay
      // to ensure grid API is fully initialized and registered in store
      setTimeout(() => {
        console.log('Applying grid settings after initialization');
        applySettingsToGrid();

        // Apply all saved column profiles after a short delay
        // This allows the grid API to be properly registered before applying profiles
        setTimeout(() => {
          console.log('Now applying column profiles');
          if (params.api) {
            // Use the window API reference to ensure we have the latest
            if (typeof window !== 'undefined') {
              console.log('Setting latest API reference before applying profiles');
              (window as any).__gridApi = params.api;
            }
            
            // Refresh grid API in store
            setGridApi(params.api);
            
            // Now apply profiles
            applyAllProfiles();
            
            // Force a column refresh to ensure styles are applied
            setTimeout(() => {
              if (params.api && typeof params.api.refreshCells === 'function') {
                console.log('Performing final cell refresh after applying profiles');
                params.api.refreshCells({ force: true });
              }
            }, 300);
          }
        }, 500);
      }, 200);

      // Set initial focus to first cell
      setTimeout(() => {
        if (params.api) {
          const columns = params.api.getColumns();
          if (columns && columns.length > 0) {
            params.api.setFocusedCell(0, columns[0].getColId());
          }
        }
      }, 300);
    } catch (error) {
      console.error('Error in onGridReady:', error);
    }
  }, [setGridApi, applySettingsToGrid, applyAllProfiles]);

  return (
    <div className="flex h-full flex-col rounded-md border bg-card">
      <DataTableToolbar />

      {/* AG Grid */}
      <div className="ag-theme-quartz flex-1">
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          // Basic grid configuration - AG Grid 33+ syntax
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          columnTypes={columnTypes}
          // Layout and appearance
          domLayout="normal"
          className="h-full w-full"
          // Enable enterprise features
          sideBar={true}
          // Event handling
          onGridReady={onGridReady}
          // Editing and selection options
          enableCellTextSelection={true}
          stopEditingWhenCellsLoseFocus={false}
          // Navigation
          enterNavigatesVertically={false}
          // Animation
          animateRows={true}
          // Provide IDs for rows if data has id field
          getRowId={(params) => params.data.id || params.data.positionId || String(Math.random())}
        />
      </div>
    </div>
  );
}
