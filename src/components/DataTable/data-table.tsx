import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { DataTableToolbar, monospacefonts } from './Toolbar/DataTableToolbar';
import { createGridTheme } from './theme/grid-theme';
import { generateColumnDefs } from './utils/column-utils';
import { ExpressionEditorDialog } from './ExpressionEditor/ExpressionEditorDialog';

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface DataTableProps<TData> {
  data: TData[];
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
  const { theme: currentTheme } = useTheme();
  const [selectedFont, setSelectedFont] = useState(monospacefonts[0]);
  const [gridTheme, setGridTheme] = useState(() => createGridTheme(monospacefonts[0].value));
  const [expressionEditorOpen, setExpressionEditorOpen] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs = useMemo(() => {
    return generateColumnDefs(data);
  }, [data]);

  useEffect(() => {
    setDarkMode(currentTheme === 'dark');
    setGridTheme(createGridTheme(selectedFont.value));
  }, [currentTheme, selectedFont]);

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

  const onGridReady = useCallback((params: any) => {
    // Set initial focus to first cell
    setTimeout(() => {
      if (params.api && params.columnApi) {
        const columns = params.columnApi.getAllDisplayedColumns();
        if (columns.length > 0) {
          params.api.setFocusedCell(0, columns[0].getColId());
        }
      }
    }, 100);
  }, [columnDefs]);

  const handleExpressionSave = useCallback((expression: any) => {
    // TODO: Handle saving the expression
    console.log('Expression saved:', expression);
    setExpressionEditorOpen(false);
  }, []);

  return (
    <div className="flex h-full flex-col rounded-md border bg-card">
      <DataTableToolbar
        selectedFont={selectedFont}
        onFontChange={setSelectedFont}
        onOpenExpressionEditor={() => setExpressionEditorOpen(true)}
      />

      {/* AG Grid */}
      <div className="ag-theme-quartz flex-1">
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          columnDefs={columnDefs}
          rowData={data}
          defaultColDef={defaultColDef}
          sideBar={true}
          domLayout="normal"
          className="h-full w-full"
          onGridReady={onGridReady}
          enableRangeSelection={true}
          enableFillHandle={true}
          enterMovesDown={false}
          stopEditingWhenCellsLoseFocus={false}
          suppressClearOnFillReduction={true}
        />
      </div>

      {/* Expression Editor Dialog */}
      <ExpressionEditorDialog
        open={expressionEditorOpen}
        onClose={() => setExpressionEditorOpen(false)}
        onSave={handleExpressionSave}
        columnDefs={columnDefs}
      />
    </div>
  );
}