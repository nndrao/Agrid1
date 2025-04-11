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
import { ColumnSettingsProps } from './types';
import { ColorPicker } from '../../Controls/ColorPicker';

const HeaderSettings: React.FC<ColumnSettingsProps> = ({ 
  column, 
  onColumnChange 
}) => {
  useEffect(() => {
    // Initialize header with default values if not already set
    if (!column.headerSettings) {
      onColumnChange({
        ...column,
        headerSettings: {
          text: column.headerName || column.field,
          tooltip: '',
          textAlign: 'left',
          background: '',
          textColor: '',
          bold: false,
          sortable: true,
          resizable: true,
          autoHeight: false,
          wrapText: false,
          filterButton: true,
          menuButton: true,
        }
      });
    }
  }, []);

  const handleHeaderChange = (field: string, value: any) => {
    onColumnChange({
      ...column,
      headerSettings: {
        ...column.headerSettings,
        [field]: value
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Header Display</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="header-text">Header Text</Label>
            <Input
              id="header-text"
              className="mt-1"
              value={column.headerSettings?.text || column.headerName || column.field || ''}
              onChange={(e) => {
                handleHeaderChange('text', e.target.value);
                // Also update the headerName property at the column level
                onColumnChange({
                  ...column,
                  headerName: e.target.value,
                  headerSettings: {
                    ...column.headerSettings,
                    text: e.target.value
                  }
                });
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="header-tooltip">Header Tooltip</Label>
            <Input
              id="header-tooltip"
              className="mt-1"
              value={column.headerSettings?.tooltip || ''}
              onChange={(e) => handleHeaderChange('tooltip', e.target.value)}
              placeholder="Tooltip shown on hover"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Header Alignment & Style</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="text-align">Text Alignment</Label>
            <Select
              value={column.headerSettings?.textAlign || 'left'}
              onValueChange={(value) => handleHeaderChange('textAlign', value)}
            >
              <SelectTrigger id="text-align" className="mt-1">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 mt-6">
            <Switch
              id="bold-text"
              checked={column.headerSettings?.bold || false}
              onCheckedChange={(checked) => handleHeaderChange('bold', checked)}
            />
            <Label htmlFor="bold-text">Bold Text</Label>
          </div>
          
          <div>
            <Label>Background Color</Label>
            <div className="mt-1">
              <ColorPicker
                color={column.headerSettings?.background || ''}
                onChange={(color) => handleHeaderChange('background', color)}
              />
            </div>
          </div>
          
          <div>
            <Label>Text Color</Label>
            <div className="mt-1">
              <ColorPicker
                color={column.headerSettings?.textColor || ''}
                onChange={(color) => handleHeaderChange('textColor', color)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Header Behavior</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="sortable"
              checked={column.headerSettings?.sortable ?? true}
              onCheckedChange={(checked) => {
                handleHeaderChange('sortable', checked);
                // Also update the sortable property at the column level
                onColumnChange({
                  ...column,
                  sortable: checked,
                  headerSettings: {
                    ...column.headerSettings,
                    sortable: checked
                  }
                });
              }}
            />
            <Label htmlFor="sortable">Sortable</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="resizable"
              checked={column.headerSettings?.resizable ?? true}
              onCheckedChange={(checked) => {
                handleHeaderChange('resizable', checked);
                // Also update the resizable property at the column level
                onColumnChange({
                  ...column,
                  resizable: checked,
                  headerSettings: {
                    ...column.headerSettings,
                    resizable: checked
                  }
                });
              }}
            />
            <Label htmlFor="resizable">Resizable</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="wrap-text"
              checked={column.headerSettings?.wrapText || false}
              onCheckedChange={(checked) => handleHeaderChange('wrapText', checked)}
            />
            <Label htmlFor="wrap-text">Wrap Text</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-height"
              checked={column.headerSettings?.autoHeight || false}
              onCheckedChange={(checked) => handleHeaderChange('autoHeight', checked)}
            />
            <Label htmlFor="auto-height">Auto Height</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="filter-button"
              checked={column.headerSettings?.filterButton ?? true}
              onCheckedChange={(checked) => handleHeaderChange('filterButton', checked)}
            />
            <Label htmlFor="filter-button">Show Filter Button</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="menu-button"
              checked={column.headerSettings?.menuButton ?? true}
              onCheckedChange={(checked) => handleHeaderChange('menuButton', checked)}
            />
            <Label htmlFor="menu-button">Show Menu Button</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSettings; 