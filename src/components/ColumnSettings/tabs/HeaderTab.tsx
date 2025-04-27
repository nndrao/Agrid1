import React, { useMemo } from 'react';
import { StylePreview } from '../StylePreview';
import { StyleSection } from '../StyleSection';
import { FormField } from '../FormField';
import { FontStyleButtons } from '../FontStyleButtons';
import { AlignmentButtons } from '../AlignmentButtons';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { fontFamilies, fontSizes, fontWeights, borderStyles, borderSides, ColumnSettingsState } from '../useColumnSettings';

interface HeaderTabProps {
  settings: ColumnSettingsState['header'];
  onUpdate: (updates: Partial<ColumnSettingsState['header']>) => void;
}

export const HeaderTab: React.FC<HeaderTabProps> = ({ settings, onUpdate }) => {
  console.log('HeaderTab render with settings:', settings);

  // Create a wrapper for onUpdate to add debugging
  const handleUpdate = (updates: Partial<ColumnSettingsState['header']>) => {
    console.log('HeaderTab: handleUpdate called with', updates);
    onUpdate(updates);
  };

  // Memoize preview styles to prevent unnecessary re-renders but update when settings change
  const previewStyles = useMemo(() => {
    return settings.applyStyles ? settings : undefined;
  }, [
    settings.applyStyles,
    settings.fontFamily,
    settings.fontSize,
    settings.fontWeight,
    settings.bold,
    settings.italic,
    settings.underline,
    settings.textColor,
    settings.backgroundColor,
    settings.alignH,
    settings.borderStyle,
    settings.borderWidth,
    settings.borderColor,
    settings.borderSides
  ]);

  return (
    <div className="bg-card border border-border/80 shadow-none rounded-lg mb-3 p-4">
      {/* Top section with checkbox and preview */}
      <div className="flex flex-col space-y-2 mb-3">
        {/* Apply Styles Checkbox */}
        <div className="flex items-center space-x-2 py-1 px-2 bg-muted/30 rounded">
          <Checkbox
            id="apply-header-styles"
            checked={settings.applyStyles}
            onCheckedChange={(checked) => {
              console.log('Apply styles changed to:', checked);
              // Pass the value as a direct boolean
              const applyStyles = checked === true;
              console.log(`Setting header.applyStyles to ${applyStyles} (${typeof applyStyles})`);
              handleUpdate({ applyStyles });
            }}
          />
          <Label htmlFor="apply-header-styles" className="text-sm font-medium cursor-pointer">
            Apply these styles to the grid header
          </Label>
        </div>
        
        {/* Preview with dynamic styles */}
        <StylePreview 
          label="" 
          value="Header Preview" 
          styles={previewStyles}
        />
      </div>

      {/* Typography */}
      <StyleSection title="Typography">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Font Family" htmlFor="header-font-family">
            <Select value={settings.fontFamily} onValueChange={value => handleUpdate({ fontFamily: value })}>
              <SelectTrigger id="header-font-family" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Font Size" htmlFor="header-font-size">
            <Select value={settings.fontSize} onValueChange={value => handleUpdate({ fontSize: value })}>
              <SelectTrigger id="header-font-size" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Font Weight" htmlFor="header-font-weight">
            <Select value={settings.fontWeight} onValueChange={value => handleUpdate({ fontWeight: value })}>
              <SelectTrigger id="header-font-weight" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontWeights.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Style">
            <FontStyleButtons
              bold={settings.bold}
              italic={settings.italic}
              underline={settings.underline}
              onBoldChange={value => handleUpdate({ bold: value })}
              onItalicChange={value => handleUpdate({ italic: value })}
              onUnderlineChange={value => handleUpdate({ underline: value })}
            />
          </FormField>
        </div>
      </StyleSection>

      {/* Colors */}
      <StyleSection title="Colors">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Text Color" htmlFor="header-text-color">
            <Input
              id="header-text-color"
              type="color"
              value={settings.textColor}
              onChange={e => handleUpdate({ textColor: e.target.value })}
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded"
            />
          </FormField>

          <FormField label="Background" htmlFor="header-bg-color">
            <Input
              id="header-bg-color"
              type="color"
              value={settings.backgroundColor}
              onChange={e => handleUpdate({ backgroundColor: e.target.value })}
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded"
            />
          </FormField>
        </div>
      </StyleSection>

      {/* Alignment */}
      <StyleSection title="Alignment">
        <AlignmentButtons
          value={settings.alignH}
          onChange={value => handleUpdate({ alignH: value })}
        />
      </StyleSection>

      {/* Borders */}
      <StyleSection title="Borders">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Style" htmlFor="header-border-style">
            <Select value={settings.borderStyle} onValueChange={value => handleUpdate({ borderStyle: value })}>
              <SelectTrigger id="header-border-style" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {borderStyles.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={`Width: ${settings.borderWidth}px`} htmlFor="header-border-width">
            <Slider
              id="header-border-width"
              min={0}
              max={10}
              step={1}
              value={[settings.borderWidth]}
              onValueChange={([v]) => handleUpdate({ borderWidth: v })}
              className="h-7 w-full"
            />
          </FormField>

          <FormField label="Color" htmlFor="header-border-color">
            <Input
              id="header-border-color"
              type="color"
              value={settings.borderColor}
              onChange={e => handleUpdate({ borderColor: e.target.value })}
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded"
            />
          </FormField>

          <FormField label="Sides" htmlFor="header-border-sides">
            <Select value={settings.borderSides} onValueChange={value => handleUpdate({ borderSides: value })}>
              <SelectTrigger id="header-border-sides" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {borderSides.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </StyleSection>
    </div>
  );
};
