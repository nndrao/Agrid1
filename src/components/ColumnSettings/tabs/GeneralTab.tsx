import React, { useEffect, useRef, useState } from 'react';
import { TabSection } from '../TabSection';
import { FormField } from '../FormField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { columnTypes, pinnedPositions, filterOptions, filterTypes, ColumnSettingsState } from '../useColumnSettings';

interface GeneralTabProps {
  settings: ColumnSettingsState['general'];
  onUpdate: (updates: Partial<ColumnSettingsState['general']>) => void;
  selectedColumn: string;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, onUpdate, selectedColumn }) => {
  console.log('GeneralTab render with settings:', settings, 'for column:', selectedColumn);

  // Create a wrapper for onUpdate to add debugging
  const handleUpdate = (updates: Partial<ColumnSettingsState['general']>) => {
    console.log('GeneralTab: handleUpdate called with', updates);
    onUpdate(updates);
  };
  const [localHeaderName, setLocalHeaderName] = useState(settings.headerName || '');
  const headerInputRef = useRef<HTMLInputElement>(null);
  const initialRenderRef = useRef(true);

  // Update local state when settings change from parent or when selected column changes
  useEffect(() => {
    setLocalHeaderName(settings.headerName || '');
  }, [settings.headerName, selectedColumn]);

  // Apply changes to parent component
  const handleHeaderChange = () => {
    if (localHeaderName !== settings.headerName) {
      handleUpdate({ headerName: localHeaderName });
    }
  };

  // Only log updates on dependency changes, not every render
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    console.log('GeneralTab settings updated:', settings);
  }, [settings]);

  return (
    <TabSection
      title="General"
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <FormField label="Header Name" htmlFor="header-name" className="column-settings-input-contain">
          <Input
            key={`header-name-input-${selectedColumn}`}
            id="header-name"
            ref={headerInputRef}
            value={localHeaderName}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLocalHeaderName(e.target.value);
            }}
            onBlur={handleHeaderChange}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                handleHeaderChange();
                e.preventDefault();
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              headerInputRef.current?.focus();
            }}
            autoComplete="off"
            placeholder="Enter header name"
            className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FormField>

        <FormField label="Width" htmlFor="width">
          <Input
            id="width"
            value={settings.width || ''}
            onChange={(e) => {
              console.log('Width changed to:', e.target.value);
              handleUpdate({ width: e.target.value });
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FormField>

        <FormField label="Type" htmlFor="column-type">
          <Select value={settings.columnType} onValueChange={value => handleUpdate({ columnType: value })}>
            <SelectTrigger id="column-type" className="h-8 text-[13px] bg-card border border-border/80 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columnTypes.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Pinned" htmlFor="pinned-position">
          <Select value={settings.pinnedPosition} onValueChange={value => handleUpdate({ pinnedPosition: value })}>
            <SelectTrigger id="pinned-position" className="h-8 text-[13px] bg-card border border-border/80 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pinnedPositions.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Filter" htmlFor="filter">
          <Select value={settings.filter} onValueChange={value => handleUpdate({ filter: value })}>
            <SelectTrigger id="filter" className="h-8 text-[13px] bg-card border border-border/80 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Filter Type" htmlFor="filter-type">
          <Select value={settings.filterType} onValueChange={value => handleUpdate({ filterType: value })}>
            <SelectTrigger id="filter-type" className="h-8 text-[13px] bg-card border border-border/80 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterTypes.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Sortable">
          <Switch
            checked={settings.sortable}
            onCheckedChange={value => handleUpdate({ sortable: value })}
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          />
        </FormField>

        <FormField label="Resizable">
          <Switch
            checked={settings.resizable}
            onCheckedChange={value => handleUpdate({ resizable: value })}
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          />
        </FormField>

        <FormField label="Hidden">
          <Switch
            checked={settings.hidden}
            onCheckedChange={value => handleUpdate({ hidden: value })}
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          />
        </FormField>

        <FormField label="Editable">
          <Switch
            checked={settings.editable}
            onCheckedChange={value => handleUpdate({ editable: value })}
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          />
        </FormField>
      </div>
    </TabSection>
  );
};
