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
import { Card } from "@/components/ui/card";
import { ColumnSettingsProps } from './types';
import { ColorPicker } from '../../Controls/ColorPicker';

const StyleSettings: React.FC<ColumnSettingsProps> = ({ 
  column, 
  onColumnChange 
}) => {
  useEffect(() => {
    // Initialize style with default values if not already set
    if (!column.style) {
      onColumnChange({
        ...column,
        style: {
          width: column.width || 200,
          minWidth: column.minWidth || 50,
          maxWidth: column.maxWidth || 1000,
          flex: 1,
          wrapText: false,
          autoHeight: false,
          resizable: true,
          alignContent: 'left',
          cellClass: '',
          cellStyle: {
            backgroundColor: '',
            color: '',
            fontWeight: 'normal',
            fontSize: '',
            padding: '',
            border: ''
          }
        }
      });
    }
  }, []);

  const handleStyleChange = (field: string, value: any) => {
    // Handle nested property changes
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onColumnChange({
        ...column,
        style: {
          ...column.style,
          [parent]: {
            ...column.style?.[parent],
            [child]: value
          }
        }
      });
    } else {
      // Handle top-level property changes
      onColumnChange({
        ...column,
        style: {
          ...column.style,
          [field]: value
        }
      });

      // Also update the column level properties if they match
      if (['width', 'minWidth', 'maxWidth', 'flex', 'resizable'].includes(field)) {
        onColumnChange({
          ...column,
          [field]: value,
          style: {
            ...column.style,
            [field]: value
          }
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Size & Layout</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              className="mt-1"
              type="number"
              value={column.style?.width || column.width || 200}
              onChange={(e) => handleStyleChange('width', Number(e.target.value))}
              min={20}
            />
          </div>
          
          <div>
            <Label htmlFor="flex">Flex Grow</Label>
            <Input
              id="flex"
              className="mt-1"
              type="number"
              value={column.style?.flex || 1}
              onChange={(e) => handleStyleChange('flex', Number(e.target.value))}
              min={0}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              0 for fixed width, &gt;0 for flexible width
            </p>
          </div>
          
          <div>
            <Label htmlFor="min-width">Min Width (px)</Label>
            <Input
              id="min-width"
              className="mt-1"
              type="number"
              value={column.style?.minWidth || column.minWidth || 50}
              onChange={(e) => handleStyleChange('minWidth', Number(e.target.value))}
              min={20}
            />
          </div>
          
          <div>
            <Label htmlFor="max-width">Max Width (px)</Label>
            <Input
              id="max-width"
              className="mt-1"
              type="number"
              value={column.style?.maxWidth || column.maxWidth || 1000}
              onChange={(e) => handleStyleChange('maxWidth', Number(e.target.value))}
              min={20}
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Cell Appearance</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="content-alignment">Content Alignment</Label>
            <Select
              value={column.style?.alignContent || 'left'}
              onValueChange={(value) => handleStyleChange('alignContent', value)}
            >
              <SelectTrigger id="content-alignment" className="mt-1">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="mt-1">
                <ColorPicker
                  color={column.style?.cellStyle?.backgroundColor || ''}
                  onChange={(color) => handleStyleChange('cellStyle.backgroundColor', color)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <div className="mt-1">
                <ColorPicker
                  color={column.style?.cellStyle?.color || ''}
                  onChange={(color) => handleStyleChange('cellStyle.color', color)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select
                value={column.style?.cellStyle?.fontWeight || 'normal'}
                onValueChange={(value) => handleStyleChange('cellStyle.fontWeight', value)}
              >
                <SelectTrigger id="font-weight" className="mt-1">
                  <SelectValue placeholder="Select font weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Lighter</SelectItem>
                  <SelectItem value="bolder">Bolder</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="300">300</SelectItem>
                  <SelectItem value="400">400</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="600">600</SelectItem>
                  <SelectItem value="700">700</SelectItem>
                  <SelectItem value="800">800</SelectItem>
                  <SelectItem value="900">900</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                className="mt-1"
                placeholder="e.g., 14px, 1rem"
                value={column.style?.cellStyle?.fontSize || ''}
                onChange={(e) => handleStyleChange('cellStyle.fontSize', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                className="mt-1"
                placeholder="e.g., 8px, 4px 8px"
                value={column.style?.cellStyle?.padding || ''}
                onChange={(e) => handleStyleChange('cellStyle.padding', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="border">Border</Label>
              <Input
                id="border"
                className="mt-1"
                placeholder="e.g., 1px solid #e0e0e0"
                value={column.style?.cellStyle?.border || ''}
                onChange={(e) => handleStyleChange('cellStyle.border', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="css-class">CSS Class</Label>
            <Input
              id="css-class"
              className="mt-1"
              value={column.style?.cellClass || ''}
              onChange={(e) => handleStyleChange('cellClass', e.target.value)}
              placeholder="Custom CSS class name"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Apply predefined styles via class name
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Cell Behavior</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="wrap-text"
              checked={column.style?.wrapText || false}
              onCheckedChange={(checked) => handleStyleChange('wrapText', checked)}
            />
            <Label htmlFor="wrap-text">Wrap Text</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-height"
              checked={column.style?.autoHeight || false}
              onCheckedChange={(checked) => handleStyleChange('autoHeight', checked)}
            />
            <Label htmlFor="auto-height">Auto Height</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="resizable"
              checked={column.style?.resizable ?? true}
              onCheckedChange={(checked) => {
                handleStyleChange('resizable', checked);
                // Also update the resizable property at the column level
                onColumnChange({
                  ...column,
                  resizable: checked,
                  style: {
                    ...column.style,
                    resizable: checked
                  }
                });
              }}
            />
            <Label htmlFor="resizable">Resizable</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Advanced Styling</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="cell-style-rules">Cell Style Rules (JSON)</Label>
            <textarea
              id="cell-style-rules"
              className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={column.style?.cellClassRules ? JSON.stringify(column.style.cellClassRules, null, 2) : ''}
              onChange={(e) => {
                try {
                  const rules = e.target.value ? JSON.parse(e.target.value) : {};
                  handleStyleChange('cellClassRules', rules);
                } catch (error) {
                  // Handle invalid JSON - could show an error message
                }
              }}
              placeholder='{"cell-success": "params.value > 100", "cell-error": "params.value < 0"}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              JSON object with class names as keys and expressions as values
            </p>
          </div>
        </div>
      </div>
      
      {/* Style Preview */}
      <Card 
        className="p-4 mt-4"
        style={{ 
          backgroundColor: column.style?.cellStyle?.backgroundColor || 'inherit',
          color: column.style?.cellStyle?.color || 'inherit',
          fontWeight: column.style?.cellStyle?.fontWeight || 'inherit',
          fontSize: column.style?.cellStyle?.fontSize || 'inherit',
          padding: column.style?.cellStyle?.padding || '8px',
          border: column.style?.cellStyle?.border || '1px solid #e0e0e0',
          textAlign: column.style?.alignContent === 'left' ? 'left' : 
                    column.style?.alignContent === 'center' ? 'center' : 
                    column.style?.alignContent === 'right' ? 'right' : 'left',
          whiteSpace: column.style?.wrapText ? 'normal' : 'nowrap',
        }}
      >
        <h4 className="text-sm font-medium mb-1">Style Preview</h4>
        <div>Sample cell content with applied styling</div>
      </Card>
    </div>
  );
};

export default StyleSettings; 