import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent } from 'ag-grid-community';
import { DataTableToolbar } from './Toolbar/DataTableToolbar';
import { createGridTheme } from './theme/grid-theme';
import { generateColumnDefs } from './utils/column-utils';
import { useApplyColumnProfiles } from '@/components/ColumnSettings/useApplyColumnProfiles';


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

  // Memoize the theme mode to avoid unnecessary re-renders
  const isDarkMode = useMemo(() => currentTheme === 'dark', [currentTheme]);

  // Initialize the grid theme when the theme or font changes
  useEffect(() => {
    // Set the theme mode on the body element
    document.body.dataset.agThemeMode = isDarkMode ? 'dark' : 'light';

    // Create a new grid theme with the current font
    const fontValue = settings?.font?.value || defaultFontValue;
    setGridTheme(createGridTheme(fontValue));

    if (process.env.NODE_ENV === 'development') {
      console.log('Grid theme updated:', { isDarkMode, fontValue });
    }
  }, [isDarkMode, settings?.font?.value, defaultFontValue]);

  // Initialize the store once on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Get applyAllProfiles function from hook
  const { applyAllProfiles } = useApplyColumnProfiles(gridApi);

  // Memoize the settings update function to reduce rerenders
  const applyGridSettings = useCallback(() => {
    if (!gridApi || typeof gridApi.getColumn !== 'function') {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Applying settings and profiles in batch');
    }

    // Apply settings once with all changes batched
    applySettingsToGrid();

    // Apply profiles without additional timeouts
    applyAllProfiles();
  }, [gridApi, applySettingsToGrid, applyAllProfiles]);

  // Apply font family CSS variable directly without triggering grid refresh
  useEffect(() => {
    if (settings?.font?.value) {
      // Only update the font family setting - less expensive operation
      document.documentElement.style.setProperty('--ag-font-family', settings.font.value);
    }
  }, [settings?.font?.value]);

  // Combine grid state settings into a single effect with a debounce mechanism
  useEffect(() => {
    if (!gridApi) return;

    // Check if any grid state settings have changed
    const hasGridStateChanges = settings?.columnsState || settings?.filterState || settings?.sortState;
    const hasAdvancedChanges = settings?.rowGroupState || settings?.pivotState || settings?.chartState;

    if (!hasGridStateChanges && !hasAdvancedChanges) return;

    // Use a debounce to avoid multiple rapid updates
    const debounceTimer = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        if (hasGridStateChanges) {
          console.log('Applying grid state settings (columns/filters/sorts)');
        }
        if (hasAdvancedChanges) {
          console.log('Applying advanced grid settings (groups/pivots/charts)');
        }
      }

      // Apply all settings in a single batch
      applyGridSettings();
    }, 50); // Short debounce to batch closely-timed updates

    return () => clearTimeout(debounceTimer);
  }, [
    gridApi,
    settings?.columnsState,
    settings?.filterState,
    settings?.sortState,
    settings?.rowGroupState,
    settings?.pivotState,
    settings?.chartState,
    applyGridSettings
  ]);

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

  // Batch all grid initialization steps in a single function
  const setupGridApi = useCallback((api: any) => {
    if (!api) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('Setting up grid API with batched operations');
    }

    // Store reference in window for emergency access only in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).__gridApi = api;
      (window as any).__hasGridApi = true;
      (window as any).__refreshGridApi = () => {
        setGridApi(api);
        return 'Grid API refreshed';
      };
    }

    // Set API in store - this operation is synchronous
    setGridApi(api);

    // Apply settings with a slight delay to ensure grid is fully initialized
    if (api && typeof api.getColumn === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Applying initial settings to grid');
      }

      // Use a short timeout to ensure the grid is fully rendered
      setTimeout(() => {
        applyGridSettings();

        // Set initial focus to first cell
        const columns = api.getColumns();
        if (columns && columns.length > 0) {
          api.setFocusedCell(0, columns[0].getColId());
        }
      }, 50);
    }
  }, [setGridApi, applyGridSettings]);

  // Handle grid ready event - AG Grid 33+ approach with single initialization
  const onGridReady = useCallback((params: GridReadyEvent) => {
    if (!params || !params.api) {
      console.warn('Grid API not available in onGridReady');
      return;
    }

    try {
      // Initialize grid API once without multiple timeouts
      setupGridApi(params.api);
    } catch (error) {
      console.error('Error in onGridReady:', error);
    }
  }, [setupGridApi]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any references to the grid API
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        delete (window as any).__gridApi;
        delete (window as any).__hasGridApi;
        delete (window as any).__refreshGridApi;
      }
    };
  }, []);

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