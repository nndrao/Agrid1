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
import { Textarea } from "@/components/ui/textarea";
import { ColumnSettingsProps } from './types';

const ComponentSettings: React.FC<ColumnSettingsProps> = ({ 
  column, 
  onColumnChange 
}) => {
  useEffect(() => {
    // Initialize component configurations with default values if not already set
    if (!column.components) {
      onColumnChange({
        ...column,
        components: {
          cellRenderer: '',
          cellRendererParams: {},
          cellEditor: '',
          cellEditorParams: {},
          enableCellChangeFlash: true,
          tooltipComponent: null,
          tooltipText: ''
        }
      });
    }
  }, []);

  const handleComponentChange = (field: string, value: any) => {
    // Handle nested property changes
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onColumnChange({
        ...column,
        components: {
          ...column.components,
          [parent]: {
            ...column.components?.[parent],
            [child]: value
          }
        }
      });
    } else {
      // Handle top-level property changes
      onColumnChange({
        ...column,
        components: {
          ...column.components,
          [field]: value
        }
      });
    }
  };

  const handleParamsChange = (type: 'renderer' | 'editor', value: string) => {
    try {
      // Attempt to parse JSON
      const params = value ? JSON.parse(value) : {};
      
      // Update the appropriate params object
      if (type === 'renderer') {
        handleComponentChange('cellRendererParams', params);
      } else {
        handleComponentChange('cellEditorParams', params);
      }
    } catch (error) {
      // Handle invalid JSON - could display an error message
      console.error(`Invalid JSON in ${type} params:`, error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Cell Rendering</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="cell-renderer">Cell Renderer</Label>
            <Select
              value={column.components?.cellRenderer || ''}
              onValueChange={(value) => handleComponentChange('cellRenderer', value)}
            >
              <SelectTrigger id="cell-renderer" className="mt-1">
                <SelectValue placeholder="Select cell renderer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="agAnimateShowChangeCellRenderer">Animate Changes</SelectItem>
                <SelectItem value="agGroupCellRenderer">Group Cell</SelectItem>
                <SelectItem value="agSparklineCellRenderer">Sparkline</SelectItem>
                <SelectItem value="CustomCellRenderer">Custom Renderer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Component used to render the cell content
            </p>
          </div>
          
          {column.components?.cellRenderer && (
            <div>
              <Label htmlFor="cell-renderer-params">Cell Renderer Parameters (JSON)</Label>
              <Textarea
                id="cell-renderer-params"
                className="mt-1"
                rows={4}
                value={JSON.stringify(column.components?.cellRendererParams || {}, null, 2)}
                onChange={(e) => handleParamsChange('renderer', e.target.value)}
                placeholder='{"example": "value"}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Parameters passed to the cell renderer component (JSON format)
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="flash-cell"
              checked={column.components?.enableCellChangeFlash || false}
              onCheckedChange={(checked) => handleComponentChange('enableCellChangeFlash', checked)}
            />
            <Label htmlFor="flash-cell">Flash Cell on Change</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Cell Editing</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="cell-editor">Cell Editor</Label>
            <Select
              value={column.components?.cellEditor || ''}
              onValueChange={(value) => handleComponentChange('cellEditor', value)}
            >
              <SelectTrigger id="cell-editor" className="mt-1">
                <SelectValue placeholder="Select cell editor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="agTextCellEditor">Text Editor</SelectItem>
                <SelectItem value="agSelectCellEditor">Select Editor</SelectItem>
                <SelectItem value="agNumberCellEditor">Number Editor</SelectItem>
                <SelectItem value="agDateCellEditor">Date Editor</SelectItem>
                <SelectItem value="agLargeTextCellEditor">Large Text Editor</SelectItem>
                <SelectItem value="CustomCellEditor">Custom Editor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Component used for editing cell values
            </p>
          </div>
          
          {column.components?.cellEditor && (
            <div>
              <Label htmlFor="cell-editor-params">Cell Editor Parameters (JSON)</Label>
              <Textarea
                id="cell-editor-params"
                className="mt-1"
                rows={4}
                value={JSON.stringify(column.components?.cellEditorParams || {}, null, 2)}
                onChange={(e) => handleParamsChange('editor', e.target.value)}
                placeholder='{"example": "value"}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Parameters passed to the cell editor component (JSON format)
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Tooltips</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="tooltip-text">Default Tooltip Text</Label>
            <Input
              id="tooltip-text"
              className="mt-1"
              value={column.components?.tooltipText || ''}
              onChange={(e) => handleComponentChange('tooltipText', e.target.value)}
              placeholder="Tooltip displayed on hover"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to show cell value as tooltip
            </p>
          </div>
          
          <div>
            <Label htmlFor="tooltip-component">Custom Tooltip Component</Label>
            <Select
              value={column.components?.tooltipComponent || ''}
              onValueChange={(value) => handleComponentChange('tooltipComponent', value)}
            >
              <SelectTrigger id="tooltip-component" className="mt-1">
                <SelectValue placeholder="Select tooltip component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="CustomTooltip">Custom Tooltip</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to use the default tooltip
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Custom Components</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="custom-component">Custom Component Name</Label>
            <Input
              id="custom-component"
              className="mt-1"
              value={column.components?.customComponent || ''}
              onChange={(e) => handleComponentChange('customComponent', e.target.value)}
              placeholder="MyCustomComponent"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Name of a custom component registered with the grid
            </p>
          </div>
          
          <div>
            <Label htmlFor="custom-component-params">Custom Component Parameters (JSON)</Label>
            <Textarea
              id="custom-component-params"
              className="mt-1"
              rows={4}
              value={JSON.stringify(column.components?.customComponentParams || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = e.target.value ? JSON.parse(e.target.value) : {};
                  handleComponentChange('customComponentParams', params);
                } catch (error) {
                  // Handle invalid JSON
                }
              }}
              placeholder='{"example": "value"}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              Parameters passed to the custom component (JSON format)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentSettings; 