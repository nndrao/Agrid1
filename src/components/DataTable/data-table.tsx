import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent } from 'ag-grid-community';
import { DataTableToolbar } from './Toolbar/DataTableToolbar';
import { createGridTheme } from './theme/grid-theme';
import { generateColumnDefs } from './utils/column-utils';


import { useGridStore } from '@/store/gridStore';

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

  useEffect(() => {
    if (gridApi) {
      // Only apply settings when properties that require grid refresh change
      // This prevents unnecessary refreshes when saving profiles or changing fontSize/density
      console.log('Applying settings due to grid-related property change');
      applySettingsToGrid();
    }
  }, [
    font, columnsState, filterState, sortState, rowGroupState, pivotState, chartState,
    gridApi, applySettingsToGrid
  ]);

  function setDarkMode(enabled: boolean) {
    document.body.dataset.agThemeMode = enabled ? 'dark' : 'light';
  }

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    editable: true,
  };

  // Define column types for the grid
  const columnTypes = {
    customNumeric: {
      filter: 'agNumberColumnFilter',
      headerClass: 'ag-right-aligned-header',
      cellClass: 'ag-right-aligned-cell',
    },
    customDate: {
      filter: 'agDateColumnFilter',
    }
  };

  const onGridReady = useCallback((params: GridReadyEvent) => {
    if (!params || !params.api) {
      console.warn('Grid API not available in onGridReady');
      return;
    }

    try {
      // Set up grid API reference in the store
      setGridApi(params.api);

      // Apply current settings to grid
      setTimeout(() => {
        applySettingsToGrid();
      }, 0);

      // Set initial focus to first cell
      setTimeout(() => {
        if (params.api) {
          const columns = params.api.getColumns();
          if (columns && columns.length > 0) {
            params.api.setFocusedCell(0, columns[0].getColId());
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error in onGridReady:', error);
    }
  }, [setGridApi, applySettingsToGrid]);







  return (
    <div className="flex h-full flex-col rounded-md border bg-card">
      <DataTableToolbar />

      {/* AG Grid */}
      <div className="ag-theme-quartz flex-1">
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          columnDefs={columnDefs}
          rowData={data}
          defaultColDef={defaultColDef}
          columnTypes={columnTypes}
          sideBar={true}
          domLayout="normal"
          className="h-full w-full"
          onGridReady={onGridReady}
          enableCellTextSelection={true}
          enterNavigatesVertically={false}
          stopEditingWhenCellsLoseFocus={false}
        />
      </div>




    </div>
  );
}
