import React from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSettingsProps, FilterSettings } from './types';

export function FilterSettings({ column, onColumnChange }: ColumnSettingsProps) {
  const filter = column.filter || { enabled: false };

  const handleFilterChange = (key: string, value: any) => {
    onColumnChange({
      ...column,
      filter: {
        ...filter,
        [key]: value
      }
    });
  };

  return (
    <SettingsSection title="Filter">
      <SettingsItem label="Enable Filter">
        <Switch
          checked={filter.enabled}
          onCheckedChange={(checked) => handleFilterChange('enabled', checked)}
        />
      </SettingsItem>

      {filter.enabled && (
        <>
          <SettingsItem label="Filter Type">
            <Select
              value={filter.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>

          {filter.type === 'text' && (
            <>
              <SettingsItem label="Case Sensitive">
                <Switch
                  checked={filter.options?.caseSensitive}
                  onCheckedChange={(checked) => handleFilterChange('options', { ...filter.options, caseSensitive: checked })}
                />
              </SettingsItem>
              <SettingsItem label="Include Blanks">
                <Switch
                  checked={filter.options?.includeBlanks}
                  onCheckedChange={(checked) => handleFilterChange('options', { ...filter.options, includeBlanks: checked })}
                />
              </SettingsItem>
              <SettingsItem label="Filter Type">
                <Select
                  value={filter.options?.filterType}
                  onValueChange={(value) => handleFilterChange('options', { ...filter.options, filterType: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="startsWith">Starts With</SelectItem>
                    <SelectItem value="endsWith">Ends With</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsItem>
            </>
          )}
        </>
      )}
    </SettingsSection>
  );
} 