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

interface CellTabProps {
  settings: ColumnSettingsState['cell'];
  onUpdate: (updates: Partial<ColumnSettingsState['cell']>) => void;
}

// New component for form field with enable checkbox
const FormFieldWithToggle = ({ 
  label, 
  htmlFor, 
  enabled,
  onToggle,
  children 
}: { 
  label: string, 
  htmlFor: string, 
  enabled: boolean,
  onToggle: (enabled: boolean) => void,
  children: React.ReactNode 
}) => (
  <div className="flex flex-col space-y-1">
    <div className="flex items-center justify-between">
      <Label htmlFor={htmlFor} className="text-[13px] font-medium">
        {label}
      </Label>
      <div className="flex items-center">
        <Label htmlFor={`${htmlFor}-toggle`} className="text-[11px] mr-1 text-muted-foreground">
          Apply
        </Label>
        <Checkbox 
          id={`${htmlFor}-toggle`}
          checked={enabled}
          onCheckedChange={onToggle}
          className="h-3.5 w-3.5"
        />
      </div>
    </div>
    {children}
  </div>
);

export const CellTab: React.FC<CellTabProps> = ({ settings, onUpdate }) => {
  // Create a wrapper for onUpdate to add debugging
  const handleUpdate = (updates: Partial<ColumnSettingsState['cell']>) => {
    console.log('CellTab: handleUpdate called with', updates);
    onUpdate(updates);
  };

  // Define style enablers (moved from global to individual properties)
  const applyTextColor = settings.applyTextColor ?? false;
  const applyBackgroundColor = settings.applyBackgroundColor ?? false;
  const applyBorder = settings.applyBorder ?? false;

  // Memoize preview styles to prevent unnecessary re-renders but update when settings change
  const previewStyles = useMemo(() => {
    const styleOverrides: Partial<ColumnSettingsState['cell']> = {
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      bold: settings.bold,
      italic: settings.italic,
      underline: settings.underline,
      alignH: settings.alignH,
    };
    
    // Only include properties that are enabled, otherwise set to undefined to use theme defaults
    if (applyTextColor) {
      styleOverrides.textColor = settings.textColor;
    } else {
      styleOverrides.textColor = undefined;
    }
    
    if (applyBackgroundColor) {
      styleOverrides.backgroundColor = settings.backgroundColor;
    } else {
      styleOverrides.backgroundColor = undefined;
    }
    
    if (applyBorder) {
      styleOverrides.borderStyle = settings.borderStyle;
      styleOverrides.borderWidth = settings.borderWidth;
      styleOverrides.borderColor = settings.borderColor;
      styleOverrides.borderSides = settings.borderSides;
    } else {
      styleOverrides.borderStyle = undefined;
      styleOverrides.borderWidth = undefined;
      styleOverrides.borderColor = undefined;
      styleOverrides.borderSides = undefined;
    }
    
    return styleOverrides;
  }, [
    settings.fontFamily,
    settings.fontSize,
    settings.fontWeight,
    settings.bold,
    settings.italic,
    settings.underline,
    settings.alignH,
    applyTextColor,
    settings.textColor,
    applyBackgroundColor,
    settings.backgroundColor,
    applyBorder,
    settings.borderStyle,
    settings.borderWidth,
    settings.borderColor,
    settings.borderSides
  ]);
  
  return (
    <div className="bg-card border border-border/80 shadow-none rounded-lg mb-3 p-4">
      {/* Preview box at the top */}
      <div className="mb-4">
        <StylePreview 
          label="" 
          value="Cell Preview" 
          styles={previewStyles}
        />
      </div>

      {/* Typography */}
      <StyleSection title="Typography">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Font Family" htmlFor="cell-font-family">
            <Select value={settings.fontFamily} onValueChange={value => handleUpdate({ fontFamily: value })}>
              <SelectTrigger id="cell-font-family" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Font Size" htmlFor="cell-font-size">
            <Select value={settings.fontSize} onValueChange={value => handleUpdate({ fontSize: value })}>
              <SelectTrigger id="cell-font-size" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Font Weight" htmlFor="cell-font-weight">
            <Select value={settings.fontWeight} onValueChange={value => handleUpdate({ fontWeight: value })}>
              <SelectTrigger id="cell-font-weight" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
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
          <FormFieldWithToggle 
            label="Text Color" 
            htmlFor="cell-text-color"
            enabled={applyTextColor}
            onToggle={checked => handleUpdate({ applyTextColor: !!checked })}
          >
            <Input
              id="cell-text-color"
              type="color"
              value={settings.textColor}
              onChange={e => handleUpdate({ textColor: e.target.value })}
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded"
            />
          </FormFieldWithToggle>

          <FormFieldWithToggle 
            label="Background" 
            htmlFor="cell-bg-color"
            enabled={applyBackgroundColor}
            onToggle={checked => handleUpdate({ applyBackgroundColor: !!checked })}
          >
            <Input
              id="cell-bg-color"
              type="color"
              value={settings.backgroundColor}
              onChange={e => handleUpdate({ backgroundColor: e.target.value })}
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded"
            />
          </FormFieldWithToggle>
        </div>
      </StyleSection>

      {/* Alignment */}
      <StyleSection title="Alignment">
        <AlignmentButtons
          value={settings.alignH}
          onChange={value => handleUpdate({ alignH: value })}
        />
      </StyleSection>

      {/* Borders with toggle */}
      <StyleSection title="Borders">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium">Border Properties</span>
          <div className="flex items-center">
            <Label htmlFor="cell-border-toggle" className="text-[11px] mr-1 text-muted-foreground">
              Apply Borders
            </Label>
            <Checkbox 
              id="cell-border-toggle"
              checked={applyBorder}
              onCheckedChange={checked => handleUpdate({ applyBorder: !!checked })}
              className="h-3.5 w-3.5"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Style" htmlFor="cell-border-style">
            <Select 
              value={settings.borderStyle} 
              onValueChange={value => handleUpdate({ borderStyle: value })}
              disabled={!applyBorder}
            >
              <SelectTrigger id="cell-border-style" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {borderStyles.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={`Width: ${settings.borderWidth}px`} htmlFor="cell-border-width">
            <Slider
              id="cell-border-width"
              min={0}
              max={10}
              step={1}
              value={[settings.borderWidth]}
              onValueChange={([v]) => handleUpdate({ borderWidth: v })}
              className="h-7 w-full"
              disabled={!applyBorder}
            />
          </FormField>

          <FormField label="Color" htmlFor="cell-border-color">
            <Input
              id="cell-border-color"
              type="color"
              value={settings.borderColor}
              onChange={e => handleUpdate({ borderColor: e.target.value })}
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded"
              disabled={!applyBorder}
            />
          </FormField>

          <FormField label="Sides" htmlFor="cell-border-sides">
            <Select 
              value={settings.borderSides} 
              onValueChange={value => handleUpdate({ borderSides: value })}
              disabled={!applyBorder}
            >
              <SelectTrigger id="cell-border-sides" className="h-7 text-[13px] w-full bg-card border border-border/80 rounded">
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
