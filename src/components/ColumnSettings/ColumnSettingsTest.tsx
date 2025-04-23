import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGridStore } from '@/store/gridStore';
import { ColumnSettingsDialog } from './ColumnSettingsDialogRefactored';

// Sample column list for testing
const testColumns = [
  'positionId', 'cusip', 'isin', 'issuer', 'currency', 'sector', 'rating', 
  'maturityDate', 'coupon', 'position', 'marketValue', 'price', 'yieldToMaturity', 
  'modifiedDuration', 'convexity', 'spreadDuration', 'zSpread', 'oaSpread'
];

/**
 * This component provides a simple UI to directly test column styles
 */
export const ColumnSettingsTest: React.FC = () => {
  const gridStore = useGridStore();
  const [open, setOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('positionId');
  const [headerStyles, setHeaderStyles] = useState(false);
  const [cellStyles, setCellStyles] = useState(false);
  
  // Load current settings when component mounts or column changes
  useEffect(() => {
    if (selectedColumn) {
      const settings = gridStore.getColumnSettings(selectedColumn);
      if (settings) {
        setHeaderStyles(settings.header?.applyStyles === true);
        setCellStyles(settings.cell?.applyStyles === true);
      }
    }
  }, [selectedColumn, gridStore]);
  
  // Apply test styles directly
  const applyTestStyles = () => {
    console.log('⭐ Direct test of column styling');
    
    // Ensure the boolean flags are correct
    const useHeaderStyles = headerStyles === true;
    const useCellStyles = cellStyles === true;
    
    console.log('Using correctly typed style flags:', {
      headerStyles: useHeaderStyles,
      cellStyles: useCellStyles,
      headerStylesType: typeof useHeaderStyles,
      cellStylesType: typeof useCellStyles
    });
    
    // Create test settings with explicit true/false values for styling flags
    const testSettings = {
      general: {
        headerName: selectedColumn,
        width: '150',
        columnType: 'Default',
        pinnedPosition: 'Left', // Test pinning as well
        filter: 'Enabled',
        filterType: 'Auto',
        sortable: true,
        resizable: true,
        hidden: false,
        editable: true,
      },
      header: {
        applyStyles: useHeaderStyles, // Explicit boolean value
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: 'Bold',
        bold: true,
        italic: false,
        underline: false,
        textColor: '#FF0000',
        backgroundColor: '#F0F0F0',
        alignH: 'center',
        borderStyle: 'Solid',
        borderWidth: 2,
        borderColor: '#000000',
        borderSides: 'All',
      },
      cell: {
        applyStyles: useCellStyles, // Explicit boolean value
        fontFamily: 'Arial',
        fontSize: '14px',
        fontWeight: 'Bold',
        bold: true,
        italic: false,
        underline: false,
        textColor: '#0000FF',
        backgroundColor: '#F8F8F8',
        alignH: 'center',
        borderStyle: 'Solid',
        borderWidth: 1,
        borderColor: '#000000',
        borderSides: 'All',
      }
    };
    
    // Log the stringified and parsed version to ensure JSON doesn't mess with types
    const stringified = JSON.stringify(testSettings);
    const parsed = JSON.parse(stringified);
    
    console.log('Applying test settings after JSON processing:', {
      columnName: selectedColumn,
      headerStyles: parsed.header.applyStyles,
      cellStyles: parsed.cell.applyStyles,
      headerApplyStylesType: typeof parsed.header.applyStyles,
      headerApplyStyles: parsed.header.applyStyles,
      cellApplyStylesType: typeof parsed.cell.applyStyles,
      cellApplyStyles: parsed.cell.applyStyles
    });
    
    // Save settings to grid store - use original object not the parsed one
    const saveResult = gridStore.saveColumnSettings(selectedColumn, testSettings);
    console.log(`Settings saved to store: ${saveResult ? 'SUCCESS' : 'FAILED'}`);
    
    // Try to get window.__gridApi as fallback
    let gridApi = gridStore.gridApi;
    if (!gridApi && typeof window !== 'undefined' && (window as any).__gridApi) {
      console.log('Using window.__gridApi as fallback');
      gridApi = (window as any).__gridApi;
      
      // Update store
      gridStore.setGridApi(gridApi);
    }
    
    console.log('Attempting to apply column settings with grid API:', gridApi ? 'AVAILABLE' : 'NOT AVAILABLE');
    
    // Apply styles to grid
    const applyResult = gridStore.applyColumnSettings(selectedColumn);
    console.log(`Settings applied to grid via store: ${applyResult ? 'SUCCESS' : 'FAILED'}`);
    
    // Try the hard-coded brute force approach directly
    console.log('🔴 ATTEMPTING DIRECT STYLE INJECTION FOR TEST STYLES');
    
    // Force a direct approach through CSS
    try {
      // For header styles
      if (useHeaderStyles) {
        // Create a style element for headers
        let headerStyleEl = document.getElementById(`direct-header-style-${selectedColumn}`);
        if (!headerStyleEl) {
          headerStyleEl = document.createElement('style');
          headerStyleEl.id = `direct-header-style-${selectedColumn}`;
          document.head.appendChild(headerStyleEl);
        }
        
        // Set specific CSS with !important on everything
        headerStyleEl.textContent = `
        .ag-theme-quartz .ag-header-cell[col-id="${selectedColumn}"],
        .ag-theme-quartz-dark .ag-header-cell[col-id="${selectedColumn}"],
        [col-id="${selectedColumn}"].ag-header-cell,
        .custom-header-${selectedColumn} {
          color: #FF0000 !important;
          background-color: #F0F0F0 !important;
          font-weight: bold !important;
          font-size: 16px !important;
          font-family: Arial !important;
        }
        
        .ag-theme-quartz .ag-header-cell[col-id="${selectedColumn}"] .ag-header-cell-label,
        .ag-theme-quartz-dark .ag-header-cell[col-id="${selectedColumn}"] .ag-header-cell-label {
          justify-content: center !important;
        }`;
        
        console.log('Injected header CSS directly');
      }
      
      // For cell styles
      if (useCellStyles) {
        // Create a style element for cells
        let cellStyleEl = document.getElementById(`direct-cell-style-${selectedColumn}`);
        if (!cellStyleEl) {
          cellStyleEl = document.createElement('style');
          cellStyleEl.id = `direct-cell-style-${selectedColumn}`;
          document.head.appendChild(cellStyleEl);
        }
        
        // Set specific CSS with !important on everything
        cellStyleEl.textContent = `
        .ag-theme-quartz .ag-cell[col-id="${selectedColumn}"],
        .ag-theme-quartz-dark .ag-cell[col-id="${selectedColumn}"],
        [col-id="${selectedColumn}"].ag-cell,
        .custom-cell-${selectedColumn},
        div.ag-center-cols-container .ag-row .ag-cell[col-id="${selectedColumn}"] {
          color: #0000FF !important;
          background-color: #F8F8F8 !important;
          font-weight: bold !important;
          font-size: 14px !important;
          text-align: center !important;
          font-family: Arial !important;
        }`;
        
        console.log('Injected cell CSS directly');
      }
    } catch (cssError) {
      console.error('Error injecting CSS:', cssError);
    }
    
    // Also try direct DOM manipulation with a delay
    setTimeout(() => {
      try {
        console.log('🔴 ATTEMPTING DIRECT DOM MANIPULATION FOR TEST STYLES');
        
        // Direct DOM injection for header
        if (useHeaderStyles) {
          const headerElements = document.querySelectorAll(`.ag-header-cell[col-id="${selectedColumn}"]`);
          console.log(`Found ${headerElements.length} header elements for direct styling`);
          
          headerElements.forEach(el => {
            // Apply inline styles with !important
            el.setAttribute('style', 
              `color: #FF0000 !important; 
               background-color: #F0F0F0 !important; 
               font-weight: bold !important; 
               font-size: 16px !important; 
               font-family: Arial !important;`
            );
            
            // Also try to find and style the header label for alignment
            const label = el.querySelector('.ag-header-cell-label');
            if (label) {
              label.setAttribute('style', 'justify-content: center !important;');
            }
            
            console.log('Applied direct header styles to element:', el);
          });
        }
        
        // Direct DOM injection for cells
        if (useCellStyles) {
          const cellElements = document.querySelectorAll(`.ag-cell[col-id="${selectedColumn}"]`);
          console.log(`Found ${cellElements.length} cell elements for direct styling`);
          
          cellElements.forEach(el => {
            // Apply inline styles with !important
            el.setAttribute('style', 
              `color: #0000FF !important; 
               background-color: #F8F8F8 !important; 
               font-weight: bold !important; 
               font-size: 14px !important; 
               text-align: center !important; 
               font-family: Arial !important;`
            );
            
            console.log('Applied direct cell styles to element:', el);
          });
        }
        
        // Attempt to force pinning
        if (typeof window !== 'undefined' && (window as any).__gridApi) {
          const api = (window as any).__gridApi;
          console.log('Attempting direct pinning via window.__gridApi');
          
          if (typeof api.applyColumnState === 'function') {
            api.applyColumnState({
              state: [{
                colId: selectedColumn,
                pinned: 'left'
              }],
              defaultState: { pinned: null }
            });
            console.log('Applied direct pinning via applyColumnState');
          }
        }
      } catch (error) {
        console.error('Error applying direct DOM styles:', error);
      }
    }, 300);
  };
  
  return (
    <div className="p-4 space-y-4">
      <Card className="w-[350px] shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Test Column Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="header-styles" 
                checked={headerStyles}
                onCheckedChange={(checked) => {
                  console.log('Header style switch changed to:', checked);
                  setHeaderStyles(checked === true);
                }}
              />
              <Label htmlFor="header-styles">Apply Header Styles</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="cell-styles" 
                checked={cellStyles}
                onCheckedChange={(checked) => {
                  console.log('Cell style switch changed to:', checked);
                  setCellStyles(checked === true);
                }}
              />
              <Label htmlFor="cell-styles">Apply Cell Styles</Label>
            </div>
            
            <div className="flex flex-col space-y-2">
              <select 
                className="p-2 border rounded" 
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {testColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              
              <Button 
                onClick={applyTestStyles}
                className="w-full"
              >
                Apply Test Styles
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground mt-2">
              This applies red header text and blue cell text with center alignment
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={() => setOpen(true)}>Open Column Settings Dialog</Button>
      
      <ColumnSettingsDialog
        open={open}
        onOpenChange={setOpen}
        columnList={testColumns}
        selectedColumn={selectedColumn}
        onSelectColumn={setSelectedColumn}
      />
    </div>
  );
};