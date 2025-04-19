import React from 'react';
import { StylePreview } from '../StylePreview';
import { StyleSection } from '../StyleSection';
import { FormField } from '../FormField';
import { FontStyleButtons } from '../FontStyleButtons';
import { AlignmentButtons } from '../AlignmentButtons';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { fontFamilies, fontSizes, fontWeights, borderStyles, borderSides, ColumnSettingsState } from '../useColumnSettings';

interface CellTabProps {
  settings: ColumnSettingsState['cell'];
  onUpdate: (updates: Partial<ColumnSettingsState['cell']>) => void;
}

export const CellTab: React.FC<CellTabProps> = ({ settings, onUpdate }) => {
  return (
    <div className="bg-card border border-border/80 shadow-none rounded-lg mb-3 p-5">
      {/* Preview */}
      <StylePreview label="Preview" value="Cell Preview" />
      
      {/* Typography */}
      <StyleSection title="Typography">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Font Family" htmlFor="cell-font-family">
            <Select value={settings.fontFamily} onValueChange={value => onUpdate({ fontFamily: value })}>
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
            <Select value={settings.fontSize} onValueChange={value => onUpdate({ fontSize: value })}>
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
            <Select value={settings.fontWeight} onValueChange={value => onUpdate({ fontWeight: value })}>
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
              onBoldChange={value => onUpdate({ bold: value })}
              onItalicChange={value => onUpdate({ italic: value })}
              onUnderlineChange={value => onUpdate({ underline: value })}
            />
          </FormField>
        </div>
      </StyleSection>
      
      {/* Colors */}
      <StyleSection title="Colors">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Text Color" htmlFor="cell-text-color">
            <Input 
              id="cell-text-color"
              type="color"
              value={settings.textColor} 
              onChange={e => onUpdate({ textColor: e.target.value })} 
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" 
            />
          </FormField>
          
          <FormField label="Background" htmlFor="cell-bg-color">
            <Input 
              id="cell-bg-color"
              type="color"
              value={settings.backgroundColor} 
              onChange={e => onUpdate({ backgroundColor: e.target.value })} 
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" 
            />
          </FormField>
        </div>
      </StyleSection>
      
      {/* Alignment */}
      <StyleSection title="Alignment">
        <AlignmentButtons 
          value={settings.alignH}
          onChange={value => onUpdate({ alignH: value })}
        />
      </StyleSection>
      
      {/* Borders */}
      <StyleSection title="Borders">
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Style" htmlFor="cell-border-style">
            <Select value={settings.borderStyle} onValueChange={value => onUpdate({ borderStyle: value })}>
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
              onValueChange={([v]) => onUpdate({ borderWidth: v })} 
              className="h-7 w-full" 
            />
          </FormField>
          
          <FormField label="Color" htmlFor="cell-border-color">
            <Input 
              id="cell-border-color"
              type="color"
              value={settings.borderColor} 
              onChange={e => onUpdate({ borderColor: e.target.value })} 
              className="h-7 w-full text-[13px] bg-card border border-border/80 rounded" 
            />
          </FormField>
          
          <FormField label="Sides" htmlFor="cell-border-sides">
            <Select value={settings.borderSides} onValueChange={value => onUpdate({ borderSides: value })}>
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
