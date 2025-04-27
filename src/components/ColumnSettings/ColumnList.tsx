import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColumnListProps {
  columns: string[];
  selectedColumn: string;
  onSelectColumn: (column: string) => void;
  modifiedColumns?: string[];
}

export const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  selectedColumn,
  onSelectColumn,
  modifiedColumns = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredColumns = columns.filter(col => 
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <aside className="w-[210px] pr-6 border-r border-border/80 bg-card/80 flex flex-col gap-0 pt-2 pb-2">
      <div className="px-3 pb-2">
        <Input
          placeholder="Search columns..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="h-8 text-[13px] bg-card border border-border/80 rounded placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {filteredColumns.map(col => (
          <Button
            key={col}
            variant={col === selectedColumn ? "secondary" : "ghost"}
            size="sm"
            className={`w-full justify-start gap-2 px-3 py-2 text-[13px] font-normal rounded-lg mb-1 ${col === selectedColumn ? 'font-semibold' : ''}`}
            type="button"
            onClick={() => {
              // This will trigger the useEffect in the parent that saves the current column state
              onSelectColumn(col);
            }}
          >
            <div className="flex items-center gap-2 min-w-[16px]">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground">
                <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {modifiedColumns.includes(col) && (
                <span className="h-2 w-2 rounded-full bg-blue-500 absolute ml-[10px] mt-[-8px]" title="Modified"></span>
              )}
            </div>
            <span className="truncate">
              {col}
              {modifiedColumns.includes(col) && " *"}
            </span>
          </Button>
        ))}
      </div>
    </aside>
  );
};
