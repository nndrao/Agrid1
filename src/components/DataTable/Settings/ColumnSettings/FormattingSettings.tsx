import React from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ColumnSettingsProps, FormattingSettings } from './types';

export function FormattingSettings({ column, onColumnChange }: ColumnSettingsProps) {
  const formatting = column.formatting || { type: 'text' };

  const handleFormattingChange = (key: string, value: any) => {
    onColumnChange({
      ...column,
      formatting: {
        ...formatting,
        [key]: value
      }
    });
  };

  return (
    <SettingsSection title="Formatting">
      <SettingsItem label="Type">
        <Select
          value={formatting.type}
          onValueChange={(value) => handleFormattingChange('type', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="currency">Currency</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      {formatting.type === 'text' && (
        <>
          <SettingsItem label="Case">
            <Select
              value={formatting.text?.case}
              onValueChange={(value) => handleFormattingChange('text', { ...formatting.text, case: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upper">UPPERCASE</SelectItem>
                <SelectItem value="lower">lowercase</SelectItem>
                <SelectItem value="title">Title Case</SelectItem>
              </SelectContent>
            </Select>
          </SettingsItem>
          <SettingsItem label="Max Length">
            <Input
              type="number"
              value={formatting.text?.maxLength}
              onChange={(e) => handleFormattingChange('text', { ...formatting.text, maxLength: parseInt(e.target.value) })}
              className="w-[180px]"
            />
          </SettingsItem>
          <SettingsItem label="Trim Whitespace">
            <Switch
              checked={formatting.text?.trim}
              onCheckedChange={(checked) => handleFormattingChange('text', { ...formatting.text, trim: checked })}
            />
          </SettingsItem>
        </>
      )}

      {formatting.type === 'number' && (
        <>
          <SettingsItem label="Decimal Places">
            <Input
              type="number"
              value={formatting.number?.decimalPlaces}
              onChange={(e) => handleFormattingChange('number', { ...formatting.number, decimalPlaces: parseInt(e.target.value) })}
              className="w-[180px]"
            />
          </SettingsItem>
          <SettingsItem label="Thousand Separator">
            <Switch
              checked={formatting.number?.thousandSeparator}
              onCheckedChange={(checked) => handleFormattingChange('number', { ...formatting.number, thousandSeparator: checked })}
            />
          </SettingsItem>
        </>
      )}

      {formatting.type === 'date' && (
        <SettingsItem label="Format">
          <Input
            value={formatting.date?.format}
            onChange={(e) => handleFormattingChange('date', { ...formatting.date, format: e.target.value })}
            className="w-[180px]"
            placeholder="YYYY-MM-DD"
          />
        </SettingsItem>
      )}

      {formatting.type === 'boolean' && (
        <SettingsItem label="Display">
          <Select
            value={formatting.boolean?.display}
            onValueChange={(value) => handleFormattingChange('boolean', { ...formatting.boolean, display: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select display" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true/false">True/False</SelectItem>
              <SelectItem value="yes/no">Yes/No</SelectItem>
              <SelectItem value="✓/✗">✓/✗</SelectItem>
            </SelectContent>
          </Select>
        </SettingsItem>
      )}

      {formatting.type === 'currency' && (
        <>
          <SettingsItem label="Symbol">
            <Input
              value={formatting.currency?.symbol}
              onChange={(e) => handleFormattingChange('currency', { ...formatting.currency, symbol: e.target.value })}
              className="w-[180px]"
              placeholder="$"
            />
          </SettingsItem>
          <SettingsItem label="Decimal Places">
            <Input
              type="number"
              value={formatting.currency?.decimalPlaces}
              onChange={(e) => handleFormattingChange('currency', { ...formatting.currency, decimalPlaces: parseInt(e.target.value) })}
              className="w-[180px]"
            />
          </SettingsItem>
          <SettingsItem label="Thousand Separator">
            <Switch
              checked={formatting.currency?.thousandSeparator}
              onCheckedChange={(checked) => handleFormattingChange('currency', { ...formatting.currency, thousandSeparator: checked })}
            />
          </SettingsItem>
        </>
      )}

      {formatting.type === 'percentage' && (
        <SettingsItem label="Decimal Places">
          <Input
            type="number"
            value={formatting.percentage?.decimalPlaces}
            onChange={(e) => handleFormattingChange('percentage', { ...formatting.percentage, decimalPlaces: parseInt(e.target.value) })}
            className="w-[180px]"
          />
        </SettingsItem>
      )}
    </SettingsSection>
  );
} 