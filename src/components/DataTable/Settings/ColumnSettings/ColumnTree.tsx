import { useState } from "react";
import { ChevronDown, ChevronRight, GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnDefinition, ColumnState } from "./types";

interface ColumnTreeProps {
  columns: ColumnDefinition[];
  columnStates: Record<string, ColumnState>;
  selectedColumn: string | null;
  onColumnSelect: (columnId: string) => void;
  onColumnStateChange: (columnId: string, changes: Partial<ColumnState>) => void;
}

export function ColumnTree({
  columns,
  columnStates,
  selectedColumn,
  onColumnSelect,
  onColumnStateChange,
}: ColumnTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const renderColumn = (column: ColumnDefinition, level = 0) => {
    if (column.hidden) return null;
    
    const isGroup = column.children && column.children.length > 0;
    const isExpanded = expandedGroups.has(column.id);
    const state = columnStates[column.id];

    if (!state) return null;

    return (
      <div key={column.id}>
        <div
          className={cn(
            "group flex items-center px-2 py-1.5 gap-1.5 select-none",
            selectedColumn === column.id && "bg-accent text-accent-foreground",
            "hover:bg-accent/50 cursor-pointer"
          )}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
          onClick={() => onColumnSelect(column.id)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100" />
          
          {isGroup ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroup(column.id);
              }}
              className="h-4 w-4 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onColumnStateChange(column.id, { visible: !state.visible });
            }}
            className={cn(
              "h-4 w-4 flex items-center justify-center",
              state.visible ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {state.visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </button>

          <span className="text-sm truncate flex-1">
            {state.headerName || column.field}
          </span>
        </div>

        {isGroup && isExpanded && (
          <div>
            {column.children.map((child) => renderColumn(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {columns.map((column) => renderColumn(column))}
    </div>
  );
}