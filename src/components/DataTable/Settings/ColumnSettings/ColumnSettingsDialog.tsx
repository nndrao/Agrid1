import { useEffect, useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgGridReact } from "ag-grid-react";

// Import our new components
import ColumnSettingsPanel from "./ColumnSettingsPanel";
import { ColumnState } from "./types";

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridRef: React.RefObject<AgGridReact>;
}

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  gridRef
}: ColumnSettingsDialogProps) {
  const [columns, setColumns] = useState<ColumnState[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredColumns, setFilteredColumns] = useState<ColumnState[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const initialColumnsRef = useRef<ColumnState[]>([]);

  // Initialize columns when dialog opens
  useEffect(() => {
    if (!open || !gridRef.current?.api) return;
    
    try {
      const api = gridRef.current.api;
      
      console.log('Loading columns into settings dialog');
      console.log('API available:', !!api);
      
      // Get column definitions directly from the API
      const columnDefs = api.getColumnDefs() || [];
      console.log('Column definitions from API:', columnDefs);
      
      if (!columnDefs || columnDefs.length === 0) {
        console.warn('No column definitions found');
        return;
      }
      
      // Map column definitions to our internal state format
      const columnsState: ColumnState[] = columnDefs.map((colDef: any) => {
        const field = colDef.field || colDef.colId;
        
        return {
          field,
          headerName: colDef.headerName || field,
          width: colDef.width || 200,
          hide: colDef.hide || false,
          pinned: colDef.pinned || null,
          sort: colDef.sort || null,
          filter: colDef.filter !== false,
          sortable: colDef.sortable !== false,
          resizable: colDef.resizable !== false,
          // Include custom properties
          headerSettings: colDef.headerSettings,
          formatting: colDef.formatting,
          style: colDef.style,
          components: colDef.components
        };
      });
      
      console.log('Processed column state:', columnsState);
      
      setColumns(columnsState);
      setFilteredColumns(columnsState);
      
      // Select the first column by default if none selected
      if (columnsState.length > 0 && !selectedColumn) {
        setSelectedColumn(columnsState[0].field);
      }
      
      initialColumnsRef.current = JSON.parse(JSON.stringify(columnsState));
      setHasChanges(false);
    } catch (error) {
      console.error('Error initializing columns:', error);
    }
  }, [open, gridRef, selectedColumn]);

  // Filter columns when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredColumns(columns);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = columns.filter(col => 
      col.field.toLowerCase().includes(query) || 
      (col.headerName?.toLowerCase() || "").includes(query)
    );
    
    setFilteredColumns(filtered);
  }, [searchQuery, columns]);

  // Update column configuration
  const handleColumnChange = (updatedColumn: ColumnState) => {
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(col => {
        if (col.field === updatedColumn.field) {
          return updatedColumn;
        }
        return col;
      });
      setHasChanges(true);
      return newColumns;
    });
  };

  // Apply changes to the grid
  const applyChanges = () => {
    if (!gridRef.current?.api) return;
    
    try {
      const api = gridRef.current.api;
      
      // Get current column definitions
      const currentColumnDefs = api.getColumnDefs() || [];
      
      // Update column definitions with our changes
      const updatedColumnDefs = currentColumnDefs.map((colDef: any) => {
        // Find our updated column state
        const updatedCol = columns.find(
          col => col.field === colDef.field || col.field === colDef.colId
        );
        
        if (updatedCol) {
          return {
            ...colDef,
            headerName: updatedCol.headerName,
            hide: updatedCol.hide,
            pinned: updatedCol.pinned,
            width: updatedCol.width,
            filter: updatedCol.filter,
            sortable: updatedCol.sortable,
            resizable: updatedCol.resizable,
            // Include our custom properties
            headerSettings: updatedCol.headerSettings,
            formatting: updatedCol.formatting,
            style: updatedCol.style,
            components: updatedCol.components
          };
        }
        return colDef;
      });
      
      // Apply updated column definitions to the grid
      api.setColumnDefs(updatedColumnDefs);
      
      // Refresh the grid
      api.refreshHeader();
      api.refreshCells({ force: true });
      
      setHasChanges(false);
      onOpenChange(false);
      
      console.log('Applied column changes to grid');
    } catch (error) {
      console.error('Error applying column changes:', error);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (confirmClose) {
        setColumns(initialColumnsRef.current);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  // Reset to grid state
  const resetChanges = () => {
    setColumns(initialColumnsRef.current);
    setHasChanges(false);
  };

  // Get the selected column data
  const selectedColumnData = useMemo(() => {
    if (!selectedColumn) return null;
    
    const found = columns.find(col => col.field === selectedColumn);
    console.log('Selected column data:', found);
    return found || null;
  }, [columns, selectedColumn]);

  // Handle column selection
  const handleSelectColumn = (field: string) => {
    console.log('Selecting column:', field);
    setSelectedColumn(field);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Column Settings</DialogTitle>
          <DialogDescription>
            Configure and manage grid columns. Changes will be applied when you save.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-[600px] overflow-hidden">
          {/* Column List */}
          <div className="w-[250px] border-r">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search columns..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(600px-70px)]">
              <div className="p-2">
                {filteredColumns.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No columns found
                  </div>
                ) : (
                  filteredColumns.map((col) => (
                    <div
                      key={col.field}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent",
                        selectedColumn === col.field && "bg-accent"
                      )}
                      onClick={() => handleSelectColumn(col.field)}
                    >
                      <div className="flex items-center">
                        <div className="font-medium">{col.headerName || col.field}</div>
                      </div>
                      
                      {col.hide && (
                        <Badge variant="outline" className="ml-2">Hidden</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Column Settings */}
          <div className="flex-1 overflow-auto">
            {selectedColumnData ? (
              <ColumnSettingsPanel
                column={selectedColumnData}
                onColumnChange={handleColumnChange}
              />
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                {columns.length === 0 ? 
                  "No columns available in the grid" : 
                  "Select a column to edit its settings"}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="p-3 border-t flex justify-between">
          <div>
            <Button variant="outline" onClick={resetChanges} disabled={!hasChanges}>
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={applyChanges} 
              disabled={!hasChanges}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}