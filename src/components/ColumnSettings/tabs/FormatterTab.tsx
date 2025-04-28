import React from 'react';
import { TabSection } from '../TabSection';
import { FormField } from '../FormField';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ColumnSettingsState } from '../useColumnSettings';
import FormatterHelp from '../FormatterHelp';

// Define formatter types
export const formatterTypes = ['None', 'Number', 'Date', 'Currency', 'Percent', 'Custom'];
export const numberFormatPresets = ['1,234.56', '1234.56', '1.234,56', '1 234,56'];
export const dateFormatPresets = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY', 'DD MMM YYYY'];
export const currencySymbols = ['$', '€', '£', '¥', '₹', '₽', 'R$', 'kr', '฿', '₩'];

interface FormatterTabProps {
  settings: ColumnSettingsState['formatter'];
  onUpdate: (updates: Partial<ColumnSettingsState['formatter']>) => void;
}

export const FormatterTab: React.FC<FormatterTabProps> = ({ settings, onUpdate }) => {
  // Create default settings in case settings is undefined
  const defaultSettings: ColumnSettingsState['formatter'] = {
    formatterType: 'None',
    decimalPlaces: 2,
    useThousandsSeparator: true,
    formatPreset: '',
    currencySymbol: '$',
    symbolPosition: 'before',
    customFormat: ''
  };

  // Use default settings if settings is undefined
  const safeSettings = settings || defaultSettings;

  // Create a wrapper for onUpdate to add debugging
  const handleUpdate = (updates: Partial<ColumnSettingsState['formatter']>) => {
    console.log('FormatterTab: handleUpdate called with', updates);
    onUpdate(updates);
  };

  // Determine which format options to show based on formatter type
  const renderFormatOptions = () => {
    if (!safeSettings) return null;
    
    switch (safeSettings.formatterType) {
      case 'Number':
        return (
          <>
            <FormField label="Decimal Places" htmlFor="decimal-places">
              <Input
                id="decimal-places"
                type="number"
                min="0"
                max="10"
                value={String(safeSettings.decimalPlaces || 0)}
                onChange={(e) => handleUpdate({ decimalPlaces: parseInt(e.target.value) || 0 })}
                onKeyDown={(e) => e.stopPropagation()}
                className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </FormField>
            <FormField label="Thousands Separator" htmlFor="thousands-separator">
              <Switch
                checked={!!safeSettings.useThousandsSeparator}
                onCheckedChange={(value) => handleUpdate({ useThousandsSeparator: value })}
                className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
              />
            </FormField>
            <FormField label="Format Preset" htmlFor="number-format-preset">
              <Select 
                value={safeSettings.formatPreset || ''} 
                onValueChange={(value) => handleUpdate({ formatPreset: value })}
              >
                <SelectTrigger id="number-format-preset" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {numberFormatPresets.map((preset) => (
                    <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </>
        );
      
      case 'Date':
        return (
          <FormField label="Date Format" htmlFor="date-format">
            <Select 
              value={safeSettings.formatPreset || ''} 
              onValueChange={(value) => handleUpdate({ formatPreset: value })}
            >
              <SelectTrigger id="date-format" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateFormatPresets.map((format) => (
                  <SelectItem key={format} value={format}>{format}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        );
      
      case 'Currency':
        return (
          <>
            <FormField label="Currency Symbol" htmlFor="currency-symbol">
              <Select 
                value={safeSettings.currencySymbol || '$'} 
                onValueChange={(value) => handleUpdate({ currencySymbol: value })}
              >
                <SelectTrigger id="currency-symbol" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencySymbols.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Decimal Places" htmlFor="decimal-places">
              <Input
                id="decimal-places"
                type="number"
                min="0"
                max="10"
                value={String(safeSettings.decimalPlaces || 0)}
                onChange={(e) => handleUpdate({ decimalPlaces: parseInt(e.target.value) || 0 })}
                onKeyDown={(e) => e.stopPropagation()}
                className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </FormField>
            <FormField label="Symbol Position" htmlFor="symbol-position">
              <Select 
                value={safeSettings.symbolPosition || 'before'} 
                onValueChange={(value) => handleUpdate({ symbolPosition: value })}
              >
                <SelectTrigger id="symbol-position" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before ($100)</SelectItem>
                  <SelectItem value="after">After (100$)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </>
        );
      
      case 'Percent':
        return (
          <FormField label="Decimal Places" htmlFor="decimal-places">
            <Input
              id="decimal-places"
              type="number"
              min="0"
              max="10"
              value={String(safeSettings.decimalPlaces || 0)}
              onChange={(e) => handleUpdate({ decimalPlaces: parseInt(e.target.value) || 0 })}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FormField>
        );
      
      case 'Custom':
        return (
          <FormField label="Custom Format" htmlFor="custom-format">
            <div className="flex items-center gap-2">
              <Input
                id="custom-format"
                value={safeSettings.customFormat || ''}
                onChange={(e) => handleUpdate({ customFormat: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Enter Excel-like format, e.g. #,##0.00"
                className="h-8 text-[13px] bg-card border border-border/80 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormatterHelp />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Supports Excel-like formats. Click the ? for help.
            </div>
          </FormField>
        );
      
      default:
        return null;
    }
  };

  // Render with null check
  if (!safeSettings) {
    return (
      <TabSection 
        title="Formatter" 
        icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground">
          <path d="M5 8h14M5 12h14M5 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>}
      >
        <div className="text-center py-4 text-muted-foreground">Loading formatter options...</div>
      </TabSection>
    );
  }

  return (
    <TabSection
      title="Formatter"
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground">
        <path d="M5 8h14M5 12h14M5 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <FormField label="Formatter Type" htmlFor="formatter-type">
          <Select 
            value={safeSettings.formatterType || 'None'} 
            onValueChange={(value) => handleUpdate({ formatterType: value })}
          >
            <SelectTrigger id="formatter-type" className="h-8 text-[13px] bg-card border border-border/80 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatterTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {renderFormatOptions()}
      </div>
    </TabSection>
  );
};
