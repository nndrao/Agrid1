import React, { useEffect } from 'react';
import {
  Label,
} from "@/components/ui/label";
import {
  Switch,
} from "@/components/ui/switch";
import {
  Input,
} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnSettingsProps } from './types';

const FilterSettings: React.FC<ColumnSettingsProps> = ({ 
  column, 
  onColumnChange 
}) => {
  useEffect(() => {
    // Initialize filter with default values if not already set
    if (!column.filter) {
      onColumnChange({
        ...column,
        filter: {
          enabled: true,
          filterType: getDefaultFilterType(column),
          buttons: ['apply', 'clear', 'reset', 'cancel'],
          debounceMs: 500,
          defaultFilter: null,
          filterParams: {}
        }
      });
    }
  }, []);

  const getDefaultFilterType = (col: any): string => {
    // Choose appropriate filter type based on column data type
    if (col.formatting?.type === 'number' || col.formatting?.type === 'currency' || col.formatting?.type === 'percentage') {
      return 'number';
    } else if (col.formatting?.type === 'date') {
      return 'date';
    } else if (col.formatting?.type === 'boolean') {
      return 'set';
    } else {
      return 'text';
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    // Handle nested property changes
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onColumnChange({
        ...column,
        filter: {
          ...column.filter,
          [parent]: {
            ...column.filter?.[parent],
            [child]: value
          }
        }
      });
    } else {
      // Handle top-level property changes
      onColumnChange({
        ...column,
        filter: {
          ...column.filter,
          [field]: value
        }
      });

      // If toggling filter enabled, also update filterable at column level
      if (field === 'enabled') {
        onColumnChange({
          ...column,
          filterable: value,
          filter: {
            ...column.filter,
            enabled: value
          }
        });
      }
    }
  };

  const handleButtonToggle = (button: string) => {
    const currentButtons = column.filter?.buttons || [];
    if (currentButtons.includes(button)) {
      // Remove button
      handleFilterChange('buttons', currentButtons.filter(b => b !== button));
    } else {
      // Add button
      handleFilterChange('buttons', [...currentButtons, button]);
    }
  };

  // Render filter-specific parameter fields
  const renderFilterTypeParams = () => {
    if (!column.filter) return null;
    
    const filterType = column.filter.filterType;
    
    switch (filterType) {
      case 'text':
        return (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                id="case-sensitive"
                checked={column.filter.filterParams?.caseSensitive || false}
                onCheckedChange={(checked) => handleFilterChange('filterParams.caseSensitive', checked)}
              />
              <Label htmlFor="case-sensitive">Case Sensitive</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="exact-match"
                checked={column.filter.filterParams?.exactMatch || false}
                onCheckedChange={(checked) => handleFilterChange('filterParams.exactMatch', checked)}
              />
              <Label htmlFor="exact-match">Exact Match</Label>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="default-text-option">Default Text Filter Option</Label>
              <Select
                value={column.filter.filterParams?.defaultOption || 'contains'}
                onValueChange={(value) => handleFilterChange('filterParams.defaultOption', value)}
              >
                <SelectTrigger id="default-text-option" className="mt-1">
                  <SelectValue placeholder="Select default option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="endsWith">Ends With</SelectItem>
                  <SelectItem value="notContains">Not Contains</SelectItem>
                  <SelectItem value="notEqual">Not Equal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
        
      case 'number':
        return (
          <>
            <div className="col-span-2">
              <Label htmlFor="default-number-option">Default Number Filter Option</Label>
              <Select
                value={column.filter.filterParams?.defaultOption || 'equals'}
                onValueChange={(value) => handleFilterChange('filterParams.defaultOption', value)}
              >
                <SelectTrigger id="default-number-option" className="mt-1">
                  <SelectValue placeholder="Select default option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="notEqual">Not Equal</SelectItem>
                  <SelectItem value="greaterThan">Greater Than</SelectItem>
                  <SelectItem value="greaterThanOrEqual">Greater Than or Equal</SelectItem>
                  <SelectItem value="lessThan">Less Than</SelectItem>
                  <SelectItem value="lessThanOrEqual">Less Than or Equal</SelectItem>
                  <SelectItem value="inRange">In Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="min-value">Min Value</Label>
              <Input
                id="min-value"
                className="mt-1"
                type="number"
                value={column.filter.filterParams?.min !== undefined ? column.filter.filterParams.min : ''}
                onChange={(e) => handleFilterChange('filterParams.min', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional minimum allowed value"
              />
            </div>
            
            <div>
              <Label htmlFor="max-value">Max Value</Label>
              <Input
                id="max-value"
                className="mt-1"
                type="number"
                value={column.filter.filterParams?.max !== undefined ? column.filter.filterParams.max : ''}
                onChange={(e) => handleFilterChange('filterParams.max', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional maximum allowed value"
              />
            </div>
          </>
        );
        
      case 'date':
        return (
          <>
            <div className="col-span-2">
              <Label htmlFor="default-date-option">Default Date Filter Option</Label>
              <Select
                value={column.filter.filterParams?.defaultOption || 'equals'}
                onValueChange={(value) => handleFilterChange('filterParams.defaultOption', value)}
              >
                <SelectTrigger id="default-date-option" className="mt-1">
                  <SelectValue placeholder="Select default option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="notEqual">Not Equal</SelectItem>
                  <SelectItem value="greaterThan">After</SelectItem>
                  <SelectItem value="lessThan">Before</SelectItem>
                  <SelectItem value="inRange">In Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-date-picker"
                checked={column.filter.filterParams?.showDatePicker || true}
                onCheckedChange={(checked) => handleFilterChange('filterParams.showDatePicker', checked)}
              />
              <Label htmlFor="show-date-picker">Show Date Picker</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="use-comparator"
                checked={column.filter.filterParams?.comparator || false}
                onCheckedChange={(checked) => handleFilterChange('filterParams.comparator', checked)}
              />
              <Label htmlFor="use-comparator">Use Custom Comparator</Label>
            </div>
          </>
        );
        
      case 'set':
        return (
          <>
            <div className="col-span-2">
              <Label htmlFor="filter-values">Values (comma separated)</Label>
              <Input
                id="filter-values"
                className="mt-1"
                value={column.filter.filterParams?.values?.join(', ') || ''}
                onChange={(e) => {
                  const valuesArray = e.target.value
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
                  
                  handleFilterChange('filterParams.values', valuesArray.length > 0 ? valuesArray : undefined);
                }}
                placeholder="Value1, Value2, Value3"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty to extract values from data
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="excel-mode"
                checked={column.filter.filterParams?.excelMode || false}
                onCheckedChange={(checked) => handleFilterChange('filterParams.excelMode', checked)}
              />
              <Label htmlFor="excel-mode">Excel-like Mode</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="hide-select-all"
                checked={column.filter.filterParams?.suppressSelectAll || false}
                onCheckedChange={(checked) => handleFilterChange('filterParams.suppressSelectAll', checked)}
              />
              <Label htmlFor="hide-select-all">Hide Select All</Label>
            </div>
          </>
        );
        
      default:
        return (
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">
              No additional parameters for this filter type.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Filter Settings</h3>
        
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-filtering"
              checked={column.filter?.enabled ?? true}
              onCheckedChange={(checked) => handleFilterChange('enabled', checked)}
            />
            <Label htmlFor="enable-filtering">Enable Filtering</Label>
          </div>
          
          {column.filter?.enabled && (
            <>
              <div>
                <Label htmlFor="filter-type">Filter Type</Label>
                <Select
                  value={column.filter?.filterType || 'text'}
                  onValueChange={(value) => handleFilterChange('filterType', value)}
                >
                  <SelectTrigger id="filter-type" className="mt-1">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Filter</SelectItem>
                    <SelectItem value="number">Number Filter</SelectItem>
                    <SelectItem value="date">Date Filter</SelectItem>
                    <SelectItem value="set">Set Filter</SelectItem>
                    <SelectItem value="custom">Custom Filter</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the appropriate filter type for this column
                </p>
              </div>
              
              {column.filter?.filterType === 'custom' && (
                <div>
                  <Label htmlFor="custom-filter">Custom Filter Component</Label>
                  <Input
                    id="custom-filter"
                    className="mt-1"
                    value={column.filter?.filterParams?.filterComponent || ''}
                    onChange={(e) => handleFilterChange('filterParams.filterComponent', e.target.value)}
                    placeholder="e.g., MyCustomFilter"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Name of your custom filter component
                  </p>
                </div>
              )}
              
              <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-medium mb-3">
                  Filter Type Specific Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {renderFilterTypeParams()}
                </div>
              </div>
              
              <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-medium mb-3">
                  Behavior Settings
                </h4>
              </div>
              
              <div>
                <Label htmlFor="debounce-ms">Debounce (ms)</Label>
                <Input
                  id="debounce-ms"
                  className="mt-1"
                  type="number"
                  value={column.filter?.debounceMs || 500}
                  onChange={(e) => handleFilterChange('debounceMs', Number(e.target.value))}
                  min={0}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Milliseconds to wait before filtering after typing
                </p>
              </div>
              
              <div>
                <Label>Filter Buttons</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['apply', 'clear', 'reset', 'cancel'].map(button => (
                    <Badge
                      key={button}
                      variant={column.filter?.buttons?.includes(button) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => handleButtonToggle(button)}
                    >
                      {button}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select which filter buttons to show
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="keep-filter-state"
                  checked={column.filter?.filterParams?.newRowsAction === 'keep' || false}
                  onCheckedChange={(checked) => handleFilterChange('filterParams.newRowsAction', checked ? 'keep' : 'clear')}
                />
                <Label htmlFor="keep-filter-state">Keep filter state when new rows are added</Label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSettings; 