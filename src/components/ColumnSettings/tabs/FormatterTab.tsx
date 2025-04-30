import React, { useState, useEffect } from 'react';
import { TabSection } from '../TabSection';
import { FormField } from '../FormField';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ColumnSettingsState } from '../useColumnSettings';
import FormatterHelp from '../FormatterHelp';
import { formatExcelValue } from '@/utils/formatters';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Formatter options
const formatterTypes = ['None', 'Number', 'Date', 'Currency', 'Percent', 'Custom'] as const;
const numberFormatPresets = ['1,234.56', '1234.56', '1.234,56', '1 234,56'];
const dateFormatPresets = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY', 'DD MMM YYYY'];
const currencySymbols = ['$', '€', '£', '¥', '₹', '₽', 'R$', 'kr', '฿', '₩'];

// Example format strings
const exampleFormatStrings = {
  'Color & Conditionals': '[>0][Green]"▲"$#,##0.00;[<0][Red]"▼"$#,##0.00;$0.00',
  'Status Indicators': '[=1][Green]"✓";[=0][Red]"✗";"N/A"',
  'Score Ranges': '[>=90][#00BB00]0"%";[>=70][#0070C0]0"%";[Red]0"%"',
  'KPI Indicators': '[>100][Green]"✓ Above Target";[=100][Blue]"= On Target";[Red]"✗ Below Target"',
  'Simple Heatmap': '[>0.7][#009900]0.0%;[>0.3][#FFCC00]0.0%;[#FF0000]0.0%',
  'Text with Values': '{value} units',
  'Currency with Suffix': '"$"#,##0.00" USD"',
  'Conditional Prefix': '[>1000]"High: "$#,##0.00;$#,##0.00'
};

// Sample values for preview
const sampleValues = {
  'Color & Conditionals': [1234.56, -1234.56, 0],
  'Status Indicators': [1, 0, 2],
  'Score Ranges': [95, 75, 65],
  'KPI Indicators': [110, 100, 90],
  'Simple Heatmap': [0.8, 0.5, 0.2],
  'Text with Values': [42],
  'Currency with Suffix': [1234.56],
  'Conditional Prefix': [1234.56, 123.45]
};

interface FormatterTabProps {
  settings: ColumnSettingsState['formatter'];
  onUpdate: (updates: Partial<ColumnSettingsState['formatter']>) => void;
}

const defaultFormatter: ColumnSettingsState['formatter'] = {
  formatterType: 'None',
  decimalPlaces: 2,
  useThousandsSeparator: true,
  formatPreset: '',
  currencySymbol: '$',
  symbolPosition: 'before',
  customFormat: '',
};

// Format Preview Component
const FormatPreview: React.FC<{ format: string; value?: number | string }> = ({ format, value = 1234.56 }) => {
  const result = formatExcelValue({ value }, format);

  return (
    <div className="mt-2 p-2 border rounded bg-muted/30">
      <div className="text-xs text-muted-foreground mb-1">Preview:</div>
      <div
        className="font-mono text-sm"
        style={{ color: result.color || 'inherit' }}
      >
        {result.text || String(value)}
      </div>
    </div>
  );
};

export const FormatterTab: React.FC<FormatterTabProps> = ({ settings, onUpdate }) => {
  const fmt = settings || defaultFormatter;
  const handle = (updates: Partial<ColumnSettingsState['formatter']>) => onUpdate(updates);

  // State for custom format preview
  const [previewValue, setPreviewValue] = useState<number>(1234.56);
  const [customFormatTab, setCustomFormatTab] = useState<string>('editor');

  // Apply a preset format example
  const applyFormatExample = (formatString: string) => {
    handle({ customFormat: formatString });
  };

  return (
    <TabSection
      title="Formatter"
      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-muted-foreground"><path d="M5 8h14M5 12h14M5 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Formatter Type */}
        <FormField label="Formatter Type" htmlFor="formatter-type">
          <Select value={fmt.formatterType || 'None'} onValueChange={v => handle({ formatterType: v })}>
            <SelectTrigger id="formatter-type" className="h-8 text-[13px] bg-card border border-border/80 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatterTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Number Options */}
        {fmt.formatterType === 'Number' && <>
          <FormField label="Decimal Places" htmlFor="decimal-places">
            <Input
              id="decimal-places"
              type="number"
              min="0"
              max="10"
              value={String(fmt.decimalPlaces ?? 0)}
              onChange={e => handle({ decimalPlaces: parseInt(e.target.value) || 0 })}
              onKeyDown={e => e.stopPropagation()}
              className="h-8 text-[13px] bg-card border border-border/80 rounded"
            />
          </FormField>
          <FormField label="Thousands Separator" htmlFor="thousands-separator">
            <Switch
              checked={!!fmt.useThousandsSeparator}
              onCheckedChange={v => handle({ useThousandsSeparator: v })}
              className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
            />
          </FormField>
          <FormField label="Format Preset" htmlFor="number-format-preset">
            <Select value={fmt.formatPreset || ''} onValueChange={v => handle({ formatPreset: v })}>
              <SelectTrigger id="number-format-preset" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {numberFormatPresets.map(preset => (
                  <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </>}

        {/* Date Options */}
        {fmt.formatterType === 'Date' && (
          <FormField label="Date Format" htmlFor="date-format">
            <Select value={fmt.formatPreset || ''} onValueChange={v => handle({ formatPreset: v })}>
              <SelectTrigger id="date-format" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateFormatPresets.map(preset => (
                  <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

        {/* Currency Options */}
        {fmt.formatterType === 'Currency' && <>
          <FormField label="Currency Symbol" htmlFor="currency-symbol">
            <Select value={fmt.currencySymbol || '$'} onValueChange={v => handle({ currencySymbol: v })}>
              <SelectTrigger id="currency-symbol" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencySymbols.map(sym => (
                  <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Decimal Places" htmlFor="currency-decimal-places">
            <Input
              id="currency-decimal-places"
              type="number"
              min="0"
              max="10"
              value={String(fmt.decimalPlaces ?? 0)}
              onChange={e => handle({ decimalPlaces: parseInt(e.target.value) || 0 })}
              onKeyDown={e => e.stopPropagation()}
              className="h-8 text-[13px] bg-card border border-border/80 rounded"
            />
          </FormField>
          <FormField label="Symbol Position" htmlFor="symbol-position">
            <Select value={fmt.symbolPosition || 'before'} onValueChange={v => handle({ symbolPosition: v })}>
              <SelectTrigger id="symbol-position" className="h-8 text-[13px] bg-card border border-border/80 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before ($100)</SelectItem>
                <SelectItem value="after">After (100$)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </>}

        {/* Percent Options */}
        {fmt.formatterType === 'Percent' && (
          <FormField label="Decimal Places" htmlFor="percent-decimal-places">
            <Input
              id="percent-decimal-places"
              type="number"
              min="0"
              max="10"
              value={String(fmt.decimalPlaces ?? 0)}
              onChange={e => handle({ decimalPlaces: parseInt(e.target.value) || 0 })}
              onKeyDown={e => e.stopPropagation()}
              className="h-8 text-[13px] bg-card border border-border/80 rounded"
            />
          </FormField>
        )}

        {/* Custom Format */}
        {fmt.formatterType === 'Custom' && (
          <div className="col-span-2">
            <Tabs value={customFormatTab} onValueChange={setCustomFormatTab} className="w-full">
              <TabsList className="mb-2 gap-1 bg-card border border-border/80 rounded-lg p-1 h-8">
                <TabsTrigger value="editor" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">
                  Format Editor
                </TabsTrigger>
                <TabsTrigger value="examples" className="data-[state=active]:bg-accent data-[state=active]:text-foreground text-[13px] px-4 py-1 rounded">
                  Examples
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="pt-1">
                <FormField label="Custom Format" htmlFor="custom-format">
                  <div className="flex items-center gap-2">
                    <Input
                      id="custom-format"
                      value={fmt.customFormat || ''}
                      onChange={e => handle({ customFormat: e.target.value })}
                      onKeyDown={e => e.stopPropagation()}
                      placeholder="Enter Excel-like format, e.g. #,##0.00"
                      className="h-8 text-[13px] bg-card border border-border/80 rounded"
                    />
                    <FormatterHelp />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Supports Excel-like formats. Click the ? for help.
                  </div>
                </FormField>

                <div className="mt-4 flex items-center gap-2">
                  <div className="text-sm">Preview Value:</div>
                  <Input
                    type="number"
                    value={previewValue}
                    onChange={e => setPreviewValue(Number(e.target.value))}
                    className="h-8 w-32 text-[13px] bg-card border border-border/80 rounded"
                  />
                </div>

                {fmt.customFormat && (
                  <FormatPreview format={fmt.customFormat} value={previewValue} />
                )}
              </TabsContent>

              <TabsContent value="examples" className="pt-1">
                <div className="text-sm mb-2">Click an example to apply it:</div>
                <div className="space-y-3">
                  {Object.entries(exampleFormatStrings).map(([name, format]) => (
                    <div key={name} className="border rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-sm">{name}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => applyFormatExample(format)}
                        >
                          Apply
                        </Button>
                      </div>
                      <div className="text-xs font-mono bg-muted/30 p-1 rounded mb-1 overflow-x-auto">
                        {format}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sampleValues[name as keyof typeof sampleValues]?.map((value, i) => (
                          <div key={i} className="text-xs bg-muted/20 px-2 py-1 rounded">
                            <span className="text-muted-foreground mr-1">{value}:</span>
                            <span
                              style={{
                                color: formatExcelValue({ value }, format).color || 'inherit'
                              }}
                            >
                              {formatExcelValue({ value }, format).text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </TabSection>
  );
};
