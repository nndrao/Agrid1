import { useState } from 'react';
import { Columns, Search, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeBlock } from '@/components/ui/code-block';
import { cn } from '@/lib/utils';

interface ColumnSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  columns: any[]; // Column definitions from AG Grid
  onApply: (updatedColumns: any[]) => void;
}

export function ColumnSettingsDialog({
  open,
  onClose,
  columns,
  onApply,
}: ColumnSettingsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [editedColumns, setEditedColumns] = useState<any[]>([...columns]);
  
  // Filter columns based on search term
  const filteredColumns = columns.filter(column => 
    (column.headerName || column.field || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Get selected column from edited columns array
  const selectedColumnIndex = editedColumns.findIndex(col => col.field === selectedColumnId);
  const selectedColumn = selectedColumnIndex >= 0 ? editedColumns[selectedColumnIndex] : null;
  
  // Update a specific property of the selected column
  const updateColumnProperty = (property: string, value: any) => {
    if (selectedColumnIndex === -1) return;
    
    setEditedColumns(prev => {
      const updated = [...prev];
      updated[selectedColumnIndex] = {
        ...updated[selectedColumnIndex],
        [property]: value
      };
      return updated;
    });
  };

  // Apply changes to the grid
  const handleApply = () => {
    onApply(editedColumns);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[1200px] h-[900px]" style={{ maxWidth: "1200px", maxHeight: "900px" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Columns className="h-5 w-5 mr-2" />
            Column Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[750px] border rounded-md overflow-hidden">
          {/* Available Columns Sidebar */}
          <div className="w-[250px] border-r flex flex-col bg-muted/30">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredColumns.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No columns match your search
                  </div>
                ) : (
                  filteredColumns.map((column) => (
                    <div
                      key={column.field}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        selectedColumnId === column.field && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => setSelectedColumnId(column.field)}
                    >
                      <span className="truncate">
                        {column.headerName || column.field}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-4">
            {selectedColumn ? (
              <div className="h-full flex flex-col">
                <h3 className="font-medium text-lg mb-4">{selectedColumn.headerName || selectedColumn.field}</h3>
                
                <div className="flex-1 flex flex-col">
                  <div className="border-b pb-2 mb-4">
                    <div className="flex space-x-4">
                      {['General', 'Header', 'Cell', 'Value Formatters', 'Editors'].map((tab) => {
                        const value = tab.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <button
                            key={value}
                            className={cn(
                              "px-3 py-2 text-sm font-medium rounded-md",
                              activeTab === value 
                                ? "bg-primary text-primary-foreground" 
                                : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={() => setActiveTab(value)}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex-1 border rounded-md p-4 bg-muted/10 overflow-auto">
                    {activeTab === 'general' && (
                      <div className="space-y-4 pb-12">
                        {/* Top section with key details */}
                        <div className="bg-card rounded-md border p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium">{selectedColumn?.headerName || selectedColumn?.field}</h3>
                              <p className="text-sm text-muted-foreground font-mono">{selectedColumn?.field}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center border rounded-md px-2 py-1 text-xs bg-muted/30">
                                <span className="font-medium mr-1">Type:</span> 
                                {selectedColumn?.type || 'Default'}
                              </div>
                              <div className="flex items-center border rounded-md px-2 py-1 text-xs bg-muted/30">
                                <span className="font-medium mr-1">Width:</span> 
                                {selectedColumn?.width || 'Auto'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main form section */}
                        <div className="grid md:grid-cols-12 gap-x-4 gap-y-3 bg-card rounded-md border p-4 shadow-sm mb-2">
                          {/* Left section - Main properties */}
                          <div className="md:col-span-7 space-y-4">
                            <h4 className="text-sm font-semibold border-b pb-1">Display Properties</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {/* Column Header */}
                              <div className="space-y-1">
                                <Label htmlFor="headerName" className="text-xs">Header Name</Label>
                                <Input
                                  id="headerName"
                                  size={1}
                                  value={selectedColumn?.headerName || ''}
                                  onChange={(e) => updateColumnProperty('headerName', e.target.value)}
                                  className="h-8"
                                />
                              </div>

                              {/* Column Width */}
                              <div className="space-y-1">
                                <Label htmlFor="width" className="text-xs">Width (px)</Label>
                                <Input
                                  id="width"
                                  type="number"
                                  value={selectedColumn?.width || ''}
                                  onChange={(e) => updateColumnProperty('width', parseInt(e.target.value, 10) || '')}
                                  className="h-8"
                                />
                              </div>

                              {/* Column Type */}
                              <div className="space-y-1">
                                <Label htmlFor="colType" className="text-xs">Column Type</Label>
                                <Select
                                  value={selectedColumn?.type || 'default'}
                                  onValueChange={(value) => updateColumnProperty('type', value === 'default' ? null : value)}
                                >
                                  <SelectTrigger id="colType" className="h-8">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="customNumeric">Numeric</SelectItem>
                                    <SelectItem value="customDate">Date</SelectItem>
                                    <SelectItem value="rightAligned">Right Aligned</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Pin Column */}
                              <div className="space-y-1">
                                <Label htmlFor="pinned" className="text-xs">Pinned Position</Label>
                                <Select
                                  value={selectedColumn?.pinned || 'none'}
                                  onValueChange={(value) => updateColumnProperty('pinned', value === 'none' ? null : value)}
                                >
                                  <SelectTrigger id="pinned" className="h-8">
                                    <SelectValue placeholder="Not pinned" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Not pinned</SelectItem>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <h4 className="text-sm font-semibold border-b pb-1 pt-2">Filter Settings</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {/* Column Filter */}
                              <div className="space-y-1">
                                <Label htmlFor="filter" className="text-xs">Filter</Label>
                                <Select
                                  value={selectedColumn?.filter?.toString() || 'true'}
                                  onValueChange={(value) => updateColumnProperty('filter', value === 'true')}
                                >
                                  <SelectTrigger id="filter" className="h-8">
                                    <SelectValue placeholder="Enable filter" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">Enabled</SelectItem>
                                    <SelectItem value="false">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Filter Type */}
                              <div className="space-y-1">
                                <Label htmlFor="filterType" className="text-xs">Filter Type</Label>
                                <Select
                                  value={selectedColumn?.filterType || 'auto'}
                                  onValueChange={(value) => updateColumnProperty('filterType', value === 'auto' ? null : value)}
                                  disabled={!selectedColumn?.filter}
                                >
                                  <SelectTrigger id="filterType" className="h-8">
                                    <SelectValue placeholder="Auto (based on type)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="agTextColumnFilter">Text</SelectItem>
                                    <SelectItem value="agNumberColumnFilter">Number</SelectItem>
                                    <SelectItem value="agDateColumnFilter">Date</SelectItem>
                                    <SelectItem value="agSetColumnFilter">Set</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right section - Toggle properties */}
                          <div className="md:col-span-5 space-y-4 md:border-l md:pl-4">
                            <h4 className="text-sm font-semibold border-b pb-1">Behavior Settings</h4>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {/* Sortable */}
                              <div className="flex items-center justify-between py-1 border-b border-dashed border-muted">
                                <Label htmlFor="sortable" className="cursor-pointer">Sortable</Label>
                                <Switch 
                                  id="sortable" 
                                  checked={selectedColumn?.sortable !== false}
                                  onCheckedChange={(checked) => 
                                    updateColumnProperty('sortable', checked)
                                  }
                                />
                              </div>

                              {/* Resizable */}
                              <div className="flex items-center justify-between py-1 border-b border-dashed border-muted">
                                <Label htmlFor="resizable" className="cursor-pointer">Resizable</Label>
                                <Switch 
                                  id="resizable" 
                                  checked={selectedColumn?.resizable !== false}
                                  onCheckedChange={(checked) => 
                                    updateColumnProperty('resizable', checked)
                                  }
                                />
                              </div>

                              {/* Hide */}
                              <div className="flex items-center justify-between py-1 border-b border-dashed border-muted">
                                <Label htmlFor="hide" className="cursor-pointer">Hidden</Label>
                                <Switch 
                                  id="hide" 
                                  checked={selectedColumn?.hide === true}
                                  onCheckedChange={(checked) => 
                                    updateColumnProperty('hide', checked)
                                  }
                                />
                              </div>

                              {/* Editable */}
                              <div className="flex items-center justify-between py-1 border-b border-dashed border-muted">
                                <Label htmlFor="editable" className="cursor-pointer">Editable</Label>
                                <Switch 
                                  id="editable" 
                                  checked={selectedColumn?.editable !== false}
                                  onCheckedChange={(checked) => 
                                    updateColumnProperty('editable', checked)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Spacer div to ensure content doesn't stick to bottom */}
                        <div className="h-8"></div>
                      </div>
                    )}
                    
                    {activeTab === 'header' && (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Header settings will be implemented here
                      </div>
                    )}
                    
                    {activeTab === 'cell' && (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Cell settings will be implemented here
                      </div>
                    )}
                    
                    {activeTab === 'value-formatters' && (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Value formatter settings will be implemented here
                      </div>
                    )}
                    
                    {activeTab === 'editors' && (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Editor settings will be implemented here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a column from the sidebar to edit its properties</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}