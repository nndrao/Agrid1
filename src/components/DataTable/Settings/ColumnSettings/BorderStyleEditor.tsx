import React from 'react';
import { SettingsItem } from './SettingsItem';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';

interface BorderStyle {
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color?: string;
}

interface BorderStyleEditorProps {
  value: BorderStyle;
  onChange: (value: BorderStyle) => void;
  className?: string;
}

export function BorderStyleEditor({ value, onChange, className }: BorderStyleEditorProps) {
  const handleChange = (side: string, key: string, newValue: any) => {
    onChange({
      ...value,
      [side]: {
        ...value[side as keyof typeof value],
        [key]: newValue
      }
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground">Top</h4>
          <SettingsItem label="Width">
            <Input
              type="number"
              value={value.top?.width}
              onChange={(e) => handleChange('top', 'width', parseInt(e.target.value))}
              className="w-[100px]"
              min={0}
            />
          </SettingsItem>
          <SettingsItem label="Style">
            <Select
              value={value.top?.style}
              onValueChange={(val) => handleChange('top', 'style', val)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>
          <SettingsItem label="Color">
            <ColorPicker
              color={value.top?.color}
              onChange={(color) => handleChange('top', 'color', color)}
            />
          </SettingsItem>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground">Right</h4>
          <SettingsItem label="Width">
            <Input
              type="number"
              value={value.right?.width}
              onChange={(e) => handleChange('right', 'width', parseInt(e.target.value))}
              className="w-[100px]"
              min={0}
            />
          </SettingsItem>
          <SettingsItem label="Style">
            <Select
              value={value.right?.style}
              onValueChange={(val) => handleChange('right', 'style', val)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>
          <SettingsItem label="Color">
            <ColorPicker
              color={value.right?.color}
              onChange={(color) => handleChange('right', 'color', color)}
            />
          </SettingsItem>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground">Bottom</h4>
          <SettingsItem label="Width">
            <Input
              type="number"
              value={value.bottom?.width}
              onChange={(e) => handleChange('bottom', 'width', parseInt(e.target.value))}
              className="w-[100px]"
              min={0}
            />
          </SettingsItem>
          <SettingsItem label="Style">
            <Select
              value={value.bottom?.style}
              onValueChange={(val) => handleChange('bottom', 'style', val)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>
          <SettingsItem label="Color">
            <ColorPicker
              color={value.bottom?.color}
              onChange={(color) => handleChange('bottom', 'color', color)}
            />
          </SettingsItem>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground">Left</h4>
          <SettingsItem label="Width">
            <Input
              type="number"
              value={value.left?.width}
              onChange={(e) => handleChange('left', 'width', parseInt(e.target.value))}
              className="w-[100px]"
              min={0}
            />
          </SettingsItem>
          <SettingsItem label="Style">
            <Select
              value={value.left?.style}
              onValueChange={(val) => handleChange('left', 'style', val)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>
          <SettingsItem label="Color">
            <ColorPicker
              color={value.left?.color}
              onChange={(color) => handleChange('left', 'color', color)}
            />
          </SettingsItem>
        </div>
      </div>
    </div>
  );
} 