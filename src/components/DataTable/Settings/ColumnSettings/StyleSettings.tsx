import React from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettingsProps, StyleSettings } from './types';
import { ColorPicker } from '@/components/ui/color-picker';

export function StyleSettings({ column, onColumnChange }: ColumnSettingsProps) {
  const style = column.style || {};

  const handleStyleChange = (key: string, value: any) => {
    onColumnChange({
      ...column,
      style: {
        ...style,
        [key]: value
      }
    });
  };

  return (
    <SettingsSection title="Style">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground">Header</h4>
          <SettingsItem label="Background Color">
            <ColorPicker
              color={style.header?.backgroundColor}
              onChange={(color) => handleStyleChange('header', { ...style.header, backgroundColor: color })}
            />
          </SettingsItem>
          <SettingsItem label="Text Color">
            <ColorPicker
              color={style.header?.textColor}
              onChange={(color) => handleStyleChange('header', { ...style.header, textColor: color })}
            />
          </SettingsItem>
          <SettingsItem label="Font Size">
            <Input
              type="number"
              value={style.header?.fontSize}
              onChange={(e) => handleStyleChange('header', { ...style.header, fontSize: parseInt(e.target.value) })}
              className="w-[180px]"
            />
          </SettingsItem>
          <SettingsItem label="Font Weight">
            <Select
              value={style.header?.fontWeight?.toString()}
              onValueChange={(value) => handleStyleChange('header', { ...style.header, fontWeight: parseInt(value) })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground">Cell</h4>
          <SettingsItem label="Background Color">
            <ColorPicker
              color={style.cell?.backgroundColor}
              onChange={(color) => handleStyleChange('cell', { ...style.cell, backgroundColor: color })}
            />
          </SettingsItem>
          <SettingsItem label="Text Color">
            <ColorPicker
              color={style.cell?.textColor}
              onChange={(color) => handleStyleChange('cell', { ...style.cell, textColor: color })}
            />
          </SettingsItem>
          <SettingsItem label="Font Size">
            <Input
              type="number"
              value={style.cell?.fontSize}
              onChange={(e) => handleStyleChange('cell', { ...style.cell, fontSize: parseInt(e.target.value) })}
              className="w-[180px]"
            />
          </SettingsItem>
        </div>
      </div>
    </SettingsSection>
  );
} 