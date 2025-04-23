import { Search, Eye, EyeOff, GripVertical, ChevronRight, PanelRight, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ColumnState } from "./types";

interface ColumnListProps {
  columns: ColumnState[];
  selectedColumn: string | null;
  onSelectColumn: (field: string) => void;
  onToggleVisibility: (field: string, hide: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ColumnList({
  columns,
  selectedColumn,
  onSelectColumn,
  onToggleVisibility,
  searchQuery,
  onSearchChange
}: ColumnListProps) {
  const [filteredColumns, setFilteredColumns] = useState<ColumnState[]>(columns);
  
  // Filter columns when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredColumns(columns);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = columns.filter(col => 
      col.field.toLowerCase().includes(query) || 
      (col.headerName && col.headerName.toLowerCase().includes(query))
    );
    
    setFilteredColumns(filtered);
  }, [searchQuery, columns]);

  return (
    <div className="border-r w-[280px] flex flex-col">
      <div className="p-3 border-b bg-muted/20">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search columns..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredColumns.map((column) => (
            <div
              key={column.field}
              className={cn(
                "group flex items-center px-2 py-1.5 rounded-md cursor-pointer text-sm",
                selectedColumn === column.field && "bg-accent text-accent-foreground",
                selectedColumn !== column.field && "hover:bg-accent/50"
              )}
              onClick={() => onSelectColumn(column.field)}
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <GripVertical className="h-4 w-4 text-muted-foreground/70 opacity-0 group-hover:opacity-100" />
                <span className="truncate flex-1">{column.headerName || column.field}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {column.pinned && (
                  <Badge variant="outline" className="px-1 h-5">
                    <PanelRight className="h-3 w-3" />
                  </Badge>
                )}
                
                {column.sort && (
                  <Badge variant="outline" className="px-1 h-5">
                    <ArrowUpDown className="h-3 w-3" />
                  </Badge>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(column.field, !column.hide);
                  }}
                  className={cn(
                    "h-6 w-6 rounded-sm inline-flex items-center justify-center",
                    column.hide ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {column.hide ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
          
          {filteredColumns.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              No columns match your search
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-muted/20">
        <div className="text-xs text-muted-foreground">
          {filteredColumns.length} of {columns.length} columns
        </div>
      </div>
    </div>
  );
} 