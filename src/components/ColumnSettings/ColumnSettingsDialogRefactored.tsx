import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { ColumnList } from './ColumnList';
import { GeneralTab } from './tabs/GeneralTab';
import { HeaderTab } from './tabs/HeaderTab';
import { CellTab } from './tabs/CellTab';
import { FilterTab } from './tabs/FilterTab';
import { FormattersTab } from './tabs/FormattersTab';
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
  
  // Local state to use while editing
  const [state, setState] = useState<ColumnSettingsState | null>(null);

  // Load column settings from grid store when dialog opens or column changes
  useEffect(() => {
    if (open && selectedColumn) {
      // Get column settings from store
      const settings = gridStore.getColumnSettings(selectedColumn);
      
      if (settings) {
        console.log(`Loaded settings for column ${selectedColumn} from grid store`);
        setState(settings);
      } else {
        // If no settings, create default state with explicit boolean values
        console.log(`No settings found for column ${selectedColumn}, using defaults`);
        setState({
          general: {
            headerName: selectedColumn,
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
      }
    }
  }, [open, selectedColumn, gridStore]);

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

  // Handle apply changes with direct column API access - optimized for performance
  const handleApplyChanges = () => {
    if (!state || !selectedColumn) return;
    
    console.log('Applying changes to grid for column:', selectedColumn);
    
    try {
      // Create a clean copy of state and ensure all boolean values are explicit
      const sanitizedState = JSON.parse(JSON.stringify(state));
      
      // Ensure style flags are explicit booleans
      sanitizedState.header.applyStyles = sanitizedState.header.applyStyles === true;
      sanitizedState.cell.applyStyles = sanitizedState.cell.applyStyles === true;
      
      // Save settings to grid store
      console.log(`Saving sanitized settings for column ${selectedColumn} to store`);
      gridStore.saveColumnSettings(selectedColumn, sanitizedState);
      
      // Get the gridApi from the store or window.__gridApi
      const api = gridStore.gridApi || ((typeof window !== 'undefined') ? (window as any).__gridApi : null);
      
      if (!api) {
        console.error('No grid API available to apply column settings');
        onOpenChange(false);
        return;
      }
      
      // Apply settings using the store's optimized batch method
      console.log('Applying column settings using store method');
      gridStore.applyColumnSettings(selectedColumn);
      
      // Close the dialog immediately - no need for setTimeout
      onOpenChange(false);
    } catch (error) {
      console.error('Error when applying column settings:', error);
      onOpenChange(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    // Reset to original loaded settings or defaults
    if (open && selectedColumn) {
      const settings = gridStore.getColumnSettings(selectedColumn);
      
      if (settings) {
        setState(settings);
      } else {
        setState({
          general: {
            headerName: selectedColumn,
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
          />
          
          {/* Main Content */}
          <div className="flex-1 pl-6 overflow-y-hidden" style={{ maxHeight: 740 }}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-2 gap-1 bg-card border border-border/80 rounded-lg p-1 h-9">
                <TabsTrigger value="general" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">General</TabsTrigger>
                <TabsTrigger value="header" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Header</TabsTrigger>
                <TabsTrigger value="cell" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Cell</TabsTrigger>
                <TabsTrigger value="filter" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Filter</TabsTrigger>
                <TabsTrigger value="formatters" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">Formatters</TabsTrigger>
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
              
              <TabsContent value="formatters" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <FormattersTab />
              </TabsContent>
              
              <TabsContent value="editors" className="pt-1 overflow-y-auto" style={{ maxHeight: 680 }}>
                <EditorsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Footer: match Expression Editor dialog */}
        <div className="flex justify-between border-t border-border/80" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
          <Button 
            variant="outline" 
            className="h-8 px-5 text-[13px] border border-border/80 bg-card text-foreground hover:bg-accent hover:text-foreground" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
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
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};