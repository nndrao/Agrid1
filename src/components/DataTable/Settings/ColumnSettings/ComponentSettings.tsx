import React from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettingsProps, ComponentSettings } from './types';

export function ComponentSettings({ column, onColumnChange }: ColumnSettingsProps) {
  const components = column.components || {};

  const handleComponentChange = (key: string, value: string) => {
    onColumnChange({
      ...column,
      components: {
        ...components,
        [key]: value
      }
    });
  };

  return (
    <SettingsSection title="Components">
      <SettingsItem label="Cell Renderer">
        <Select
          value={components.cellRenderer}
          onValueChange={(value) => handleComponentChange('cellRenderer', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select renderer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agAnimateShowChangeCellRenderer">Animate Change</SelectItem>
            <SelectItem value="agAnimateSlideCellRenderer">Slide</SelectItem>
            <SelectItem value="agGroupCellRenderer">Group</SelectItem>
            <SelectItem value="agCheckboxCellRenderer">Checkbox</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <SettingsItem label="Cell Editor">
        <Select
          value={components.cellEditor}
          onValueChange={(value) => handleComponentChange('cellEditor', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select editor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agTextCellEditor">Text</SelectItem>
            <SelectItem value="agNumberCellEditor">Number</SelectItem>
            <SelectItem value="agDateCellEditor">Date</SelectItem>
            <SelectItem value="agSelectCellEditor">Select</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <SettingsItem label="Header Component">
        <Select
          value={components.headerComponent}
          onValueChange={(value) => handleComponentChange('headerComponent', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select header" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agColumnHeader">Default</SelectItem>
            <SelectItem value="agColumnHeaderGroup">Group</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <SettingsItem label="Filter Component">
        <Select
          value={components.filterComponent}
          onValueChange={(value) => handleComponentChange('filterComponent', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agTextColumnFilter">Text</SelectItem>
            <SelectItem value="agNumberColumnFilter">Number</SelectItem>
            <SelectItem value="agDateColumnFilter">Date</SelectItem>
            <SelectItem value="agSetColumnFilter">Set</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>
    </SettingsSection>
  );
} 