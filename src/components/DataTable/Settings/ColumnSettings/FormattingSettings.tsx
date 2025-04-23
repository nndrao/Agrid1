import React, { useEffect } from 'react';
import {
  Label,
} from "@/components/ui/label";
import {
  Switch,
} from "@/components/ui/switch";
import {
  Input,
} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ColumnSettingsProps } from './types';

const FormattingSettings: React.FC<ColumnSettingsProps> = ({ 
  column, 
  onColumnChange 
}) => {
  useEffect(() => {
    // Initialize formatting with default values if not already set
    if (!column.formatting) {
      console.log('Initializing formatting settings for column:', column.field);
      const defaultFormatting = {
        type: 'text',
        precision: 2,
        thousand: ',',
        decimal: '.',
        prefix: '',
        suffix: '',
        dateFormat: 'yyyy-MM-dd',
        nullValue: '',
        trueValue: 'Yes',
        falseValue: 'No',
        currencySymbol: '$',
        textCase: 'none',
        trimWhitespace: false,
        maxLength: 0,
        useGrouping: true
      };
      
      onColumnChange({
        ...column,
        formatting: defaultFormatting
      });
    } else {
      console.log('Formatting settings already exist for column:', column.field);
    }
  }, [column.field]);

  const handleFormattingChange = (field: string, value: any) => {
    // Ensure column and formatting exist
    const currentFormatting = column.formatting || {};

    onColumnChange({
      ...column,
      formatting: {
        ...currentFormatting,
        [field]: value
      }
    });
  };

  // Safely access formatting values with fallbacks to prevent errors
  const getFormattingValue = (field: string, defaultValue: any) => {
    return column.formatting && column.formatting[field] !== undefined 
      ? column.formatting[field] 
      : defaultValue;
  };

  const formatValueExample = (value: any) => {
    const formatting = column.formatting || {};
    
    if (value == null || value === '') {
      return formatting.nullValue || '';
    }
    
    switch (formatting.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        const options: Intl.NumberFormatOptions = {
          minimumFractionDigits: formatting.precision || 0,
          maximumFractionDigits: formatting.precision || 0,
          useGrouping: formatting.useGrouping !== false
        };
        
        return num.toLocaleString(undefined, options);
        
      case 'currency':
        const amount = parseFloat(value);
        if (isNaN(amount)) return value;
        
        const currencyOptions: Intl.NumberFormatOptions = {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: formatting.precision || 0,
          maximumFractionDigits: formatting.precision || 0,
          useGrouping: formatting.useGrouping !== false
        };
        
        const formatted = amount.toLocaleString(undefined, currencyOptions);
        return formatting.currencySymbol ? 
          formatted.replace('$', formatting.currencySymbol) : 
          formatted;
        
      case 'percentage':
        const pct = parseFloat(value);
        if (isNaN(pct)) return value;
        
        const pctOptions: Intl.NumberFormatOptions = {
          style: 'percent',
          minimumFractionDigits: formatting.precision || 0,
          maximumFractionDigits: formatting.precision || 0
        };
        
        return pct.toLocaleString(undefined, pctOptions);
        
      case 'date':
        try {
          const date = new Date(value);
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          };
          
          if (formatting.dateFormat?.includes('HH') || 
              formatting.dateFormat?.includes('hh') || 
              formatting.dateFormat?.includes('mm') || 
              formatting.dateFormat?.includes('ss')) {
            options.hour = '2-digit';
            options.minute = '2-digit';
          }
          
          if (formatting.dateFormat?.includes('ss')) {
            options.second = '2-digit';
          }
          
          return date.toLocaleDateString(undefined, options);
        } catch (e) {
          return value;
        }
        
      case 'boolean':
        return value === true || value === 'true' || value === 1 || value === '1' ? 
          (formatting.trueValue || 'Yes') : 
          (formatting.falseValue || 'No');
        
      case 'text':
      default:
        let text = String(value);
        
        if (formatting.trimWhitespace) {
          text = text.trim();
        }
        
        if (formatting.maxLength && text.length > formatting.maxLength) {
          text = text.substring(0, formatting.maxLength) + '...';
        }
        
        switch (formatting.textCase) {
          case 'upper':
            text = text.toUpperCase();
            break;
          case 'lower':
            text = text.toLowerCase();
            break;
          case 'title':
            text = text.replace(/\w\S*/g, (txt) => {
              return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
            });
            break;
        }
        
        return formatting.prefix ? formatting.prefix + text : text + (formatting.suffix || '');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Value Format</h3>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="format-type">Value Type</Label>
            <Select
              value={getFormattingValue('type', 'text')}
              onValueChange={(value) => handleFormattingChange('type', value)}
            >
              <SelectTrigger id="format-type" className="mt-1">
                <SelectValue placeholder="Select value type" />
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
            <p className="text-xs text-muted-foreground mt-1">
              Select how values in this column should be formatted
            </p>
          </div>
          
          {/* Text Formatting Options */}
          {getFormattingValue('type', 'text') === 'text' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="text-case">Text Case</Label>
                  <Select
                    value={getFormattingValue('textCase', 'none')}
                    onValueChange={(value) => handleFormattingChange('textCase', value)}
                  >
                    <SelectTrigger id="text-case" className="mt-1">
                      <SelectValue placeholder="Select text case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="upper">UPPERCASE</SelectItem>
                      <SelectItem value="lower">lowercase</SelectItem>
                      <SelectItem value="title">Title Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="max-length">Maximum Length</Label>
                  <Input
                    id="max-length"
                    className="mt-1"
                    type="number"
                    value={getFormattingValue('maxLength', '')}
                    onChange={(e) => handleFormattingChange('maxLength', e.target.value ? Number(e.target.value) : 0)}
                    min={0}
                    placeholder="0 = No limit"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    className="mt-1"
                    value={getFormattingValue('prefix', '')}
                    onChange={(e) => handleFormattingChange('prefix', e.target.value)}
                    placeholder="Text before value"
                  />
                </div>
                
                <div>
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input
                    id="suffix"
                    className="mt-1"
                    value={getFormattingValue('suffix', '')}
                    onChange={(e) => handleFormattingChange('suffix', e.target.value)}
                    placeholder="Text after value"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="trim-whitespace"
                  checked={getFormattingValue('trimWhitespace', false)}
                  onCheckedChange={(checked) => handleFormattingChange('trimWhitespace', checked)}
                />
                <Label htmlFor="trim-whitespace">Trim Whitespace</Label>
              </div>
            </>
          )}
          
          {/* Number Formatting Options */}
          {(getFormattingValue('type', 'text') === 'number' || 
           getFormattingValue('type', 'text') === 'currency' || 
           getFormattingValue('type', 'text') === 'percentage') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precision">Decimal Places</Label>
                  <Input
                    id="precision"
                    className="mt-1"
                    type="number"
                    value={getFormattingValue('precision', 0)}
                    onChange={(e) => handleFormattingChange('precision', Number(e.target.value))}
                    min={0}
                    max={20}
                  />
                </div>
                
                <div>
                  <Label htmlFor="decimal-separator">Decimal Separator</Label>
                  <Input
                    id="decimal-separator"
                    className="mt-1"
                    value={getFormattingValue('decimal', '.')}
                    onChange={(e) => handleFormattingChange('decimal', e.target.value)}
                    maxLength={1}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-grouping"
                    checked={getFormattingValue('useGrouping', true) !== false}
                    onCheckedChange={(checked) => handleFormattingChange('useGrouping', checked)}
                  />
                  <Label htmlFor="use-grouping">Use Thousand Separators</Label>
                </div>
                
                {getFormattingValue('useGrouping', true) !== false && (
                  <div>
                    <Label htmlFor="thousand-separator">Thousand Separator</Label>
                    <Input
                      id="thousand-separator"
                      className="mt-1"
                      value={getFormattingValue('thousand', ',')}
                      onChange={(e) => handleFormattingChange('thousand', e.target.value)}
                      maxLength={1}
                    />
                  </div>
                )}
              </div>
              
              {getFormattingValue('type', 'text') === 'currency' && (
                <div>
                  <Label htmlFor="currency-symbol">Currency Symbol</Label>
                  <Input
                    id="currency-symbol"
                    className="mt-1"
                    value={getFormattingValue('currencySymbol', '$')}
                    onChange={(e) => handleFormattingChange('currencySymbol', e.target.value)}
                    maxLength={3}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    className="mt-1"
                    value={getFormattingValue('prefix', '')}
                    onChange={(e) => handleFormattingChange('prefix', e.target.value)}
                    placeholder="Text before value"
                  />
                </div>
                
                <div>
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input
                    id="suffix"
                    className="mt-1"
                    value={getFormattingValue('suffix', '')}
                    onChange={(e) => handleFormattingChange('suffix', e.target.value)}
                    placeholder="Text after value"
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Date Formatting Options */}
          {getFormattingValue('type', 'text') === 'date' && (
            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={getFormattingValue('dateFormat', 'yyyy-MM-dd')}
                onValueChange={(value) => handleFormattingChange('dateFormat', value)}
              >
                <SelectTrigger id="date-format" className="mt-1">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MMM d, yyyy">Month D, YYYY</SelectItem>
                  <SelectItem value="d MMM yyyy">D Month YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd HH:mm">YYYY-MM-DD HH:MM</SelectItem>
                  <SelectItem value="MM/dd/yyyy HH:mm">MM/DD/YYYY HH:MM</SelectItem>
                  <SelectItem value="yyyy-MM-dd HH:mm:ss">YYYY-MM-DD HH:MM:SS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Boolean Formatting Options */}
          {getFormattingValue('type', 'text') === 'boolean' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="true-value">True Value</Label>
                <Input
                  id="true-value"
                  className="mt-1"
                  value={getFormattingValue('trueValue', 'Yes')}
                  onChange={(e) => handleFormattingChange('trueValue', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="false-value">False Value</Label>
                <Input
                  id="false-value"
                  className="mt-1"
                  value={getFormattingValue('falseValue', 'No')}
                  onChange={(e) => handleFormattingChange('falseValue', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-base font-medium mb-4">Empty & Null Values</h3>
        
        <div>
          <Label htmlFor="null-value">Display for Empty/Null Values</Label>
          <Input
            id="null-value"
            className="mt-1"
            value={getFormattingValue('nullValue', '')}
            onChange={(e) => handleFormattingChange('nullValue', e.target.value)}
            placeholder="Leave blank to show nothing"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Text to display when cell has no value
          </p>
        </div>
      </div>
      
      {/* Format Preview */}
      <Card className="p-4 mt-6">
        <h4 className="text-sm font-medium mb-3">Format Preview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Text:</Label>
              <div className="mt-1 p-2 border rounded">
                {formatValueExample('Sample Text')}
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Number:</Label>
              <div className="mt-1 p-2 border rounded">
                {formatValueExample(1234.56)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Date:</Label>
              <div className="mt-1 p-2 border rounded">
                {formatValueExample(new Date().toISOString())}
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Empty Value:</Label>
              <div className="mt-1 p-2 border rounded">
                {formatValueExample(null)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FormattingSettings; 