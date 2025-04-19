import React from 'react';
import { TabSection } from '../TabSection';
import { FormField } from '../FormField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { columnTypes, pinnedPositions, filterOptions, filterTypes, ColumnSettingsState } from '../useColumnSettings';

interface GeneralTabProps {
  settings: ColumnSettingsState['general'];
  onUpdate: (updates: Partial<ColumnSettingsState['general']>) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, onUpdate }) => {
  return (
    <TabSection 
      title="General" 
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <FormField label="Header Name" htmlFor="header-name">
          <Input 
            id="header-name"
            value={settings.headerName} 
            onChange={e => onUpdate({ headerName: e.target.value })} 
            className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
          />
        </FormField>
        
        <FormField label="Width" htmlFor="width">
          <Input 
            id="width"
            value={settings.width} 
            onChange={e => onUpdate({ width: e.target.value })} 
            className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
          />
        </FormField>
        
        <FormField label="Type" htmlFor="column-type">
          <Select value={settings.columnType} onValueChange={value => onUpdate({ columnType: value })}>
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
          <Select value={settings.pinnedPosition} onValueChange={value => onUpdate({ pinnedPosition: value })}>
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
          <Select value={settings.filter} onValueChange={value => onUpdate({ filter: value })}>
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
          <Select value={settings.filterType} onValueChange={value => onUpdate({ filterType: value })}>
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
            onCheckedChange={value => onUpdate({ sortable: value })} 
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" 
          />
        </FormField>
        
        <FormField label="Resizable">
          <Switch 
            checked={settings.resizable} 
            onCheckedChange={value => onUpdate({ resizable: value })} 
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" 
          />
        </FormField>
        
        <FormField label="Hidden">
          <Switch 
            checked={settings.hidden} 
            onCheckedChange={value => onUpdate({ hidden: value })} 
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" 
          />
        </FormField>
        
        <FormField label="Editable">
          <Switch 
            checked={settings.editable} 
            onCheckedChange={value => onUpdate({ editable: value })} 
            className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" 
          />
        </FormField>
      </div>
    </TabSection>
  );
};
