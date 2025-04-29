import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { ColumnList } from './ColumnList';
import { GeneralTab } from './tabs/GeneralTab';
import { HeaderTab } from './tabs/HeaderTab';
import { CellTab } from './tabs/CellTab';
import { FilterTab } from './tabs/FilterTab';
import { EditorsTab } from './tabs/EditorsTab';

// Import grid store instead of local state management
import { useGridStore } from '@/store/gridStore';
import { ColumnSettingsState } from './useColumnSettings';

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnList: string[];
  selectedColumn: string;
  onSelectColumn: (col: string) => void;
}

export const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  open,
  onOpenChange,
  columnList,
  selectedColumn,
  onSelectColumn
}) => {
  // Use grid store for state management instead of local hook
  const gridStore = useGridStore();
  
  // Local state to use while editing current column
  const [state, setState] = useState<ColumnSettingsState | null>(null);
  
  // Map to store settings for all modified columns
  const [modifiedColumnsMap, setModifiedColumnsMap] = useState<Record<string, ColumnSettingsState>>({});
  
  // Track previously selected column to save changes when changing selection
  const prevSelectedColumnRef = useRef<string | null>(null);
  
  // Get default settings for a column
  const getDefaultSettings = (colId: string): ColumnSettingsState => ({
    general: {
      headerName: colId,
      width: '120',
      columnType: 'Default',
      pinnedPosition: 'Not pinned',
      filter: 'Enabled',
      filterType: 'Auto',
      sortable: true,
      resizable: true,
      hidden: false,
      editable: true,
    },
    header: {
      // CRITICAL: Ensure this is an explicit boolean
      applyStyles: false,
      fontFamily: 'Arial',
      fontSize: '14px',
      fontWeight: 'Normal',
      bold: false,
      italic: false,
      underline: false,
      textColor: '#000000',
      backgroundColor: '#FFFFFF',
      alignH: 'left',
      borderStyle: 'Solid',
      borderWidth: 1,
      borderColor: '#000000',
      borderSides: 'All',
    },
    cell: {
      // CRITICAL: Ensure this is an explicit boolean
      applyStyles: false, 
      fontFamily: 'Arial',
      fontSize: '14px',
      fontWeight: 'Normal',
      bold: false,
      italic: false,
      underline: false,
      textColor: '#000000',
      backgroundColor: '#FFFFFF',
      alignH: 'left',
      borderStyle: 'Solid',
      borderWidth: 1,
      borderColor: '#000000',
      borderSides: 'All',
    }
  });

  // Previous selected column tracking
  const prevSelectedColumnValue = useRef<string | null>(null);
  
  // Effect to save current state when column changes
  useEffect(() => {
    // Only proceed if the column has actually changed
    if (prevSelectedColumnValue.current !== selectedColumn) {
      // Save settings for the previous column
      if (prevSelectedColumnRef.current && state) {
        // Check if the state is actually different from original
        const originalSettings = gridStore.getColumnSettings(prevSelectedColumnRef.current);
        const hasChanges = !originalSettings || 
          JSON.stringify(originalSettings) !== JSON.stringify(state);
        
        if (hasChanges) {
          setModifiedColumnsMap(prev => ({
            ...prev,
            [prevSelectedColumnRef.current!]: JSON.parse(JSON.stringify(state))
          }));
        }
      }
      
      // Update previous column ref
      prevSelectedColumnRef.current = selectedColumn;
      
      // Update tracking value for next comparison
      prevSelectedColumnValue.current = selectedColumn;
    }
  }, [selectedColumn, state, gridStore]);
  
  // Load settings when column changes or dialog opens
  useEffect(() => {
    if (open && selectedColumn) {
      // Check if we already have modified settings for this column
      if (modifiedColumnsMap[selectedColumn]) {
        setState(modifiedColumnsMap[selectedColumn]);
      } else {
        // Otherwise get from store
        const settings = gridStore.getColumnSettings(selectedColumn);
        
        if (settings) {
          setState(settings);
        } else {
          // If no settings, create default state
          setState(getDefaultSettings(selectedColumn));
        }
      }
    }
  }, [open, selectedColumn, modifiedColumnsMap, gridStore]);

  // Update section handlers
  const updateGeneral = (updates: Partial<ColumnSettingsState['general']>) => {
    if (!state) return;
    setState({
      ...state,
      general: {
        ...state.general,
        ...updates
      }
    });
  };

  const updateHeader = (updates: Partial<ColumnSettingsState['header']>) => {
    if (!state) return;
    setState({
      ...state,
      header: {
        ...state.header,
        ...updates
      }
    });
  };

  const updateCell = (updates: Partial<ColumnSettingsState['cell']>) => {
    if (!state) return;
    setState({
      ...state,
      cell: {
        ...state.cell,
        ...updates
      }
    });
  };

  // Function to check if state has changed from the original settings
  const hasStateChanged = useCallback(() => {
    if (!selectedColumn || !state) return false;
    
    const originalSettings = gridStore.getColumnSettings(selectedColumn);
    if (!originalSettings) return true; // If no original settings, any state represents a change
    
    // Deep comparison to see if there are real changes
    return JSON.stringify(originalSettings) !== JSON.stringify(state);
  }, [state, selectedColumn, gridStore]);

  // Handle apply changes with direct column API access - optimized for performance
  const handleApplyChanges = () => {
    if (!state) return;
    
    try {
      // First check if the current column needs to be added to the map
      const currentColChanged = hasStateChanged();
      
      // First save the current column's state to our map if it has changed
      if (selectedColumn && state && currentColChanged) {
        setModifiedColumnsMap(prev => ({
          ...prev,
          [selectedColumn]: JSON.parse(JSON.stringify(state))
        }));
      }
      
      // Get the gridApi from the store or window.__gridApi
      const api = gridStore.gridApi || ((typeof window !== 'undefined') ? (window as any).__gridApi : null);
      
      if (!api) {
        console.error('No grid API available to apply column settings');
        onOpenChange(false);
        return;
      }
      
      // Compile list of all columns to update
      const allColumnsToUpdate = {...modifiedColumnsMap};
      
      // Add the currently selected column if it's not already in the map
      if (selectedColumn && state && !allColumnsToUpdate[selectedColumn]) {
        allColumnsToUpdate[selectedColumn] = JSON.parse(JSON.stringify(state));
      }
      
      // Apply changes for all modified columns
      const columnIds = Object.keys(allColumnsToUpdate);
      console.log(`Applying changes to ${columnIds.length} columns:`, columnIds.join(', '));
      
      // Apply each column's settings
      for (const colId of columnIds) {
        const columnState = allColumnsToUpdate[colId];
        
        // Ensure style flags are explicit booleans for each column
        const sanitizedState = JSON.parse(JSON.stringify(columnState));
        sanitizedState.header.applyStyles = sanitizedState.header.applyStyles === true;
        sanitizedState.cell.applyStyles = sanitizedState.cell.applyStyles === true;
        
        // Save settings to grid store for each column
        gridStore.saveColumnSettings(colId, sanitizedState);
        
        // Apply settings using the store's optimized batch method
        gridStore.applyColumnSettings(colId);
      }
      
      // Reset the modified columns map
      setModifiedColumnsMap({});
      
      // Close the dialog immediately
      onOpenChange(false);
    } catch (error) {
      console.error('Error when applying column settings:', error);
      onOpenChange(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    const modifiedCount = Object.keys(modifiedColumnsMap).length;
    
    // Only show prompt if there are multiple columns modified
    let resetAllColumns = false;
    if (modifiedCount > 1) {
      resetAllColumns = window.confirm(`Reset settings for all ${modifiedCount} modified columns? Click Cancel to reset only the current column.`);
    }
    
    if (resetAllColumns) {
      // Reset the entire modified columns map
      setModifiedColumnsMap({});
      
      // Reset current column to original state
      if (open && selectedColumn) {
        const settings = gridStore.getColumnSettings(selectedColumn);
        
        if (settings) {
          setState(settings);
        } else {
          setState(getDefaultSettings(selectedColumn));
        }
      }
    } else {
      // Reset only the current column
      if (open && selectedColumn) {
        const settings = gridStore.getColumnSettings(selectedColumn);
        
        if (settings) {
          setState(settings);
        } else {
          setState(getDefaultSettings(selectedColumn));
        }
        
        // Also remove it from the modified columns map
        if (modifiedColumnsMap[selectedColumn]) {
          const newMap = {...modifiedColumnsMap};
          delete newMap[selectedColumn];
          setModifiedColumnsMap(newMap);
        }
      }
    }
  };

  // Don't render anything if state is not initialized yet
  if (!state) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-4 sm:p-5 bg-background rounded-xl shadow-lg border border-border/80"
        style={{ width: 800, minWidth: 800, maxWidth: 800, height: 840, maxHeight: 940, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-[20px] font-semibold text-foreground flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-primary"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h10M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Column Settings
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground mt-1">
            Configure display and behavior for this column
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-row min-h-0 flex-1">
          {/* Sidebar */}
          <ColumnList 
            columns={columnList}
            selectedColumn={selectedColumn}
            onSelectColumn={onSelectColumn}
            modifiedColumns={Object.keys(modifiedColumnsMap)}
          />
          
          {/* Main Content */}
          <div className="flex-1 pl-6 overflow-y-hidden" style={{ maxHeight: 740 }}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-2 gap-1 bg-card border border-border/80 rounded-lg p-1 h-9">
                <TabsTrigger value="general" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">General</TabsTrigger>
                <TabsTrigger value="header" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Header</TabsTrigger>
                <TabsTrigger value="cell" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Cell</TabsTrigger>
                <TabsTrigger value="filter" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Filter</TabsTrigger>
                <TabsTrigger value="editors" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Editors</TabsTrigger>
              </TabsList>
              
              {/* Tab Contents */}
              <TabsContent value="general" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <GeneralTab 
                  settings={state.general}
                  onUpdate={updateGeneral}
                />
              </TabsContent>
              
              <TabsContent value="header" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <HeaderTab 
                  settings={state.header}
                  onUpdate={updateHeader}
                />
              </TabsContent>
              
              <TabsContent value="cell" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <CellTab 
                  settings={state.cell}
                  onUpdate={updateCell}
                />
              </TabsContent>
              
              <TabsContent value="filter" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <FilterTab />
              </TabsContent>
              
              <TabsContent value="editors" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <EditorsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Footer: match Expression Editor dialog */}
        <div className="flex justify-between border-t border-border/80" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            
            {/* Show modified columns count */}
            {Object.keys(modifiedColumnsMap).length > 0 && (
              <span className="ml-3 text-sm text-muted-foreground">
                {Object.keys(modifiedColumnsMap).length} column{Object.keys(modifiedColumnsMap).length !== 1 ? 's' : ''} modified
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              className="h-8 px-5 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              onClick={handleApplyChanges}
              disabled={Object.keys(modifiedColumnsMap).length === 0 && !hasStateChanged()}
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};